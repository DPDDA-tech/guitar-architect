import React from 'react';

interface TeensBasicCareSectionProps {
  isLight: boolean;
  lang: 'pt' | 'en';
}

export const TeensBasicCareSection: React.FC<TeensBasicCareSectionProps> = ({ isLight, lang }) => {
  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('ga-route-change'));
  };

  const copy = lang === 'pt'
    ? {
        title: 'CUIDADOS BÁSICOS',
        subtitle: 'Pequenos cuidados que fazem seu instrumento durar muito mais.',
      }
    : {
        title: 'BASIC CARE',
        subtitle: 'Small habits that help your instrument last much longer.',
      };

  return (
    <button
      type="button"
      onClick={() => navigateTo('/teens/cuidados-basicos')}
      className={`group relative overflow-hidden p-7 rounded-[36px] border backdrop-blur-md flex flex-col items-start text-left transition-all animate-in fade-in zoom-in-95 shadow-2xl hover:border-violet-400 cursor-pointer ${isLight ? 'border-violet-200 bg-white/85 hover:bg-white' : 'border-violet-800/40 bg-zinc-950/40 hover:bg-zinc-900/60'} before:absolute before:inset-0 before:rounded-[36px] before:border before:border-violet-400/30`}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`mb-3 w-full rounded-2xl border px-3 py-2 ${isLight ? 'border-violet-200 bg-violet-50/70' : 'border-violet-500/25 bg-violet-900/20'}`}>
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none" aria-hidden="true">
          <path d="M14 18H226" stroke="#475569" strokeOpacity="0.34" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 26H226" stroke="#475569" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 34H226" stroke="#475569" strokeOpacity="0.26" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 42H226" stroke="#475569" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 50H226" stroke="#475569" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />

          <path d="M30 50C58 46 72 26 92 18C112 10 136 14 156 28C176 42 194 46 214 34" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M44 56C70 52 92 34 116 30C138 26 160 34 180 48" stroke="#a855f7" strokeWidth="2.4" strokeLinecap="round" opacity="0.96" />
          <path d="M108 14L120 6L132 14L120 22Z" stroke="#f59e0b" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="78" cy="20" r="3" fill="#22d3ee" />
          <circle cx="154" cy="20" r="2.5" fill="#f472b6" />
          <circle cx="186" cy="44" r="2.5" fill="#f59e0b" />
          <path d="M58 56L68 46" stroke="#c084fc" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-sm font-black uppercase tracking-[0.14em]">{copy.title}</h3>
      <p className="mt-2 text-[11px] font-bold opacity-70">{copy.subtitle}</p>
    </button>
  );
};
