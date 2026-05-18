export type ThemeCategory = 'tier0' | 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5' | 'tier6';
export type ThemeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ThemeInstrumentFamily = 'guitar6' | 'guitar7' | 'guitar8' | 'bass4' | 'bass5' | 'special';

export interface ThemeCollectionItem {
  id: string;
  name: string;
  subtitle: string;
  category: ThemeCategory;
  rarity: ThemeRarity;
  instrumentFamily: ThemeInstrumentFamily;
  unlocked: boolean;
  isDefault?: boolean;
  image: string;
  placeholderGradient: string;
  inspiredBy?: string;
  description: string;
  unlockRequirement?: string;
  glowColor?: string;
}

export interface ThemeCollectionState {
  activeThemeId: string;
  unlockedThemeIds: string[];
}
