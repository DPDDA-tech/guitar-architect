import React from 'react';

export type FretboardContextCoachData = {
  title: string;
  message: string;
  source?: string;
};

interface FretboardContextCoachProps {
  context: FretboardContextCoachData;
  isLight: boolean;
  lang: 'pt' | 'en';
  onClose: () => void;
}

export const FretboardContextCoach: React.FC<FretboardContextCoachProps> = ({
  context,
  isLight,
  lang,
  onClose,
}) => (
  <aside
    className={`
      fixed z-[85] pointer-events-auto
      bottom-20 left-3 md:bottom-10 md:left-10
      w-full max-w-[260px] sm:max-w-[320px] md:max-w-[360px]
      rounded-2xl border p-4
      shadow-[0_18px_44px_rgba(2,6,23,0.24)]
      ${isLight ? 'border-blue-200 bg-white/95 text-zinc-900' : 'border-blue-500/35 bg-[#091227]/92 text-zinc-100'}
    `}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
          {lang === 'pt' ? 'Context Coach' : 'Context Coach'}
        </p>
        <h3 className="mt-1 text-sm font-black uppercase">{context.title}</h3>
      </div>
      <button
        onClick={onClose}
        className="rounded-md px-2 text-base leading-none text-zinc-500 transition hover:text-red-500"
        aria-label={lang === 'pt' ? 'Fechar coach' : 'Close coach'}
      >
        ×
      </button>
    </div>
    <p className={`mt-2 text-xs font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
      {context.message}
    </p>
  </aside>
);

