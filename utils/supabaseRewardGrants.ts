import { supabase } from '../src/lib/supabase';
import { listAllAdminEligibleUsers } from './supabaseAdminUsers';

export type SupabaseRewardGrant = {
  id: string;
  email: string;
  user_id?: string | null;
  reward_id: string;
  reason: string | null;
  source: string;
  granted_by: string | null;
  granted_at: string;
  revoked_at: string | null;
};

export type SupabaseRewardGrantParams = {
  email: string;
  rewardId: string;
  reason?: string;
  grantedBy?: string;
};

function normalize(email: string) {
  return (email || '').trim().toLowerCase();
}

/**
 * Lista todos os históricos de grants do Supabase.
 */
export async function listSupabaseRewardGrants(): Promise<SupabaseRewardGrant[]> {
  try {
    const { data, error } = await supabase
      .from('reward_grants')
      .select('*')
      .order('granted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[SupabaseRewards] Falha ao listar grants:', err);
    return [];
  }
}

/**
 * Lista apenas os grants que não foram revogados.
 */
export async function listActiveSupabaseRewardGrants(): Promise<SupabaseRewardGrant[]> {
  try {
    const { data, error } = await supabase
      .from('reward_grants')
      .select('*')
      .is('revoked_at', null)
      .order('granted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[SupabaseRewards] Falha ao listar grants ativos:', err);
    return [];
  }
}

/**
 * Lista os IDs de selos ativos concedidos para um e-mail específico.
 */
export async function listActiveSupabaseRewardGrantIdsByEmail(email: string): Promise<string[]> {
  const target = normalize(email);
  if (!target) return [];

  try {
    const { data, error } = await supabase
      .from('reward_grants')
      .select('reward_id')
      .eq('email', target)
      .is('revoked_at', null);

    if (error) throw error;

    return Array.from(new Set((data || []).map(row => row.reward_id).filter(Boolean)));
  } catch (err) {
    console.warn('[SupabaseRewards] Falha ao listar grants ativos por e-mail:', err);
    return [];
  }
}

export async function listUnifiedActiveRewardGrantIdsByEmail(email: string): Promise<string[]> {
  const target = normalize(email);
  if (!target) return [];

  const [rewardGrantIds, supporterProfileGrants] = await Promise.all([
    listActiveSupabaseRewardGrantIdsByEmail(target),
    listSupporterProfileBadgeGrants(),
  ]);

  const supporterProfileIds = supporterProfileGrants
    .filter((grant) => normalize(grant.email) === target)
    .map((grant) => grant.reward_id);

  return Array.from(new Set([...rewardGrantIds, ...supporterProfileIds]));
}

export async function listSupporterProfileRewardIdsByUserId(userId: string): Promise<string[]> {
  const target = (userId || '').trim();
  if (!target) return [];

  try {
    const { data, error } = await supabase
      .from('supporter_profiles')
      .select('unlocked_badges, unlocked_rewards')
      .eq('user_id', target)
      .maybeSingle();

    if (error) throw error;
    if (!data) return [];

    const parseList = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.filter((id): id is string => typeof id === 'string');
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    return Array.from(new Set([
      ...parseList((data as { unlocked_badges?: unknown }).unlocked_badges),
      ...parseList((data as { unlocked_rewards?: unknown }).unlocked_rewards),
    ]));
  } catch (err) {
    console.warn('[SupabaseRewards] Falha ao listar reward IDs de supporter_profiles por user_id:', err);
    return [];
  }
}

export async function listUnifiedActiveRewardGrantIds(params: { email?: string | null; userId?: string | null }): Promise<string[]> {
  const targetEmail = normalize(params.email || '');
  const targetUserId = (params.userId || '').trim();

  const [emailGrantIds, supporterIdsByUserId, supporterProfileGrants] = await Promise.all([
    targetEmail ? listActiveSupabaseRewardGrantIdsByEmail(targetEmail) : Promise.resolve([]),
    targetUserId ? listSupporterProfileRewardIdsByUserId(targetUserId) : Promise.resolve([]),
    !targetUserId && targetEmail ? listSupporterProfileBadgeGrants() : Promise.resolve([]),
  ]);

  const supporterIdsByEmail = (!targetUserId && targetEmail)
    ? supporterProfileGrants
        .filter((grant) => normalize(grant.email) === targetEmail)
        .map((grant) => grant.reward_id)
    : [];

  return Array.from(new Set([
    ...emailGrantIds,
    ...supporterIdsByUserId,
    ...supporterIdsByEmail,
  ]));
}

