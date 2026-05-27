import React, { useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const TeensPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getTeensLang());
  const isLight = theme === 'light';

  const copy = lang === 'pt'
    ? {
        title: 'GA Teens',
        subtitle: 'Desafios, riffs, treino guiado e evolução musical para a próxima geração de arquitetos do som.',
        earlyAccess: 'Acesso antecipado',
        ecosystem: 'Explorar Ecossistema',
        studio: 'Modo Profissional (Studio)',
        locked: 'Nível bloqueado',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Escuro',
      }
    : {
        title: 'GA Teens',
        subtitle: 'Challenges, riffs, guided practice and musical growth for the next generation of sound architects.',
        earlyAccess: 'Early access',
        ecosystem: 'Explore Ecosystem',
        studio: 'Professional Mode (Studio)',
        locked: 'Level locked',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
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
    backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#312e81'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#cbd5e1' : '#312e81'} 1px, transparent 1px)`,
    backgroundSize: '28px 28px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 transition-all duration-500 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#03010a] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative mx-auto max-w-5xl">
        <header className={`relative flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ${isLight ? 'rounded-[36px] border border-violet-200/70 bg-white/75 backdrop-blur-sm px-4 py-8 md:px-8 md:py-10 shadow-[0_20px_50px_rgba(139,92,246,0.08)]' : ''}`}>
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/gateenslogo.webp" alt="GA Teens" className="relative w-36 h-36 md:w-52 md:h-52 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-transform group-hover:scale-105" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-violet-500">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold opacity-80 leading-relaxed italic">
            {copy.subtitle}
          </p>
          <div className="mt-6 flex w-full items-center justify-center">
            <span className="px-5 py-2 rounded-full border border-violet-500/50 bg-violet-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              {copy.earlyAccess}
            </span>
            <div className="hidden md:flex absolute right-3 items-center gap-3">
              <button
                onClick={handleToggleTheme}
                className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
              >
                {copy.theme}: {isLight ? copy.light : copy.dark}
              </button>
              <button
                onClick={handleToggleLang}
                className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="mt-3 flex md:hidden gap-2">
            <button
              onClick={handleToggleTheme}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
            >
              {copy.theme}: {isLight ? copy.light : copy.dark}
            </button>
            <button
              onClick={handleToggleLang}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            {
              title: 'Riff Challenges',
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
              title: 'Scale Hunter',
              subtitle: 'Coming soon',
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
              available: false,
              path: '',
            },
            {
              title: 'Chord Builder',
              subtitle: 'Coming soon',
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
              available: false,
              path: '',
            },
            {
              title: 'Rhythm Lab',
              subtitle: 'Coming soon',
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
              available: false,
              path: '',
            },
          ].map((module, idx) => (
            <button
              key={module.title}
              type="button"
              disabled={!module.available}
              onClick={() => module.available && navigateTo(module.path)}
              style={{ animationDelay: `${idx * 150}ms` }}
              className={`group relative p-7 rounded-[36px] border backdrop-blur-md flex flex-col items-start text-left transition-all animate-in fade-in zoom-in-95 shadow-2xl ${module.available ? 'hover:border-violet-400 cursor-pointer' : 'cursor-not-allowed opacity-80'} ${isLight ? 'border-violet-200 bg-white/85 hover:bg-white' : 'border-violet-800/40 bg-zinc-950/40 hover:bg-zinc-900/60'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`mb-3 w-full rounded-2xl border px-3 py-2 ${isLight ? 'border-violet-200 bg-violet-50/70' : 'border-violet-500/25 bg-violet-900/20'}`}>
                {module.visual}
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.14em]">{module.title}</h3>
              <p className="mt-2 text-[11px] font-bold opacity-70">{module.subtitle}</p>
              <p className="mt-3 text-[9px] font-black opacity-40 tracking-[0.2em] group-hover:text-violet-400 transition-colors uppercase">
                {module.available ? (lang === 'pt' ? 'Disponível' : 'Available') : copy.locked}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 mt-16">
          <button
            onClick={() => navigateTo('/ecosystem')}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black uppercase text-xs shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all active:scale-95"
          >
            {copy.ecosystem}
          </button>

          <button
            onClick={() => navigateTo('/studio')}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'}`}
          >
            {copy.studio}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeensPage;
