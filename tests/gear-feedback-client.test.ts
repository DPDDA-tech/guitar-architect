import { describe, expect, it, vi, beforeEach } from 'vitest';

const getSession = vi.fn();
const signInAnonymously = vi.fn();
const invoke = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
      signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
    },
    functions: {
      invoke: (...args: unknown[]) => invoke(...args),
    },
    from: (...args: unknown[]) => from(...args),
  },
}));

const {
  ensureGearFeedbackSession,
  submitGearFeedback,
  fetchOwnGearFeedback,
  GearFeedbackError,
} = await import('../utils/gearFeedbackClient');

const basePayload = () => ({
  productId: 'picks',
  interest: 'high' as const,
  useContexts: ['home-study'],
  priority: 'quality',
  wantsUpdates: false,
  turnstileToken: 'token-abc',
});

beforeEach(() => {
  getSession.mockReset();
  signInAnonymously.mockReset();
  invoke.mockReset();
  maybeSingle.mockReset();
  eq.mockClear();
  select.mockClear();
  from.mockClear();
});

describe('ensureGearFeedbackSession', () => {
  it('reuses an existing session without calling signInAnonymously', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null });
    const userId = await ensureGearFeedbackSession();
    expect(userId).toBe('user-1');
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('creates an anonymous session only when none exists', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    signInAnonymously.mockResolvedValue({ data: { session: { user: { id: 'anon-1' } } }, error: null });
    const userId = await ensureGearFeedbackSession();
    expect(userId).toBe('anon-1');
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('throws a typed error when anonymous sign-in is unavailable (e.g. disabled in the project)', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    signInAnonymously.mockResolvedValue({ data: { session: null }, error: { message: 'Anonymous sign-ins are disabled' } });
    await expect(ensureGearFeedbackSession()).rejects.toMatchObject({ kind: 'auth_unavailable' });
  });

  it('surfaces a getSession failure as a typed auth_unavailable error (missing/ausente user)', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: { message: 'network error' } });
    await expect(ensureGearFeedbackSession()).rejects.toBeInstanceOf(GearFeedbackError);
  });
});

// Builds a mock Response-like object matching what supabase-js attaches as
// `error.context` for a FunctionsHttpError: something with .status, .clone()
// and an async .json() body reader.
const mockContext = (status: number, body?: unknown) => ({
  status,
  clone() {
    return this;
  },
  async json() {
    if (body === undefined) throw new Error('no body');
    return body;
  },
});

const FORBIDDEN_RAW_SDK_SUBSTRINGS = ['non-2xx', 'Edge Function returned'];

