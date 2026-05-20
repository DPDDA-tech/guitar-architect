import { ACHIEVEMENTS } from '../data/achievements';
import { calculateAchievementProgress, getAchievementById } from './achievementUtils';
import {
  getAchievementProgressState,
  getUnlockedAchievementIds,
  mergeAchievementProgressState,
  unlockAchievement,
} from './achievementStorage';
import { loadConfig } from './persistence';
import type { AchievementProgressState } from '../types/achievement';

const EVENT_LOG_KEY = 'ga_achievement_event_log';
const MAX_EVENT_LOG_LENGTH = 120;
const LOYALTY_DAYS_KEY = 'ga_loyalty_days_seen';
const ANNIVERSARY_MONTH = 0;
const ANNIVERSARY_DAY = 24;
const FIRST_ANNIVERSARY_YEAR = 2026;

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

export type AchievementEvent =
  | { type: 'exercise_completion'; exerciseId: string; bpm?: number; repetitions?: number }
  | { type: 'bpm_target'; exerciseId: string; bpm: number }
  | { type: 'module_completion'; moduleId: string }
  | { type: 'exploration'; key: string; amount?: number }
  | { type: 'streak'; days: number }
  | { type: 'loyalty'; days: number }
  | { type: 'tenure'; firstSeenAt?: string; lastSeenAt?: string }
  | { type: 'app_anniversary'; key: string; year?: number }
  | { type: 'instrument_switch'; instrumentFamily: 'guitar' | 'extended_guitar' | 'bass' | 'general' }
  | { type: 'export_diagram'; format: 'json' | 'png' | 'pdf' | 'project' };

export interface AchievementEventResult {
  progress: AchievementProgressState;
  unlockedAchievementIds: string[];
  newlyUnlockedAchievementIds: string[];
}

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

const appendEventLog = (event: AchievementEvent, userId?: string) => {
  if (!canUseLocalStorage()) return;
  try {
    const prefixedKey = getUserPrefixedKey(EVENT_LOG_KEY, userId);
    const raw = window.localStorage.getItem(prefixedKey);
    const current = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(current) ? current : [];
    next.push({ ...event, at: new Date().toISOString() });
    window.localStorage.setItem(prefixedKey, JSON.stringify(next.slice(-MAX_EVENT_LOG_LENGTH)));
  } catch {
    // event telemetry is diagnostic only
  }
};

const emitAchievementUnlocks = (achievementIds: string[]) => {
  if (typeof window === 'undefined' || achievementIds.length === 0) return;
  window.dispatchEvent(new CustomEvent('ga-achievements-unlocked', {
    detail: { achievementIds },
  }));
};

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const incrementRecord = (record: Record<string, number> | undefined, key: string, amount = 1) => ({
  ...(record ?? {}),
  [key]: (record?.[key] ?? 0) + amount,
});

const toProgressPatch = (event: AchievementEvent, userId?: string): AchievementProgressState => {
  const current = getAchievementProgressState(userId);

  if (event.type === 'exercise_completion') {
    return {
      completedExerciseIds: [event.exerciseId],
      exerciseCompletionCounts: incrementRecord(current.exerciseCompletionCounts, event.exerciseId, event.repetitions ?? 1),
      exerciseBpmTargets: event.bpm
        ? { ...(current.exerciseBpmTargets ?? {}), [event.exerciseId]: Math.max(current.exerciseBpmTargets?.[event.exerciseId] ?? 0, event.bpm) }
        : current.exerciseBpmTargets,
    };
  }

  if (event.type === 'bpm_target') {
    return {
      exerciseBpmTargets: {
        ...(current.exerciseBpmTargets ?? {}),
        [event.exerciseId]: Math.max(current.exerciseBpmTargets?.[event.exerciseId] ?? 0, event.bpm),
      },
    };
  }

  if (event.type === 'module_completion') {
    return {
      completedModuleIds: [event.moduleId],
      moduleCompletionCounts: incrementRecord(current.moduleCompletionCounts, event.moduleId),
    };
  }

  if (event.type === 'exploration') {
    return {
      explorationCounts: incrementRecord(current.explorationCounts, event.key, event.amount ?? 1),
    };
  }

  if (event.type === 'streak') {
    return { streakDays: event.days };
  }

  if (event.type === 'loyalty') {
    return { loyaltyDays: event.days };
  }

  if (event.type === 'tenure') {
    return {
      firstSeenAt: current.firstSeenAt ?? event.firstSeenAt ?? new Date().toISOString(),
      lastSeenAt: event.lastSeenAt ?? new Date().toISOString(),
    };
  }

  if (event.type === 'app_anniversary') {
    return {
      appAnniversaryKeys: [event.key],
    };
  }

  if (event.type === 'instrument_switch') {
    return {
      explorationCounts: incrementRecord(current.explorationCounts, 'switch_instrument_family'),
    };
  }

  if (event.type === 'export_diagram') {
    return {
      explorationCounts: incrementRecord(current.explorationCounts, 'export_diagram'),
    };
  }

  return {};
};

