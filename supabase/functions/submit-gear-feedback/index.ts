// Edge Function: submit-gear-feedback
//
// Receives one "Opinar sobre este conceito" response for the Gear public
// consultation, validates it end-to-end on the server (never trusting the
// browser), verifies the Cloudflare Turnstile token, applies a persistent
// rate limit, and upserts the response keyed by (product_id, user_id).
//
// Auth model: the caller must present a Supabase Authorization Bearer JWT.
// This includes Supabase Anonymous Sign-In sessions — anonymous users hold a
// normal "authenticated" role JWT with an is_anonymous claim, so the same
// user-scoped client + RLS policies apply to them as to logged-in users.
//
// Local invocation (after `supabase start`):
//   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/submit-gear-feedback' \
//     --header 'Authorization: Bearer <user-access-token>' \
//     --header 'Content-Type: application/json' \
//     --data '{"productId":"picks","interest":"high","useContexts":["home-study"],"priority":"quality","turnstileToken":"XXXX.DUMMY.TOKEN.XXXX"}'

import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  validateGearFeedbackPayload,
  verifyTurnstileToken,
  isWithinRateLimit,
} from './logic.ts';

// Only these origins are allowed to call this function from a browser.
// Kept in sync with the Cloudflare Turnstile widget's allowed hostnames
// (production: guitararchitect.com.br / www.guitararchitect.com.br — no
// preview domains; local dev: the Vite dev server).
const ALLOWED_ORIGINS = new Set([
  'https://guitararchitect.com.br',
  'https://www.guitararchitect.com.br',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const buildCorsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
};

const jsonResponse = (req: Request, body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...buildCorsHeaders(req), 'Content-Type': 'application/json' },
  });

const errorResponse = (req: Request, status: number, message: string) => jsonResponse(req, { error: message }, status);

const hashIp = async (ip: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return errorResponse(req, 405, 'method_not_allowed');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
  const rateLimitIpSalt = Deno.env.get('RATE_LIMIT_IP_SALT');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error('submit-gear-feedback: missing Supabase environment configuration');
    return errorResponse(req, 500, 'server_misconfigured');
  }
  if (!turnstileSecret) {
    console.error('submit-gear-feedback: missing TURNSTILE_SECRET_KEY');
    return errorResponse(req, 500, 'server_misconfigured');
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(req, 401, 'authentication_required');
  }

  // User-scoped client: RLS applies exactly as it would from the browser.
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) {
    return errorResponse(req, 401, 'authentication_required');
  }
  const userId = userData.user.id;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return errorResponse(req, 400, 'invalid_json');
  }

  const validation = validateGearFeedbackPayload(rawBody);
  if (!validation.ok) {
    return errorResponse(req, 400, validation.error);
  }
  const feedback = validation.data;

  const turnstileToken = typeof (rawBody as Record<string, unknown>).turnstileToken === 'string'
    ? ((rawBody as Record<string, unknown>).turnstileToken as string).trim()
    : '';
  const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;

  const turnstileResult = await verifyTurnstileToken(turnstileToken, turnstileSecret, remoteIp, fetch);
  if (!turnstileResult.success) {
    return errorResponse(req, 400, 'turnstile_failed');
  }

  // Service-role client: bypasses RLS for the rate-limit table (which has no
  // client grants at all) and to upsert the feedback row on the verified
  // user's behalf without letting the client control risk_status.
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  const ipHash = remoteIp && rateLimitIpSalt ? await hashIp(remoteIp, rateLimitIpSalt) : null;

  const { data: rateLimitRows, error: rateLimitError } = await adminClient.rpc(
    'gear_feedback_check_rate_limit',
    { p_user_id: userId, p_ip_hash: ipHash }
  );
  if (rateLimitError) {
    console.error('submit-gear-feedback: rate limit check failed', rateLimitError.message);
    return errorResponse(req, 500, 'unexpected_error');
  }
  const rateLimitRow = Array.isArray(rateLimitRows) ? rateLimitRows[0] : rateLimitRows;
  if (!rateLimitRow || !isWithinRateLimit(rateLimitRow.minute_count, rateLimitRow.hour_count)) {
    return jsonResponse(req, { error: 'rate_limited', message: 'Muitas tentativas. Aguarde um momento e tente novamente.' }, 429);
  }

  const { data: existingRow, error: existingRowError } = await adminClient
    .from('gear_public_feedback')
    .select('id')
    .eq('product_id', feedback.productId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingRowError) {
    console.error('submit-gear-feedback: existing row lookup failed', existingRowError.message);
    return errorResponse(req, 500, 'unexpected_error');
  }
  const wasExisting = Boolean(existingRow);

  const { error: upsertError } = await adminClient
    .from('gear_public_feedback')
    .upsert(
      {
        product_id: feedback.productId,
        user_id: userId,
        interest: feedback.interest,
        use_contexts: feedback.useContexts,
        other_use_context: feedback.otherUseContext,
        priority: feedback.priority,
        comment: feedback.comment,
        wants_updates: feedback.wantsUpdates,
        email: feedback.email,
      },
      { onConflict: 'product_id,user_id' }
    );

  if (upsertError) {
    console.error('submit-gear-feedback: upsert failed', upsertError.message);
    return errorResponse(req, 500, 'unexpected_error');
  }

  return jsonResponse(
    req,
    {
      status: wasExisting ? 'updated' : 'created',
      message: wasExisting ? 'Sua opinião anterior foi atualizada.' : 'Sua opinião foi registrada.',
    },
    200
  );
});
