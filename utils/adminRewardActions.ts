/**
 * Helpers de alto nível para ações de concessão e revogação de recompensas (Admin/DEV).
 * Abstrai a lógica de armazenamento e garante a normalização dos dados.
 */

import { 
  addStoredAdminRewardGrant, 
  removeStoredAdminRewardGrant, 
  hasStoredAdminRewardGrant 
} from './adminRewardGrantStorage';

export type RewardGrantActionParams = {
  email: string;
  rewardId: string;
  reason?: string;
};

/**
 * Normaliza internamente o e-mail para as ações de concessão.
 */
function normalizeRewardGrantEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Verifica se uma recompensa específica foi concedida manualmente para o e-mail informado.
 */
export function isRewardGrantedToEmail({ email, rewardId }: Omit<RewardGrantActionParams, 'reason'>): boolean {
  return hasStoredAdminRewardGrant(email, rewardId);
}

/**
 * Concede uma recompensa a um e-mail, registrando a data e evitando duplicados.
 */
export function grantRewardToEmail({ email, rewardId, reason }: RewardGrantActionParams): void {
  const normalizedEmail = normalizeRewardGrantEmail(email);
  const normalizedRewardId = (rewardId || '').trim();

  if (!normalizedEmail || !normalizedRewardId) {
    return;
  }

  addStoredAdminRewardGrant({
    email: normalizedEmail,
    rewardId: normalizedRewardId,
    reason: reason || 'Manual Dev Grant',
    grantedAt: new Date().toISOString(),
  });
}

/**
 * Revoga uma concessão manual pré-existente.
 */
export function revokeRewardFromEmail({ email, rewardId }: Omit<RewardGrantActionParams, 'reason'>): void {
  removeStoredAdminRewardGrant(email, rewardId);
}

/**
 * Alterna o estado de uma concessão: se existir, remove; se não, adiciona.
 */
export function toggleRewardGrant(params: RewardGrantActionParams): void {
  const { email, rewardId } = params;
  
  if (isRewardGrantedToEmail({ email, rewardId })) {
    revokeRewardFromEmail({ email, rewardId });
  } else {
    grantRewardToEmail(params);
  }
}
