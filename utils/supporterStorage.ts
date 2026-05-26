import { getUnlockedSupporterRewards } from '../data/supporterRewards';
import { getScopedStorageKey } from './persistence';
import { supabase } from '../src/lib/supabase';

export const SUPPORTER_TOTAL_KEY = 'ga_supporter_total';
export const UNLOCKED_SUPPORTER_REWARDS_KEY = 'ga_unlocked_supporter_rewards';
export const UNLOCKED_SUPPORTER_BADGES_KEY = 'ga_unlocked_supporter_badges';

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

/**
 * Resolve o ID do usuário para sincronização de apoiador.
 * Converte identificadores legados ("Guitar Architect", "guitar_architect", "guest")
 * para o UUID real do Supabase caso o usuário esteja autenticado.
 */
const resolveEffectiveSupporterUserId = (userId?: string | null): string => {
  console.log(`[SupporterStorage] resolve: incoming userId='${userId}'`);
  const legacyIds = ['guest', 'Guitar Architect', 'guitar_architect'];
  const currentId = userId || 'guest';
  
  // Se já for um UUID (não está na lista legacy), retorna direto
  if (!legacyIds.includes(currentId)) return currentId;

  // Caso contrário, tenta descobrir o UUID do usuário logado via ga_config (bootstrap)
  try {
    const configRaw = window.localStorage.getItem('ga_config');
    if (configRaw) {
      const config = JSON.parse(configRaw);
      // Se o ga_config tiver um UUID real, usamos ele como autoridade
      if (config.currentUser && !legacyIds.includes(config.currentUser)) {
        console.log(`[SupporterStorage] legacy user '${currentId}' normalized to: ${config.currentUser}`);
        return config.currentUser;
      }
    }
  } catch {
    // Erro silencioso no parse
  }

  return currentId;
};

const readStringArray = (key: string, userId?: string | null): string[] => {
  if (!canUseLocalStorage()) return [];
  const effectiveId = resolveEffectiveSupporterUserId(userId);
  const scopedKey = getScopedStorageKey(key, effectiveId);
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

  // Fallback para chave sem escopo (legado absoluto)
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item: unknown): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * Migra dados de apoiador do storage legado (escopo "Guitar Architect", "guest" ou sem escopo)
 * para o escopo do UUID atual do usuário autenticado usando merge conservador.
 */
const migrateLegacySupporterStorage = (userId: string): boolean => {
  if (!canUseLocalStorage() || !userId || userId === 'guest') return false;

  let hasMigrated = false;
  const LEGACY_SCOPES = ['Guitar Architect', 'guest', 'guitar_architect'];
  const currentTotalKey = getScopedStorageKey(SUPPORTER_TOTAL_KEY, userId);
  const currentRewardsKey = getScopedStorageKey(UNLOCKED_SUPPORTER_REWARDS_KEY, userId);
  const currentBadgesKey = getScopedStorageKey(UNLOCKED_SUPPORTER_BADGES_KEY, userId);

  // 1. Migração do Total (Math.max)
  const currentTotalRaw = window.localStorage.getItem(currentTotalKey);
  let maxTotal = currentTotalRaw ? Number(currentTotalRaw) : 0;
  if (isNaN(maxTotal)) maxTotal = 0;

  let foundLegacyTotal = false;
  LEGACY_SCOPES.forEach(scope => {
    const raw = window.localStorage.getItem(`${SUPPORTER_TOTAL_KEY}_${scope}`);
    if (raw) {
      const val = Number(raw);
      if (!isNaN(val) && val > maxTotal) {
        maxTotal = val;
        foundLegacyTotal = true;
      }
    }
  });
  
  const unscopedTotalRaw = window.localStorage.getItem(SUPPORTER_TOTAL_KEY);
  if (unscopedTotalRaw) {
    const val = Number(unscopedTotalRaw);
    if (!isNaN(val) && val > maxTotal) {
      maxTotal = val;
      foundLegacyTotal = true;
    }
  }

  if (foundLegacyTotal) {
    console.log(`[SupporterStorage] Migration: Total updated to ${maxTotal} for ${userId}`);
    window.localStorage.setItem(currentTotalKey, String(maxTotal));
    hasMigrated = true;
  }

  // 2. Migração de Recompensas e Selos (Union)
  const migrateArray = (baseKey: string, currentKey: string) => {
    const parse = (raw: string | null) => {
      if (!raw) return [];
      try {
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p.filter((x): x is string => typeof x === 'string') : [];
      } catch { return []; }
    };

    const currentRaw = window.localStorage.getItem(currentKey);
    const currentList = parse(currentRaw);
    const mergedSet = new Set(currentList);

    LEGACY_SCOPES.forEach(scope => {
      parse(window.localStorage.getItem(`${baseKey}_${scope}`)).forEach(id => mergedSet.add(id));
      
      // Fallback para chaves com nomenclatura legada alternativa (ex: sem o prefixo "unlocked_")
      if (baseKey === UNLOCKED_SUPPORTER_REWARDS_KEY) {
        parse(window.localStorage.getItem(`ga_supporter_rewards_${scope}`)).forEach(id => mergedSet.add(id));
      }
    });
    parse(window.localStorage.getItem(baseKey)).forEach(id => mergedSet.add(id));

    if (mergedSet.size > currentList.length) {
      const result = Array.from(mergedSet);
      console.log(`[SupporterStorage] Migration: ${baseKey} expanded to ${result.length} items for ${userId}`);
      window.localStorage.setItem(currentKey, JSON.stringify(result));
      return true;
    }
    return false;
  };

  if (migrateArray(UNLOCKED_SUPPORTER_REWARDS_KEY, currentRewardsKey)) hasMigrated = true;
  if (migrateArray(UNLOCKED_SUPPORTER_BADGES_KEY, currentBadgesKey)) hasMigrated = true;

  if (hasMigrated) {
    console.log(`[SupporterStorage] Local migration completed for ${userId}. Current scope is now populated.`);
  }
  return hasMigrated;
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
  const effectiveId = resolveEffectiveSupporterUserId(userId);
  const existing = pendingPushTimers.get(effectiveId);
  if (existing) {
    clearTimeout(existing);
  }
  console.log(`[SupporterStorage] schedulePush: user=${effectiveId}, delay=${delay}ms`);
  const id = window.setTimeout(() => {
    console.log(`[SupporterStorage] Executing debounced push for user: ${effectiveId}`);
    pushSupporterToServer(effectiveId).catch((err) => {
      console.error(`[SupporterStorage] Push error in schedulePush:`, err);
    });
    pendingPushTimers.delete(effectiveId);
  }, delay) as unknown as number;
  pendingPushTimers.set(effectiveId, id);
};

