import { supabase } from '../src/lib/supabase';
import { listAllAdminEligibleUsers } from './supabaseAdminUsers';

export type SupabaseRewardGrant = {
  id: string;
  email: string;
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
