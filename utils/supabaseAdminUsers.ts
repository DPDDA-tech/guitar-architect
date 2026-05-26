import { supabase } from '../src/lib/supabase';

export type AdminUserRecord = {
  id?: string;
  email: string;
};

type ProfileRow = {
  id?: string | null;
  email?: string | null;
};

type RpcCountRow = {
  total?: number;
  count?: number;
};

export async function getRegisteredUserCount(): Promise<number | null> {
  let rpcAvailable = false;
  try {
    const { data, error } = await supabase.rpc('count_registered_users');
    if (!error) {
      rpcAvailable = true;
      if (typeof data === 'number' && Number.isFinite(data)) return data;
      if (Array.isArray(data) && data.length > 0) {
        const row = data[0] as RpcCountRow;
        if (typeof row.total === 'number') return row.total;
        if (typeof row.count === 'number') return row.count;
      }
      if (data && typeof data === 'object') {
        const row = data as RpcCountRow;
        if (typeof row.total === 'number') return row.total;
        if (typeof row.count === 'number') return row.count;
      }
    }
  } catch {
    // fallback below
  }

  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    if (typeof count === 'number' && count > 0) {
      return count;
    }

    // Secondary fallback: users that already synced supporter profile.
    const supporterCountResult = await supabase
      .from('supporter_profiles')
      .select('user_id', { count: 'exact', head: true });

    if (!supporterCountResult.error && typeof supporterCountResult.count === 'number' && supporterCountResult.count > 0) {
      return supporterCountResult.count;
    }

    // Avoid showing a misleading zero when we cannot reliably count registered auth users from client-side.
    if (!rpcAvailable) {
      return null;
    }
    return 0;
  } catch (error) {
    console.warn('[AdminUsers] Falha ao contar usuários registrados:', error);
    return null;
  }
}

export async function listAllAdminEligibleUsers(): Promise<AdminUserRecord[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email');

    if (error) {
      throw error;
    }

    const rows = (data || []) as ProfileRow[];

    return rows
      .map((user) => ({
        id: user.id || undefined,
        email: (user.email || '').trim().toLowerCase(),
      }))
      .filter((user) => user.email.length > 0);
  } catch (error) {
    console.warn('[AdminUsers] Falha ao listar usuários:', error);
    return [];
  }
}
