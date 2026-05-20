import { ACHIEVEMENTS } from '../data/achievements';
import { EXERCISES } from '../data/exercises';
import { REWARDS } from '../data/rewards';
import { getTierDisplay } from './tierNomenclature';
import type {
  Achievement,
  AchievementCategory,
  AchievementProgressState,
  AchievementRequirement,
  AchievementTier,
  AchievementUnlockType,
} from '../types/achievement';
import type { Reward, RewardRarity } from '../types/reward';

export interface AchievementProgressResult {
  percent: number;
  current: number;
  target: number;
  unlocked: boolean;
  label: string;
}

const clampProgress = (current: number, target: number) => {
  const safeTarget = Math.max(1, target);
  return Math.min(100, Math.round((Math.min(current, safeTarget) / safeTarget) * 100));
};

export const listAllAchievements = () => ACHIEVEMENTS;

export const getAchievementsByTier = (tier: AchievementTier) => (
  ACHIEVEMENTS.filter(achievement => achievement.tier === tier)
);

export const getAchievementsByCategory = (category: AchievementCategory) => (
  ACHIEVEMENTS.filter(achievement => achievement.category === category)
);

export const getAchievementsByRarity = (rarity: RewardRarity) => (
  ACHIEVEMENTS.filter(achievement => achievement.rarity === rarity)
);

export const getAchievementById = (id: string) => ACHIEVEMENTS.find(achievement => achievement.id === id);

export const getRewardById = (id: string) => REWARDS.find(reward => reward.id === id);

export const getExerciseById = (id: string) => EXERCISES.find(exercise => exercise.id === id);

export const getRewardsForAchievement = (achievementId: string): Reward[] => {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return [];
  return achievement.rewardIds
    .map(getRewardById)
    .filter((reward): reward is Reward => Boolean(reward));
};

export const getAchievementsForExercise = (exerciseId: string): Achievement[] => (
  ACHIEVEMENTS.filter(achievement => (
    achievement.relatedExerciseIds.includes(exerciseId) ||
    achievement.requirements.exerciseId === exerciseId ||
    achievement.requirements.exerciseIds?.includes(exerciseId)
  ))
);

export const isAchievementUnlocked = (achievementId: string, userUnlockedAchievementIds: string[]) => (
  userUnlockedAchievementIds.includes(achievementId)
);

export const getVisibleAchievements = (userUnlockedAchievementIds: string[]) => (
  ACHIEVEMENTS.filter(achievement => (
    !achievement.hidden || isAchievementUnlocked(achievement.id, userUnlockedAchievementIds)
  ))
);

export const getUnlockedAchievements = (userUnlockedAchievementIds: string[]) => (
  ACHIEVEMENTS.filter(achievement => isAchievementUnlocked(achievement.id, userUnlockedAchievementIds))
);

export const getHighestUnlockedAchievementTier = (userUnlockedAchievementIds: string[]): AchievementTier => (
  getUnlockedAchievements(userUnlockedAchievementIds).reduce<number>(
    (highest, achievement) => Math.max(highest, achievement.tier),
    0,
  ) as AchievementTier
);

export const getLockedAchievements = (userUnlockedAchievementIds: string[]) => (
  ACHIEVEMENTS.filter(achievement => !isAchievementUnlocked(achievement.id, userUnlockedAchievementIds))
);

export const getUnlockedRewards = (userUnlockedAchievementIds: string[]): Reward[] => {
  const rewardIds = new Set<string>();
  ACHIEVEMENTS.forEach(achievement => {
    if (!isAchievementUnlocked(achievement.id, userUnlockedAchievementIds)) return;
    achievement.rewardIds.forEach(rewardId => rewardIds.add(rewardId));
  });

  return Array.from(rewardIds)
    .map(getRewardById)
    .filter((reward): reward is Reward => Boolean(reward))
    .filter(reward => reward.asset.status === 'ready');
};

