import { constancyRewards } from '../data/constancyRewards';
import { getScopedStorageKey } from './persistence';

export const GA_CURRENT_CONSTANCY_STREAK_KEY = 'ga_current_constancy_streak';
export const GA_HIGHEST_CONSTANCY_STREAK_KEY = 'ga_highest_constancy_streak';
export const GA_LAST_CONSTANCY_CHECK_KEY = 'ga_last_constancy_check';
export const GA_UNLOCKED_CONSTANCY_REWARDS_KEY = 'ga_unlocked_constancy_rewards';

export type ConstancyState = {
  currentStreak: number;
  highestStreak: number;
  lastCheckDate: string | null;
  unlockedRewardIds: string[];
};

export type ConstancyUpdateResult = {
  state: ConstancyState;
  newlyUnlockedRewardIds: string[];
  changed: boolean;
};

export type NextConstancyMilestone = {
  nextRewardId: string | null;
  nextRequiredDays: number | null;
  daysRemaining: number | null;
};

const readNumber = (value: string | null, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readRewardIds = (value: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)));
  } catch {
    return [];
  }
};

const parseDateKey = (value: string | null): string | null => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
};

/**
 * Retorna a data atual (ou fornecida) no formato YYYY-MM-DD usando o horário local.
 */
export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula a diferença em dias entre duas chaves de data (YYYY-MM-DD).
 */
export function getDateDiffInDays(fromDateKey: string, toDateKey: string): number {
  try {
    const from = new Date(`${fromDateKey}T00:00:00`);
    const to = new Date(`${toDateKey}T00:00:00`);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
    
    const diffTime = to.getTime() - from.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Recupera o estado atual de constância do localStorage.
 */
export function getConstancyState(userId?: string | null): ConstancyState {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, highestStreak: 0, lastCheckDate: null, unlockedRewardIds: [] };
  }

  const currentKey = getScopedStorageKey(GA_CURRENT_CONSTANCY_STREAK_KEY, userId);
  const highestKey = getScopedStorageKey(GA_HIGHEST_CONSTANCY_STREAK_KEY, userId);
  const checkKey = getScopedStorageKey(GA_LAST_CONSTANCY_CHECK_KEY, userId);
  const rewardsKey = getScopedStorageKey(GA_UNLOCKED_CONSTANCY_REWARDS_KEY, userId);

  const scopedCurrent = localStorage.getItem(currentKey);
  
  // MIGRATION TRIGGER
  if (userId && userId !== 'guest' && scopedCurrent === null) {
    const legacyCurrent = localStorage.getItem(GA_CURRENT_CONSTANCY_STREAK_KEY);
    if (legacyCurrent !== null) {
      localStorage.setItem(currentKey, legacyCurrent);
      localStorage.setItem(highestKey, localStorage.getItem(GA_HIGHEST_CONSTANCY_STREAK_KEY) || '0');
      localStorage.setItem(checkKey, localStorage.getItem(GA_LAST_CONSTANCY_CHECK_KEY) || '');
      localStorage.setItem(rewardsKey, localStorage.getItem(GA_UNLOCKED_CONSTANCY_REWARDS_KEY) || '[]');
    }
  }

  const scopedState: ConstancyState = {
    currentStreak: readNumber(localStorage.getItem(currentKey)),
    highestStreak: readNumber(localStorage.getItem(highestKey)),
    lastCheckDate: parseDateKey(localStorage.getItem(checkKey)),
    unlockedRewardIds: readRewardIds(localStorage.getItem(rewardsKey)),
  };

  const legacyState: ConstancyState = {
    currentStreak: readNumber(localStorage.getItem(GA_CURRENT_CONSTANCY_STREAK_KEY)),
    highestStreak: readNumber(localStorage.getItem(GA_HIGHEST_CONSTANCY_STREAK_KEY)),
    lastCheckDate: parseDateKey(localStorage.getItem(GA_LAST_CONSTANCY_CHECK_KEY)),
    unlockedRewardIds: readRewardIds(localStorage.getItem(GA_UNLOCKED_CONSTANCY_REWARDS_KEY)),
  };

  const guestState: ConstancyState = {
    currentStreak: readNumber(localStorage.getItem(getScopedStorageKey(GA_CURRENT_CONSTANCY_STREAK_KEY, 'guest'))),
    highestStreak: readNumber(localStorage.getItem(getScopedStorageKey(GA_HIGHEST_CONSTANCY_STREAK_KEY, 'guest'))),
    lastCheckDate: parseDateKey(localStorage.getItem(getScopedStorageKey(GA_LAST_CONSTANCY_CHECK_KEY, 'guest'))),
    unlockedRewardIds: readRewardIds(localStorage.getItem(getScopedStorageKey(GA_UNLOCKED_CONSTANCY_REWARDS_KEY, 'guest'))),
  };

  const merged: ConstancyState = {
    currentStreak: Math.max(scopedState.currentStreak, legacyState.currentStreak, guestState.currentStreak),
    highestStreak: Math.max(scopedState.highestStreak, legacyState.highestStreak, guestState.highestStreak),
    lastCheckDate: [scopedState.lastCheckDate, legacyState.lastCheckDate, guestState.lastCheckDate]
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null,
    unlockedRewardIds: Array.from(new Set([
      ...scopedState.unlockedRewardIds,
      ...legacyState.unlockedRewardIds,
      ...guestState.unlockedRewardIds,
    ])),
  };

  if (userId && userId !== 'guest') {
    saveConstancyState(merged, userId);
  }

  return merged;
}

