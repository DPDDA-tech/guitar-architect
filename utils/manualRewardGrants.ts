/**
 * Utilitários para gestão de concessões manuais de recompensas.
 * Camada temporária que centraliza permissões especiais antes da migração total para Supabase.
 */

export type ManualRewardGrant = {
  email: string;
  rewardId: string;
  reason?: string;
  grantedAt?: string;
  source: 'manual-local' | 'supabase';
};

/**
 * Lista local temporária de grants.
 * CENTRALIZAÇÃO: O e-mail de desenvolvedor/admin vive apenas aqui nesta fase.
 */
const LOCAL_MANUAL_GRANTS: ManualRewardGrant[] = [
  {
    email: 'dilioalvarenga@gmail.com',
    rewardId: 'first_supporter_arquiteto',
    reason: 'Founder / Alpha Tester',
    grantedAt: '2024-05-18T00:00:00Z',
    source: 'manual-local',
  },
];

/**
 * Normaliza o e-mail para comparação consistente.
 */
function normalize(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Retorna todos os grants manuais associados a um e-mail.
 */
export function getManualRewardGrantsForEmail(email?: string | null): ManualRewardGrant[] {
  const normalizedEmail = normalize(email);
  if (!normalizedEmail) return [];

  return LOCAL_MANUAL_GRANTS.filter(
    (grant) => normalize(grant.email) === normalizedEmail
  );
}

/**
 * Verifica se um usuário possui concessão manual para uma recompensa específica.
 */
export function hasManualRewardGrant(
  email: string | null | undefined,
  rewardId: string
): boolean {
  const normalizedEmail = normalize(email);
  if (!normalizedEmail || !rewardId) return false;

  return LOCAL_MANUAL_GRANTS.some(
    (grant) => normalize(grant.email) === normalizedEmail && grant.rewardId === rewardId
  );
}