import React, { useState, useEffect } from 'react';
import { 
  isProfileBadgePinned, 
  toggleProfileBadgePin, 
  canPinMoreProfileBadges,
  MAX_PINNED_PROFILE_BADGES 
} from '../../utils/pinnedProfileBadges';

interface PinBadgeActionProps {
  /** ID único do selo/recompensa */
  rewardId: string;
  /** Indica se o selo já foi conquistado pelo usuário */
  isUnlocked: boolean;
}

/**
 * Componente de ação para fixar/remover selos no perfil.
 * Deve ser renderizado dentro do modal de detalhes do selo.
 */
export const PinBadgeAction: React.FC<PinBadgeActionProps> = ({ rewardId, isUnlocked }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [canPinMore, setCanPinMore] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Sincroniza o estado sempre que o selo selecionado mudar ou o modal abrir
  useEffect(() => {
    if (rewardId) {
      setIsPinned(isProfileBadgePinned(rewardId));
      setCanPinMore(canPinMoreProfileBadges());
      setFeedback(null);
    }
  }, [rewardId]);

  // Regra: Selos bloqueados não podem ser fixados
  if (!isUnlocked || !rewardId) {
    return null;
  }

  const handleToggle = () => {
    const result = toggleProfileBadgePin(rewardId);

    if (result.ok) {
      const nowPinned = result.action === 'pinned';
      setIsPinned(nowPinned);
      setCanPinMore(canPinMoreProfileBadges());
      setFeedback({
        text: nowPinned ? "Selo fixado no perfil." : "Selo removido do perfil.",
        type: 'success'
      });
    } else if (result.reason === 'limit_reached') {
      setFeedback({
        text: `Você já fixou ${MAX_PINNED_PROFILE_BADGES} selos. Remova um para adicionar outro.`,
        type: 'warning'
      });
    }
  };

  const isLimitReached = !isPinned && !canPinMore;

  return (
    <div className="ga-pin-badge-action mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleToggle}
          disabled={isLimitReached}
          className={`
            flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            ${isPinned 
              ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-900/20' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'}
            ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-95'}
          `}
        >
          <span className="text-base" role="img" aria-label="pin">
            {isPinned ? '📍' : '📌'}
          </span>
          {isPinned ? 'Remover do perfil' : 'Fixar no perfil'}
        </button>

        {/* Feedback de sucesso ou aviso de limite */}
        {feedback && (
          <p className={`text-center text-xs font-medium animate-in fade-in slide-in-from-top-1 ${
            feedback.type === 'warning' ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-400'
          }`}>
            {feedback.text}
          </p>
        )}

        {isLimitReached && !feedback && (
          <p className="text-center text-xs text-slate-500 italic">
            Limite de {MAX_PINNED_PROFILE_BADGES} selos fixados atingido.
          </p>
        )}
      </div>
    </div>
  );
};