/**
 * Salva o estado de constância no localStorage.
 */
export function saveConstancyState(state: ConstancyState, userId?: string | null): void {
  if (typeof window === 'undefined') return;

  const currentKey = getScopedStorageKey(GA_CURRENT_CONSTANCY_STREAK_KEY, userId);
  const highestKey = getScopedStorageKey(GA_HIGHEST_CONSTANCY_STREAK_KEY, userId);
  const checkKey = getScopedStorageKey(GA_LAST_CONSTANCY_CHECK_KEY, userId);
  const rewardsKey = getScopedStorageKey(GA_UNLOCKED_CONSTANCY_REWARDS_KEY, userId);

  localStorage.setItem(currentKey, String(state.currentStreak));
  localStorage.setItem(highestKey, String(state.highestStreak));
  localStorage.setItem(checkKey, state.lastCheckDate || '');
  
  const uniqueIds = Array.from(new Set(state.unlockedRewardIds.filter(Boolean)));
  localStorage.setItem(rewardsKey, JSON.stringify(uniqueIds));
  window.dispatchEvent(new Event('ga-constancy-updated'));
}

/**
 * Retorna os IDs das recompensas elegíveis para um determinado streak.
 */
export function getUnlockedConstancyRewardIdsForStreak(streak: number): string[] {
  return constancyRewards
    .filter(reward => reward.requiredDays <= streak)
    .map(reward => reward.id);
}

/**
 * Calcula o próximo marco de constância.
 */
export function getNextConstancyMilestone(streak?: number): NextConstancyMilestone {
  const current = streak ?? getConstancyState().currentStreak;
  const nextReward = constancyRewards.find(r => r.requiredDays > current);

  if (!nextReward) {
    return { nextRewardId: null, nextRequiredDays: null, daysRemaining: null };
  }

  return {
    nextRewardId: nextReward.id,
    nextRequiredDays: nextReward.requiredDays,
    daysRemaining: nextReward.requiredDays - current
  };
}

/**
 * Registra uma visita e atualiza os streaks e recompensas desbloqueadas.
 */
export function recordConstancyVisit(date: Date = new Date(), userId?: string | null): ConstancyUpdateResult {
  const state = getConstancyState(userId);
  const todayKey = getTodayDateKey(date);

  if (state.lastCheckDate === todayKey) {
    return { state, newlyUnlockedRewardIds: [], changed: false };
  }

  let newCurrentStreak = 1;

  if (state.lastCheckDate) {
    const diff = getDateDiffInDays(state.lastCheckDate, todayKey);
    
    if (diff === 1) {
      newCurrentStreak = state.currentStreak + 1;
    } else if (diff <= 0) {
      // Visita no mesmo dia (já tratado) ou data retroativa: ignorar processamento de streak
      return { state, newlyUnlockedRewardIds: [], changed: false };
    }
    // Se diff > 1, newCurrentStreak permanece 1 (streak quebrado)
  }

  const newHighestStreak = Math.max(state.highestStreak, newCurrentStreak);
  const rewardsForHighest = getUnlockedConstancyRewardIdsForStreak(newHighestStreak);
  
  const nextUnlockedIds = Array.from(new Set([...state.unlockedRewardIds, ...rewardsForHighest]));
  const newlyUnlockedRewardIds = nextUnlockedIds.filter(id => !state.unlockedRewardIds.includes(id));

  const newState: ConstancyState = {
    currentStreak: newCurrentStreak,
    highestStreak: newHighestStreak,
    lastCheckDate: todayKey,
    unlockedRewardIds: nextUnlockedIds
  };

  saveConstancyState(newState, userId);
  return { state: newState, newlyUnlockedRewardIds, changed: true };
}
