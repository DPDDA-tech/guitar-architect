import { describe, expect, it, vi } from 'vitest';
import {
  ALLOWED_PRODUCT_IDS,
  ALLOWED_INTEREST,
  ALLOWED_USE_CONTEXTS,
  ALLOWED_PRIORITIES,
  RATE_LIMIT_PER_MINUTE,
  RATE_LIMIT_PER_HOUR,
  validateGearFeedbackPayload,
  isWithinRateLimit,
  verifyTurnstileToken,
} from '../supabase/functions/submit-gear-feedback/logic';
import { GEAR_PRODUCT_IDS } from '../components/GearPage';
import {
  GEAR_FEEDBACK_INTEREST_IDS,
  GEAR_FEEDBACK_USE_CONTEXT_IDS,
  GEAR_FEEDBACK_PRIORITY_IDS,
} from '../components/GearProductFeedbackModal';

const validPayload = () => ({
  productId: 'picks',
  interest: 'high',
  useContexts: ['home-study', 'lessons'],
  priority: 'quality',
  comment: 'Great idea.',
  wantsUpdates: true,
  email: 'person@example.com',
  turnstileToken: 'token-123',
});

describe('submit-gear-feedback: allowlist synchronization with the frontend', () => {
  it('matches the 15 published product ids in GearPage.tsx exactly (order-independent)', () => {
    expect([...ALLOWED_PRODUCT_IDS].sort()).toEqual([...GEAR_PRODUCT_IDS].sort());
    expect(ALLOWED_PRODUCT_IDS.length).toBe(15);
  });

  it('matches the interest options in GearProductFeedbackModal.tsx', () => {
    expect([...ALLOWED_INTEREST].sort()).toEqual([...GEAR_FEEDBACK_INTEREST_IDS].sort());
  });

  it('matches the use-context options in GearProductFeedbackModal.tsx', () => {
    expect([...ALLOWED_USE_CONTEXTS].sort()).toEqual([...GEAR_FEEDBACK_USE_CONTEXT_IDS].sort());
  });

  it('matches the priority options in GearProductFeedbackModal.tsx', () => {
    expect([...ALLOWED_PRIORITIES].sort()).toEqual([...GEAR_FEEDBACK_PRIORITY_IDS].sort());
  });
});

describe('submit-gear-feedback: payload validation', () => {
  it('accepts a fully valid payload and normalizes it', () => {
    const result = validateGearFeedbackPayload(validPayload());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.productId).toBe('picks');
      expect(result.data.useContexts).toEqual(['home-study', 'lessons']);
      expect(result.data.email).toBe('person@example.com');
    }
  });

  it('rejects an unknown product id (defense against a tampered client)', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), productId: 'unlisted-product' });
    expect(result).toEqual({ ok: false, error: 'invalid_product', field: 'productId' });
  });

  it('rejects a missing/empty productId', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), productId: '' });
    expect(result.ok).toBe(false);
  });

  it('rejects an invalid interest value', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), interest: 'extreme' });
    expect(result).toEqual({ ok: false, error: 'invalid_interest', field: 'interest' });
  });

  it('rejects an empty useContexts array', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), useContexts: [] });
    expect(result).toEqual({ ok: false, error: 'missing_use_contexts', field: 'useContexts' });
  });

  it('rejects a useContexts array with an unknown option', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), useContexts: ['spaceship'] });
    expect(result).toEqual({ ok: false, error: 'invalid_use_context', field: 'useContexts' });
  });

  it('rejects an excessively large useContexts array', () => {
    const result = validateGearFeedbackPayload({
      ...validPayload(),
      useContexts: Array.from({ length: 50 }, () => 'home-study'),
    });
    expect(result).toEqual({ ok: false, error: 'too_many_use_contexts', field: 'useContexts' });
  });

  it('rejects an invalid priority', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), priority: 'yesterday' });
    expect(result).toEqual({ ok: false, error: 'invalid_priority', field: 'priority' });
  });

  it('rejects a comment beyond the size limit', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), comment: 'x'.repeat(1001) });
    expect(result).toEqual({ ok: false, error: 'comment_too_long', field: 'comment' });
  });

  it('rejects an otherUseContext beyond the size limit', () => {
    const result = validateGearFeedbackPayload({
      ...validPayload(),
      useContexts: ['other'],
      otherUseContext: 'x'.repeat(200),
    });
    expect(result).toEqual({ ok: false, error: 'other_use_context_too_long', field: 'otherUseContext' });
  });

  it('rejects an invalid email format when provided', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), email: 'not-an-email' });
    expect(result).toEqual({ ok: false, error: 'invalid_email', field: 'email' });
  });

  it('accepts a missing email when wantsUpdates is false', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), wantsUpdates: false, email: undefined });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.email).toBeNull();
  });

  it('stores email as null when wantsUpdates is false even if an email was sent', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), wantsUpdates: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.email).toBeNull();
  });

  it('strips HTML tags from free-text fields without destroying legitimate text', () => {
    const result = validateGearFeedbackPayload({
      ...validPayload(),
      comment: 'I <b>really</b> like this <script>alert(1)</script> concept.',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.comment).not.toContain('<');
      expect(result.data.comment).toContain('really like this');
      expect(result.data.comment).toContain('concept.');
    }
  });

  it('rejects a payload missing the Turnstile token', () => {
    const result = validateGearFeedbackPayload({ ...validPayload(), turnstileToken: '' });
    expect(result).toEqual({ ok: false, error: 'missing_turnstile_token', field: 'turnstileToken' });
  });

  it('rejects a completely malformed payload', () => {
    expect(validateGearFeedbackPayload(null)).toEqual({ ok: false, error: 'invalid_payload' });
    expect(validateGearFeedbackPayload('a string')).toEqual({ ok: false, error: 'invalid_payload' });
    expect(validateGearFeedbackPayload(42)).toEqual({ ok: false, error: 'invalid_payload' });
  });
});

describe('submit-gear-feedback: rate limiting thresholds', () => {
  it('allows requests within both windows', () => {
    expect(isWithinRateLimit(1, 1)).toBe(true);
    expect(isWithinRateLimit(RATE_LIMIT_PER_MINUTE, RATE_LIMIT_PER_HOUR)).toBe(true);
  });

  it('blocks once the per-minute threshold is exceeded', () => {
    expect(isWithinRateLimit(RATE_LIMIT_PER_MINUTE + 1, 1)).toBe(false);
  });

  it('blocks once the per-hour threshold is exceeded', () => {
    expect(isWithinRateLimit(1, RATE_LIMIT_PER_HOUR + 1)).toBe(false);
  });
});

describe('submit-gear-feedback: Turnstile verification', () => {
  it('rejects an empty token without calling the network', async () => {
    const fetchImpl = vi.fn();
    const result = await verifyTurnstileToken('', 'secret', '1.2.3.4', fetchImpl as unknown as typeof fetch);
    expect(result.success).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('accepts a token when Cloudflare reports success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    const result = await verifyTurnstileToken('good-token', 'secret', '1.2.3.4', fetchImpl as unknown as typeof fetch);
    expect(result.success).toBe(true);
  });

  it('rejects a token when Cloudflare reports failure (invalid/expired/duplicate)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
    });
    const result = await verifyTurnstileToken('bad-token', 'secret', '1.2.3.4', fetchImpl as unknown as typeof fetch);
    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain('timeout-or-duplicate');
  });

  it('fails closed when the siteverify network call itself fails', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
    const result = await verifyTurnstileToken('any-token', 'secret', '1.2.3.4', fetchImpl as unknown as typeof fetch);
    expect(result.success).toBe(false);
  });
});
