import React from 'react';

export type FretboardOnboardingTip = {
  id: string;
  title: string;
  message: string;
};

interface FretboardOnboardingOverlayProps {
  tip: FretboardOnboardingTip;
  isLight: boolean;
  lang: 'pt' | 'en';
  onAcknowledge: () => void;
  onDismissForever: () => void;
}

export const FretboardOnboardingOverlay: React.FC<FretboardOnboardingOverlayProps> = ({
  tip,
  isLight,
  lang,
  onAcknowledge,
  onDismissForever,
}) => {
  return (
    <aside
      className={`
        fixed z-[82] pointer-events-auto
        right-3 left-3 bottom-20
        md:left-auto md:right-10 md:bottom-10 md:w-[340px]
        rounded-2xl border p-4
        shadow-[0_16px_36px_rgba(2,6,23,0.22)]
        ${isLight ? 'border-amber-200 bg-white/95 text-zinc-900' : 'border-amber-500/35 bg-[#1b1307]/92 text-zinc-100'}
      `}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-500">
        {lang === 'pt' ? 'Onboarding' : 'Onboarding'}
      </p>
      <h3 className="mt-1 text-[11px] font-black uppercase">{tip.title}</h3>
      <p className={`mt-2 text-[11px] font-semibold leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>
        {tip.message}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onAcknowledge}
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-black uppercase text-white transition hover:bg-amber-400 active:scale-[0.98]"
        >
          {lang === 'pt' ? 'Entendi' : 'Got it'}
        </button>
        <button
          onClick={onDismissForever}
          className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase transition ${isLight ? 'border-zinc-300 text-zinc-700 hover:border-zinc-500' : 'border-zinc-600 text-zinc-200 hover:border-zinc-300'}`}
        >
          {lang === 'pt' ? 'Não mostrar novamente' : "Don't show again"}
        </button>
      </div>
    </aside>
  );
};

