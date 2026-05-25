/**
 * Utilitários de controle de acesso administrativo.
 */

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;

  const admins = [
    'dilioalvarenga@gmail.com'
  ];

  return admins.includes(email.toLowerCase());
}