/**
 * Verifica se um e-mail possui um selo ativo no Supabase.
 */
export async function hasSupabaseRewardGrant(email: string, rewardId: string): Promise<boolean> {
  const target = normalize(email);
  if (!target || !rewardId) return false;

  try {
    const { data, error } = await supabase
      .from('reward_grants')
      .select('id')
      .eq('email', target)
      .eq('reward_id', rewardId)
      .is('revoked_at', null)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (err) {
    console.warn('[SupabaseRewards] Erro no check de grant:', err);
    return false;
  }
}

/**
 * Cria uma nova concessão no banco de dados.
 */
export async function grantSupabaseRewardToEmail({ email, rewardId, reason, grantedBy }: SupabaseRewardGrantParams) {
  const target = normalize(email);
  if (!target || !rewardId) return { ok: false };

  const { error } = await supabase.from('reward_grants').insert({
    email: target,
    reward_id: rewardId,
    reason: reason || 'Manual Admin Grant',
    granted_by: grantedBy,
    source: 'admin-supabase'
  });

  if (error) console.warn('[SupabaseRewards] Falha ao conceder selo:', error);
  return { ok: !error, error };
}

/**
 * Revoga (soft-delete) uma concessão ativa.
 */
export async function revokeSupabaseRewardFromEmail(email: string, rewardId: string) {
  const { error } = await supabase
    .from('reward_grants')
    .update({ revoked_at: new Date().toISOString() })
    .eq('email', normalize(email))
    .eq('reward_id', rewardId)
    .is('revoked_at', null);

  if (error) console.warn('[SupabaseRewards] Falha ao revogar selo:', error);
  return { ok: !error, error };
}

/**
 * Lista os selos concedidos via perfil de apoiador (supporter_profiles.unlocked_badges
 * / unlocked_rewards), como o "Prime Architect", que não passam pela tabela reward_grants.
 * Apenas leitura — não cria/altera schema.
 */
export async function listSupporterProfileBadgeGrants(): Promise<SupabaseRewardGrant[]> {
  try {
    const { data, error } = await supabase
      .from('supporter_profiles')
      .select('user_id, unlocked_badges, unlocked_rewards, updated_at');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const users = await listAllAdminEligibleUsers();
    const emailByUserId = new Map(users.filter(u => u.id).map(u => [u.id as string, u.email]));
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user?.id && authData.user.email) {
        emailByUserId.set(authData.user.id, authData.user.email.trim().toLowerCase());
      }
    } catch {
      // best effort only
    }

    const grants: SupabaseRewardGrant[] = [];

    data.forEach((row: { user_id: string; unlocked_badges: unknown; unlocked_rewards: unknown; updated_at: string | null }) => {
      const email = emailByUserId.get(row.user_id) || `user:${row.user_id}`;

      const parseList = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.filter((id): id is string => typeof id === 'string');
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const rewardIds = Array.from(new Set([...parseList(row.unlocked_badges), ...parseList(row.unlocked_rewards)]));

      rewardIds.forEach((rewardId) => {
        grants.push({
          id: `supporter-profile-${row.user_id}-${rewardId}`,
          email,
          user_id: row.user_id,
          reward_id: rewardId,
          reason: null,
          source: 'supporter-profile',
          granted_by: null,
          granted_at: row.updated_at || new Date(0).toISOString(),
          revoked_at: null,
        });
      });
    });

    return grants;
  } catch (err) {
    console.warn('[SupabaseRewards] Falha ao listar selos de supporter_profiles:', err);
    return [];
  }
}

/**
 * Concede uma recompensa para todos os usuários cadastrados no sistema.
 */
export async function grantRewardToAllUsers(
  rewardId: string,
  reason: string,
  grantedBy: string
): Promise<{ successCount: number; failCount: number; totalProcessed: number }> {
  const users = await listAllAdminEligibleUsers();

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    const email = user.email?.trim().toLowerCase();
    if (!email) continue;

    const result = await grantSupabaseRewardToEmail({
      email,
      rewardId,
      reason: `[BULK] ${reason}`,
      grantedBy,
    });

    if (result.ok) {
      successCount += 1;
      continue;
    }

    const errorCode = (result.error as { code?: string } | null | undefined)?.code;
    const errorMessage = String(result.error || '');

    const isDuplicate =
      errorCode === '23505' ||
      errorMessage.toLowerCase().includes('duplicate');

    if (!isDuplicate) {
      failCount += 1;
    }
  }

  return {
    successCount,
    failCount,
    totalProcessed: users.length,
  };
}
