import React, { useEffect, useRef, useState } from 'react';
import { loadTurnstile } from '../utils/turnstile';
import { validateGearFeedbackForm, type GearFeedbackFormErrors } from '../utils/gearFeedbackValidation';
import {
  ensureGearFeedbackSession,
  fetchOwnGearFeedback,
  submitGearFeedback,
  GearFeedbackError,
} from '../utils/gearFeedbackClient';

type AppLang = 'pt' | 'en';

export type GearFeedbackInterest = 'high' | 'medium' | 'low' | 'none';

export interface GearProductFeedback {
  productId: string;
  interest: GearFeedbackInterest;
  useContexts: string[];
  otherUseContext?: string;
  priority: string;
  comment?: string;
  wantsUpdates: boolean;
  email?: string;
}

interface GearFeedbackProduct {
  id: string;
  name: string;
}

interface GearProductFeedbackModalProps {
  product: GearFeedbackProduct;
  lang: AppLang;
  isLight: boolean;
  onClose: () => void;
}

// Exported so tests can assert these stay in sync with the Edge Function's
// own copy of the allowlists (supabase/functions/submit-gear-feedback/logic.ts).
export const GEAR_FEEDBACK_INTEREST_IDS: GearFeedbackInterest[] = ['high', 'medium', 'low', 'none'];
export const GEAR_FEEDBACK_USE_CONTEXT_IDS = [
  'home-study',
  'lessons',
  'rehearsals',
  'studio',
  'performances',
  'transport',
  'organization',
  'daily-use',
  'other',
];
export const GEAR_FEEDBACK_PRIORITY_IDS = [
  'quality',
  'functionality',
  'durability',
  'design',
  'portability',
  'organization',
  'affordable-price',
  'other',
];

const INTEREST_OPTIONS: { id: GearFeedbackInterest; pt: string; en: string }[] = [
  { id: 'high', pt: 'Alto', en: 'High' },
  { id: 'medium', pt: 'Médio', en: 'Medium' },
  { id: 'low', pt: 'Baixo', en: 'Low' },
  { id: 'none', pt: 'Nenhum', en: 'None' },
];

const USE_CONTEXT_OPTIONS: { id: string; pt: string; en: string }[] = [
  { id: 'home-study', pt: 'Estudo em casa', en: 'Studying at home' },
  { id: 'lessons', pt: 'Aulas', en: 'Lessons' },
  { id: 'rehearsals', pt: 'Ensaios', en: 'Rehearsals' },
  { id: 'studio', pt: 'Estúdio', en: 'Studio' },
  { id: 'performances', pt: 'Apresentações', en: 'Performances' },
  { id: 'transport', pt: 'Transporte', en: 'Transport' },
  { id: 'organization', pt: 'Organização', en: 'Organization' },
  { id: 'daily-use', pt: 'Uso cotidiano', en: 'Everyday use' },
  { id: 'other', pt: 'Outro', en: 'Other' },
];

const PRIORITY_OPTIONS: { id: string; pt: string; en: string }[] = [
  { id: 'quality', pt: 'Qualidade', en: 'Quality' },
  { id: 'functionality', pt: 'Funcionalidade', en: 'Functionality' },
  { id: 'durability', pt: 'Durabilidade', en: 'Durability' },
  { id: 'design', pt: 'Design', en: 'Design' },
  { id: 'portability', pt: 'Facilidade de transporte', en: 'Ease of transport' },
  { id: 'organization', pt: 'Organização', en: 'Organization' },
  { id: 'affordable-price', pt: 'Preço acessível', en: 'Affordable price' },
  { id: 'other', pt: 'Outro', en: 'Other' },
];

type SubmitState = 'idle' | 'authenticating' | 'validating' | 'submitting' | 'success' | 'error' | 'rate_limited';

