import React, { useMemo, useState, useEffect } from 'react';
import { getPinnedProfileBadges } from '../utils/pinnedProfileBadges';
import { getRewardMetadataById, type RewardMetadata } from '../utils/rewardLookup';
import { PinBadgeAction } from './themeCollection/PinBadgeAction';
import { getSelectedRewardBadgeId, getUnlockedAchievementIds, setSelectedRewardBadgeId } from '../utils/achievementStorage';
import { getUnlockedRewards } from '../utils/achievementUtils';
import { loadConfig } from '../utils/persistence';

interface PinnedProfileBadgesProps {
  isLight: boolean;
}

export const PinnedProfileBadges: React.FC<PinnedProfileBadgesProps> = ({ isLight }) => {
  const [badges, setBadges] = useState<RewardMetadata[]>([]);
  const [previewBadge, setPreviewBadge] = useState<RewardMetadata | null>(null);
  const [selectedBadgeId, setSelectedBadgeIdState] = useState<string | null>(() => getSelectedRewardBadgeId());
  const [identityMenuOpen, setIdentityMenuOpen] = useState(false);
  const currentUserId = useMemo(() => loadConfig()?.currentUser, []);

  const refreshBadges = () => {
    const pinnedIds = getPinnedProfileBadges();
    const resolved = pinnedIds
      .map(id => getRewardMetadataById(id))
      .filter((b): b is RewardMetadata => b !== null);
    setBadges(resolved);
    setSelectedBadgeIdState(getSelectedRewardBadgeId(currentUserId));
  };

  useEffect(() => {
    refreshBadges();
    window.addEventListener('storage', refreshBadges);
    window.addEventListener('ga-pinned-badges-updated', refreshBadges);
    window.addEventListener('ga-selected-badge-updated', refreshBadges);
    window.addEventListener('ga-achievements-unlocked', refreshBadges);
    return () => {
      window.removeEventListener('storage', refreshBadges);
      window.removeEventListener('ga-pinned-badges-updated', refreshBadges);
      window.removeEventListener('ga-selected-badge-updated', refreshBadges);
      window.removeEventListener('ga-achievements-unlocked', refreshBadges);
    };
  }, [currentUserId]);

  const usableUnlockedRewards = useMemo(() => {
    const unlockedIds = getUnlockedAchievementIds(currentUserId);
    return getUnlockedRewards(unlockedIds).filter(reward => reward.usableInProfile);
  }, [currentUserId, selectedBadgeId, badges.length]);

  const activeBadge = useMemo(() => (
    selectedBadgeId ? getRewardMetadataById(selectedBadgeId) : null
  ), [selectedBadgeId]);

  const handleSetActiveBadge = (rewardId: string | null) => {
    const next = setSelectedRewardBadgeId(rewardId, currentUserId);
    setSelectedBadgeIdState(next);
    setIdentityMenuOpen(false);
  };

  return (
    <>
      <div className="hidden lg:flex items-center gap-2 ml-3 mr-3 shrink-0">
        <button
          type="button"
          onClick={() => setIdentityMenuOpen(true)}
          className={`rounded-lg border px-2 py-1 text-[8px] font-black uppercase transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-700 hover:border-blue-300' : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-blue-500'}`}
          title="Trocar identidade ativa"
        >
          {activeBadge ? `Ativo: ${activeBadge.title}` : 'Sem identidade ativa'}
        </button>

        {badges.length > 0 && (
          <div className="grid grid-cols-5 grid-rows-2 gap-1">
            {badges.map(badge => (
              <button
                key={badge.id}
                type="button"
                className={`relative flex items-center justify-center w-[28px] h-[28px] p-1 rounded-lg border shadow-sm transition-all hover:scale-110 hover:z-10 shrink-0 ${
                  isLight ? 'bg-white border-zinc-200' : 'bg-zinc-800 border-zinc-700 shadow-black/40'
                }`}
                title={badge.title}
                onClick={() => setPreviewBadge(badge)}
              >
                <img src={badge.image} alt={badge.title} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {identityMenuOpen && (
        <div className="fixed inset-0 z-[145] flex items-start justify-center bg-black/72 px-4 pb-4 pt-[10vh] backdrop-blur-md" onClick={() => setIdentityMenuOpen(false)}>
          <div
            className={`max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl border p-5 shadow-2xl ${isLight ? 'border-slate-200 bg-white' : 'border-blue-900/60 bg-slate-950'}`}
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">Identidade ativa do perfil</h2>
              <button
                type="button"
                onClick={() => setIdentityMenuOpen(false)}
                className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-700 text-slate-200'}`}
              >
                Fechar
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleSetActiveBadge(null)}
                className={`rounded-xl border px-3 py-2 text-left text-[10px] font-black uppercase ${selectedBadgeId === null ? 'border-blue-400 bg-blue-600 text-white' : isLight ? 'border-zinc-200 bg-white text-zinc-700' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}`}
              >
                Desativar identidade
              </button>
              {usableUnlockedRewards.map(reward => (
                <button
                  key={reward.id}
                  type="button"
                  onClick={() => handleSetActiveBadge(reward.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-[10px] font-black uppercase ${selectedBadgeId === reward.id ? 'border-blue-400 bg-blue-600 text-white' : isLight ? 'border-zinc-200 bg-white text-zinc-700' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}`}
                >
                  {selectedBadgeId === reward.id ? 'Selecionado: ' : 'Usar: '}
                  {reward.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewBadge && (
        <div className="fixed inset-0 z-[140] flex items-start justify-center bg-black/82 px-4 pb-4 pt-[10vh] backdrop-blur-xl" onClick={() => setPreviewBadge(null)}>
          <div
            className={`max-h-[92vh] w-full max-w-3xl overflow-auto rounded-3xl border p-5 shadow-2xl ${isLight ? 'border-slate-200 bg-white' : 'border-blue-900/60 bg-slate-950'}`}
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Selo fixado</p>
                <h2 className="text-lg font-black">{previewBadge.title}</h2>
                <p className={`mt-1 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {previewBadge.description || 'Selo desbloqueado na sua jornada no Guitar Architect.'}
                </p>
                <PinBadgeAction rewardId={previewBadge.id} isUnlocked={true} />
              </div>
              <button
                type="button"
                onClick={() => setPreviewBadge(null)}
                className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-700 text-slate-200'}`}
              >
                Fechar
              </button>
            </div>
            <a href={previewBadge.image} target="_blank" rel="noreferrer" download className="mt-3 block" title="Abrir ou salvar imagem">
              <img src={previewBadge.image} alt={previewBadge.title} className="mx-auto max-h-[58vh] w-auto max-w-full rounded-2xl object-contain" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
