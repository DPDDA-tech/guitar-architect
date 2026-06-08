import React, { useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import { getRankProgress, getTeensXp } from '../utils/teenProgress';
import { TeensGarageSection } from './TeensGarageSection';
import { TeensBasicCareSection } from './TeensBasicCareSection';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type TeensModule = {
  title: string;
  subtitle: string;
  visual: React.ReactNode;
  available: boolean;
  path: string;
  unlockXp?: number;
};

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const TeensPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getTeensLang());
  const isLight = theme === 'light';
  const xp = getTeensXp();
  const rankProgress = getRankProgress(xp);

  const copy = lang === 'pt'
    ? {
        title: 'Guitar Architect Teens',
        subtitle: 'Descubra, pratique e evolua como um verdadeiro arquiteto do som.',
        ecosystem: 'Explorar Ecossistema',
        studio: 'Modo Profissional (Studio)',
        locked: 'Nível bloqueado',
      }
    : {
        title: 'Guitar Architect Teens',
        subtitle: 'Discover, practice and evolve like a true architect of sound.',
        ecosystem: 'Explore Ecosystem',
        studio: 'Professional Mode (Studio)',
        locked: 'Level locked',
      };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ga_teens_theme', next);
      return next;
    });
  };

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === 'pt' ? 'en' : 'pt';
      localStorage.setItem('ga_teens_lang', next);
      return next;
    });
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(129,140,248,0.25)'} 1px, transparent 1px)`,
    backgroundSize: '100% 28px',
  };

  const modules: TeensModule[] = [
    {
      title: 'Desafios de Riff',
      subtitle: lang === 'pt' ? 'Ouça, memorize e reproduza riffs.' : 'Listen, memorize and reproduce riffs.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <path d="M10 52h20M38 40h20M66 24h20M94 44h20M122 14h20" stroke="#a855f7" strokeWidth="5" strokeLinecap="round" />
          <path d="M12 56C44 34 74 34 106 56C138 34 168 34 200 56" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <circle cx="202" cy="56" r="5" fill="#22d3ee" />
        </svg>
      ),
      available: true,
      path: '/teens/riff-challenges',
    },
    {
      title: 'Caça às Escalas',
      subtitle: lang === 'pt' ? 'Caçe padrões por região no braço.' : 'Hunt regional fretboard patterns.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <circle cx="64" cy="32" r="18" stroke="#60a5fa" strokeWidth="2.5" />
          <circle cx="64" cy="32" r="10" stroke="#22d3ee" strokeWidth="2.5" />
          <circle cx="64" cy="32" r="3.5" fill="#22d3ee" />
          <path d="M82 32H122L158 20L198 28" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="122" cy="32" r="4" fill="#a78bfa" />
          <circle cx="158" cy="20" r="4" fill="#f472b6" />
          <circle cx="198" cy="28" r="4" fill="#22d3ee" />
        </svg>
      ),
      available: true,
      path: '/teens/scale-hunter',
      unlockXp: 220,
    },
    {
      title: 'Explorador de Acordes',
      subtitle: lang === 'pt' ? 'Descubra os acordes essenciais e seus formatos mais usados.' : 'Discover essential chords and their most common shapes.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <path d="M20 14H220" stroke="#334155" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 24H220" stroke="#334155" strokeOpacity="0.24" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 34H220" stroke="#334155" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 44H220" stroke="#334155" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 54H220" stroke="#334155" strokeOpacity="0.14" strokeWidth="2" strokeLinecap="round" />
          <path d="M54 18V50M98 18V50M142 18V50M186 18V50" stroke="#475569" strokeOpacity="0.3" strokeWidth="2" />
          <circle cx="54" cy="24" r="4" fill="#22d3ee" />
          <circle cx="54" cy="44" r="4" fill="#22d3ee" />
          <circle cx="98" cy="34" r="4" fill="#a855f7" />
          <circle cx="142" cy="24" r="4" fill="#f59e0b" />
          <circle cx="142" cy="44" r="4" fill="#f59e0b" />
          <circle cx="186" cy="34" r="4" fill="#f472b6" />
          <path d="M40 56C66 42 76 20 100 18C126 16 138 42 162 44C182 46 196 36 212 22" stroke="#22d3ee" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      ),
      available: true,
      path: '/teens/explorador-de-acordes',
      unlockXp: 240,
    },
    {
      title: 'Mapa de Tríades',
      subtitle: lang === 'pt' ? 'Veja tríades e inversões ligadas pelo braço inteiro.' : 'See triads and inversions connected across the full neck.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <path d="M20 14H220" stroke="#334155" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 24H220" stroke="#334155" strokeOpacity="0.24" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 34H220" stroke="#334155" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 44H220" stroke="#334155" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 54H220" stroke="#334155" strokeOpacity="0.14" strokeWidth="2" strokeLinecap="round" />
          <path d="M48 18V50M90 18V50M132 18V50M174 18V50" stroke="#475569" strokeOpacity="0.3" strokeWidth="2" />
          <circle cx="48" cy="44" r="4" fill="#ef4444" />
          <circle cx="90" cy="34" r="4" fill="#2563eb" />
          <circle cx="132" cy="24" r="4" fill="#2563eb" />
          <circle cx="174" cy="34" r="4" fill="#ef4444" opacity="0.65" />
          <circle cx="216" cy="24" r="4" fill="#2563eb" opacity="0.65" />
          <path d="M48 44C64 40 74 38 90 34C106 30 116 28 132 24" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M174 34C190 30 200 28 216 24" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        </svg>
      ),
      available: true,
      path: '/teens/triad-map',
      unlockXp: 260,
    },
    {
      title: 'Construtor de Acordes',
      subtitle: lang === 'pt' ? 'Monte blocos harmônicos por sensação.' : 'Build harmonic blocks by feel.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <rect x="20" y="34" width="26" height="18" rx="4" fill="#3b82f6" />
          <rect x="56" y="24" width="26" height="28" rx="4" fill="#22d3ee" />
          <rect x="92" y="14" width="26" height="38" rx="4" fill="#8b5cf6" />
          <rect x="128" y="24" width="26" height="28" rx="4" fill="#f472b6" />
          <path d="M46 43H56M82 38H92M118 33H128" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M154 38H198" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
      available: true,
      path: '/teens/chord-builder',
      unlockXp: 280,
    },
    {
      title: 'Laboratório de Ritmo',
      subtitle: lang === 'pt' ? 'Treine pulsos e timing em loops curtos.' : 'Train pulses and timing with short loops.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <rect x="16" y="30" width="8" height="20" rx="3" fill="#22d3ee" />
          <rect x="30" y="22" width="8" height="28" rx="3" fill="#60a5fa" />
          <rect x="44" y="30" width="8" height="20" rx="3" fill="#22d3ee" />
          <rect x="66" y="18" width="8" height="32" rx="3" fill="#a855f7" />
          <rect x="80" y="26" width="8" height="24" rx="3" fill="#c084fc" />
          <rect x="94" y="18" width="8" height="32" rx="3" fill="#a855f7" />
          <path d="M120 44C138 26 156 26 174 44C192 26 210 26 224 38" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
      available: true,
      path: '/teens/rhythm-lab',
      unlockXp: 120,
    },
    {
      title: 'Batidas Populares',
      subtitle: lang === 'pt' ? 'Aprenda levadas com setas tradicionais de cifra.' : 'Learn strumming patterns with classic arrow notation.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <path d="M42 16V48" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 38L42 50L52 38" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M92 48V16" stroke="#fb7185" strokeWidth="4" strokeLinecap="round" />
          <path d="M82 26L92 14L102 26" stroke="#fb7185" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M128 22C144 10 162 10 178 22" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M128 42C144 54 162 54 178 42" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="196" cy="32" r="6" fill="#22d3ee" />
        </svg>
      ),
      available: true,
      path: '/teens/batidas-populares',
      unlockXp: 160,
    },
    {
      title: 'Leitura de Partitura + TAB',
      subtitle: lang === 'pt' ? 'Leia partitura + TAB como um mapa musical.' : 'Read staff + TAB as a musical map.',
      visual: (
        <svg viewBox="0 0 240 64" className="h-16 w-full" fill="none">
          <line x1="12" y1="18" x2="228" y2="18" stroke="#64748b" />
          <line x1="12" y1="25" x2="228" y2="25" stroke="#64748b" />
          <line x1="12" y1="32" x2="228" y2="32" stroke="#64748b" />
          <line x1="12" y1="39" x2="228" y2="39" stroke="#64748b" />
          <line x1="12" y1="46" x2="228" y2="46" stroke="#64748b" />
          <circle cx="68" cy="39" r="4" fill="#22d3ee" />
          <circle cx="120" cy="32" r="4" fill="#a855f7" />
          <circle cx="174" cy="25" r="4" fill="#f472b6" />
          <path d="M20 56h18M52 56h18M84 56h18M116 56h18M148 56h18M180 56h18" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      available: true,
      path: '/teens/blueprint-reading',
      unlockXp: 360,
    },
  ];

  return (
    <div className={`min-h-screen relative p-6 md:p-12 transition-all duration-500 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#03010a] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <div className="relative mx-auto max-w-5xl">
        <header className={`relative flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ${isLight ? 'rounded-[36px] border border-violet-200/70 bg-white/75 backdrop-blur-sm px-4 py-8 md:px-8 md:py-10 shadow-[0_20px_50px_rgba(139,92,246,0.08)]' : ''}`}>
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/gateenslogo.webp" alt="GA Teens" className="relative w-36 h-36 md:w-52 md:h-52 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-transform group-hover:scale-105" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-violet-500">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base font-bold opacity-80 leading-relaxed italic">{copy.subtitle}</p>

          <div className={`mt-5 w-full max-w-md rounded-xl border px-4 py-3 ${isLight ? 'border-violet-200 bg-violet-50/60' : 'border-violet-700/60 bg-violet-950/35'}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Progressão</p>
              <p className="text-[11px] font-black uppercase">{rankProgress.current.label} · XP {xp}</p>
            </div>
            <div className={`mt-2 h-2 w-full rounded-full ${isLight ? 'bg-violet-100' : 'bg-zinc-800'}`}>
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all" style={{ width: `${rankProgress.percent}%` }} />
            </div>
            {rankProgress.next && (
              <p className={`mt-2 text-[11px] font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {Math.max(0, rankProgress.next.minXp - xp)} XP para {rankProgress.next.label}
              </p>
            )}
          </div>

          <div className="mt-6 flex w-full items-center justify-center">
            <div className="hidden md:flex absolute right-3 items-center gap-3">
              <button
                onClick={handleToggleTheme}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
                aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
                title={isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode')}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
              <button onClick={handleToggleLang} className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}>{lang.toUpperCase()}</button>
            </div>
          </div>

          <div className="mt-3 flex md:hidden gap-2">
            <button
              onClick={handleToggleTheme}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
              aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
              title={isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode')}
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={handleToggleLang} className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}>{lang.toUpperCase()}</button>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {modules.map((module, idx) => {
            const cardTier = xp >= 620 ? 'tier-neon' : xp >= 320 ? 'tier-pulse' : xp >= 120 ? 'tier-trail' : 'tier-base';
            const tierClass = cardTier === 'tier-neon'
              ? 'before:absolute before:inset-0 before:rounded-[36px] before:border before:border-fuchsia-400/35 before:shadow-[0_0_35px_rgba(217,70,239,0.22)]'
              : cardTier === 'tier-pulse'
                ? 'before:absolute before:inset-0 before:rounded-[36px] before:border before:border-cyan-400/35 before:shadow-[0_0_26px_rgba(34,211,238,0.2)]'
                : cardTier === 'tier-trail'
                  ? 'before:absolute before:inset-0 before:rounded-[36px] before:border before:border-violet-400/30'
                  : '';
            return (
              <button
                key={module.title}
                type="button"
                disabled={!module.available}
                onClick={() => module.available && navigateTo(module.path)}
                style={{ animationDelay: `${idx * 150}ms` }}
                className={`group relative overflow-hidden p-7 rounded-[36px] border backdrop-blur-md flex flex-col items-start text-left transition-all animate-in fade-in zoom-in-95 shadow-2xl ${module.available ? 'hover:border-violet-400 cursor-pointer' : 'cursor-not-allowed opacity-80'} ${isLight ? 'border-violet-200 bg-white/85 hover:bg-white' : 'border-violet-800/40 bg-zinc-950/40 hover:bg-zinc-900/60'} ${tierClass}`}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`mb-3 w-full rounded-2xl border px-3 py-2 ${isLight ? 'border-violet-200 bg-violet-50/70' : 'border-violet-500/25 bg-violet-900/20'}`}>{module.visual}</div>
                <h3 className="text-sm font-black uppercase tracking-[0.14em]">{module.title}</h3>
                <p className="mt-2 text-[11px] font-bold opacity-70">{module.subtitle}</p>
                {!module.available && (
                  <p className="mt-3 text-[9px] font-black opacity-40 tracking-[0.2em] group-hover:text-violet-400 transition-colors uppercase">
                    {copy.locked}
                  </p>
                )}
              </button>
            );
          })}
          <TeensGarageSection isLight={isLight} lang={lang} />
          <TeensBasicCareSection isLight={isLight} lang={lang} />
        </div>

        <div className="flex flex-col items-center gap-6 mt-16">
          <button onClick={() => navigateTo('/ecosystem')} className="px-12 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black uppercase text-xs shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all active:scale-95">{copy.ecosystem}</button>
          <button onClick={() => navigateTo('/studio')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'}`}>{copy.studio}</button>
        </div>
      </div>
    </div>
  );
};

export default TeensPage;
