import { supabase } from '../src/lib/supabase';

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