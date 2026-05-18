export type RewardType = 'sticker' | 'logo' | 'badge' | 'profile_asset' | 'export_asset';
export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'guitar_hero';
export type RewardAssetStatus = 'placeholder' | 'ready';

export interface RewardAsset {
  status: RewardAssetStatus;
  path: string | null;
  slug: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: RewardType;
  assetPath: string | null;
  asset: RewardAsset;
  rarity: RewardRarity;
  hidden: boolean;
  usableInProfile: boolean;
  usableInExport: boolean;
}