export const evaluateAchievementUnlocks = (userId?: string): AchievementEventResult => {
  const progress = getAchievementProgressState(userId);
  let unlockedIds = getUnlockedAchievementIds(userId);
  const newlyUnlockedAchievementIds: string[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (unlockedIds.includes(achievement.id)) return;
    const result = calculateAchievementProgress(achievement, progress, unlockedIds);
    if (!result.unlocked) return;
    unlockedIds = unlockAchievement(achievement.id, userId);
    newlyUnlockedAchievementIds.push(achievement.id);
  });

  return {
    progress,
    unlockedAchievementIds: unlockedIds,
    newlyUnlockedAchievementIds,
  };
};

export const recordAchievementEvent = (event: AchievementEvent, userId?: string): AchievementEventResult => {
  appendEventLog(event, userId);
  const progress = mergeAchievementProgressState(toProgressPatch(event, userId), userId);
  const result = evaluateAchievementUnlocks(userId);
  emitAchievementUnlocks(result.newlyUnlockedAchievementIds);
  return { ...result, progress };
};

export const recordAppLoyaltyVisit = (date = new Date(), userId?: string): AchievementEventResult => {
  if (!canUseLocalStorage()) {
    return recordAchievementEvent({ type: 'tenure', lastSeenAt: date.toISOString() }, userId);
  }

  const today = getDateKey(date);
  const prefixedKey = getUserPrefixedKey(LOYALTY_DAYS_KEY, userId);
  let days: string[] = [];
  try {
    const raw = window.localStorage.getItem(prefixedKey);
    const parsed = raw ? JSON.parse(raw) : [];
    days = Array.isArray(parsed) ? parsed.filter((day): day is string => typeof day === 'string') : [];
  } catch {
    days = [];
  }

  const uniqueDays = Array.from(new Set([...days, today])).sort();
  window.localStorage.setItem(prefixedKey, JSON.stringify(uniqueDays));
  recordAchievementEvent({ type: 'tenure', firstSeenAt: uniqueDays[0], lastSeenAt: date.toISOString() }, userId);
  return recordAchievementEvent({ type: 'loyalty', days: uniqueDays.length }, userId);
};

export const getAppAnniversaryNumber = (date = new Date()) => {
  const anniversaryNumber = date.getFullYear() - FIRST_ANNIVERSARY_YEAR + 1;
  return anniversaryNumber > 0 ? anniversaryNumber : 0;
};

export const recordAppAnniversaryVisit = (
  date = new Date(),
  accountCreatedAt?: string,
  userId?: string,
): AchievementEventResult | null => {
  if (date.getMonth() !== ANNIVERSARY_MONTH || date.getDate() !== ANNIVERSARY_DAY) return null;

  const anniversaryNumber = getAppAnniversaryNumber(date);
  if (anniversaryNumber < 1 || anniversaryNumber > 5) return null;

  const accountCreatedYear = accountCreatedAt ? new Date(accountCreatedAt).getFullYear() : undefined;
  if (accountCreatedYear !== date.getFullYear()) return null;

  const key = `app-anniversary-${anniversaryNumber}-year-${date.getFullYear()}`;
  return recordAchievementEvent({ type: 'app_anniversary', key, year: date.getFullYear() }, userId);
};

export const unlockAchievementById = (achievementId: string, userId?: string): AchievementEventResult => {
  const achievement = getAchievementById(achievementId);
  if (!achievement || achievement.asset.status !== 'ready') {
    return {
      progress: getAchievementProgressState(userId),
      unlockedAchievementIds: getUnlockedAchievementIds(userId),
      newlyUnlockedAchievementIds: [],
    };
  }
  const before = getUnlockedAchievementIds(userId);
  const after = unlockAchievement(achievementId, userId);
  if (!before.includes(achievementId)) emitAchievementUnlocks([achievementId]);
  return {
    progress: getAchievementProgressState(userId),
    unlockedAchievementIds: after,
    newlyUnlockedAchievementIds: before.includes(achievementId) ? [] : [achievementId],
  };
};