const GearProductFeedbackModal: React.FC<GearProductFeedbackModalProps> = ({ product, lang, isLight, onClose }) => {
  const isPt = lang === 'pt';
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  const [interest, setInterest] = useState<GearFeedbackInterest | ''>('');
  const [useContexts, setUseContexts] = useState<string[]>([]);
  const [otherUseContext, setOtherUseContext] = useState('');
  const [priority, setPriority] = useState('');
  const [comment, setComment] = useState('');
  const [wantsUpdates, setWantsUpdates] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<GearFeedbackFormErrors>({});
  const [hasExistingResponse, setHasExistingResponse] = useState(false);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState('');
  const [authError, setAuthError] = useState('');

  const turnstileSiteKey = (import.meta as { env?: Record<string, string> }).env?.VITE_TURNSTILE_SITE_KEY ?? '';

  // Ensure a session exists (reusing one if possible) and prefill the form
  // with the user's own previous response, if any.
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setSubmitState('authenticating');
      try {
        await ensureGearFeedbackSession();
        if (cancelled) return;

        const existing = await fetchOwnGearFeedback(product.id);
        if (cancelled) return;
        if (existing) {
          setInterest(existing.interest);
          setUseContexts(existing.useContexts);
          setOtherUseContext(existing.otherUseContext ?? '');
          setPriority(existing.priority);
          setComment(existing.comment ?? '');
          setWantsUpdates(existing.wantsUpdates);
          setEmail(existing.email ?? '');
          setHasExistingResponse(true);
        }
        setSubmitState('idle');
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof GearFeedbackError
          ? error.message
          : isPt ? 'Não foi possível iniciar sua participação anônima.' : 'Could not start anonymous participation.';
        setAuthError(
          isPt
            ? `Não foi possível preparar sua participação (${message}). Você ainda pode preencher o formulário, mas o envio pode falhar até que isso seja resolvido.`
            : `Could not prepare your participation (${message}). You can still fill in the form, but submission may fail until this is resolved.`
        );
        setSubmitState('idle');
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Load and render the Turnstile widget once a site key is configured.
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return;
    let cancelled = false;

    loadTurnstile()
      .then(api => {
        if (cancelled || !turnstileContainerRef.current) return;
        turnstileWidgetId.current = api.render(turnstileContainerRef.current, {
          sitekey: turnstileSiteKey,
          theme: isLight ? 'light' : 'dark',
          callback: token => {
            setTurnstileToken(token);
            setTurnstileError('');
          },
          'expired-callback': () => {
            setTurnstileToken('');
            setTurnstileError(isPt ? 'A verificação de segurança expirou. Tente novamente.' : 'The security check expired. Please try again.');
          },
          'error-callback': () => {
            setTurnstileToken('');
            setTurnstileError(isPt ? 'Não foi possível concluir a verificação de segurança.' : 'The security check could not be completed.');
          },
        });
      })
      .catch(() => {
        if (cancelled) return;
        setTurnstileError(isPt ? 'Não foi possível carregar a verificação de segurança.' : 'Could not load the security check.');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnstileSiteKey, isLight]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('[data-modal-initial-focus]')?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
        const first = list[0];
        const last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  const panelClass = isLight ? 'border-zinc-200 bg-white' : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.97)]';
  const fieldsetClass = isLight ? 'border-zinc-200' : 'border-zinc-700';
  const legendClass = isLight ? 'text-zinc-700' : 'text-zinc-200';
  const inputClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-800 placeholder:text-zinc-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600';
  const errorClass = isLight ? 'text-red-600' : 'text-red-400';
  const accentTextClass = isLight ? 'text-blue-700' : 'text-blue-300';
  const mutedTextClass = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const noticeClass = isLight
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : 'border-amber-900/60 bg-amber-950/30 text-amber-200';
  const errorPanelClass = isLight
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-red-900/60 bg-red-950/30 text-red-300';

  const pillClass = (active: boolean) =>
    `cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
      active
        ? isLight
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-blue-400 bg-blue-500 text-white'
        : isLight
        ? 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-blue-300'
        : 'border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-blue-500'
    }`;

  const toggleUseContext = (id: string) => {
    setUseContexts(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const resetTurnstile = () => {
    if (turnstileWidgetId.current) {
      loadTurnstile()
        .then(api => api.reset(turnstileWidgetId.current ?? undefined))
        .catch(() => undefined);
    }
    setTurnstileToken('');
  };

  const isBusy = submitState === 'submitting' || submitState === 'authenticating';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isBusy) return;

    const nextErrors = validateGearFeedbackForm({ interest, useContexts, priority, email, wantsUpdates: wantsUpdates === true }, isPt);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (turnstileSiteKey && !turnstileToken) {
      setTurnstileError(isPt ? 'Conclua a verificação de segurança antes de enviar.' : 'Complete the security check before submitting.');
      return;
    }
    if (!turnstileSiteKey) {
      setSubmitState('error');
      setStatusMessage(
        isPt
          ? 'A verificação de segurança não está configurada nesta implantação. Não é possível enviar no momento.'
          : 'The security check is not configured in this deployment. Submission is unavailable right now.'
      );
      return;
    }

    setSubmitState('submitting');
    setStatusMessage('');

    try {
      await ensureGearFeedbackSession();
      const result = await submitGearFeedback({
        productId: product.id,
        interest: interest as GearFeedbackInterest,
        useContexts,
        otherUseContext: useContexts.includes('other') ? otherUseContext.trim() || undefined : undefined,
        priority,
        comment: comment.trim() || undefined,
        wantsUpdates: wantsUpdates === true,
        email: wantsUpdates === true && email.trim() ? email.trim() : undefined,
        turnstileToken,
      });
      setSubmitState('success');
      setStatusMessage(result.message || (isPt ? 'Sua opinião foi registrada.' : 'Your opinion has been recorded.'));
    } catch (error) {
      if (error instanceof GearFeedbackError && error.kind === 'rate_limited') {
        setSubmitState('rate_limited');
        setStatusMessage(error.message);
      } else {
        setSubmitState('error');
        setStatusMessage(
          error instanceof GearFeedbackError
            ? error.message
            : isPt
            ? 'Ocorreu um erro inesperado. Tente novamente em instantes.'
            : 'An unexpected error occurred. Please try again shortly.'
        );
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('[GearProductFeedbackModal] submit failed:', error);
      }
    } finally {
      resetTurnstile();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isPt ? `Opinar sobre este conceito: ${product.name}` : `Share your opinion: ${product.name}`}
        className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 ${panelClass}`}
      >
        <button
          type="button"
          data-modal-initial-focus
          onClick={onClose}
          aria-label={isPt ? 'Fechar' : 'Close'}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${isLight ? 'border-zinc-300 bg-white text-zinc-600 hover:border-blue-400' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-blue-500'}`}
        >
          ✕
        </button>

        <p className={`pr-10 text-[10px] font-black uppercase tracking-widest ${accentTextClass}`}>
          {isPt ? 'Opinar sobre este conceito' : 'Share your opinion on this concept'}
        </p>
        <h3 className="pr-10 text-lg font-black uppercase tracking-tight">{product.name}</h3>

        {submitState === 'success' ? (
          <div className={`mt-6 rounded-2xl border p-5 text-sm font-semibold leading-relaxed ${panelClass}`}>
            <p>{statusMessage}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-500"
            >
              {isPt ? 'Fechar' : 'Close'}
            </button>
          </div>
        ) : (
          <form className="mt-5 space-y-6 text-sm" onSubmit={handleSubmit} noValidate>
            <p className={`${isLight ? 'text-zinc-600' : 'text-zinc-300'} font-semibold leading-relaxed`}>
              {isPt
                ? 'Sua opinião ajudará o Guitar Architect a decidir se este conceito deve avançar para consulta a fornecedores e prototipagem física.'
                : 'Your opinion will help Guitar Architect decide whether this concept should advance to supplier consultation and physical prototyping.'}
            </p>

            {hasExistingResponse && (
              <p className={`rounded-xl border px-3 py-2 text-xs font-bold ${noticeClass}`}>
                {isPt
                  ? 'Você já opinou sobre este conceito. Um novo envio substituirá sua resposta anterior.'
                  : 'You already shared your opinion on this concept. A new submission will replace your previous response.'}
              </p>
            )}

            {authError && (
              <p className={`rounded-xl border px-3 py-2 text-xs font-bold ${noticeClass}`} role="status">
                {authError}
              </p>
            )}

            <fieldset className={`rounded-2xl border p-4 ${fieldsetClass}`}>
              <legend className={`px-1 text-xs font-black uppercase tracking-widest ${legendClass}`}>
                {isPt ? 'Qual é o seu nível de interesse neste conceito?' : 'What is your level of interest in this concept?'}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(option => (
                  <label key={option.id} className={pillClass(interest === option.id)}>
                    <input
                      type="radio"
                      name="gear-feedback-interest"
                      value={option.id}
                      checked={interest === option.id}
                      onChange={() => setInterest(option.id)}
                      className="sr-only"
                    />
                    {option[lang]}
                  </label>
                ))}
              </div>
              {errors.interest && <p className={`mt-2 text-xs font-bold ${errorClass}`} role="alert">{errors.interest}</p>}
            </fieldset>

            <fieldset className={`rounded-2xl border p-4 ${fieldsetClass}`}>
              <legend className={`px-1 text-xs font-black uppercase tracking-widest ${legendClass}`}>
                {isPt ? 'Em que situação você usaria este produto?' : 'In what situation would you use this product?'}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {USE_CONTEXT_OPTIONS.map(option => (
                  <label key={option.id} className={pillClass(useContexts.includes(option.id))}>
                    <input
                      type="checkbox"
                      checked={useContexts.includes(option.id)}
                      onChange={() => toggleUseContext(option.id)}
                      className="sr-only"
                    />
                    {option[lang]}
                  </label>
                ))}
              </div>
              {useContexts.includes('other') && (
                <input
                  type="text"
                  value={otherUseContext}
                  onChange={event => setOtherUseContext(event.target.value)}
                  placeholder={isPt ? 'Descreva brevemente' : 'Briefly describe'}
                  maxLength={140}
                  className={`mt-3 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                />
              )}
              {errors.useContexts && <p className={`mt-2 text-xs font-bold ${errorClass}`} role="alert">{errors.useContexts}</p>}
            </fieldset>

            <fieldset className={`rounded-2xl border p-4 ${fieldsetClass}`}>
              <legend className={`px-1 text-xs font-black uppercase tracking-widest ${legendClass}`}>
                {isPt ? 'O que seria mais importante neste produto?' : 'What would matter most in this product?'}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map(option => (
                  <label key={option.id} className={pillClass(priority === option.id)}>
                    <input
                      type="radio"
                      name="gear-feedback-priority"
                      value={option.id}
                      checked={priority === option.id}
                      onChange={() => setPriority(option.id)}
                      className="sr-only"
                    />
                    {option[lang]}
                  </label>
                ))}
              </div>
              {errors.priority && <p className={`mt-2 text-xs font-bold ${errorClass}`} role="alert">{errors.priority}</p>}
            </fieldset>

            <div>
              <label htmlFor="gear-feedback-comment" className={`block text-xs font-black uppercase tracking-widest ${legendClass}`}>
                {isPt ? 'O que você mudaria, acrescentaria ou evitaria neste conceito?' : 'What would you change, add or avoid in this concept?'}
              </label>
              <textarea
                id="gear-feedback-comment"
                value={comment}
                onChange={event => setComment(event.target.value)}
                rows={3}
                maxLength={1000}
                className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
              />
            </div>

            <fieldset className={`rounded-2xl border p-4 ${fieldsetClass}`}>
              <legend className={`px-1 text-xs font-black uppercase tracking-widest ${legendClass}`}>
                {isPt ? 'Gostaria de acompanhar a evolução deste conceito?' : 'Would you like to follow this concept’s progress?'}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className={pillClass(wantsUpdates === true)}>
                  <input
                    type="radio"
                    name="gear-feedback-updates"
                    checked={wantsUpdates === true}
                    onChange={() => setWantsUpdates(true)}
                    className="sr-only"
                  />
                  {isPt ? 'Sim' : 'Yes'}
                </label>
                <label className={pillClass(wantsUpdates === false)}>
                  <input
                    type="radio"
                    name="gear-feedback-updates"
                    checked={wantsUpdates === false}
                    onChange={() => setWantsUpdates(false)}
                    className="sr-only"
                  />
                  {isPt ? 'Não' : 'No'}
                </label>
              </div>
              {wantsUpdates === true && (
                <div className="mt-3">
                  <label htmlFor="gear-feedback-email" className={`block text-xs font-bold ${mutedTextClass}`}>
                    {isPt ? 'E-mail (opcional)' : 'Email (optional)'}
                  </label>
                  <input
                    id="gear-feedback-email"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="voce@exemplo.com"
                    maxLength={254}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                  />
                  <p className={`mt-1 text-[11px] font-semibold ${mutedTextClass}`}>
                    {isPt ? 'O e-mail será usado apenas para atualizações deste conceito.' : 'This email will only be used for updates about this concept.'}
                  </p>
                  {errors.email && <p className={`mt-2 text-xs font-bold ${errorClass}`} role="alert">{errors.email}</p>}
                </div>
              )}
            </fieldset>

            <div>
              <p className={`mb-2 text-xs font-black uppercase tracking-widest ${legendClass}`}>
                {isPt ? 'Verificação de segurança' : 'Security check'}
              </p>
              <div ref={turnstileContainerRef} />
              {!turnstileSiteKey && (
                <p className={`mt-2 text-xs font-bold ${mutedTextClass}`}>
                  {isPt
                    ? 'Verificação de segurança indisponível nesta implantação.'
                    : 'Security check unavailable in this deployment.'}
                </p>
              )}
              {turnstileError && <p className={`mt-2 text-xs font-bold ${errorClass}`} role="alert">{turnstileError}</p>}
            </div>

            <p className={`text-[11px] font-semibold leading-relaxed ${mutedTextClass}`}>
              {isPt
                ? 'A participação não representa reserva, compra ou compromisso de lançamento.'
                : 'Participating does not represent a reservation, purchase or launch commitment.'}
            </p>

            {(submitState === 'error' || submitState === 'rate_limited') && statusMessage && (
              <p className={`rounded-xl border px-3 py-2 text-xs font-bold ${errorPanelClass}`} role="alert">
                {statusMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              aria-busy={isBusy}
              className={`w-full min-h-11 rounded-xl text-sm font-black uppercase tracking-widest text-white transition ${
                isBusy ? 'cursor-not-allowed bg-blue-400' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {submitState === 'submitting'
                ? isPt ? 'Enviando…' : 'Sending…'
                : submitState === 'authenticating'
                ? isPt ? 'Preparando…' : 'Preparing…'
                : isPt ? 'Enviar opinião' : 'Send feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GearProductFeedbackModal;
