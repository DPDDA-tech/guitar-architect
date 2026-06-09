import React from 'react';
import { type AppLang } from '../../utils/ecosystemPreferences';
import { getEcosystemLang, getLocalizedBackLabel } from './ecosystemPageCopy';

type EcosystemPageActionsProps = {
  ecosystem: 'kids' | 'teens';
  isLight: boolean;
  backLabel: string;
  backPath: string;
};

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

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9Z" />
  </svg>
);

const getCurrentLang = (ecosystem: 'kids' | 'teens'): AppLang => getEcosystemLang(ecosystem);

export const EcosystemPageActions: React.FC<EcosystemPageActionsProps> = ({ ecosystem, isLight, backLabel, backPath }) => {
  const lang = getCurrentLang(ecosystem);
  const themeStorageKey = ecosystem === 'kids' ? 'ga_kids_theme' : 'ga_teens_theme';
  const langStorageKey = ecosystem === 'kids' ? 'ga_kids_lang' : 'ga_teens_lang';
  const actionClass = ecosystem === 'kids'
    ? (isLight
      ? 'border-emerald-300 bg-white text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.12)] hover:border-emerald-400 hover:shadow-[0_10px_24px_rgba(16,185,129,0.16)]'
      : 'border-emerald-500/70 bg-emerald-950/60 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_0_24px_rgba(16,185,129,0.18)] hover:border-emerald-400 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_0_30px_rgba(16,185,129,0.24)]')
    : (isLight
      ? 'border-violet-300 bg-white text-violet-700 shadow-[0_8px_20px_rgba(139,92,246,0.12)] hover:border-violet-400 hover:shadow-[0_10px_24px_rgba(139,92,246,0.16)]'
      : 'border-violet-700 bg-violet-950/60 text-violet-200 shadow-[0_0_0_1px_rgba(139,92,246,0.16),0_0_24px_rgba(139,92,246,0.18)] hover:border-violet-400 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.22),0_0_30px_rgba(139,92,246,0.24)]');

  const handleToggleTheme = () => {
    const nextTheme = isLight ? 'dark' : 'light';
    localStorage.setItem(themeStorageKey, nextTheme);
    window.location.reload();
  };

  const handleToggleLang = () => {
    const nextLang = lang === 'pt' ? 'en' : 'pt';
    localStorage.setItem(langStorageKey, nextLang);
    window.location.reload();
  };

  const localizedBackLabel = getLocalizedBackLabel(ecosystem, backPath, backLabel);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => navigateTo(backPath)}
        className={`rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${actionClass}`}
      >
        {localizedBackLabel}
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigateTo('/ecosystem')}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${actionClass}`}
          aria-label={lang === 'pt' ? 'Voltar ao ecossistema' : 'Back to ecosystem'}
          title={lang === 'pt' ? 'Ecossistema' : 'Ecosystem'}
        >
          <GlobeIcon />
        </button>
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
    </div>
  );
};

export default EcosystemPageActions;