export const getSupporterContributionTotal = (userId?: string | null) => {
  if (!canUseLocalStorage()) return 0;
  const effectiveId = resolveEffectiveSupporterUserId(userId);
  const scopedKey = getScopedStorageKey(SUPPORTER_TOTAL_KEY, effectiveId);
  const data = window.localStorage.getItem(scopedKey) || window.localStorage.getItem(SUPPORTER_TOTAL_KEY);
  const value = data ? Number(data) : 0;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
};

export const getUnlockedSupporterRewardIds = (userId?: string | null) => readStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, userId);

export const getUnlockedSupporterBadgeIds = (userId?: string | null) => readStringArray(UNLOCKED_SUPPORTER_BADGES_KEY, userId);

export const syncUnlockedSupporterRewards = (total: number, userId?: string | null) => {
  const effectiveId = resolveEffectiveSupporterUserId(userId);
  const unlockedIds = getUnlockedSupporterRewards(total).map(reward => reward.id);
  writeStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, unlockedIds, effectiveId);
  // Schedule a conservative push to server (debounced). Do not block UI.
  (async () => {
    try {
      const finalId = await getSupabaseUserId(effectiveId);
      if (!finalId || finalId === 'guest') return;
      schedulePush(finalId);
    } catch (err) {
      // ignore
    }
  })();

  return unlockedIds;
};

export const setSupporterContributionTotal = (total: number, userId?: string | null) => {
  const effectiveId = resolveEffectiveSupporterUserId(userId);
  const normalized = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const key = getScopedStorageKey(SUPPORTER_TOTAL_KEY, effectiveId);
  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, String(normalized));
  }
  const result = syncUnlockedSupporterRewards(normalized, effectiveId);

  // Schedule a debounced push (avoids race conditions)
  (async () => {
    try {
      const finalId = await getSupabaseUserId(effectiveId);
      if (!finalId || finalId === 'guest') return;
      schedulePush(finalId);
    } catch (err) {
      // ignore
    }
  })();

  return result;
};

// --- Server synchronization helpers (conservative merge) ---

