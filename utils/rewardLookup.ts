import { getAchievementById, getRewardById } from './achievementUtils';
import { supporterRewards } from '../data/supporterRewards';
import { supporterFirstRewards } from '../data/supporterFirstRewards';
import { constancyRewards } from '../data/constancyRewards';

export interface RewardMetadata {
  id: string;
  title: string;
  image: string;
  category?: string;
  description?: string;
}

const isCollectorBadgeId = (id: string) => id.startsWith('logo-collector-');
const isAnniversaryBadgeId = (id: string) => id.startsWith('logo-anniversary-');

export function resolveHeaderBadgeRewardId(id: string): string | null {
  if (!id) return null;

  if (id.startsWith('reward:')) {
    return id.replace('reward:', '') || null;
  }

  if (id.startsWith('achievement:')) {
    const achievement = getAchievementById(id.replace('achievement:', ''));
    if (achievement?.rewardIds?.length === 1) {
      return achievement.rewardIds[0];
    }
    return null;
  }

  const achievement = getAchievementById(id);
  if (achievement?.rewardIds?.length === 1) {
    return achievement.rewardIds[0];
  }

  return id;
}

export function isRewardEligibleForHeaderBadge(id: string): boolean {
  const resolvedId = resolveHeaderBadgeRewardId(id);
  if (!resolvedId) return false;

  if (isCollectorBadgeId(resolvedId) || isAnniversaryBadgeId(resolvedId)) return true;

  const rewardRaw = getRewardById(resolvedId);
  if (rewardRaw) {
    if (rewardRaw.usableInProfile === false) return false;
    return rewardRaw.type !== 'logo';
  }

  if (supporterRewards.some(r => r.id === resolvedId)) return true;
  if (supporterFirstRewards.some(r => r.id === resolvedId)) return true;
  if (constancyRewards.some(r => r.id === resolvedId)) return true;

  return false;
}

export function getRewardMetadataById(id: string): RewardMetadata | null {
  if (!id) return null;

  const resolvedId = resolveHeaderBadgeRewardId(id) || id;

  const supporter = supporterRewards.find(r => r.id === resolvedId);
  if (supporter) {
    return {
      id: supporter.id,
      title: supporter.title,
      image: supporter.image,
      category: 'supporter',
      description: supporter.description,
    };
  }

  const firstSupporter = supporterFirstRewards.find(r => r.id === resolvedId);
  if (firstSupporter) {
    return {
      id: firstSupporter.id,
      title: firstSupporter.title,
      image: firstSupporter.image,
      category: firstSupporter.category,
      description: firstSupporter.description,
    };
  }

  const constancy = constancyRewards.find(r => r.id === resolvedId);
  if (constancy) {
    return {
      id: constancy.id,
      title: constancy.title,
      image: constancy.image,
      category: constancy.category,
      description: constancy.description,
    };
  }

  const rewardRaw = getRewardById(resolvedId);
  if (rewardRaw && rewardRaw.asset.path) {
    return {
      id: rewardRaw.id,
      title: rewardRaw.title,
      image: rewardRaw.asset.path,
      category: rewardRaw.type,
      description: rewardRaw.description,
    };
  }

  if (id.startsWith('achievement:')) {
    const achId = id.replace('achievement:', '');
    const ach = getAchievementById(achId);
    if (ach && ach.asset.path) {
      return {
        id,
        title: ach.title,
        image: ach.asset.path,
        category: ach.category,
        description: ach.description,
      };
    }
  }

  const achRaw = getAchievementById(id);
  if (achRaw && achRaw.asset.path) {
    return {
      id: achRaw.id,
      title: achRaw.title,
      image: achRaw.asset.path,
      description: achRaw.description,
    };
  }

  return null;
}
