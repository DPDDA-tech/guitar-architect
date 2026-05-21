import React, { useEffect, useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import ThemeCollectionHeader from './themeCollection/ThemeCollectionHeader';
import ThemeGrid from './themeCollection/ThemeGrid';
import AchievementsPanel from './AchievementsPanel';
import { THEME_REGISTRY, DEFAULT_THEME_ID } from '../features/themeCollection/themeRegistry';
import { getThemeCopy } from '../features/themeCollection/themeCopy';
import { getThemeWithState, loadThemeCollectionState, saveThemeCollectionState, selectTheme } from '../features/themeCollection/themeUtils';
import { getUnlockedAchievements, getUnlockedRewards } from '../utils/achievementUtils';
import { getUnlockedAchievementIds, unlockAchievement } from '../utils/achievementStorage';
import { getCollectionLoreByPath, type CollectionLoreItem } from '../data/collectionLore';

const CORE_ACHIEVEMENT_ID = 'core-enter-architect';

type CollectionPreview = {
  image: string;
  name: string;
  subtitle: string;
};

type WorkCollectionItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  rarity: string;
  image: string;
};

const collectionCategoryLabel: Record<CollectionLoreItem['category'], Record<Lang, string>> = {
  classic_headstock: { pt: 'Headstocks clássicos', en: 'Classic Headstocks' },
  artist_series: { pt: 'Série de artistas', en: 'Artist Series' },
  extended_range: { pt: 'Extended Range', en: 'Extended Range' },
  bass_collection: { pt: 'Coleção de baixos', en: 'Bass Collection' },
  collector_badge: { pt: 'Colecionadores', en: 'Collectors' },
  anniversary: { pt: 'Aniversário', en: 'Anniversary' },
  legendary: { pt: 'Lendário', en: 'Legendary' },
};

