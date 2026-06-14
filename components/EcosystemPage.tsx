import React, { useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';

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

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const EcosystemPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const isLight = theme === 'light';

  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

  const handleToggleTheme = () => {
    const current = loadConfig();
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    const next = { ...(current || {}), theme: nextTheme, lang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(nextTheme, lang);
    setTheme(nextTheme);
  };

  const handleToggleLang = () => {
    const current = loadConfig();
    const nextLang: AppLang = lang === 'pt' ? 'en' : 'pt';
    const next = { ...(current || {}), theme, lang: nextLang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(theme, nextLang);
    setLang(nextLang);
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  return (
    <>
    <div className={`relative p-6 md:p-12 pt-3 md:pt-5 [@media(max-height:800px)]:pt-2 overflow-hidden ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

      <div className="relative mx-auto max-w-6xl py-2 md:py-3 text-center">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">
          {lang === 'pt' ? 'Ecossistema Musical' : 'Music Ecosystem'}
        </p>

        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
          Guitar Architect
        </h1>

        <p className="mt-2 mb-4 text-zinc-500 font-bold uppercase text-[14px] tracking-[0.25em]">
          {lang === 'pt' ? 'Defina sua etapa na construção musical: descoberta, prática guiada ou ferramentas avançadas.' : 'Choose your stage in the musical journey: discovery, guided practice, or advanced tools.'}
        </p>

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

        <div className="grid gap-8 md:grid-cols-3 mb-10 md:mb-12 [@media(max-height:800px)]:mb-6">
          {[
            {
              id: 'kids',
              title: 'KIDS',
              subtitle: lang === 'pt' ? 'Descoberta musical' : 'Musical discovery',
              logo: '/gakidslogo.webp',
              path: '/kids',
              btn: 'bg-emerald-600',
              cta: lang === 'pt' ? 'Entrar no Kids' : 'Enter Kids',
            },
            {
              id: 'teens',
              title: 'TEENS',
              subtitle: lang === 'pt' ? 'Riffs e desafios' : 'Riffs and challenges',
              logo: '/gateenslogo.webp',
              path: '/teens',
              btn: 'bg-violet-600',
              cta: lang === 'pt' ? 'Entrar no Teens' : 'Enter Teens',
            },
            {
              id: 'studio',
              title: 'STUDIO',
              subtitle: lang === 'pt' ? 'Ferramentas avançadas' : 'Advanced tools',
              logo: '/logogastudio.webp',
              path: '/studio',
              btn: 'bg-blue-600',
              cta: lang === 'pt' ? 'Abrir Studio' : 'Open Studio',
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
                className={`group px-10 md:px-12 py-7 md:py-9 [@media(max-height:800px)]:py-6 rounded-[64px] border transition-all duration-500 text-center flex flex-col items-center ${
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

    <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default EcosystemPage;
