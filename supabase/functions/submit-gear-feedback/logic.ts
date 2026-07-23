// Pure, runtime-agnostic logic for the submit-gear-feedback Edge Function.
// No Deno-specific or Node-specific APIs here on purpose, so this module can
// be imported both by the Deno entrypoint (index.ts) and by the project's
// Vitest suite (tests/gear-feedback-function.test.ts) without any shims.
//
// IMPORTANT: ALLOWED_PRODUCT_IDS / ALLOWED_INTEREST / ALLOWED_USE_CONTEXTS /
// ALLOWED_PRIORITIES are intentionally duplicated from components/GearPage.tsx
// and components/GearProductFeedbackModal.tsx rather than imported, because
// Supabase Edge Functions only bundle their own function directory and do
// not resolve relative imports that reach outside of it. A dedicated Vitest
// test asserts these lists stay identical to the frontend's source of truth,
// so drift between the two copies fails CI instead of failing silently.

export const ALLOWED_PRODUCT_IDS = [
  'blueprint-journal',
  'desk-mat-studio',
  'cleaning-kit',
  'premium-cap',
  'pedalboard-dust-cover',
  'pedalboard-soft-case',
  'modular-organizer-case',
  'maintenance-kit',
  'mug',
  'picks',
  'pick-tin',
  'headphone-stand',
  'pedalboard-mat',
  'thermal-line',
  'guitar-premium-bag',
] as const;

export const ALLOWED_INTEREST = ['high', 'medium', 'low', 'none'] as const;

export const ALLOWED_USE_CONTEXTS = [
  'home-study',
  'lessons',
  'rehearsals',
  'studio',
  'performances',
  'transport',
  'organization',
  'daily-use',
  'other',
] as const;

export const ALLOWED_PRIORITIES = [
  'quality',
  'functionality',
  'durability',
  'design',
  'portability',
  'organization',
  'affordable-price',
  'other',
] as const;

export const MAX_COMMENT_LENGTH = 1000;
export const MAX_OTHER_CONTEXT_LENGTH = 140;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_USE_CONTEXTS = ALLOWED_USE_CONTEXTS.length;

export const RATE_LIMIT_PER_MINUTE = 5;
export const RATE_LIMIT_PER_HOUR = 30;

export type GearFeedbackInterest = (typeof ALLOWED_INTEREST)[number];

export interface NormalizedGearFeedback {
  productId: (typeof ALLOWED_PRODUCT_IDS)[number];
  interest: GearFeedbackInterest;
  useContexts: string[];
  otherUseContext: string | null;
  priority: string;
  comment: string | null;
  wantsUpdates: boolean;
  email: string | null;
}

export type GearFeedbackValidationError =
  | 'invalid_payload'
  | 'invalid_product'
  | 'invalid_interest'
  | 'missing_use_contexts'
  | 'too_many_use_contexts'
  | 'invalid_use_context'
  | 'invalid_priority'
  | 'invalid_other_use_context'
  | 'other_use_context_too_long'
  | 'invalid_comment'
  | 'comment_too_long'
  | 'invalid_email'
  | 'email_too_long'
  | 'missing_turnstile_token';

export type ValidationResult =
  | { ok: true; data: NormalizedGearFeedback }
  | { ok: false; error: GearFeedbackValidationError; field?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, '');

const normalizeSpaces = (value: string): string => value.replace(/\s+/g, ' ').trim();

const sanitizeFreeText = (value: string): string => normalizeSpaces(stripHtml(value));