const renderLorePanel = (path: string, isLight: boolean, lang: Lang) => {
  const lore = getCollectionLoreByPath(path);
  if (!lore) return null;
  const infoBlocks = [
    lore.history ? { label: lang === 'pt' ? 'História' : 'History', body: lore.history[lang] } : null,
    lore.artistInfluence ? { label: lang === 'pt' ? 'Influência musical' : 'Musical Influence', body: lore.artistInfluence[lang] } : null,
    lore.technicalIdentity ? { label: lang === 'pt' ? 'Identidade técnica' : 'Technical Identity', body: lore.technicalIdentity[lang] } : null,
  ].filter((item): item is { label: string; body: string } => Boolean(item));
  const metaItems = [
    lore.yearFounded ? [lang === 'pt' ? 'Marco' : 'Milestone', lore.yearFounded] : null,
    lore.country ? [lang === 'pt' ? 'País' : 'Country', lore.country[lang]] : null,
    lore.founder ? [lang === 'pt' ? 'Referência histórica' : 'Historical Reference', lore.founder] : null,
  ].filter((item): item is string[] => Boolean(item));

  return (
    <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-blue-900/60 bg-[#050914] text-slate-100'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-900/80 bg-blue-950/40 text-blue-200'}`}>
          {lore.tier}
        </span>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-800 bg-slate-950/70 text-slate-300'}`}>
          {collectionCategoryLabel[lore.category][lang]}
        </span>
        {lore.tone === 'mythic' && (
          <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-800/70 bg-amber-950/30 text-amber-200'}`}>
            {lang === 'pt' ? 'Referência mítica' : 'Mythic Reference'}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-xl font-black uppercase tracking-tight">{lore.title[lang]}</h3>
      <p className={`mt-2 max-w-3xl text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
        {lore.shortText[lang]}
      </p>
      {metaItems.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {metaItems.map(([label, value]) => (
            <span key={`${label}-${value}`} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.13em] ${isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-800 bg-slate-950/70 text-slate-400'}`}>
              {label}: <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{value}</span>
            </span>
          ))}
        </div>
      )}
      {infoBlocks.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {infoBlocks.map(block => (
            <div key={block.label} className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-blue-950/70 bg-slate-950/60'}`}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">{block.label}</p>
              <p className={`mt-2 text-xs font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {block.body}
              </p>
            </div>
          ))}
        </div>
      )}
      {lore.legalNote && (
        <p className={`mt-4 text-[10px] font-bold uppercase tracking-[0.12em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          {lore.legalNote[lang]}
        </p>
      )}
    </div>
  );
};

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
  const [previewAsset, setPreviewAsset] = useState<CollectionPreview | null>(null);
  const currentUserId = useMemo(() => getInitialConfig()?.currentUser, []);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>(() => getUnlockedAchievementIds(currentUserId));
  const isLight = theme === 'light';
  const achievementUnlockedThemeIds = useMemo(() => {
    const unlockedAssets = new Set<string>();
    getUnlockedAchievements(unlockedAchievementIds).forEach(achievement => {
      if (achievement.asset.status === 'ready' && achievement.asset.path && !achievement.asset.path.includes('/tierothers/')) {
        unlockedAssets.add(achievement.asset.path);
      }
    });
    getUnlockedRewards(unlockedAchievementIds).forEach(reward => {
      if (reward.asset.status === 'ready' && reward.asset.path && !reward.asset.path.includes('/tierothers/')) {
        unlockedAssets.add(reward.asset.path);
      }
    });
    return THEME_REGISTRY
      .filter(themeItem => themeItem.unlocked || unlockedAssets.has(themeItem.image))
      .map(themeItem => themeItem.id);
  }, [unlockedAchievementIds]);
  const effectiveCollectionState = useMemo(() => ({
    ...collectionState,
    unlockedThemeIds: Array.from(new Set([...collectionState.unlockedThemeIds, ...achievementUnlockedThemeIds])),
  }), [achievementUnlockedThemeIds, collectionState]);
  const items = useMemo(() => THEME_REGISTRY.map(item => getThemeWithState(item, effectiveCollectionState)), [effectiveCollectionState]);
  const workRewards = useMemo(() => {
    const itemMap = new Map<string, WorkCollectionItem>();
    getUnlockedAchievements(unlockedAchievementIds).forEach(achievement => {
      if (achievement.asset.status !== 'ready' || !achievement.asset.path) return;
      if (!achievement.asset.path.includes('/tierothers/')) return;
      itemMap.set(`achievement:${achievement.id}`, {
        id: `achievement:${achievement.id}`,
        title: achievement.title,
        description: achievement.description,
        type: achievement.category,
        rarity: achievement.rarity,
        image: achievement.asset.path,
      });
    });
    getUnlockedRewards(unlockedAchievementIds).forEach(reward => {
      if (!reward.asset.path) return;
      if (!reward.asset.path.includes('/tierothers/')) return;
      itemMap.set(`reward:${reward.id}`, {
        id: `reward:${reward.id}`,
        title: reward.title,
        description: reward.description,
        type: reward.type,
        rarity: reward.rarity,
        image: reward.asset.path,
      });
    });
    return Array.from(itemMap.values());
  }, [unlockedAchievementIds]);
  const activeTheme = items.find(item => item.id === effectiveCollectionState.activeThemeId) || items.find(item => item.id === DEFAULT_THEME_ID) || items[0];
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

  useEffect(() => {
    if (unlockedAchievementIds.includes(CORE_ACHIEVEMENT_ID)) return;
    setUnlockedAchievementIds(unlockAchievement(CORE_ACHIEVEMENT_ID, currentUserId));
  }, [currentUserId, unlockedAchievementIds]);

  useEffect(() => {
    const refreshUnlockedRewards = () => setUnlockedAchievementIds(getUnlockedAchievementIds(currentUserId));
    window.addEventListener('ga-achievements-unlocked', refreshUnlockedRewards);
    window.addEventListener('storage', refreshUnlockedRewards);
    return () => {
      window.removeEventListener('ga-achievements-unlocked', refreshUnlockedRewards);
      window.removeEventListener('storage', refreshUnlockedRewards);
    };
  }, [currentUserId]);

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
    const next = selectTheme(themeId, effectiveCollectionState);
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

        <ThemeGrid category="tier0" items={items} activeThemeId={effectiveCollectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier1" items={items} activeThemeId={effectiveCollectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier2" items={items} activeThemeId={effectiveCollectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier3" items={items} activeThemeId={effectiveCollectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier4" items={items} activeThemeId={effectiveCollectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier5" items={items} activeThemeId={effectiveCollectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />
        <ThemeGrid category="tier6" items={items} activeThemeId={effectiveCollectionState.activeThemeId} isLight={isLight} lang={lang} onSelect={handleSelect} onPreview={setPreviewTheme} />

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                {lang === 'pt' ? 'Coleção' : 'Collection'}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
                {lang === 'pt' ? 'Coleção da Obra' : 'Work Collection'}
              </h2>
              <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {lang === 'pt'
                  ? 'Selos, badges e logos oficiais liberados pelas conquistas, pela jornada de estudo e pelos marcos especiais do Guitar Architect.'
                  : 'Official seals, badges and logos unlocked through achievements, study milestones and special Guitar Architect moments.'}
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-800/60 bg-blue-950/30 text-blue-200'}`}>
              {workRewards.length} {lang === 'pt' ? 'itens' : 'items'}
            </span>
          </div>
          {workRewards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {workRewards.map(reward => (
                <button
                  key={reward.id}
                  type="button"
                  onClick={() => setPreviewAsset({ image: reward.image, name: reward.title, subtitle: reward.description })}
                  className={`group overflow-hidden rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${isLight ? 'border-[#c7d4e4] bg-white/94 shadow-[0_18px_42px_rgba(71,85,105,0.12)]' : 'border-blue-900/55 bg-[linear-gradient(145deg,rgba(7,13,24,0.96),rgba(3,7,18,0.98))] shadow-[0_22px_70px_rgba(2,6,23,0.42)]'}`}
                >
                  <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-blue-950/60 bg-slate-950'}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.18),transparent_58%)] opacity-0 transition group-hover:opacity-100" />
                    <img src={reward.image} alt={reward.title} className="relative h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">{reward.type}</p>
                      <h3 className="mt-1 text-base font-black">{reward.title}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-900/70 bg-blue-950/35 text-blue-200'}`}>
                      {reward.rarity.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{reward.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className={`rounded-2xl border p-6 text-sm font-bold ${isLight ? 'border-[#c7d4e4] bg-white/90 text-slate-600' : 'border-blue-900/55 bg-[#050914] text-slate-400'}`}>
              {lang === 'pt'
                ? 'Os selos da obra aparecerão aqui conforme forem desbloqueados.'
                : 'Work collection items will appear here as they are unlocked.'}
            </div>
          )}
        </section>

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
            {renderLorePanel(previewTheme.image, isLight, lang)}
          </div>
        </div>
      )}
      {previewAsset && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/82 p-4 backdrop-blur-xl" onClick={() => setPreviewAsset(null)}>
          <div className={`max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl border p-4 shadow-2xl ${isLight ? 'border-slate-200 bg-white' : 'border-blue-900/60 bg-slate-950'}`} onClick={event => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">{lang === 'pt' ? 'Item desbloqueado' : 'Unlocked item'}</p>
                <h2 className="text-lg font-black">{previewAsset.name}</h2>
                <p className={`mt-1 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{previewAsset.subtitle}</p>
              </div>
              <button onClick={() => setPreviewAsset(null)} className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-700 text-slate-200'}`}>
                {lang === 'pt' ? 'Fechar' : 'Close'}
              </button>
            </div>
            <a href={previewAsset.image} target="_blank" rel="noreferrer" download className="block" title={lang === 'pt' ? 'Abrir ou salvar imagem' : 'Open or save image'}>
              <img src={previewAsset.image} alt={previewAsset.name} className="mx-auto max-h-[76vh] w-auto max-w-full rounded-2xl object-contain" />
            </a>
            {renderLorePanel(previewAsset.image, isLight, lang)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeCollectionPage;
