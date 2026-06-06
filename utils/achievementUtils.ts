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

const formatCountLabel = (count: number, singular: string, plural: string) => (
  `${count} ${count === 1 ? singular : plural}`
);

const describeRequirement = (requirements: AchievementRequirement, unlockType: AchievementUnlockType, lang: 'pt' | 'en'): string => {
  const type = inferUnlockType(requirements, unlockType);

  if (type === 'composite') {
    const parts = (requirements.allOf ?? requirements.anyOf ?? [])
      .map(child => describeRequirement(child, inferUnlockType(child, 'manual'), lang))
      .filter(Boolean);
    if (parts.length === 0) return lang === 'pt' ? 'Complete os critérios combinados.' : 'Complete the combined criteria.';
    return requirements.anyOf
      ? `${lang === 'pt' ? 'Complete qualquer um' : 'Complete any one'}: ${parts.join(' · ')}`
      : `${lang === 'pt' ? 'Complete todos' : 'Complete all'}: ${parts.join(' · ')}`;
  }

  if (type === 'exercise_completion') {
    if (requirements.exerciseId === '*') {
      const count = requirements.requiredCount ?? 1;
      return lang === 'pt'
        ? `Complete ${formatCountLabel(count, 'exercício prático', 'exercícios práticos')}.`
        : `Complete ${formatCountLabel(count, 'practical exercise', 'practical exercises')}.`;
    }
    const exercise = requirements.exerciseId ? getExerciseById(requirements.exerciseId) : null;
    const count = requirements.requiredCount ?? 1;
    if (exercise?.title) {
      return lang === 'pt'
        ? `Complete ${formatCountLabel(count, 'vez', 'vezes')} o exercício ${exercise.title}.`
        : `Complete ${formatCountLabel(count, 'time', 'times')} the exercise ${exercise.title}.`;
    }
    return lang === 'pt'
      ? `Complete ${formatCountLabel(count, 'exercício', 'exercícios')} específicos.`
      : `Complete ${formatCountLabel(count, 'specific exercise', 'specific exercises')}.`;
  }

  if (type === 'bpm_target') {
    const exercise = requirements.exerciseId ? getExerciseById(requirements.exerciseId) : null;
    const exerciseLabel = exercise?.title ?? (lang === 'pt' ? 'o exercício alvo' : 'the target exercise');
    return lang === 'pt'
      ? `Alcance ${requirements.minBpm ?? 0} BPM em ${exerciseLabel}.`
      : `Reach ${requirements.minBpm ?? 0} BPM in ${exerciseLabel}.`;
  }

  if (type === 'module_completion') {
    if (requirements.moduleId) {
      return lang === 'pt'
        ? `Conclua o módulo ${requirements.moduleId}.`
        : `Complete the ${requirements.moduleId} module.`;
    }
    const count = requirements.requiredCount ?? requirements.moduleIds?.length ?? 1;
    return lang === 'pt'
      ? `Conclua ${formatCountLabel(count, 'módulo', 'módulos')}.`
      : `Complete ${formatCountLabel(count, 'module', 'modules')}.`;
  }

  if (type === 'streak') {
    const days = requirements.streakDays ?? requirements.requiredCount ?? 1;
    return lang === 'pt'
      ? `Mantenha ${formatCountLabel(days, 'dia consecutivo', 'dias consecutivos')} de prática.`
      : `Maintain ${formatCountLabel(days, 'consecutive day', 'consecutive days')} of practice.`;
  }

  if (type === 'loyalty') {
    const days = requirements.loyaltyDays ?? requirements.requiredCount ?? 1;
    return lang === 'pt'
      ? `Volte ao app em ${formatCountLabel(days, 'dia distinto', 'dias distintos')}.`
      : `Return to the app on ${formatCountLabel(days, 'distinct day', 'distinct days')}.`;
  }

  if (type === 'tenure') {
    const days = requirements.tenureDays ?? requirements.requiredCount ?? 1;
    return lang === 'pt'
      ? `Mantenha ${formatCountLabel(days, 'dia', 'dias')} desde o primeiro registro local.`
      : `Keep ${formatCountLabel(days, 'day', 'days')} since the first local record.`;
  }

  if (type === 'anniversary') {
    return lang === 'pt'
      ? `Acesse o app em 24 de janeiro de ${requirements.anniversaryYear ?? 'aniversário válido'} com conta criada no mesmo ano do selo.`
      : `Access the app on January 24, ${requirements.anniversaryYear ?? 'the valid anniversary year'} with an account created in that same badge year.`;
  }

  if (type === 'exploration') {
    if (requirements.explorationKey === 'switch_instrument_family') {
      const count = requirements.requiredCount ?? 1;
      return lang === 'pt'
        ? `Troque a família do instrumento ${formatCountLabel(count, 'vez', 'vezes')}.`
        : `Switch instrument family ${formatCountLabel(count, 'time', 'times')}.`;
    }
    if (requirements.explorationKey === 'registered_instruments' || requirements.instrumentCount !== undefined) {
      const count = requirements.instrumentCount ?? requirements.requiredCount ?? 1;
      return lang === 'pt'
        ? `Cadastre ${formatCountLabel(count, 'instrumento', 'instrumentos')}.`
        : `Register ${formatCountLabel(count, 'instrument', 'instruments')}.`;
    }
    if (requirements.explorationKey === 'apply_scale') {
      const count = requirements.requiredCount ?? 1;
      return lang === 'pt'
        ? `Aplique escalas ${formatCountLabel(count, 'vez', 'vezes')} no fretboard.`
        : `Apply scales on the fretboard ${formatCountLabel(count, 'time', 'times')}.`;
    }
    if (requirements.explorationKey === 'open_metronome') {
      const count = requirements.requiredCount ?? 1;
      return lang === 'pt'
        ? `Abra o metrônomo ${formatCountLabel(count, 'vez', 'vezes')}.`
        : `Open the metronome ${formatCountLabel(count, 'time', 'times')}.`;
    }
    if (requirements.explorationKey === 'harmonic_cycle_progression') {
      const count = requirements.requiredCount ?? 1;
      return lang === 'pt'
        ? `Explore progressões no ciclo harmônico ${formatCountLabel(count, 'vez', 'vezes')}.`
        : `Explore harmonic-cycle progressions ${formatCountLabel(count, 'time', 'times')}.`;
    }
    if (requirements.explorationKey === 'export_diagram') {
      const count = requirements.requiredCount ?? 1;
      return lang === 'pt'
        ? `Exporte diagramas ${formatCountLabel(count, 'vez', 'vezes')}.`
        : `Export diagrams ${formatCountLabel(count, 'time', 'times')}.`;
    }
    const count = requirements.requiredCount ?? 1;
    return lang === 'pt'
      ? `Complete ${formatCountLabel(count, 'interação de exploração', 'interações de exploração')}.`
      : `Complete ${formatCountLabel(count, 'exploration interaction', 'exploration interactions')}.`;
  }

  if (type === 'tier_collection') {
    const tierLabel = requirements.achievementTier !== undefined ? getTierDisplay(requirements.achievementTier, lang) : (lang === 'pt' ? 'tier alvo' : 'target tier');
    const count = requirements.unlockedAchievementCount ?? requirements.requiredCount ?? 1;
    return lang === 'pt'
      ? `Desbloqueie ${formatCountLabel(count, 'conquista pronta', 'conquistas prontas')} do ${tierLabel}.`
      : `Unlock ${formatCountLabel(count, 'ready achievement', 'ready achievements')} from ${tierLabel}.`;
  }

  return lang === 'pt' ? 'Complete o critério manual do item.' : 'Complete the item manual criterion.';
};

export const getAchievementCriteriaText = (achievement: Achievement, lang: 'pt' | 'en' = 'pt') => (
  describeRequirement(achievement.requirements, achievement.unlockType, lang)
);