export function validateGearFeedbackPayload(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid_payload' };
  }
  const body = input as Record<string, unknown>;

  const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
  if (!(ALLOWED_PRODUCT_IDS as readonly string[]).includes(productId)) {
    return { ok: false, error: 'invalid_product', field: 'productId' };
  }

  const interest = typeof body.interest === 'string' ? body.interest.trim() : '';
  if (!(ALLOWED_INTEREST as readonly string[]).includes(interest)) {
    return { ok: false, error: 'invalid_interest', field: 'interest' };
  }

  if (!Array.isArray(body.useContexts) || body.useContexts.length === 0) {
    return { ok: false, error: 'missing_use_contexts', field: 'useContexts' };
  }
  if (body.useContexts.length > MAX_USE_CONTEXTS) {
    return { ok: false, error: 'too_many_use_contexts', field: 'useContexts' };
  }
  const useContexts = Array.from(
    new Set(body.useContexts.map(item => (typeof item === 'string' ? item.trim() : '')))
  ).filter(Boolean);
  if (useContexts.length === 0) {
    return { ok: false, error: 'missing_use_contexts', field: 'useContexts' };
  }
  if (useContexts.some(item => !(ALLOWED_USE_CONTEXTS as readonly string[]).includes(item))) {
    return { ok: false, error: 'invalid_use_context', field: 'useContexts' };
  }

  const priority = typeof body.priority === 'string' ? body.priority.trim() : '';
  if (!(ALLOWED_PRIORITIES as readonly string[]).includes(priority)) {
    return { ok: false, error: 'invalid_priority', field: 'priority' };
  }

  let otherUseContext: string | null = null;
  if (useContexts.includes('other') && body.otherUseContext !== undefined && body.otherUseContext !== null) {
    if (typeof body.otherUseContext !== 'string') {
      return { ok: false, error: 'invalid_other_use_context', field: 'otherUseContext' };
    }
    const cleaned = sanitizeFreeText(body.otherUseContext);
    if (cleaned.length > MAX_OTHER_CONTEXT_LENGTH) {
      return { ok: false, error: 'other_use_context_too_long', field: 'otherUseContext' };
    }
    otherUseContext = cleaned || null;
  }

  let comment: string | null = null;
  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment !== 'string') {
      return { ok: false, error: 'invalid_comment', field: 'comment' };
    }
    const cleaned = sanitizeFreeText(body.comment);
    if (cleaned.length > MAX_COMMENT_LENGTH) {
      return { ok: false, error: 'comment_too_long', field: 'comment' };
    }
    comment = cleaned || null;
  }

  const wantsUpdates = body.wantsUpdates === true;

  let email: string | null = null;
  if (wantsUpdates && typeof body.email === 'string' && body.email.trim()) {
    const trimmed = body.email.trim();
    if (trimmed.length > MAX_EMAIL_LENGTH) {
      return { ok: false, error: 'email_too_long', field: 'email' };
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      return { ok: false, error: 'invalid_email', field: 'email' };
    }
    email = trimmed.toLowerCase();
  }

  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';
  if (!turnstileToken) {
    return { ok: false, error: 'missing_turnstile_token', field: 'turnstileToken' };
  }

  return {
    ok: true,
    data: {
      productId: productId as NormalizedGearFeedback['productId'],
      interest: interest as GearFeedbackInterest,
      useContexts,
      otherUseContext,
      priority,
      comment,
      wantsUpdates,
      email,
    },
  };
}

export function isWithinRateLimit(minuteCount: number, hourCount: number): boolean {
  return minuteCount <= RATE_LIMIT_PER_MINUTE && hourCount <= RATE_LIMIT_PER_HOUR;
}

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
}

export async function verifyTurnstileToken(
  token: string,
  secret: string,
  remoteIp: string | undefined,
  fetchImpl: typeof fetch
): Promise<TurnstileVerifyResult> {
  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }
  if (!secret) {
    return { success: false, errorCodes: ['missing-secret'] };
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteIp) form.set('remoteip', remoteIp);

  let response: Response;
  try {
    // Fail closed quickly if Cloudflare's siteverify endpoint hangs, instead
    // of consuming the Edge Function's whole execution budget on one call.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return { success: false, errorCodes: ['siteverify_network_error'] };
  }

  if (!response.ok) {
    return { success: false, errorCodes: ['siteverify_http_error'] };
  }

  const json = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
  return { success: json.success === true, errorCodes: json['error-codes'] };
}
