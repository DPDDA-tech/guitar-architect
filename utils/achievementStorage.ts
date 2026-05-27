import type { AchievementProgressState } from '../types/achievement';
import { loadConfig } from './persistence';

export const UNLOCKED_ACHIEVEMENTS_KEY = 'ga_unlocked_achievements';
export const ACHIEVEMENT_PROGRESS_KEY = 'ga_achievement_progress';
export const SELECTED_REWARD_BADGE_KEY = 'ga_selected_reward_badge';

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

const getCurrentUserId = (): string => {
  try {
    const config = loadConfig();
    return config?.currentUser || 'guest';
  } catch {
    return 'guest';
  }
};

const getUserPrefixedKey = (baseKey: string, userId?: string): string => {
  const user = userId || getCurrentUserId();
  return `${baseKey}_${user}`;
};

const readJson = <T,>(key: string, fallback: T, userId?: string): T => {
  if (!canUseLocalStorage()) return fallback;
  const prefixedKey = getUserPrefixedKey(key, userId);
  try {
    const raw = window.localStorage.getItem(prefixedKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T, userId?: string) => {
  if (!canUseLocalStorage()) return;
  const prefixedKey = getUserPrefixedKey(key, userId);
  window.localStorage.setItem(prefixedKey, JSON.stringify(value));
};

const deleteKey = (key: string, userId?: string) => {
  if (!canUseLocalStorage()) return;
  const prefixedKey = getUserPrefixedKey(key, userId);
  window.localStorage.removeItem(prefixedKey);
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

export const getUnlockedAchievementIds = (userId?: string) => {
  const ids = readJson<string[]>(UNLOCKED_ACHIEVEMENTS_KEY, [], userId);
  return Array.isArray(ids) ? unique(ids.filter(id => typeof id === 'string')) : [];
};

export const unlockAchievement = (id: string, userId?: string) => {
  const next = unique([...getUnlockedAchievementIds(userId), id]);
  writeJson(UNLOCKED_ACHIEVEMENTS_KEY, next, userId);
  return next;
};

export const lockAchievement = (id: string, userId?: string) => {
  const next = getUnlockedAchievementIds(userId).filter(achievementId => achievementId !== id);
  writeJson(UNLOCKED_ACHIEVEMENTS_KEY, next, userId);
  return next;
};

export const resetAchievements = (userId?: string) => {
  writeJson(UNLOCKED_ACHIEVEMENTS_KEY, [], userId);
};

export const hasAchievement = (id: string, userId?: string) => getUnlockedAchievementIds(userId).includes(id);

export const getAchievementProgressState = (userId?: string): AchievementProgressState => (
  readJson<AchievementProgressState>(ACHIEVEMENT_PROGRESS_KEY, {}, userId)
);

export const setAchievementProgressState = (progress: AchievementProgressState, userId?: string) => {
  writeJson(ACHIEVEMENT_PROGRESS_KEY, progress, userId);
  return progress;
};

export const mergeAchievementProgressState = (partial: AchievementProgressState, userId?: string) => {
  const current = getAchievementProgressState(userId);
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
  writeJson(ACHIEVEMENT_PROGRESS_KEY, next, userId);
  return next;
};

export const resetAchievementProgress = (userId?: string) => {
  writeJson(ACHIEVEMENT_PROGRESS_KEY, {}, userId);
};

export const getSelectedRewardBadgeId = (userId?: string) => {
  if (!canUseLocalStorage()) return null;
  const prefixedKey = getUserPrefixedKey(SELECTED_REWARD_BADGE_KEY, userId);
  return window.localStorage.getItem(prefixedKey);
};

export const setSelectedRewardBadgeId = (rewardId: string | null, userId?: string) => {
  if (!canUseLocalStorage()) return rewardId;
  if (!rewardId) {
    deleteKey(SELECTED_REWARD_BADGE_KEY, userId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ga-selected-badge-updated'));
    }
    return null;
  }
  const prefixedKey = getUserPrefixedKey(SELECTED_REWARD_BADGE_KEY, userId);
  window.localStorage.setItem(prefixedKey, rewardId);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ga-selected-badge-updated'));
  }
  return rewardId;
};
