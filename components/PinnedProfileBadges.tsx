import React, { useState, useEffect } from 'react';
import { getPinnedProfileBadges } from '../utils/pinnedProfileBadges';
import { getRewardMetadataById, type RewardMetadata } from '../utils/rewardLookup';

interface PinnedProfileBadgesProps {
  isLight: boolean;
}

/**
 * Exibe as miniaturas dos selos fixados no perfil pelo usuário.
 * Visível apenas em telas grandes (Desktop).
 */
export const PinnedProfileBadges: React.FC<PinnedProfileBadgesProps> = ({ isLight }) => {
  const [badges, setBadges] = useState<RewardMetadata[]>([]);

  // Carrega e resolve os selos ao montar o componente
  useEffect(() => {
    const pinnedIds = getPinnedProfileBadges();
    const resolved = pinnedIds
      .map(id => getRewardMetadataById(id))
      .filter((b): b is RewardMetadata => b !== null);
    
    setBadges(resolved);
  }, []);

  if (badges.length === 0) return null;

  return (
    <div className="hidden lg:grid grid-cols-5 grid-rows-2 gap-1 ml-3 mr-3 shrink-0">
      {badges.map(badge => (
        <div 
          key={badge.id}
          className={`relative flex items-center justify-center w-[28px] h-[28px] p-1 rounded-lg border shadow-sm transition-all hover:scale-110 hover:z-10 shrink-0 ${
            isLight ? 'bg-white border-zinc-200' : 'bg-zinc-800 border-zinc-700 shadow-black/40'
          }`}
          title={badge.title}
        >
          <img src={badge.image} alt={badge.title} className="w-full h-full object-contain" />
        </div>
      ))}
    </div>
  );
};