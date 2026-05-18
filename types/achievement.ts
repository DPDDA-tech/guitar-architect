import type { RewardRarity } from './reward';

export type AchievementCategory =
  | 'core'
  | 'exploration'
  | 'harmony'
  | 'technique'
  | 'rhythm'
  | 'consistency'
  | 'theory'
  | 'challenge'
  | 'loyalty'
  | 'anniversary'
  | 'seasonal';

export type AchievementTier = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type AchievementInstrumentFamily = 'guitar' | 'extended_guitar' | 'bass' | 'general';
export type AchievementUnlockType =
  | 'module_completion'
  | 'exercise_completion'
  | 'bpm_target'
  | 'streak'
  | 'loyalty'
  | 'tenure'
  | 'anniversary'
  | 'exploration'
  | 'tier_collection'
  | 'manual'
  | 'composite';

export interface AchievementAssetPlaceholder {
  status: 'placeholder' | 'ready';
  path: string | null;
  slug: string;
}

export interface AchievementRequirement {
  exerciseId?: string;
  exerciseIds?: string[];
  moduleId?: string;
  moduleIds?: string[];
  minBpm?: number;
  repetitions?: number;
  requiredCount?: number;
  streakDays?: number;
  loyaltyDays?: number;
  tenureDays?: number;
  anniversaryYear?: number;
  anniversaryKey?: string;
  explorationKey?: string;
  achievementTier?: AchievementTier;
  unlockedAchievementCount?: number;
  instrumentFamily?: AchievementInstrumentFamily;
  allOf?: AchievementRequirement[];
  anyOf?: AchievementRequirement[];
}

export interface AchievementProgressState {
  completedExerciseIds?: string[];
  exerciseCompletionCounts?: Record<string, number>;
  exerciseBpmTargets?: Record<string, number>;
  completedModuleIds?: string[];
  moduleCompletionCounts?: Record<string, number>;
  explorationCounts?: Record<string, number>;
  streakDays?: number;
  loyaltyDays?: number;
  firstSeenAt?: string;
  lastSeenAt?: string;
  appAnniversaryKeys?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  rarity: RewardRarity;
  instrumentFamily: AchievementInstrumentFamily;
  unlockType: AchievementUnlockType;
  requirements: AchievementRequirement;
  xp: number;
  hidden: boolean;
  asset: AchievementAssetPlaceholder;
  relatedExerciseIds: string[];
  relatedModuleIds: string[];
  rewardIds: string[];
}