const getExerciseCount = (requirements: AchievementRequirement, progress: AchievementProgressState) => {
  const counts = progress.exerciseCompletionCounts ?? {};
  const completedIds = progress.completedExerciseIds ?? [];
  if (requirements.exerciseId === '*') {
    const counted = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return Math.max(counted, completedIds.length);
  }
  const exerciseIds = requirements.exerciseIds ?? (requirements.exerciseId ? [requirements.exerciseId] : []);
  return exerciseIds.reduce((sum, exerciseId) => (
    sum + Math.max(counts[exerciseId] ?? 0, completedIds.includes(exerciseId) ? 1 : 0)
  ), 0);
};

const getModuleCount = (requirements: AchievementRequirement, progress: AchievementProgressState) => {
  const counts = progress.moduleCompletionCounts ?? {};
  const completedIds = progress.completedModuleIds ?? [];
  const moduleIds = requirements.moduleIds ?? (requirements.moduleId ? [requirements.moduleId] : []);
  return moduleIds.reduce((sum, moduleId) => (
    sum + Math.max(counts[moduleId] ?? 0, completedIds.includes(moduleId) ? 1 : 0)
  ), 0);
};

const inferUnlockType = (requirements: AchievementRequirement, fallback: AchievementUnlockType): AchievementUnlockType => {
  if (requirements.allOf || requirements.anyOf) return 'composite';
  if (requirements.minBpm !== undefined) return 'bpm_target';
  if (requirements.exerciseId || requirements.exerciseIds) return 'exercise_completion';
  if (requirements.moduleId || requirements.moduleIds) return 'module_completion';
  if (requirements.streakDays !== undefined) return 'streak';
  if (requirements.loyaltyDays !== undefined) return 'loyalty';
  if (requirements.tenureDays !== undefined) return 'tenure';
  if (requirements.anniversaryKey || requirements.anniversaryYear !== undefined) return 'anniversary';
  if (requirements.explorationKey) return 'exploration';
  if (requirements.achievementTier !== undefined) return 'tier_collection';
  return fallback;
};

