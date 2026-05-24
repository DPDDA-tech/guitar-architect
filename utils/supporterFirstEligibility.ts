import { SupporterFirstReward, supporterFirstRewards } from '../data/supporterFirstRewards';
import { hasStoredAdminRewardGrant } from './adminRewardGrantStorage';

/**
 * TODO:
 * Substituir elegibilidade hardcoded por concessão admin via Supabase/backend.
 */

/**
 * Normaliza o e-mail para comparações seguras.
 * Regras: lowercase, trim, fallback para string vazia.
 */
export function normalizeSupporterEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Verifica se um e-mail específico é elegível para um selo de Primeiro Apoiador.
 * Regras:
 * 1. Requer reward.allowedEmails preenchido.
 * 2. Comparação case-insensitive usando normalização.
 */
export function isEligibleForFirstSupporterReward(
  reward: SupporterFirstReward,
  email?: string | null
): boolean {
  // 1. Prioridade: Verificar se há uma concessão administrativa persistida (Admin/Manual)
  if (hasStoredAdminRewardGrant(email, reward.id)) {
    return true;
  }

  // 2. Fallback: Sistema legado de bypass por e-mail (allowedEmails)
  if (!reward.allowedEmails || reward.allowedEmails.length === 0) {
    return false;
  }

  const normalizedEmail = normalizeSupporterEmail(email);
  if (!normalizedEmail) return false;

  return reward.allowedEmails.some(
    (allowed) => normalizeSupporterEmail(allowed) === normalizedEmail
  );
}

/**
 * Retorna a lista de IDs de selos de Primeiro Apoiador para os quais o e-mail é elegível.
 */
export function getEligibleFirstSupporterRewardIds(
  email?: string | null
): string[] {
  return supporterFirstRewards
    .filter((reward) => isEligibleForFirstSupporterReward(reward, email))
    .map((reward) => reward.id);
}