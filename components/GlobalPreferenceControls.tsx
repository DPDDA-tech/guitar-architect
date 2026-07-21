import React from 'react';
import type { AppLang, ThemeMode } from '../utils/ecosystemPreferences';

interface GlobalPreferenceControlsProps {
  theme: ThemeMode;
  lang: AppLang;
  onThemeChange: (theme: ThemeMode) => void;
  onLangChange: (lang: AppLang) => void;
  compact?: boolean;
}

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const GlobalPreferenceControls: React.FC<GlobalPreferenceControlsProps> = ({
  theme,
  lang,
  onThemeChange,
  onLangChange,
  compact = false,
}) => {
  const isLight = theme === 'light';
  const controlClass = isLight
    ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-800'
    : 'border-slate-700 bg-slate-950/75 text-slate-100 hover:border-cyan-400 hover:text-cyan-100';
  const themeName = isLight ? (lang === 'pt' ? 'Claro' : 'Light') : (lang === 'pt' ? 'Escuro' : 'Dark');

  return (
    <div className="flex items-center gap-2" role="group" aria-label={lang === 'pt' ? 'Preferências globais' : 'Global preferences'}>
      <button
        type="button"
        data-current-theme={theme}
        onClick={() => onThemeChange(isLight ? 'dark' : 'light')}
        aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
        title={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
        className={`flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-[10px] font-black uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${controlClass}`}
      >
        {isLight ? <MoonIcon /> : <SunIcon />}
        {!compact && <span>{themeName}</span>}
      </button>
      <button
        type="button"
        data-current-lang={lang}
        onClick={() => onLangChange(lang === 'pt' ? 'en' : 'pt')}
        aria-label={lang === 'pt' ? 'Trocar idioma para inglês; idioma atual português' : 'Switch language to Portuguese; current language English'}
        title={lang === 'pt' ? 'Idioma atual: português' : 'Current language: English'}
        className={`min-h-10 rounded-xl border px-3 text-[10px] font-black uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${controlClass}`}
      >
        {lang.toUpperCase()}
      </button>
    </div>
  );
};

export default GlobalPreferenceControls;
