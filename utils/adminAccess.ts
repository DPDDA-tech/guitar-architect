/**
 * Utilitários de controle de acesso administrativo.
 */

export const AUTHORIZED_ADMIN_EMAILS = [
  'dilioalvarenga@gmail.com'
];

export function normalizeAdminEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = normalizeAdminEmail(email);
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}