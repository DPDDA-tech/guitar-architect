import { getUnlockedSupporterRewards } from '../data/supporterRewards';

export const SUPPORTER_TOTAL_KEY = 'ga_supporter_total';
export const UNLOCKED_SUPPORTER_REWARDS_KEY = 'ga_unlocked_supporter_rewards';

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

const readStringArray = (key: string): string[] => {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeStringArray = (key: string, value: string[]) => {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(value))));
};

export const getSupporterContributionTotal = () => {
  if (!canUseLocalStorage()) return 0;
  const raw = window.localStorage.getItem(SUPPORTER_TOTAL_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
};

export const getUnlockedSupporterRewardIds = () => readStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY);

export const syncUnlockedSupporterRewards = (total = getSupporterContributionTotal()) => {
  const unlockedIds = getUnlockedSupporterRewards(total).map(reward => reward.id);
  writeStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, unlockedIds);
  return unlockedIds;
};

export const setSupporterContributionTotal = (total: number) => {
  const normalized = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  if (canUseLocalStorage()) {
    window.localStorage.setItem(SUPPORTER_TOTAL_KEY, String(normalized));
  }
  return syncUnlockedSupporterRewards(normalized);
};

