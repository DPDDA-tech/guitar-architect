import { getUnlockedSupporterRewards } from '../data/supporterRewards';
import { getScopedStorageKey } from './persistence';
import { supabase } from '../src/lib/supabase';

export const SUPPORTER_TOTAL_KEY = 'ga_supporter_total';
export const UNLOCKED_SUPPORTER_REWARDS_KEY = 'ga_unlocked_supporter_rewards';

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

const readStringArray = (key: string, userId?: string | null): string[] => {
  if (!canUseLocalStorage()) return [];
  const scopedKey = getScopedStorageKey(key, userId);
  const scopedRaw = window.localStorage.getItem(scopedKey);

  if (scopedRaw) {
    try {
      const parsed = JSON.parse(scopedRaw);
      return Array.isArray(parsed)
        ? parsed.filter((item: unknown): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }

  // MIGRATION
  try {
    const raw = window.localStorage.getItem(key);
    if (userId && userId !== 'guest' && raw) {
      window.localStorage.setItem(scopedKey, raw);
    }
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item: unknown): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeStringArray = (key: string, value: string[], userId?: string | null) => {
  if (!canUseLocalStorage()) return;
  const scopedKey = getScopedStorageKey(key, userId);
  window.localStorage.setItem(scopedKey, JSON.stringify(Array.from(new Set(value))));
};

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sa = Array.from(a).sort();
  const sb = Array.from(b).sort();
  for (let i = 0; i < sa.length; i += 1) if (sa[i] !== sb[i]) return false;
  return true;
};

const getSupabaseUserId = async (userId?: string | null) => {
  if (userId && userId !== 'guest') return userId;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
};

// Simple debounce/queue to avoid race conditions from rapid local updates.
const pendingPushTimers = new Map<string, number>();
const schedulePush = (userId: string, delay = 1500) => {
  const existing = pendingPushTimers.get(userId);
  if (existing) {
    clearTimeout(existing);
  }
  const id = window.setTimeout(() => {
    // fire off push but don't await
    pushSupporterToServer(userId).catch(() => {});
    pendingPushTimers.delete(userId);
  }, delay) as unknown as number;
  pendingPushTimers.set(userId, id);
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
  // Schedule a conservative push to server (debounced). Do not block UI.
  (async () => {
    try {
      const effectiveId = await getSupabaseUserId(userId);
      if (!effectiveId || effectiveId === 'guest') return;
      schedulePush(effectiveId);
    } catch (err) {
      // ignore
    }
  })();

  return unlockedIds;
};

export const setSupporterContributionTotal = (total: number, userId?: string | null) => {
  const normalized = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const key = getScopedStorageKey(SUPPORTER_TOTAL_KEY, userId);
  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, String(normalized));
  }
  const result = syncUnlockedSupporterRewards(normalized, userId);

  // Schedule a debounced push (avoids race conditions)
  (async () => {
    try {
      const effectiveId = await getSupabaseUserId(userId);
      if (!effectiveId || effectiveId === 'guest') return;
      schedulePush(effectiveId);
    } catch (err) {
      // ignore
    }
  })();

  return result;
};

// --- Server synchronization helpers (conservative merge) ---

export const hydrateSupporterFromServer = async (userId?: string | null) => {
  const effectiveId = await getSupabaseUserId(userId);
  if (!effectiveId || effectiveId === 'guest') return null;

  try {
    const { data, error } = await supabase
      .from('supporter_profiles')
      .select('supporter_total, unlocked_rewards, unlocked_badges, updated_at')
      .eq('user_id', effectiveId)
      .single();

    if (error) {
      // Table might not exist or no row for user; bail gracefully
      return null;
    }

    const localTotal = getSupporterContributionTotal(effectiveId);
    const localUnlocked = getUnlockedSupporterRewardIds(effectiveId);

    if (error || !data) {
      // Sem dados no servidor: se houver progresso local, sobe para o servidor
      if (localTotal > 0 || localUnlocked.length > 0) {
        return await pushSupporterToServer(effectiveId, localTotal, localUnlocked);
      }
      return null;
    }

    const serverTotal = Number(data.supporter_total || 0);
    const serverUnlocked = Array.isArray(data.unlocked_rewards) ? data.unlocked_rewards : [];

    // Se o cliente tem progresso que o servidor não tem, chama o RPC para consolidar
    const hasLocalProgress = localTotal > serverTotal || 
                             localUnlocked.some(id => !serverUnlocked.includes(id));

    if (hasLocalProgress) {
      return await pushSupporterToServer(effectiveId, localTotal, localUnlocked);
    }

    // Caso contrário, o servidor é a autoridade. Sincroniza cache local.
    const key = getScopedStorageKey(SUPPORTER_TOTAL_KEY, effectiveId);
    window.localStorage.setItem(key, String(serverTotal));
    writeStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, serverUnlocked, effectiveId);

    return { mergedTotal: serverTotal, mergedUnlocked: serverUnlocked };
  } catch (err) {
    return null;
  }
};

export const pushSupporterToServer = async (
  userId?: string | null,
  total?: number | undefined,
  unlocked?: string[] | undefined,
  badges?: string[] | undefined
) => {
  const effectiveId = await getSupabaseUserId(userId);
  if (!effectiveId || effectiveId === 'guest') return null;

  try {
    const p_supporter_total = typeof total === 'number' ? total : getSupporterContributionTotal(effectiveId);
    const p_unlocked_rewards = Array.isArray(unlocked) ? unlocked : getUnlockedSupporterRewardIds(effectiveId);
    const p_unlocked_badges = Array.isArray(badges) ? badges : p_unlocked_rewards;

    const { data, error } = await supabase.rpc('merge_supporter_data', {
      p_supporter_total,
      p_unlocked_rewards,
      p_unlocked_badges
    });

    if (error || !data) return null;

    const result = { 
      mergedTotal: Number(data.supporter_total || 0), 
      mergedUnlocked: Array.isArray(data.unlocked_rewards) ? data.unlocked_rewards : [], 
      mergedBadges: Array.isArray(data.unlocked_badges) ? data.unlocked_badges : [] 
    };

    // Atualiza cache local com o resultado final do merge do servidor
    const key = getScopedStorageKey(SUPPORTER_TOTAL_KEY, effectiveId);
    window.localStorage.setItem(key, String(result.mergedTotal));
    writeStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, result.mergedUnlocked, effectiveId);

    return result;
  } catch (err) {
    return null;
  }
};
