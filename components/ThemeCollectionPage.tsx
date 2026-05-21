import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import ThemeCollectionHeader from './themeCollection/ThemeCollectionHeader';
import ThemeGrid from './themeCollection/ThemeGrid';
import AchievementsPanel from './AchievementsPanel';
import { THEME_REGISTRY, DEFAULT_THEME_ID } from '../features/themeCollection/themeRegistry';
import { getThemeCopy } from '../features/themeCollection/themeCopy';
import { getThemeWithState, loadThemeCollectionState, saveThemeCollectionState, selectTheme } from '../features/themeCollection/themeUtils';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const ThemeCollectionPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [collectionState, setCollectionState] = useState(loadThemeCollectionState);
  const [previewTheme, setPreviewTheme] = useState<typeof THEME_REGISTRY[number] | null>(null);
  const isLight = theme === 'light';
  const items = useMemo(() => THEME_REGISTRY.map(item => getThemeWithState(item, collectionState)), [collectionState]);
  const activeTheme = items.find(item => item.id === collectionState.activeThemeId) || items.find(item => item.id === DEFAULT_THEME_ID) || items[0];
  const activeThemeCopy = getThemeCopy(activeTheme, lang);
  const unlockedCount = items.filter(item => item.unlocked).length;
  const t = translations[lang].harmonicCycle;
  const panelClass = isLight
    ? 'border-[#c2d0e1] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,252,0.92))] shadow-[0_24px_70px_rgba(71,85,105,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]'
    : 'border-blue-900/40 bg-[linear-gradient(145deg,rgba(9,14,23,0.97),rgba(3,7,18,0.93))] shadow-[0_26px_90px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(96,165,250,0.05)]';
  const pageBackgroundStyle = isLight
    ? {
      backgroundColor: '#edf3f8',
      backgroundImage: 'linear-gradient(rgba(156,163,175,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(156,163,175,0.03) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }
    : undefined;

  const persistConfigPatch = (patch: Partial<AppState>) => {
    const current = loadConfig();
    if (!current) return;
    saveConfig({ ...current, ...patch });
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    setTheme(nextTheme);
    persistConfigPatch({ theme: nextTheme });
  };

  const toggleLang = () => {
    const nextLang: Lang = lang === 'pt' ? 'en' : 'pt';
    setLang(nextLang);
    persistConfigPatch({ lang: nextLang });
  };

  const handleSelect = (themeId: string) => {
    const next = selectTheme(themeId, collectionState);
    setCollectionState(next);
    saveThemeCollectionState(next);
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <ThemeCollectionHeader
        activeTheme={activeTheme}
        unlockedCount={unlockedCount}
        totalCount={items.length}
        isLight={isLight}
        lang={lang}
        onBack={() => navigateTo('/')}
        onToggleTheme={toggleTheme}
        onToggleLang={toggleLang}
      />

      <main className="mx-auto max-w-[1700px] px-4 py-7">
        <section className={`rounded-2xl border p-5 ${panelClass}`}>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [lang === 'pt' ? 'Tema ativo' : 'Equipped Theme', activeThemeCopy.name],
              [lang === 'pt' ? 'Progresso' : 'Progress', `${unlockedCount}/${items.length}`],
              [lang === 'pt' ? 'Motor de temas' : 'Theme Engine', lang === 'pt' ? 'Sistema de recursos online' : 'Asset System Online'],
            ].map(([label, value]) => (
              <div key={label} className={`rounded-xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950/70'}`}>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-black">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <ThemeGrid category="tier0" items={items} activeThemeId={collectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier1" items={items} activeThemeId={collectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier2" items={items} activeThemeId={collectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier3" items={items} activeThemeId={collectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier4" items={items} activeThemeId={collectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier5" items={items} activeThemeId={collectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier6" items={items} activeThemeId={collectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />

        <AchievementsPanel isLight={isLight} />

        <div className="mt-8 text-center">
          <button onClick={() => navigateTo('/')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-5 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
            {t.backToFretboard}
          </button>
        </div>
      </main>
      {previewTheme && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/82 p-4 backdrop-blur-xl" onClick={() => setPreviewTheme(null)}>
          <div className={`max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl border p-4 shadow-2xl ${isLight ? 'border-slate-200 bg-white' : 'border-blue-900/60 bg-slate-950'}`} onClick={event => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">{lang === 'pt' ? 'Imagem desbloqueada' : 'Unlocked image'}</p>
                <h2 className="text-lg font-black">{getThemeCopy(previewTheme, lang).name}</h2>
              </div>
              <button onClick={() => setPreviewTheme(null)} className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-700 text-slate-200'}`}>
                {lang === 'pt' ? 'Fechar' : 'Close'}
              </button>
            </div>
            <a href={previewTheme.image} target="_blank" rel="noreferrer" download className="block" title={lang === 'pt' ? 'Abrir ou salvar imagem' : 'Open or save image'}>
              <img src={previewTheme.image} alt={getThemeCopy(previewTheme, lang).name} className="mx-auto max-h-[76vh] w-auto max-w-full rounded-2xl object-contain" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeCollectionPage;
