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
import { supporterRewards, getUnlockedSupporterRewards } from '../data/supporterRewards';
import { getSupporterContributionTotal, setSupporterContributionTotal, syncUnlockedSupporterRewards, hydrateSupporterFromServer } from '../utils/supporterStorage';
import { SUPPORTER_PIX_KEY, SUPPORTER_CONTACT_EMAIL } from '../utils/supporterConstants';
import { getSupporterTierInfo, formatTierName } from '../utils/supporterTierHelpers';
import { PinBadgeAction } from './themeCollection/PinBadgeAction';
import { supporterFirstRewards } from '../data/supporterFirstRewards';
import { getEligibleFirstSupporterRewardIds } from '../utils/supporterFirstEligibility';
import { supabase } from '../src/lib/supabase';
import { constancyRewards } from '../data/constancyRewards';
import { getRewardMetadataById } from '../utils/rewardLookup';
import { isAdminEmail } from '../utils/adminAccess';
import { getConstancyState, getNextConstancyMilestone } from '../utils/constancyStorage';

const CORE_ACHIEVEMENT_ID = 'core-enter-architect';

type CollectionPreview = {
  id: string;
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
  const config = useMemo(() => getInitialConfig(), []);
  const [lang, setLang] = useState<Lang>(() => config?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => config?.theme || 'dark');
  const currentUserId = useMemo(() => config?.currentUser, [config]);

  const [collectionState, setCollectionState] = useState(() => loadThemeCollectionState(currentUserId));
  const [previewTheme, setPreviewTheme] = useState<typeof THEME_REGISTRY[number] | null>(null);
  const [previewAsset, setPreviewAsset] = useState<CollectionPreview | null>(null);
  const [supporterToast, setSupporterToast] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [constancyRefreshToken, setConstancyRefreshToken] = useState(0);

  const constancyState = useMemo(() => getConstancyState(currentUserId), [currentUserId, constancyRefreshToken]);
  const nextMilestone = useMemo(() => getNextConstancyMilestone(constancyState.currentStreak), [constancyState.currentStreak]);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>(() => getUnlockedAchievementIds(currentUserId));
  const [supporterTotal, setSupporterTotal] = useState(() => getSupporterContributionTotal(currentUserId));
  const [supporterInput, setSupporterInput] = useState(() => String(getSupporterContributionTotal(currentUserId)));
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
      itemMap.set(achievement.asset.path, {
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
      if (itemMap.has(reward.asset.path)) return;
      itemMap.set(reward.asset.path, {
        id: `reward:${reward.id}`,
        title: reward.title,
        description: reward.description,
        type: reward.type,
        rarity: reward.rarity,
        image: reward.asset.path,
      });
    });
    
    // FIX: Adicionar itens "órfãos" que estão desbloqueados mas não são conquistas padrão
    unlockedAchievementIds.forEach(id => {
      const meta = getRewardMetadataById(id);
      if (meta && meta.image && meta.image.includes('/tierothers/')) {
        if (!itemMap.has(meta.image)) {
          itemMap.set(meta.image, {
            id: meta.id.startsWith('reward:') || meta.id.startsWith('achievement:') ? meta.id : `reward:${meta.id}`,
            title: meta.title,
            description: (meta as any).description || 'Item especial desbloqueado.',
            type: meta.category || 'Special',
            rarity: (meta as any).rarity || 'rare',
            image: meta.image
          });
        }
      }
    });
    return Array.from(itemMap.values());
  }, [unlockedAchievementIds]);
  const activeTheme = items.find(item => item.id === effectiveCollectionState.activeThemeId) || items.find(item => item.id === DEFAULT_THEME_ID) || items[0];
  const activeThemeCopy = getThemeCopy(activeTheme, lang);
  const unlockedCount = items.filter(item => item.unlocked).length;
  const unlockedSupporterIds = useMemo(() => {
    return getUnlockedSupporterRewards(supporterTotal).map(reward => reward.id);
  }, [supporterTotal]);
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
    // TODO: Centralizar obtenção de email via hook global ou Context para evitar múltiplas chamadas ao Auth do Supabase
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id || null;
      const email = data.user?.email || null;
      if (email) setUserEmail(email);
      setIsAdmin(isAdminEmail(email || ''));

      // Only hydrate after auth state confirms a logged user (not guest)
      if (uid) {
        try {
          const result = await hydrateSupporterFromServer(uid);
          if (result?.mergedTotal != null) {
            setSupporterTotal(result.mergedTotal);
            setSupporterInput(String(result.mergedTotal));
          }
        } catch (err) {
          // non-fatal
        }
      }
    };
    fetchUser();
  }, []);

  const eligibleFirstSupporterIds = useMemo(() => {
    const effectiveFirstSupporterEmail = import.meta.env.DEV
      ? 'dilioalvarega@gmail.com'
      : userEmail;

    const eligibleByEmail = getEligibleFirstSupporterRewardIds(effectiveFirstSupporterEmail);
    
    // FIX: Também considerar como elegível se o ID estiver na lista de conquistas desbloqueadas
    // (Isso permite que selos sincronizados via Supabase/Hydrate apareçam na UI)
    const eligibleBySync = unlockedAchievementIds.filter(id => 
      supporterFirstRewards.some(r => r.id === id)
    );

    return Array.from(new Set([...eligibleByEmail, ...eligibleBySync]));
  }, [userEmail, unlockedAchievementIds]);

  // LOGS TEMPORÁRIOS DE INVESTIGAÇÃO UI
  useEffect(() => {
    if (import.meta.env.DEV || window.location.hostname.includes('vercel.app') || true) {
      console.group('[GA UI Debug] Badge Rendering');
      console.log('Unlocked IDs (Storage):', unlockedAchievementIds);
      console.log('Eligible First Supporter IDs:', eligibleFirstSupporterIds);
      
      const target = 'first_supporter_prime_architect';
      const hasInStorage = unlockedAchievementIds.includes(target);
      const hasInEligibility = eligibleFirstSupporterIds.includes(target);
      
      if (hasInStorage && !hasInEligibility) {
        console.warn(`[UI Mismatch] ${target} está no localStorage mas o memo de elegibilidade falhou.`);
      } else if (hasInStorage && hasInEligibility) {
        console.log(`[UI Success] ${target} está pronto para renderizar.`);
      }
      console.groupEnd();
    }
  }, [unlockedAchievementIds, eligibleFirstSupporterIds]);

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

  useEffect(() => {
    const refreshConstancy = () => setConstancyRefreshToken(Date.now());
    window.addEventListener('ga-constancy-updated', refreshConstancy);
    window.addEventListener('storage', refreshConstancy);
    return () => {
      window.removeEventListener('ga-constancy-updated', refreshConstancy);
      window.removeEventListener('storage', refreshConstancy);
    };
  }, []);

  useEffect(() => {
    syncUnlockedSupporterRewards(supporterTotal, currentUserId);
  }, [supporterTotal]);

  const persistConfigPatch = (patch: Partial<AppState>) => {
    const current = loadConfig(currentUserId);
    if (!current) return;
    saveConfig({ ...current, ...patch }, currentUserId);
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
    saveThemeCollectionState(next, currentUserId);
  };

  const updateSupporterTotal = () => {
    // TODO: Admin Panel /admin/supporters
    // - Validar contribuição via Supabase
    // - Registrar histórico de mudanças
    // - Enviar notificação ao usuário
    // - Aprovar/rejeitar com observações admin
    
    // SECURITY: Apenas permitir em modo DEV
    if (!import.meta.env.DEV) {
      console.warn('SECURITY: Tentativa de alterar supporterContributionTotal em produção bloqueada');
      return;
    }

    const value = Number(supporterInput);
    if (value < 0) {
      setSupporterInput('0');
      return;
    }
    
    setSupporterContributionTotal(value, currentUserId);
    setSupporterTotal(getSupporterContributionTotal(currentUserId));
  };

  const handleCopyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORTER_PIX_KEY);
      setSupporterToast(lang === 'pt' ? 'Chave PIX copiada.' : 'PIX key copied.');
      setTimeout(() => setSupporterToast(null), 2000);
    } catch (err) {
      console.error('Failed to copy PIX key: ', err);
    }
  };

  const handleBecomeSupporter = () => {
    setSupporterToast(
      lang === 'pt'
        ? 'Veja os dados de apoio e envie o comprovante para validação do selo.'
        : 'Check the support details and send proof for badge validation.'
    );
    setTimeout(() => setSupporterToast(null), 3000);
    setTimeout(() => {
      document.getElementById('supporter-payment-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <ThemeCollectionHeader
        activeTheme={activeTheme}
        unlockedCount={unlockedCount}
        totalCount={items.length}
        isLight={isLight}
        lang={lang}
        onBack={() => navigateTo('/studio')}
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
          <details open className="group">
            <summary className={`mb-4 flex cursor-pointer list-none items-center justify-between rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'border-amber-200 bg-amber-50/70 text-amber-800' : 'border-amber-900/60 bg-amber-950/25 text-amber-200'}`}>
              <span>{lang === 'pt' ? 'Galeria de Apoiadores' : 'Supporter Gallery'}</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
                Supporter | {lang === 'pt' ? 'Apoiadores' : 'Supporters'}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
                {lang === 'pt' ? 'Apoiadores da Obra' : 'Project Supporters'}
              </h2>
              <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {lang === 'pt'
                  ? 'Badges colecionáveis liberados por faixas de apoio acumulado ao ecossistema Guitar Architect.'
                  : 'Collectible badges unlocked by accumulated support ranges for the Guitar Architect ecosystem.'}
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-800/60 bg-amber-950/30 text-amber-200'}`}>
              {unlockedSupporterIds.length}/{supporterRewards.length} {lang === 'pt' ? 'liberados' : 'unlocked'}
            </span>
          </div>
          {import.meta.env.DEV && (
            <div className={`mb-4 rounded-2xl border p-5 ${isLight ? 'border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,0.92))] shadow-[0_12px_28px_rgba(146,64,14,0.14),inset_0_1px_0_rgba(255,255,255,0.8)]' : 'border-amber-900/60 bg-[linear-gradient(135deg,rgba(24,18,8,0.96),rgba(15,10,4,0.94))] shadow-[0_16px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(245,158,11,0.12)]'}`}>
              <div className="absolute inset-0 pointer-events-none rounded-2xl bg-[radial-gradient(circle_at_15%_0%,rgba(251,191,36,0.15),transparent_40%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500">DEV / Admin Tools</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400 mt-1">Supporter Preview</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase ${isLight ? 'border-amber-300/50 bg-amber-300/20 text-amber-700' : 'border-amber-700/60 bg-amber-900/30 text-amber-300'}`}>
                    MODO DEV
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 mb-4">
                  <div className={`rounded-xl border p-3 ${isLight ? 'border-amber-100/60 bg-white/50' : 'border-amber-900/40 bg-slate-950/30'}`}>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">Total Acumulado</p>
                    <p className="text-xl font-black mt-1 text-amber-700 dark:text-amber-300">R$ {supporterTotal}</p>
                  </div>
                  
                  {(() => {
                    const tierInfo = getSupporterTierInfo(supporterTotal, lang);
                    return (
                      <div className={`rounded-xl border p-3 ${isLight ? 'border-amber-100/60 bg-white/50' : 'border-amber-900/40 bg-slate-950/30'}`}>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">Tier Atual</p>
                        <p className="text-lg font-black mt-1 text-amber-700 dark:text-amber-300">{tierInfo.currentTier ? formatTierName(tierInfo.currentTier.title) : (lang === 'pt' ? 'Nenhum' : 'None')}</p>
                      </div>
                    );
                  })()}

                  {(() => {
                    const tierInfo = getSupporterTierInfo(supporterTotal, lang);
                    const remaining = tierInfo.remaining;
                    return (
                      <div className={`rounded-xl border p-3 ${isLight ? 'border-amber-100/60 bg-white/50' : 'border-amber-900/40 bg-slate-950/30'}`}>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">Próximo Tier</p>
                        {tierInfo.isMaxTier ? (
                          <p className="text-base font-black mt-1 text-amber-600 dark:text-amber-400">Max ✓</p>
                        ) : (
                          <p className="text-sm font-black mt-1 text-amber-700 dark:text-amber-300">
                            Faltam <span className="text-amber-600 dark:text-amber-400">R$ {remaining}</span>
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="number"
                    min="0"
                    value={supporterInput}
                    onChange={event => setSupporterInput(event.target.value)}
                    placeholder={lang === 'pt' ? 'Valor acumulado em R$' : 'Accumulated value in R$'}
                    className={`flex-1 min-h-11 rounded-xl border px-4 text-sm font-black outline-none transition-all ${isLight ? 'border-amber-200/60 bg-white/70 text-slate-900 focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,191,36,0.1)]' : 'border-amber-900/60 bg-slate-950/50 text-white focus:border-amber-700 focus:bg-slate-900/70 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.08)]'}`}
                    aria-label={lang === 'pt' ? 'Valor de apoio acumulado' : 'Accumulated support value'}
                  />
                  <button
                    type="button"
                    onClick={updateSupporterTotal}
                    className={`rounded-xl border px-5 py-3 text-[10px] font-black uppercase transition-all ${isLight ? 'border-amber-300/60 bg-amber-400/80 text-amber-900 hover:bg-amber-400 shadow-[0_4px_12px_rgba(146,64,14,0.15)]' : 'border-amber-700/60 bg-amber-500/60 text-amber-950 hover:bg-amber-500 shadow-[0_4px_12px_rgba(251,191,36,0.18)]'} active:scale-95`}
                  >
                    {lang === 'pt' ? 'Simular' : 'Simulate'}
                  </button>
                </div>

                <p className="text-[9px] font-bold uppercase tracking-[0.12em] mt-3 text-amber-700 dark:text-amber-400 opacity-75">
                  {lang === 'pt' 
                    ? 'Alterações persistem em localStorage. Apenas DEV pode editar. Não afeta produção.' 
                    : 'Changes persist in localStorage. Only DEV can edit. Does not affect production.'}
                </p>
              </div>
            </div>
          )}
          <div className={`mb-5 rounded-2xl border p-5 ${isLight ? 'border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.9),rgba(255,255,255,0.94))] shadow-[0_18px_42px_rgba(146,64,14,0.10)]' : 'border-amber-900/45 bg-[linear-gradient(145deg,rgba(24,18,8,0.82),rgba(3,7,18,0.94))] shadow-[0_22px_70px_rgba(0,0,0,0.28)]'}`}>
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
                  {lang === 'pt' ? 'Apoiadores Oficiais' : 'Official Supporters'}
                </p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">
                  {lang === 'pt' ? 'Apoie o Guitar Architect' : 'Support Guitar Architect'}
                </h3>
                <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {lang === 'pt'
                    ? 'Os Apoiadores Oficiais ajudam a construir e expandir o ecossistema Guitar Architect. Cada contribuição registrada no perfil soma progresso e pode desbloquear selos colecionáveis exclusivos, vinculados à jornada de evolução do projeto.'
                    : 'Official Supporters help build and expand the Guitar Architect ecosystem. Each contribution registered in the profile adds progress and may unlock exclusive collectible badges tied to the project evolution journey.'}
                </p>
                <div className={`mt-5 rounded-2xl border p-4 ${isLight ? 'border-amber-200 bg-white/78' : 'border-amber-900/45 bg-slate-950/48'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-amber-300/60 bg-amber-400/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                      Supporter Season 1
                    </span>
                    <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-800 bg-slate-950/70 text-slate-300'}`}>
                      {lang === 'pt' ? 'Fundação' : 'Foundation'}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {lang === 'pt'
                      ? 'A Season 1 marca a fase inicial de construção do Guitar Architect. Os selos desbloqueados nesta temporada representam participação na fundação do ecossistema e poderão ter valor histórico dentro da coleção oficial.'
                      : 'Season 1 marks the initial building phase of Guitar Architect. Badges unlocked during this season represent participation in the foundation of the ecosystem and may carry historical value within the official collection.'}
                  </p>
                  <p className={`mt-3 text-[11px] font-bold uppercase tracking-[0.12em] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {lang === 'pt'
                      ? 'Selos de temporada podem ser limitados ao período da campanha e permanecer vinculados ao perfil do apoiador.'
                      : 'Season badges may be limited to the campaign period and remain tied to the supporter profile.'}
                  </p>
                  <p className={`mt-3 text-[10px] font-black uppercase tracking-[0.14em] ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                    {lang === 'pt'
                      ? 'A Season 1 permanece aberta para registros de apoio até 31/05/2027.'
                      : 'Season 1 remains open for support registrations until May 31, 2027.'}
                  </p>
                </div>
              </div>
              <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white/80' : 'border-blue-950/60 bg-slate-950/50'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                  {lang === 'pt' ? 'Como funciona' : 'How it works'}
                </p>
                <ol className={`mt-3 space-y-2 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {(lang === 'pt'
                    ? [
                      'As contribuições são cumulativas.',
                      'O valor total registrado no perfil define o nível de apoiador.',
                      'Ao atingir uma nova faixa, o usuário mantém os selos anteriores e desbloqueia o novo selo.',
                      'Os selos são pessoais e vinculados ao perfil do usuário.',
                      'A posse do arquivo de imagem não representa desbloqueio oficial.',
                      'O reconhecimento oficial depende do registro no sistema do Guitar Architect.',
                      'As faixas, temporadas e recompensas poderão evoluir em versões futuras do projeto.',
                    ]
                    : [
                      'Contributions are cumulative.',
                      'The total amount registered in the profile defines the supporter level.',
                      'When a new range is reached, previous badges remain unlocked and the new badge is added.',
                      'Badges are personal and tied to the user profile.',
                      'Owning the image file does not represent an official unlock.',
                      'Official recognition depends on registration inside the Guitar Architect system.',
                      'Ranges, seasons and rewards may evolve in future versions of the project.',
                    ]).map((rule, index) => (
                    <li key={rule} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/60 text-[10px] font-black text-amber-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
              <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white/78' : 'border-blue-950/60 bg-slate-950/45'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                  {lang === 'pt' ? 'Como apoiar nesta fase' : 'How to support in this phase'}
                </p>
                <p className={`mt-2 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {lang === 'pt'
                    ? 'Nesta fase inicial, o apoio é registrado manualmente. Após realizar a contribuição, o apoiador poderá enviar o comprovante para validação e liberação do selo correspondente no perfil.'
                    : 'In this initial phase, support is registered manually. After contributing, the supporter may send proof for validation and badge release in the profile.'}
                </p>
              </div>
              <div id="supporter-payment-info" className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white/78' : 'border-blue-950/60 bg-slate-950/45'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                  {lang === 'pt' ? 'Dados de apoio' : 'Support details'}
                </p>
                <div className={`mt-2 space-y-2 text-sm font-black ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <p>{lang === 'pt' ? 'Chave PIX:' : 'PIX key:'} <span className="text-amber-300">{SUPPORTER_PIX_KEY}</span></p>
                  <p>{lang === 'pt' ? 'Contato:' : 'Contact:'} <span className="text-amber-300">{SUPPORTER_CONTACT_EMAIL}</span></p>
                </div>
                <button type="button" onClick={handleCopyPixKey} className="mt-3 w-full rounded-xl border border-amber-300/50 bg-amber-500/20 px-4 py-2.5 text-[10px] font-black uppercase text-amber-300 transition-colors hover:bg-amber-500/30">
                  {lang === 'pt' ? 'Copiar chave PIX' : 'Copy PIX key'}
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <button type="button" onClick={handleBecomeSupporter} className="rounded-xl border border-amber-300/55 bg-amber-500 px-5 py-3 text-[10px] font-black uppercase text-slate-950 shadow-lg shadow-amber-950/20">
                  {lang === 'pt' ? 'Tornar-se apoiador' : 'Become a supporter'}
                </button>
                <button type="button" onClick={() => document.getElementById('supporter-rewards-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`rounded-xl border px-5 py-3 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-700 bg-slate-950/70 text-slate-200'}`}>
                  {lang === 'pt' ? 'Ver selos na coleção' : 'View badges in collection'}
                </button>
              </div>
            </div>
          </div>
          <div id="supporter-rewards-grid" className="scroll-mt-6" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {supporterRewards.map(reward => {
              const unlocked = unlockedSupporterIds.includes(reward.id);
              const valueLabel = reward.maxValue
                ? `R$ ${reward.minValue}-${reward.maxValue}`
                : `R$ ${reward.minValue}+`;
              return (
                <button
                  key={reward.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && setPreviewAsset({ id: reward.id, image: reward.image, name: reward.title, subtitle: reward.description })}
                  className={`group overflow-hidden rounded-2xl border p-4 text-left transition duration-300 ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed grayscale'} ${isLight ? 'border-[#c7d4e4] bg-white/94 shadow-[0_18px_42px_rgba(71,85,105,0.12)]' : 'border-amber-900/35 bg-[linear-gradient(145deg,rgba(9,13,23,0.96),rgba(3,7,18,0.98))] shadow-[0_22px_70px_rgba(2,6,23,0.42)]'} ${unlocked ? '' : 'opacity-55'}`}
                >
                  <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border ${isLight ? 'border-amber-100 bg-slate-50' : 'border-amber-950/50 bg-slate-950'}`}>
                    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.24),transparent_58%)] transition ${unlocked ? 'opacity-100 group-hover:opacity-100' : 'opacity-30'}`} />
                    <img src={reward.image} alt={reward.title} className={`relative h-full w-full object-contain p-3 transition duration-300 ${unlocked ? 'group-hover:scale-[1.03]' : 'blur-[1px]'}`} />
                    {!unlocked && (
                      <span className="absolute rounded-full border border-white/40 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                        {lang === 'pt' ? 'Bloqueado' : 'Locked'}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-300">{valueLabel}</p>
                      <h3 className="mt-1 text-base font-black">{reward.title}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-900/70 bg-amber-950/35 text-amber-200'}`}>
                      {reward.tier.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{reward.description}</p>
                </button>
              );
            })}
          </div>
          </details>
        </section>

        <section className="mt-10">
          <details open className="group">
            <summary className={`mb-4 flex cursor-pointer list-none items-center justify-between rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'border-blue-200 bg-blue-50/70 text-blue-800' : 'border-blue-900/60 bg-blue-950/25 text-blue-200'}`}>
              <span>{lang === 'pt' ? 'Galeria de Constância' : 'Constancy Gallery'}</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                {lang === 'pt' ? 'Constância' : 'Constancy'}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
                {lang === 'pt' ? 'Presença na Obra' : 'Presence in the Work'}
              </h2>
              <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {lang === 'pt'
                  ? 'Selos conquistados por dias consecutivos de uso real do Guitar Architect. Se a sequência for interrompida, a contagem atual reinicia, mas os selos já desbloqueados permanecem na coleção.'
                  : 'Badges earned through consecutive days of actual Guitar Architect use. If the streak is broken, the current count restarts, but already unlocked badges remain in the collection.'}
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-800/60 bg-blue-950/30 text-blue-200'}`}>
              {constancyState.unlockedRewardIds.length}/{constancyRewards.length} {lang === 'pt' ? 'liberados' : 'unlocked'}
            </span>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: lang === 'pt' ? 'Constância Atual' : 'Current Streak',
                value: lang === 'pt' ? `${constancyState.currentStreak} dias consecutivos` : `${constancyState.currentStreak} consecutive days`,
                icon: '📅'
              },
              {
                label: lang === 'pt' ? 'Maior Constância' : 'Highest Streak',
                value: lang === 'pt' ? `${constancyState.highestStreak} dias` : `${constancyState.highestStreak} days`,
                icon: '🏆'
              },
              {
                label: lang === 'pt' ? 'Próximo Marco' : 'Next Milestone',
                value: nextMilestone.nextRequiredDays 
                  ? (lang === 'pt' ? `${nextMilestone.nextRequiredDays} dias (faltam ${nextMilestone.daysRemaining})` : `${nextMilestone.nextRequiredDays} days (${nextMilestone.daysRemaining} remaining)`)
                  : (lang === 'pt' ? 'Todos os marcos alcançados' : 'All milestones reached'),
                icon: '🎯'
              }
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl border p-4 ${isLight ? 'border-blue-100 bg-white/80 shadow-sm' : 'border-blue-900/35 bg-blue-950/20 shadow-[inset_0_1px_0_rgba(96,165,250,0.05)]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs" role="img" aria-hidden="true">{stat.icon}</span>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-400">{stat.label}</p>
                </div>
                <p className="text-sm font-black tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {constancyRewards.map(reward => {
              const unlocked = constancyState.unlockedRewardIds.includes(reward.id);
              return (
                <button
                  key={reward.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && setPreviewAsset({ id: reward.id, image: reward.image, name: reward.title, subtitle: reward.description })}
                  className={`group overflow-hidden rounded-2xl border p-4 text-left transition duration-300 ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed grayscale'} ${isLight ? 'border-[#c7d4e4] bg-white/94 shadow-[0_18px_42px_rgba(71,85,105,0.12)]' : 'border-blue-900/35 bg-[linear-gradient(145deg,rgba(9,13,23,0.96),rgba(3,7,18,0.98))] shadow-[0_22px_70px_rgba(2,6,23,0.42)]'} ${unlocked ? '' : 'opacity-55'}`}
                >
                  <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border ${isLight ? 'border-blue-100 bg-slate-50' : 'border-blue-950/50 bg-slate-950'}`}>
                    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.18),transparent_58%)] transition ${unlocked ? 'opacity-100 group-hover:opacity-100' : 'opacity-30'}`} />
                    <img src={reward.image} alt={reward.title} className={`relative h-full w-full object-contain p-3 transition duration-300 ${unlocked ? 'group-hover:scale-[1.03]' : 'blur-[1px]'}`} />
                    {!unlocked && (
                      <div className="absolute flex flex-col items-center gap-1">
                        <span className="text-xl" role="img" aria-label="locked">🔒</span>
                        <span className="rounded-full border border-white/40 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                          {lang === 'pt' ? 'Bloqueado' : 'Locked'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${unlocked ? 'text-blue-400' : 'text-zinc-500'}`}>
                        {unlocked 
                          ? (lang === 'pt' ? 'Desbloqueado' : 'Unlocked') 
                          : (lang === 'pt' ? `Requer ${reward.requiredDays} dias` : `Requires ${reward.requiredDays} days`)
                        }
                      </p>
                      <h3 className="mt-1 text-base font-black">{reward.title}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-900/60 bg-blue-950/35 text-blue-200'}`}>
                      {reward.requiredDays} {lang === 'pt' ? 'dias' : 'days'}
                    </span>
                  </div>
                  {!unlocked && (
                    <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-blue-400/80">
                      {lang === 'pt' ? `Faltam ${reward.requiredDays - constancyState.highestStreak} dias de recorde` : `${reward.requiredDays - constancyState.highestStreak} days remaining for record`}
                    </p>
                  )}
                  <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{reward.description}</p>
                </button>
              );
            })}
          </div>
          </details>
        </section>

        <section className="mt-10">
          <details open className="group">
            <summary className={`mb-4 flex cursor-pointer list-none items-center justify-between rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'border-amber-200 bg-amber-50/70 text-amber-800' : 'border-amber-900/60 bg-amber-950/25 text-amber-200'}`}>
              <span>{lang === 'pt' ? 'Galeria Primeiros Apoiadores' : 'Early Supporter Gallery'}</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
                Supporter | {lang === 'pt' ? 'Primeiros Apoiadores' : 'Early Supporters'}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
                {lang === 'pt' ? 'Primeiros da Obra' : 'First of the Work'}
              </h2>
              <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {lang === 'pt'
                  ? 'Selos históricos concedidos aos primeiros apoiadores de cada nível durante a Season 1.'
                  : 'Historical badges awarded to the first supporters of each level during Season 1.'}
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-800/60 bg-amber-950/30 text-amber-200'}`}>
              {eligibleFirstSupporterIds.length}/{supporterFirstRewards.length} {lang === 'pt' ? 'liberados' : 'unlocked'}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {supporterFirstRewards.map(reward => {
              const unlocked = eligibleFirstSupporterIds.includes(reward.id);
              return (
                <button
                  key={reward.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && setPreviewAsset({ id: reward.id, image: reward.image, name: reward.title, subtitle: reward.description })}
                  className={`group overflow-hidden rounded-2xl border p-4 text-left transition duration-300 ${unlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed grayscale'} ${isLight ? 'border-[#c7d4e4] bg-white/94 shadow-[0_18px_42px_rgba(71,85,105,0.12)]' : 'border-amber-900/35 bg-[linear-gradient(145deg,rgba(9,13,23,0.96),rgba(3,7,18,0.98))] shadow-[0_22px_70px_rgba(2,6,23,0.42)]'} ${unlocked ? '' : 'opacity-55'}`}
                >
                  <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border ${isLight ? 'border-amber-100 bg-slate-50' : 'border-amber-950/50 bg-slate-950'}`}>
                    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.24),transparent_58%)] transition ${unlocked ? 'opacity-100 group-hover:opacity-100' : 'opacity-30'}`} />
                    <img src={reward.image} alt={reward.title} className={`relative h-full w-full object-contain p-3 transition duration-300 ${unlocked ? 'group-hover:scale-[1.03]' : 'blur-[1px]'}`} />
                    {!unlocked && (
                      <div className="absolute flex flex-col items-center gap-1">
                        <span className="text-xl" role="img" aria-label="locked">🔒</span>
                        <span className="rounded-full border border-white/40 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                          {lang === 'pt' ? 'Bloqueado' : 'Locked'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${unlocked ? 'text-amber-300' : 'text-zinc-500'}`}>
                        {unlocked ? (lang === 'pt' ? 'Desbloqueado' : 'Unlocked') : (lang === 'pt' ? 'Bloqueado' : 'Locked')}
                      </p>
                      <h3 className="mt-1 text-base font-black">{reward.title}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-800/60 bg-amber-950/35 text-amber-200'}`}>
                      {reward.supporterTier.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{reward.description}</p>
                </button>
              );
            })}
          </div>
          </details>
        </section>

        <section className="mt-10">
          <details open className="group">
            <summary className={`mb-4 flex cursor-pointer list-none items-center justify-between rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'border-blue-200 bg-blue-50/70 text-blue-800' : 'border-blue-900/60 bg-blue-950/25 text-blue-200'}`}>
              <span>{lang === 'pt' ? 'Galeria da Obra' : 'Work Gallery'}</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
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
                  onClick={() => setPreviewAsset({ id: reward.id, image: reward.image, name: reward.title, subtitle: reward.description })}
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
          </details>
        </section>

        <AchievementsPanel isLight={isLight} />

        <div className="mt-8 text-center">
          <button onClick={() => navigateTo('/studio')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-5 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
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

                <PinBadgeAction 
                  rewardId={previewAsset.id} 
                  isUnlocked={true} 
                />
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

      {supporterToast && (
        <div className={`fixed bottom-5 right-5 z-[150] max-w-sm rounded-2xl border p-4 text-sm font-bold backdrop-blur-xl transition-all ${isLight ? 'border-amber-200 bg-amber-50/95 text-amber-900 shadow-lg' : 'border-amber-800/60 bg-amber-950/90 text-amber-100 shadow-2xl shadow-amber-950/40'}`}>
          {supporterToast}
        </div>
      )}
    </div>
  );
};

export default ThemeCollectionPage;
