import { supporterFirstRewards } from '../data/supporterFirstRewards';
import { constancyRewards } from '../data/constancyRewards';

export type AdminRewardCatalogItem = {
  id: string;
  title: string;
  description?: string;
  category: 'supporter-first' | 'constancy' | 'supporter-pix' | 'seasonal' | 'mastery' | 'manual' | 'system';
  grantMode: 'manual' | 'automatic' | 'manual-or-automatic';
  source: string;
};

/**
 * Retorna o catálogo completo de recompensas que podem ser administradas.
 * Unifica fontes de dados estáticos e dinâmicos para o painel admin.
 */
export function getAdminRewardCatalog(): AdminRewardCatalogItem[] {
  const catalog: AdminRewardCatalogItem[] = [];

  // 1. Primeiros Apoiadores (MANUAL)
  supporterFirstRewards.forEach(r => {
    catalog.push({
      id: r.id,
      title: r.title,
      description: r.description,
      category: 'supporter-first',
      grantMode: 'manual',
      source: 'data/supporterFirstRewards'
    });
  });

  // 2. Selos de Constância (AUTOMATIC)
  constancyRewards.forEach(r => {
    catalog.push({
      id: r.id,
      title: r.title,
      description: r.description,
      category: 'constancy',
      grantMode: 'automatic',
      source: 'data/constancyRewards'
    });
  });

  // 3. Gallery Anniversary (AUTOMATIC)
Array.from({ length: 10 }, (_, i) => {
  const year = i + 1;
  const yearStr = year.toString().padStart(2, '0');

  catalog.push({
    id: `agallery-${yearStr}`,
    title: `Gallery Anniversary • ${yearStr} ${year === 1 ? 'Year' : 'Years'}`,
    category: 'system',
    grantMode: 'automatic',
    source: 'system/agallery'
  });
});

return catalog;
}