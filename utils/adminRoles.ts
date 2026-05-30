import { supabase } from '../src/lib/supabase';

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export type ActiveAdminRecord = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  granted_at: string;
  granted_by: string | null;
  granted_by_email: string | null;
  status: string;
};

const isMissingRpcError = (error: unknown) => {
  const message = String((error as { message?: string } | null | undefined)?.message || error || '').toLowerCase();
  return message.includes('could not find the function') || message.includes('does not exist');
};

export async function getMyAdminRole(): Promise<AdminRole | null> {
  try {
    const { data, error } = await supabase.rpc('get_my_admin_role');
    if (error) throw error;
    if (data === 'ADMIN' || data === 'SUPER_ADMIN') return data;
    return null;
  } catch (error) {
    if (!isMissingRpcError(error)) {
      console.warn('[AdminRoles] get_my_admin_role failed:', error);
    }
    return null;
  }
}

export async function listActiveAdministrators(): Promise<ActiveAdminRecord[]> {
  try {
    const { data, error } = await supabase.rpc('list_active_admin_roles');
    if (error) throw error;
    return (data || []) as ActiveAdminRecord[];
  } catch (error) {
    console.warn('[AdminRoles] list_active_admin_roles failed:', error);
    return [];
  }
}

export async function grantAdminRoleByEmail(targetEmail: string, role: AdminRole) {
  return supabase.rpc('grant_admin_role_by_email', {
    p_target_email: targetEmail.trim().toLowerCase(),
    p_role: role,
  });
}

export async function changeAdminRole(targetUserId: string, role: AdminRole) {
  return supabase.rpc('change_admin_role', {
    p_target_user_id: targetUserId,
    p_new_role: role,
  });
}

export async function revokeAdminRole(targetUserId: string) {
  return supabase.rpc('revoke_admin_role', {
    p_target_user_id: targetUserId,
  });
}
