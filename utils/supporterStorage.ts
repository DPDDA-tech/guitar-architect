import { getUnlockedSupporterRewards } from '../data/supporterRewards';
import { getScopedStorageKey } from './persistence';

export const SUPPORTER_TOTAL_KEY = 'ga_supporter_total';
export const UNLOCKED_SUPPORTER_REWARDS_KEY = 'ga_unlocked_supporter_rewards';

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

const readStringArray = (key: string, userId?: string | null): string[] => {
  if (!canUseLocalStorage()) return [];
  const scopedKey = getScopedStorageKey(key, userId);
  try {
    const data = window.localStorage.getItem(scopedKey);
    if (data) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    }
    // Fallback para dados legados (retrocompatibilidade)
    const legacy = window.localStorage.getItem(key);
    const parsed = legacy ? JSON.parse(legacy) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeStringArray = (key: string, value: string[], userId?: string | null) => {
  if (!canUseLocalStorage()) return;
  const scopedKey = getScopedStorageKey(key, userId);
  window.localStorage.setItem(scopedKey, JSON.stringify(Array.from(new Set(value))));
};

export const getSupporterContributionTotal = (userId?: string | null) => {
  if (!canUseLocalStorage()) return 0;
  const scopedKey = getScopedStorageKey(SUPPORTER_TOTAL_KEY, userId);
  const data = window.localStorage.getItem(scopedKey) || window.localStorage.getItem(SUPPORTER_TOTAL_KEY);
  const value = data ? Number(data) : 0;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
};

export const getUnlockedSupporterRewardIds = (userId?: string | null) => readStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, userId);

export const syncUnlockedSupporterRewards = (total: number, userId?: string | null) => {
  const unlockedIds = getUnlockedSupporterRewards(total).map(reward => reward.id);
  writeStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, unlockedIds, userId);
  return unlockedIds;
};

export const setSupporterContributionTotal = (total: number, userId?: string | null) => {
  const normalized = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const key = getScopedStorageKey(SUPPORTER_TOTAL_KEY, userId);
  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, String(normalized));
  }
  return syncUnlockedSupporterRewards(normalized, userId);
};
