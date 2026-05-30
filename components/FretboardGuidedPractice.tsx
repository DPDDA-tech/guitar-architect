import React from 'react';

export type FretboardGuidedPracticeData = {
  title: string;
  objective: string;
  steps: string[];
  currentStep: number;
};

interface FretboardGuidedPracticeProps {
  data: FretboardGuidedPracticeData;
  isLight: boolean;
  lang: 'pt' | 'en';
  onNext: () => void;
  onRestart: () => void;
  onClose: () => void;
  isCoachVisible?: boolean;
}

export const FretboardGuidedPractice: React.FC<FretboardGuidedPracticeProps> = ({
  data,
  isLight,
  lang,
  onNext,
  onRestart,
  onClose,
  isCoachVisible = false,
}) => {
  const totalSteps = Math.max(1, data.steps.length);
  const stepIndex = Math.max(0, Math.min(data.currentStep, totalSteps - 1));
  const stepLabel = data.steps[stepIndex] || (lang === 'pt' ? 'Siga para o próximo passo.' : 'Move to the next step.');
  const isLastStep = stepIndex >= totalSteps - 1;

  return (
    <aside
      className={`
        fixed z-[83] pointer-events-auto
        left-3 right-3 ${isCoachVisible ? 'bottom-[16rem]' : 'bottom-[10.5rem]'}
        md:left-10 md:right-auto md:w-[350px] md:${isCoachVisible ? 'bottom-[18.5rem]' : 'bottom-[12.5rem]'}
        rounded-2xl border p-4
        shadow-[0_18px_40px_rgba(2,6,23,0.24)]
        ${isLight ? 'border-indigo-200 bg-white/96 text-zinc-900' : 'border-indigo-500/35 bg-[#0a1226]/94 text-zinc-100'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-500">
            {lang === 'pt' ? 'Prática guiada' : 'Guided practice'}
          </p>
          <h3 className="mt-1 text-[11px] font-black uppercase">{data.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md px-2 text-base leading-none text-zinc-500 transition hover:text-red-500"
          aria-label={lang === 'pt' ? 'Fechar prática guiada' : 'Close guided practice'}
        >
          ×
        </button>
      </div>

      <p className={`mt-2 text-[11px] font-semibold leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>
        {data.objective}
      </p>

      <div className={`mt-3 rounded-xl border px-3 py-2 ${isLight ? 'border-indigo-100 bg-indigo-50/70' : 'border-indigo-500/25 bg-indigo-900/20'}`}>
        <p className={`text-[10px] font-black uppercase tracking-[0.12em] ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
          {lang === 'pt' ? 'Etapa atual' : 'Current step'} {stepIndex + 1}/{totalSteps}
        </p>
        <p className={`mt-1 text-[11px] font-semibold leading-relaxed ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>
          {stepLabel}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onNext}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-black uppercase text-white transition hover:bg-indigo-500 active:scale-[0.98]"
        >
          {isLastStep ? (lang === 'pt' ? 'Concluir' : 'Finish') : (lang === 'pt' ? 'Próximo' : 'Next')}
        </button>
        <button
          onClick={onRestart}
          className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase transition ${isLight ? 'border-zinc-300 text-zinc-700 hover:border-zinc-500' : 'border-zinc-600 text-zinc-200 hover:border-zinc-300'}`}
        >
          {lang === 'pt' ? 'Reiniciar' : 'Restart'}
        </button>
      </div>
    </aside>
  );
};

