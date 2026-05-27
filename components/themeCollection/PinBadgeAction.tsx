import React, { useEffect, useState } from 'react';
import {
  canPinMoreProfileBadges,
  isProfileBadgePinned,
  MAX_PINNED_PROFILE_BADGES,
  toggleProfileBadgePin,
} from '../../utils/pinnedProfileBadges';
import { isRewardEligibleForHeaderBadge } from '../../utils/rewardLookup';

interface PinBadgeActionProps {
  rewardId: string;
  isUnlocked: boolean;
}

export const PinBadgeAction: React.FC<PinBadgeActionProps> = ({ rewardId, isUnlocked }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [canPinMore, setCanPinMore] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  useEffect(() => {
    if (!rewardId) return;
    setIsPinned(isProfileBadgePinned(rewardId));
    setCanPinMore(canPinMoreProfileBadges());
    setFeedback(null);
  }, [rewardId]);

  const isEligible = isRewardEligibleForHeaderBadge(rewardId);
  if (!isUnlocked || !rewardId || !isEligible) return null;

  const handleToggle = () => {
    const result = toggleProfileBadgePin(rewardId);

    if (result.ok) {
      const nowPinned = result.action === 'pinned';
      setIsPinned(nowPinned);
      setCanPinMore(canPinMoreProfileBadges());
      setFeedback({
        text: nowPinned ? 'Selo fixado no perfil.' : 'Selo removido do perfil.',
        type: 'success',
      });
      return;
    }

    if (result.reason === 'limit_reached') {
      setFeedback({
        text: `Voce ja fixou ${MAX_PINNED_PROFILE_BADGES} selos. Remova um para adicionar outro.`,
        type: 'warning',
      });
    }
  };

  const isLimitReached = !isPinned && !canPinMore;

  return (
    <div className="ga-pin-badge-action mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleToggle}
          disabled={isLimitReached}
          className={`
            flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200
            ${isPinned
              ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-900/20'
              : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md'}
            ${isLimitReached ? 'cursor-not-allowed grayscale opacity-50' : 'active:scale-95'}
          `}
        >
          <span className="text-base">{isPinned ? 'PINNED' : 'PIN'}</span>
          {isPinned ? 'Remover do perfil' : 'Fixar no perfil'}
        </button>

        {feedback && (
          <p className={`animate-in fade-in slide-in-from-top-1 text-center text-xs font-medium ${
            feedback.type === 'warning' ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-400'
          }`}>
            {feedback.text}
          </p>
        )}

        {isLimitReached && !feedback && (
          <p className="text-center text-xs italic text-slate-500">
            Limite de {MAX_PINNED_PROFILE_BADGES} selos fixados atingido.
          </p>
        )}
      </div>
    </div>
  );
};
