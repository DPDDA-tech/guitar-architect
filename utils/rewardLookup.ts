import { getAchievementById, getRewardById } from './achievementUtils';
import { supporterRewards } from '../data/supporterRewards';
import { supporterFirstRewards } from '../data/supporterFirstRewards';
import { constancyRewards } from '../data/constancyRewards';

export interface RewardMetadata {
  id: string;
  title: string;
  image: string;
  category?: string;
}

/**
 * Resolve um ID de recompensa/selo em metadados para exibição.
 * Procura em: Supporter Rewards, Achievements e Recompensas Avulsas.
 */
export function getRewardMetadataById(id: string): RewardMetadata | null {
  if (!id) return null;

  // 1. Tentar Supporter Rewards (IDs simples)
  const supporter = supporterRewards.find(r => r.id === id);
  if (supporter) {
    return { id: supporter.id, title: supporter.title, image: supporter.image, category: 'supporter' };
  }

  // 1.1 Tentar Primeiros Apoiadores (IDs simples)
  const firstSupporter = supporterFirstRewards.find(r => r.id === id);
  if (firstSupporter) {
    return { id: firstSupporter.id, title: firstSupporter.title, image: firstSupporter.image, category: firstSupporter.category };
  }

  // 1.2 Tentar Selos de Constância (IDs simples)
  const constancy = constancyRewards.find(r => r.id === id);
  if (constancy) {
    return { id: constancy.id, title: constancy.title, image: constancy.image, category: constancy.category };
  }

  // 2. Tentar IDs prefixados (usados na Coleção da Obra)
  if (id.startsWith('achievement:')) {
    const achId = id.replace('achievement:', '');
    const ach = getAchievementById(achId);
    if (ach && ach.asset.path) return { id, title: ach.title, image: ach.asset.path, category: ach.category };
  }

  if (id.startsWith('reward:')) {
    const rewId = id.replace('reward:', '');
    const rew = getRewardById(rewId);
    if (rew && rew.asset.path) return { id, title: rew.title, image: rew.asset.path, category: rew.type };
  }

  // 3. Fallback: Tentar busca direta por ID bruto em conquistas/recompensas
  const achRaw = getAchievementById(id);
  if (achRaw && achRaw.asset.path) return { id: achRaw.id, title: achRaw.title, image: achRaw.asset.path };

  return null;
}