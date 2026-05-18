import type { AchievementProgressState } from '../types/achievement';

export const UNLOCKED_ACHIEVEMENTS_KEY = 'ga_unlocked_achievements';
export const ACHIEVEMENT_PROGRESS_KEY = 'ga_achievement_progress';
export const SELECTED_REWARD_BADGE_KEY = 'ga_selected_reward_badge';

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

const readJson = <T,>(key: string, fallback: T): T => {
  if (!canUseLocalStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const unique = (ids: string[]) => Array.from(new Set(ids.filter(Boolean)));

const mergeNumberRecords = (
  current: Record<string, number> | undefined,
  incoming: Record<string, number> | undefined,
) => {
  const next = { ...(current ?? {}) };
  Object.entries(incoming ?? {}).forEach(([key, value]) => {
    if (typeof value !== 'number') return;
    next[key] = Math.max(next[key] ?? 0, value);
  });
  return next;
};

export const getUnlockedAchievementIds = () => {
  const ids = readJson<string[]>(UNLOCKED_ACHIEVEMENTS_KEY, []);
  return Array.isArray(ids) ? unique(ids.filter(id => typeof id === 'string')) : [];
};

export const unlockAchievement = (id: string) => {
  const next = unique([...getUnlockedAchievementIds(), id]);
  writeJson(UNLOCKED_ACHIEVEMENTS_KEY, next);
  return next;
};

export const lockAchievement = (id: string) => {
  const next = getUnlockedAchievementIds().filter(achievementId => achievementId !== id);
  writeJson(UNLOCKED_ACHIEVEMENTS_KEY, next);
  return next;
};

export const resetAchievements = () => {
  writeJson(UNLOCKED_ACHIEVEMENTS_KEY, []);
};

export const hasAchievement = (id: string) => getUnlockedAchievementIds().includes(id);

export const getAchievementProgressState = (): AchievementProgressState => (
  readJson<AchievementProgressState>(ACHIEVEMENT_PROGRESS_KEY, {})
);

export const setAchievementProgressState = (progress: AchievementProgressState) => {
  writeJson(ACHIEVEMENT_PROGRESS_KEY, progress);
  return progress;
};

export const mergeAchievementProgressState = (partial: AchievementProgressState) => {
  const current = getAchievementProgressState();
  const next: AchievementProgressState = {
    ...current,
    ...partial,
    completedExerciseIds: unique([
      ...(current.completedExerciseIds ?? []),
      ...(partial.completedExerciseIds ?? []),
    ]),
    completedModuleIds: unique([
      ...(current.completedModuleIds ?? []),
      ...(partial.completedModuleIds ?? []),
    ]),
    appAnniversaryKeys: unique([
      ...(current.appAnniversaryKeys ?? []),
      ...(partial.appAnniversaryKeys ?? []),
    ]),
    exerciseCompletionCounts: mergeNumberRecords(current.exerciseCompletionCounts, partial.exerciseCompletionCounts),
    exerciseBpmTargets: mergeNumberRecords(current.exerciseBpmTargets, partial.exerciseBpmTargets),
    moduleCompletionCounts: mergeNumberRecords(current.moduleCompletionCounts, partial.moduleCompletionCounts),
    explorationCounts: mergeNumberRecords(current.explorationCounts, partial.explorationCounts),
    streakDays: Math.max(current.streakDays ?? 0, partial.streakDays ?? 0),
    loyaltyDays: Math.max(current.loyaltyDays ?? 0, partial.loyaltyDays ?? 0),
    firstSeenAt: current.firstSeenAt ?? partial.firstSeenAt,
    lastSeenAt: partial.lastSeenAt ?? current.lastSeenAt,
  };
  writeJson(ACHIEVEMENT_PROGRESS_KEY, next);
  return next;
};

export const resetAchievementProgress = () => {
  writeJson(ACHIEVEMENT_PROGRESS_KEY, {});
};

export const getSelectedRewardBadgeId = () => {
  if (!canUseLocalStorage()) return null;
  return window.localStorage.getItem(SELECTED_REWARD_BADGE_KEY);
};

export const setSelectedRewardBadgeId = (rewardId: string | null) => {
  if (!canUseLocalStorage()) return rewardId;
  if (!rewardId) {
    window.localStorage.removeItem(SELECTED_REWARD_BADGE_KEY);
    return null;
  }
  window.localStorage.setItem(SELECTED_REWARD_BADGE_KEY, rewardId);
  return rewardId;
};
