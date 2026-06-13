import React, { useState } from 'react';
import { loadConfig } from '../utils/persistence';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
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

const EcosystemPage: React.FC = () => {
  const [theme] = useState(() => loadConfig()?.theme || 'dark');
  const [lang] = useState(() => loadConfig()?.lang || 'pt');
  const isLight = theme === 'light';

  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

  const handleToggleTheme = () => {
    const current = loadConfig();
    const next = { ...(current || {}), theme: isLight ? 'dark' : 'light' };
    localStorage.setItem('ga_config', JSON.stringify(next));
    window.location.reload();
  };

  const handleToggleLang = () => {
    const current = loadConfig();
    const next = { ...(current || {}), lang: lang === 'pt' ? 'en' : 'pt' };
    localStorage.setItem('ga_config', JSON.stringify(next));
    window.location.reload();
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 overflow-hidden ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

      <div className="relative mx-auto max-w-6xl py-12 text-center">
        <div className="mb-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${actionClass}`}
            aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
            title={isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode')}
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
          <button
            type="button"
            onClick={handleToggleLang}
            className={`min-h-[40px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${actionClass}`}
            aria-label={lang === 'pt' ? 'Trocar idioma para inglês' : 'Switch language to Portuguese'}
            title={lang === 'pt' ? 'Idioma' : 'Language'}
          >
            {lang.toUpperCase()}
          </button>
        </div>

        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">
          Ecossistema Musical
        </p>

        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
          Guitar Architect
        </h1>

        <p className="mt-4 mb-16 text-zinc-500 font-bold uppercase text-[14px] tracking-[0.25em]">
          Defina sua etapa na construção musical
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              id: 'kids',
              title: 'KIDS',
              subtitle: 'Descoberta musical',
              logo: '/gakidslogo.webp',
              path: '/kids',
              btn: 'bg-emerald-600',
              cta: 'Entrar no Kids',
            },
            {
              id: 'teens',
              title: 'TEENS',
              subtitle: 'Riffs e desafios',
              logo: '/gateenslogo.webp',
              path: '/teens',
              btn: 'bg-violet-600',
              cta: 'Entrar no Teens',
            },
            {
              id: 'studio',
              title: 'STUDIO',
              subtitle: 'Ferramentas avançadas',
              logo: '/logogastudio.webp',
              path: '/studio',
              btn: 'bg-blue-600',
              cta: 'Abrir Studio',
            },
          ].map(area => {
            const isStudio = area.id === 'studio';
            const ctaOffsetClass =
              area.id === 'kids'
                ? 'md:mt-0'
                : area.id === 'teens'
                  ? 'md:mt-1'
                  : 'md:mt-2';
            return (
              <button
                key={area.id}
                onClick={() => navigateTo(area.path)}
                className={`group p-10 md:p-12 rounded-[64px] border transition-all duration-500 text-center flex flex-col items-center ${
                  isLight ? 'bg-white/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'
                } hover:-translate-y-2 shadow-2xl ${
                  isStudio
                    ? 'scale-[1.03] md:scale-[1.04] border-blue-400/60 shadow-[0_0_35px_rgba(37,99,235,0.28)]'
                    : ''
                }`}
              >
                <div className="w-48 h-48 md:w-64 md:h-64 mb-6 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
                  <img
                    src={area.logo}
                    alt={area.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>

                <h2 className={`text-lg md:text-xl font-extrabold uppercase tracking-[0.18em] mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-200'} drop-shadow-[0_0_8px_rgba(148,163,184,0.15)]`}>
                  {area.title}
                </h2>

                <p className={`text-[10px] font-semibold mb-7 tracking-[0.12em] uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {area.subtitle}
                </p>

                <div className={`${ctaOffsetClass} px-8 ${isStudio ? 'py-4 text-[11px]' : 'py-3 text-[10px]'} rounded-xl ${area.btn} text-white font-black uppercase tracking-widest`}>
                  {area.cta}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EcosystemPage;
