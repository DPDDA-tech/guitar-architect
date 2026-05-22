import { getCurrentSupporterTier, getNextSupporterTier, getRemainingForNextTier } from '../data/supporterRewards';

/**
 * Helpers para gerenciar informações de tiers de apoiador
 *
 * TODO: Admin Panel /admin/supporters
 * - Dashboard de apoiadores por tier
 * - Filtrar por período de cadastro
 * - Exportar relatório de contribuições
 * - Validar e liberar badges manualmente
 * - Notas admin por apoiador
 * - Integração futura com Supabase para histórico
 */

export interface SupporterTierInfo {
  currentTier: ReturnType<typeof getCurrentSupporterTier>;
  currentTierName: string;
  nextTier: ReturnType<typeof getNextSupporterTier>;
  nextTierName: string;
  remaining: number;
  isMaxTier: boolean;
  progress: number;
}

/**
 * Obtém informações completas do tier do apoiador
 * @param total - Valor total acumulado de contribuições
 * @param lang - Idioma para exibição ('pt' ou 'en')
 * @returns Objeto com informações do tier atual e próximo
 */
export const getSupporterTierInfo = (total: number, lang: 'pt' | 'en' = 'pt'): SupporterTierInfo => {
  const currentTier = getCurrentSupporterTier(total);
  const nextTier = getNextSupporterTier(total);
  const remaining = getRemainingForNextTier(total);
  const isMaxTier = !nextTier;

  return {
    currentTier,
    currentTierName: currentTier?.title || (lang === 'pt' ? 'Sem Tier' : 'No Tier'),
    nextTier,
    nextTierName: nextTier?.title || (lang === 'pt' ? 'Máximo Atingido' : 'Max Reached'),
    remaining,
    isMaxTier,
    progress: currentTier ? ((total - currentTier.minValue) / ((nextTier?.minValue || currentTier.minValue + 1) - currentTier.minValue)) * 100 : 0,
  };
};

/**
 * Formata o tier name para exibição (remove prefixo "Apoiador ")
 */
export const formatTierName = (fullTitle: string): string => {
  return fullTitle.replace('Apoiador ', '').toUpperCase();
};