const calculateRequirementProgress = (
  requirements: AchievementRequirement,
  progress: AchievementProgressState,
  unlockType: AchievementUnlockType,
  userUnlockedAchievementIds: string[] = [],
): AchievementProgressResult => {
  const type = inferUnlockType(requirements, unlockType);

  if (type === 'composite') {
    const children = requirements.allOf ?? requirements.anyOf ?? [];
    const childResults = children.map(child => calculateRequirementProgress(child, progress, 'composite', userUnlockedAchievementIds));
    const current = requirements.anyOf
      ? Math.max(0, ...childResults.map(result => result.percent))
      : childResults.reduce((sum, result) => sum + result.percent, 0);
    const target = requirements.anyOf ? 100 : Math.max(1, childResults.length * 100);
    const percent = clampProgress(current, target);
    return {
      percent,
      current,
      target,
      unlocked: percent >= 100,
      label: requirements.anyOf ? 'Qualquer criterio' : `${childResults.filter(result => result.unlocked).length}/${childResults.length} criterios`,
    };
  }

  if (type === 'exercise_completion') {
    const target = requirements.requiredCount ?? 1;
    const current = getExerciseCount(requirements, progress);
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: `${current}/${target} exercicios`,
    };
  }

  if (type === 'bpm_target') {
    const exerciseId = requirements.exerciseId ?? '';
    const current = progress.exerciseBpmTargets?.[exerciseId] ?? 0;
    const target = requirements.minBpm ?? 1;
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: `${current}/${target} BPM`,
    };
  }

  if (type === 'module_completion') {
    const target = requirements.requiredCount ?? requirements.moduleIds?.length ?? 1;
    const current = getModuleCount(requirements, progress);
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: `${current}/${target} modulos`,
    };
  }

  if (type === 'streak') {
    const current = progress.streakDays ?? 0;
    const target = requirements.streakDays ?? requirements.requiredCount ?? 1;
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: `${current}/${target} dias`,
    };
  }

  if (type === 'loyalty') {
    const current = progress.loyaltyDays ?? progress.streakDays ?? 0;
    const target = requirements.loyaltyDays ?? requirements.requiredCount ?? 1;
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: `${current}/${target} dias de lealdade`,
    };
  }

  if (type === 'tenure') {
    const current = progress.firstSeenAt
      ? Math.max(0, Math.floor((Date.now() - new Date(progress.firstSeenAt).getTime()) / 86400000))
      : 0;
    const target = requirements.tenureDays ?? requirements.requiredCount ?? 1;
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: `${current}/${target} dias de vinculo`,
    };
  }

  if (type === 'anniversary') {
    const key = requirements.anniversaryKey ?? (requirements.anniversaryYear ? `app-anniversary-${requirements.anniversaryYear}` : '');
    const unlocked = Boolean(key && progress.appAnniversaryKeys?.includes(key));
    return {
      percent: unlocked ? 100 : 0,
      current: unlocked ? 1 : 0,
      target: 1,
      unlocked,
      label: key || 'Aniversario do app',
    };
  }

  if (type === 'exploration') {
    const key = requirements.explorationKey ?? (requirements.instrumentCount !== undefined ? 'registered_instruments' : '');
    const current = progress.explorationCounts?.[key] ?? 0;
    const target = requirements.instrumentCount ?? requirements.requiredCount ?? 1;
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: `${current}/${target} interacoes`,
    };
  }

  if (type === 'tier_collection') {
    const tier = requirements.achievementTier;
    const current = tier === undefined
      ? 0
      : ACHIEVEMENTS.filter(achievement => (
        achievement.tier === tier &&
        achievement.asset.status === 'ready' &&
        userUnlockedAchievementIds.includes(achievement.id)
      )).length;
    const target = requirements.unlockedAchievementCount ?? requirements.requiredCount ?? 1;
    return {
      percent: clampProgress(current, target),
      current,
      target,
      unlocked: current >= target,
      label: tier === undefined ? `${current}/${target} tier` : `${current}/${target} ${getTierDisplay(tier, 'pt')}`,
    };
  }

  return {
    percent: 0,
    current: 0,
    target: requirements.requiredCount ?? 1,
    unlocked: false,
    label: 'Manual',
  };
};

export const calculateAchievementProgress = (
  achievement: Achievement,
  progress: AchievementProgressState,
  userUnlockedAchievementIds: string[] = [],
): AchievementProgressResult => {
  if (isAchievementUnlocked(achievement.id, userUnlockedAchievementIds)) {
    return {
      percent: 100,
      current: 1,
      target: 1,
      unlocked: true,
      label: 'Desbloqueada',
    };
  }
  const result = calculateRequirementProgress(
    achievement.requirements,
    progress,
    achievement.unlockType,
    userUnlockedAchievementIds,
  );
  if (achievement.asset.status !== 'ready') {
    return {
      ...result,
      unlocked: false,
      percent: Math.min(result.percent, 99),
      label: result.percent >= 80 ? 'Imagem em breve' : result.label,
    };
  }
  return result;
};

export const getOverallAchievementProgress = (userUnlockedAchievementIds: string[]) => {
  const visibleOrUnlocked = ACHIEVEMENTS.filter(achievement => (
    !achievement.hidden || userUnlockedAchievementIds.includes(achievement.id)
  ));
  if (visibleOrUnlocked.length === 0) return 0;
  const unlockedVisible = visibleOrUnlocked.filter(achievement => userUnlockedAchievementIds.includes(achievement.id));
  return Math.round((unlockedVisible.length / visibleOrUnlocked.length) * 100);
};

export const getTotalAchievementXp = (userUnlockedAchievementIds: string[]) => (
  getUnlockedAchievements(userUnlockedAchievementIds).reduce((sum, achievement) => sum + achievement.xp, 0)
);
