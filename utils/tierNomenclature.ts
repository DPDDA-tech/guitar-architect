import type { AchievementTier } from '../types/achievement';
import type { RewardRarity } from '../types/reward';

export type TierLang = 'pt' | 'en';

export interface TierNomenclature {
  tier: AchievementTier;
  code: string;
  en: string;
  pt: string;
}

export const TIER_NOMENCLATURE: Record<AchievementTier, TierNomenclature> = {
  0: { tier: 0, code: 'T0', en: 'RECRUIT', pt: 'CANDIDATO' },
  1: { tier: 1, code: 'T1', en: 'COMMON', pt: 'APRENDIZ' },
  2: { tier: 2, code: 'T2', en: 'RARE', pt: 'PEDREIRO' },
  3: { tier: 3, code: 'T3', en: 'EPIC', pt: 'CONTRAMESTRE' },
  4: { tier: 4, code: 'T4', en: 'LEGENDARY', pt: 'MESTRE DE OBRAS' },
  5: { tier: 5, code: 'T5', en: 'MYTHIC', pt: 'ENGENHEIRO' },
  6: { tier: 6, code: 'T6', en: 'GUITAR HERO', pt: 'ARQUITETO' },
};

export const getTierNomenclature = (tier: AchievementTier) => TIER_NOMENCLATURE[tier];

export const getTierName = (tier: AchievementTier, lang: TierLang = 'pt') => (
  TIER_NOMENCLATURE[tier][lang]
);

export const getTierDisplay = (tier: AchievementTier, lang: TierLang = 'pt') => {
  const info = getTierNomenclature(tier);
  return `${info.code} · ${info[lang]}`;
};

export const getTierCollectionName = (tier: AchievementTier, lang: TierLang = 'pt') => (
  lang === 'pt'
    ? `COLEÇÃO DO ${getTierName(tier, lang)}`
    : `${getTierName(tier, lang)} COLLECTION`
);

export const getRarityName = (rarity: RewardRarity, lang: TierLang = 'pt') => {
  const labels: Record<RewardRarity, Record<TierLang, string>> = {
    common: { en: 'COMMON', pt: 'APRENDIZ' },
    rare: { en: 'RARE', pt: 'PEDREIRO' },
    epic: { en: 'EPIC', pt: 'CONTRAMESTRE' },
    legendary: { en: 'LEGENDARY', pt: 'MESTRE DE OBRAS' },
    mythic: { en: 'MYTHIC', pt: 'ENGENHEIRO' },
    guitar_hero: { en: 'GUITAR HERO', pt: 'ARQUITETO' },
  };
  return labels[rarity][lang];
};
