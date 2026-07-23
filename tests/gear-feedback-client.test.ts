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

  it('maps a 429 response to a rate_limited error', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'rate limited', context: { status: 429 } } });
    await expect(submitGearFeedback(basePayload())).rejects.toMatchObject({ kind: 'rate_limited' });
  });

  it('maps a 400 response to a validation error', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'invalid_product', context: { status: 400 } } });
    await expect(submitGearFeedback(basePayload())).rejects.toMatchObject({ kind: 'validation' });
  });

  it('maps an unexpected transport failure to a network error', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'fetch failed' } });
    await expect(submitGearFeedback(basePayload())).rejects.toMatchObject({ kind: 'network' });
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
