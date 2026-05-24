import { supabase } from '../src/lib/supabase';

export type AdminUserRecord = {
  id?: string;
  email: string;
};

type ProfileRow = {
  id?: string | null;
  email?: string | null;
};

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