import React from 'react';

export type FretboardExecutionFeedbackData = {
  title: string;
  status: string;
  steps: string[];
  currentStep: number;
  focusLabel?: string;
};

interface FretboardExecutionFeedbackProps {
  data: FretboardExecutionFeedbackData;
  isLight: boolean;
  lang: 'pt' | 'en';
  onNextStep?: () => void;
  onClose: () => void;
  isCoachVisible?: boolean;
}

export const FretboardExecutionFeedback: React.FC<FretboardExecutionFeedbackProps> = ({
  data,
  isLight,
  lang,
  onNextStep,
  onClose,
  isCoachVisible = false,
}) => {
  const totalSteps = data.steps.length;
  const safeStep = Math.max(0, Math.min(data.currentStep, Math.max(totalSteps - 1, 0)));
  const hasSequence = totalSteps > 1;

  return (
    <aside
      className={`
        fixed z-[84] pointer-events-auto
        left-3 right-3 ${isCoachVisible ? 'bottom-[9.5rem]' : 'bottom-20'}
        md:left-10 md:right-auto md:w-[320px] md:${isCoachVisible ? 'bottom-[11.5rem]' : 'bottom-10'}
        rounded-2xl border p-3.5
        shadow-[0_14px_30px_rgba(2,6,23,0.2)]
        ${isLight ? 'border-emerald-200 bg-white/95 text-zinc-900' : 'border-emerald-500/35 bg-[#081a18]/92 text-zinc-100'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-500">
            {lang === 'pt' ? 'Feedback de execução' : 'Execution feedback'}
          </p>
          <h3 className="mt-1 text-[11px] font-black uppercase">{data.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md px-2 text-base leading-none text-zinc-500 transition hover:text-red-500"
          aria-label={lang === 'pt' ? 'Fechar feedback' : 'Close feedback'}
        >
          ×
        </button>
      </div>

      <p className={`mt-2 text-[11px] font-semibold leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>
        {data.status}
      </p>

      {data.focusLabel ? (
        <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.14em] ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
          {data.focusLabel}
        </p>
      ) : null}

      {hasSequence ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className={`text-[10px] font-black uppercase tracking-[0.12em] ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
            {lang === 'pt' ? 'Etapa' : 'Step'} {safeStep + 1}/{totalSteps}
          </p>
          <button
            onClick={onNextStep}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase text-white transition hover:bg-emerald-500 active:scale-[0.98]"
          >
            {lang === 'pt' ? 'Próximo passo' : 'Next step'}
          </button>
        </div>
      ) : null}
    </aside>
  );
};