describe('submitGearFeedback', () => {
  it('returns the server-provided status and message on success', async () => {
    invoke.mockResolvedValue({ data: { status: 'created', message: 'Sua opinião foi registrada.' }, error: null });
    const result = await submitGearFeedback(basePayload());
    expect(result).toEqual({ status: 'created', message: 'Sua opinião foi registrada.' });
    expect(invoke).toHaveBeenCalledWith('submit-gear-feedback', { body: basePayload() });
  });

  it('reports an "updated" status distinctly from "created"', async () => {
    invoke.mockResolvedValue({ data: { status: 'updated', message: 'Sua opinião anterior foi atualizada.' }, error: null });
    const result = await submitGearFeedback(basePayload());
    expect(result.status).toBe('updated');
  });

  it('maps a 429 status to a rate_limited error even without a readable body', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'rate limited', context: { status: 429 } } });
    await expect(submitGearFeedback(basePayload())).rejects.toMatchObject({ kind: 'rate_limited' });
  });

  it('maps the structured "rate_limited" body code to a rate_limited error', async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { message: 'edge function error', context: mockContext(429, { error: 'rate_limited', message: 'Muitas tentativas.' }) },
    });
    const result = submitGearFeedback(basePayload());
    await expect(result).rejects.toMatchObject({ kind: 'rate_limited' });
    await expect(result).rejects.toThrow(/Muitas tentativas|momento/i);
  });

  it('maps the structured "turnstile_failed" body code to a validation error with a specific message', async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { message: 'edge function error', context: mockContext(400, { error: 'turnstile_failed' }) },
    });
    const result = submitGearFeedback(basePayload());
    await expect(result).rejects.toMatchObject({ kind: 'validation' });
    await expect(result).rejects.toThrow(/verificação de segurança/i);
  });

  it('maps "authentication_required" to an auth_unavailable error', async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { message: 'edge function error', context: mockContext(401, { error: 'authentication_required' }) },
    });
    await expect(submitGearFeedback(basePayload())).rejects.toMatchObject({ kind: 'auth_unavailable' });
  });

  it('maps a generic 400 with an unreadable body to a validation error (status fallback)', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'invalid_product', context: { status: 400 } } });
    await expect(submitGearFeedback(basePayload())).rejects.toMatchObject({ kind: 'validation' });
  });

  it('maps every known validation error code to a validation error', async () => {
    const codes = ['invalid_product', 'invalid_interest', 'missing_use_contexts', 'invalid_priority', 'invalid_email', 'missing_turnstile_token'];
    for (const code of codes) {
      invoke.mockResolvedValue({
        data: null,
        error: { message: 'edge function error', context: mockContext(400, { error: code }) },
      });
      await expect(submitGearFeedback(basePayload())).rejects.toMatchObject({ kind: 'validation' });
    }
  });

  it('maps a 500 "unexpected_error" (e.g. a DB permission gap) to a friendly generic message, never the raw SDK error', async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { message: 'Edge Function returned a non-2xx status code', context: mockContext(500, { error: 'unexpected_error' }) },
    });
    const result = submitGearFeedback(basePayload());
    await expect(result).rejects.toMatchObject({ kind: 'unexpected' });
    for (const forbidden of FORBIDDEN_RAW_SDK_SUBSTRINGS) {
      await expect(result).rejects.not.toThrow(new RegExp(forbidden));
    }
  });

  it('maps an unexpected transport failure (no context at all) to a friendly generic message, never the raw SDK error', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'Edge Function returned a non-2xx status code' } });
    const result = submitGearFeedback(basePayload());
    await expect(result).rejects.toMatchObject({ kind: 'unexpected' });
    for (const forbidden of FORBIDDEN_RAW_SDK_SUBSTRINGS) {
      await expect(result).rejects.not.toThrow(new RegExp(forbidden));
    }
  });

  it('never throws a message containing the raw supabase-js SDK wording, across every mapped error path', async () => {
    const scenarios = [
      { message: 'x', context: mockContext(429, { error: 'rate_limited' }) },
      { message: 'x', context: mockContext(400, { error: 'turnstile_failed' }) },
      { message: 'x', context: mockContext(401, { error: 'authentication_required' }) },
      { message: 'x', context: mockContext(400, { error: 'invalid_product' }) },
      { message: 'Edge Function returned a non-2xx status code', context: mockContext(500, { error: 'unexpected_error' }) },
      { message: 'Edge Function returned a non-2xx status code' },
    ];
    for (const error of scenarios) {
      invoke.mockResolvedValue({ data: null, error });
      const result = submitGearFeedback(basePayload());
      for (const forbidden of FORBIDDEN_RAW_SDK_SUBSTRINGS) {
        await expect(result).rejects.not.toThrow(new RegExp(forbidden));
      }
    }
  });
});

describe('fetchOwnGearFeedback', () => {
  it('returns null when the user has not answered this product yet', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await fetchOwnGearFeedback('picks');
    expect(result).toBeNull();
  });

  it('returns the normalized previous response when one exists', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        interest: 'medium',
        use_contexts: ['lessons'],
        other_use_context: null,
        priority: 'design',
        comment: 'Looks nice.',
        wants_updates: true,
        email: 'person@example.com',
      },
      error: null,
    });
    const result = await fetchOwnGearFeedback('picks');
    expect(result).toEqual({
      interest: 'medium',
      useContexts: ['lessons'],
      otherUseContext: null,
      priority: 'design',
      comment: 'Looks nice.',
      wantsUpdates: true,
      email: 'person@example.com',
    });
  });

  it('degrades to null (not a thrown error) when the table is unreachable, e.g. before the migration is applied', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: 'relation "gear_public_feedback" does not exist' } });
    const result = await fetchOwnGearFeedback('picks');
    expect(result).toBeNull();
  });
});