export const hydrateSupporterFromServer = async (userId?: string | null) => {
  const effectiveId = await getSupabaseUserId(userId);
  if (!effectiveId || effectiveId === 'guest') {
    console.log(`[SupporterStorage] hydrate: skipping (id=${effectiveId})`);
    return null;
  }

  // MIGRATION: Garante que dados legados (ex: "Guitar Architect") subam para o UUID atual
  migrateLegacySupporterStorage(effectiveId);

  console.log(`[SupporterStorage] hydrate: starting for user ${effectiveId}`);

  try {
    const { data, error } = await supabase
      .from('supporter_profiles')
      .select('supporter_total, unlocked_rewards, unlocked_badges, updated_at')
      .eq('user_id', effectiveId)
      .maybeSingle(); // maybeSingle não retorna erro caso a linha não exista

    if (error) {
      console.error(`[SupporterStorage] hydrate: fetch error`, error);
      return null;
    }

    const localTotal = getSupporterContributionTotal(effectiveId);
    const localUnlocked = getUnlockedSupporterRewardIds(effectiveId);
    const localBadges = getUnlockedSupporterBadgeIds(effectiveId);

    if (!data) {
      console.log(`[SupporterStorage] hydrate: no server profile found. checking local progress to bootstrap...`);
      if (localTotal > 0 || localUnlocked.length > 0 || localBadges.length > 0) {
        console.log(`[SupporterStorage] hydrate: local data found (total=${localTotal}). pushing to cloud...`);
        return await pushSupporterToServer(effectiveId, localTotal, localUnlocked, localBadges);
      }
      console.log(`[SupporterStorage] hydrate: no local data to push.`);
      return null;
    }

    const serverTotal = Number(data.supporter_total || 0);
    const serverUnlocked = Array.isArray(data.unlocked_rewards) ? data.unlocked_rewards : [];
    const serverBadges = Array.isArray(data.unlocked_badges) ? data.unlocked_badges : [];

    // Se o cliente tem progresso que o servidor não tem, chama o RPC para consolidar
    const hasLocalProgress = localTotal > serverTotal || 
                             localUnlocked.some(id => !serverUnlocked.includes(id)) ||
                             localBadges.some(id => !serverBadges.includes(id));

    console.log(`[SupporterStorage] hydrate sync check:`, {
      server: { total: serverTotal, rewards: serverUnlocked.length, badges: serverBadges.length },
      local: { total: localTotal, rewards: localUnlocked.length, badges: localBadges.length },
      hasLocalProgress
    });

    if (hasLocalProgress) {
      console.log(`[SupporterStorage] hydrate: local progress detected. merging via RPC...`);
      return await pushSupporterToServer(effectiveId, localTotal, localUnlocked, localBadges);
    }

    // Caso contrário, o servidor é a autoridade. Sincroniza cache local.
    console.log(`[SupporterStorage] hydrate: server state is authority.`);
    const key = getScopedStorageKey(SUPPORTER_TOTAL_KEY, effectiveId);
    window.localStorage.setItem(key, String(serverTotal));
    writeStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, serverUnlocked, effectiveId);
    writeStringArray(UNLOCKED_SUPPORTER_BADGES_KEY, serverBadges, effectiveId);

    return { mergedTotal: serverTotal, mergedUnlocked: serverUnlocked, mergedBadges: serverBadges };
  } catch (err) {
    console.error(`[SupporterStorage] hydrate: fatal error`, err);
    return null;
  }
};

export const pushSupporterToServer = async (
  userId?: string | null,
  total?: number | undefined,
  unlocked?: string[] | undefined,
  badges?: string[] | undefined
) => {
  console.log(`[SupporterStorage] push: starting for userId='${userId}'`);
  const effectiveId = await getSupabaseUserId(userId);
  
  if (!effectiveId || effectiveId === 'guest') {
    console.log(`[SupporterStorage] push: aborted (effectiveId is '${effectiveId}')`);
    return null;
  }

  // MIGRATION: Garante que o push inclua dados migrados localmente antes de enviar
  migrateLegacySupporterStorage(effectiveId);

  try {
    const p_supporter_total = typeof total === 'number' ? total : getSupporterContributionTotal(effectiveId);
    const p_unlocked_rewards = Array.isArray(unlocked) ? unlocked : getUnlockedSupporterRewardIds(effectiveId);
    const p_unlocked_badges = Array.isArray(badges) ? badges : getUnlockedSupporterBadgeIds(effectiveId);

    const { data, error } = await supabase.rpc('merge_supporter_data', {
      p_supporter_total,
      p_unlocked_rewards,
      p_unlocked_badges
    });

    console.log(`[SupporterStorage] push: invoking RPC merge_supporter_data`, {
      rpcUserId: effectiveId,
      payload: { p_supporter_total, p_unlocked_rewards, p_unlocked_badges }
    });

    if (error) {
      console.error(`[SupporterStorage] push: RPC Error response:`, error);
      return null;
    }

    if (!data) {
      console.warn(`[SupporterStorage] push: RPC call returned no data`);
      return null;
    }

    // Suporta retorno tanto de 'returns jsonb' quanto 'returns table'
    const row = Array.isArray(data) ? data[0] : data;
    console.log(`[SupporterStorage] push: success! Server returned row:`, row);

    const result = { 
      mergedTotal: Number(row.supporter_total || 0), 
      mergedUnlocked: Array.isArray(row.unlocked_rewards) ? row.unlocked_rewards : [], 
      mergedBadges: Array.isArray(row.unlocked_badges) ? row.unlocked_badges : [] 
    };

    // Atualiza cache local com o resultado final do merge do servidor
    const key = getScopedStorageKey(SUPPORTER_TOTAL_KEY, effectiveId);
    window.localStorage.setItem(key, String(result.mergedTotal));
    writeStringArray(UNLOCKED_SUPPORTER_REWARDS_KEY, result.mergedUnlocked, effectiveId);
    writeStringArray(UNLOCKED_SUPPORTER_BADGES_KEY, result.mergedBadges, effectiveId);

    return result;
  } catch (err) {
    console.error(`[SupporterStorage] push: fatal error`, err);
    return null;
  }
};
