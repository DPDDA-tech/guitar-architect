import React, { useState, useEffect } from 'react';
import { getPinnedProfileBadges } from '../utils/pinnedProfileBadges';
import { getRewardMetadataById, type RewardMetadata } from '../utils/rewardLookup';
import { PinBadgeAction } from './themeCollection/PinBadgeAction';

interface PinnedProfileBadgesProps {
  isLight: boolean;
}

/**
 * Exibe as miniaturas dos selos fixados no perfil pelo usuário.
 * Visível apenas em telas grandes (Desktop).
 */
export const PinnedProfileBadges: React.FC<PinnedProfileBadgesProps> = ({ isLight }) => {
  const [badges, setBadges] = useState<RewardMetadata[]>([]);
  const [previewBadge, setPreviewBadge] = useState<RewardMetadata | null>(null);

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
    <>
      <div className="hidden lg:grid grid-cols-5 grid-rows-2 gap-1 ml-3 mr-3 shrink-0">
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
