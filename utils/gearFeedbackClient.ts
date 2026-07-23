// Client-side glue between GearProductFeedbackModal and the
// submit-gear-feedback Edge Function + gear_public_feedback table.
//
// Session handling: reuses an existing Supabase session (anonymous or
// logged-in) whenever one exists, and only calls signInAnonymously() when
// there is truly no session yet — never replaces an authenticated session,
// never creates a new anonymous user on every modal open.

import { supabase } from '../src/lib/supabase';

export interface GearFeedbackSubmitPayload {
  productId: string;
  interest: 'high' | 'medium' | 'low' | 'none';
  useContexts: string[];
  otherUseContext?: string;
  priority: string;
  comment?: string;
  wantsUpdates: boolean;
  email?: string;
  turnstileToken: string;
}

export interface GearFeedbackSubmitResult {
  status: 'created' | 'updated';
  message: string;
}

export type GearFeedbackClientError =
  | { kind: 'auth_unavailable'; message: string }
  | { kind: 'rate_limited'; message: string }
  | { kind: 'validation'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'unexpected'; message: string };

export class GearFeedbackError extends Error {
  kind: GearFeedbackClientError['kind'];
  constructor(error: GearFeedbackClientError) {
    super(error.message);
    this.kind = error.kind;
  }
}

/**
 * Ensures a Supabase session exists for the current visitor, reusing an
 * authenticated or previously-created anonymous session whenever possible.
 * Only calls signInAnonymously() when there is no session at all.
 */
export async function ensureGearFeedbackSession(): Promise<string> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new GearFeedbackError({ kind: 'auth_unavailable', message: sessionError.message });
  }
  if (sessionData.session?.user?.id) {
    return sessionData.session.user.id;
  }

  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError || !anonData.session?.user?.id) {
    throw new GearFeedbackError({
      kind: 'auth_unavailable',
      message: anonError?.message ?? 'Anonymous sign-in is not available.',
    });
  }
  return anonData.session.user.id;
}

export interface GearFeedbackExistingResponse {
  interest: 'high' | 'medium' | 'low' | 'none';
  useContexts: string[];
  otherUseContext: string | null;
  priority: string;
  comment: string | null;
  wantsUpdates: boolean;
  email: string | null;
}

/**
 * Reads back only the current user's own response for a product, relying on
 * RLS to make third-party rows unreachable. Returns null when the user has
 * not answered this product yet.
 */
export async function fetchOwnGearFeedback(productId: string): Promise<GearFeedbackExistingResponse | null> {
  const { data, error } = await supabase
    .from('gear_public_feedback')
    .select('interest, use_contexts, other_use_context, priority, comment, wants_updates, email')
    .eq('product_id', productId)
    .maybeSingle();

  if (error) {
    // Table may not exist yet in environments where the migration has not
    // been applied. Treat this as "no previous response" rather than a hard
    // failure, since the modal should still work without a saved answer.
    return null;
  }
  if (!data) return null;

  return {
    interest: data.interest,
    useContexts: Array.isArray(data.use_contexts) ? data.use_contexts : [],
    otherUseContext: data.other_use_context,
    priority: data.priority,
    comment: data.comment,
    wantsUpdates: Boolean(data.wants_updates),
    email: data.email,
  };
}

export async function submitGearFeedback(payload: GearFeedbackSubmitPayload): Promise<GearFeedbackSubmitResult> {
  const { data, error } = await supabase.functions.invoke('submit-gear-feedback', {
    body: payload,
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context?.status === 429) {
      throw new GearFeedbackError({
        kind: 'rate_limited',
        message: 'Muitas tentativas. Aguarde um momento e tente novamente.',
      });
    }
    if (context?.status && context.status >= 400 && context.status < 500) {
      throw new GearFeedbackError({
        kind: 'validation',
        message: 'Não foi possível validar sua opinião. Revise os campos e tente novamente.',
      });
    }
    throw new GearFeedbackError({ kind: 'network', message: error.message });
  }

  if (!data || typeof data.status !== 'string') {
    throw new GearFeedbackError({ kind: 'unexpected', message: 'Resposta inesperada do servidor.' });
  }

  return { status: data.status, message: data.message ?? '' };
}
