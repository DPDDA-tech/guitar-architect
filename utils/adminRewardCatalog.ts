import { supporterFirstRewards } from '../data/supporterFirstRewards';
import { supporterRewards } from '../data/supporterRewards';
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

  // 1.1 Apoiadores por Tier (MANUAL-OR-AUTOMATIC)
  supporterRewards.forEach(r => {
    catalog.push({
      id: r.id,
      title: `[S1] Supporter • ${r.title}`,
      description: r.description,
      category: 'supporter-pix',
      grantMode: 'manual-or-automatic',
      source: 'data/supporterRewards'
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

// 4. Instrument Gallery (AUTOMATIC)
[1, 3, 5, 8, 10].forEach(count => {
  const countStr = count.toString().padStart(2, '0');
  catalog.push({
    id: `collectors-${countStr}`,
    title: `Instrument Gallery • ${countStr} ${count === 1 ? 'Instrument' : 'Instruments'}`,
    category: 'system',
    grantMode: 'automatic',
    source: 'system/collectors'
  });
});

return catalog;
}