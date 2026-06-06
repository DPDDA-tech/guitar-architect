import React from 'react';

interface TeensGarageSectionProps {
  isLight: boolean;
  lang: 'pt' | 'en';
}

export const TeensGarageSection: React.FC<TeensGarageSectionProps> = ({ isLight, lang }) => {
  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('ga-route-change'));
  };

  const copy = lang === 'pt'
    ? {
        title: 'GARAGEM',
        subtitle: 'Monte, personalize e entenda guitarras icônicas sem precisar começar com equipamento caro.',
      }
    : {
        title: 'GARAGEM',
        subtitle: 'Build, customize and understand iconic guitars without starting with expensive gear.',
      };

  return (
    <button
      type="button"
      onClick={() => navigateTo('/teens/garage')}
      className={`group relative overflow-hidden p-7 rounded-[36px] border backdrop-blur-md flex flex-col items-start text-left transition-all animate-in fade-in zoom-in-95 shadow-2xl hover:border-violet-400 cursor-pointer ${isLight ? 'border-violet-200 bg-white/85 hover:bg-white' : 'border-violet-800/40 bg-zinc-950/40 hover:bg-zinc-900/60'}`}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`mb-3 w-full rounded-2xl border px-3 py-2 ${isLight ? 'border-violet-200 bg-violet-50/70' : 'border-violet-500/25 bg-violet-900/20'}`}>
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none" aria-hidden="true">
          <path d="M14 48L52 16L82 46L114 22L148 50L186 18L224 44" stroke="#22d3ee" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 52L74 28L104 54L138 30L170 56L214 36" stroke="#a855f7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
          <path d="M156 18L176 12L190 20L186 28L170 32L156 26Z" stroke="#60a5fa" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="176" cy="22" r="2.5" fill="#22d3ee" />
          <path d="M144 26L130 40" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M128 42L120 50" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-sm font-black uppercase tracking-[0.14em]">{copy.title}</h3>
      <p className="mt-2 text-[11px] font-bold opacity-70">{copy.subtitle}</p>
    </button>
  );
};
