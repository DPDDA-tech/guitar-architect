import React, { useEffect, useState } from 'react';
import { getAchievementById, getRewardsForAchievement } from '../utils/achievementUtils';
import { getTierDisplay } from '../utils/tierNomenclature';
import type { Achievement } from '../types/achievement';
import { AnalyticsEvents, trackEvent } from '../src/lib/analytics';

const isTierOthersAsset = (path?: string | null) => Boolean(path?.includes('/tierothers/'));

const getAchievementPreview = (achievement: Achievement) => {
  if (achievement.asset.status === 'ready' && achievement.asset.path) return achievement.asset.path;
  return getRewardsForAchievement(achievement.id).find(reward => (
    reward.asset.status === 'ready' && Boolean(reward.asset.path)
  ))?.asset.path ?? null;
};

const isSpecialSeal = (achievement: Achievement) => (
  achievement.category === 'anniversary' ||
  achievement.category === 'loyalty' ||
  isTierOthersAsset(achievement.asset.path) ||
  getRewardsForAchievement(achievement.id).some(reward => isTierOthersAsset(reward.asset.path))
);

const AchievementUnlockToast: React.FC = () => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [extraCount, setExtraCount] = useState(0);

  useEffect(() => {
    const handleUnlock = (event: Event) => {
      const detail = (event as CustomEvent<{ achievementIds?: string[] }>).detail;
      const ids = detail?.achievementIds || [];
      if (ids.length === 0) return;
      const achievements = ids
        .map(id => getAchievementById(id))
        .filter((item): item is Achievement => Boolean(item));
      const first = achievements.find(isSpecialSeal) ?? achievements[0];
      if (!first) return;
      setAchievement(first);
      setExtraCount(Math.max(0, ids.length - 1));
      achievements.forEach(item => {
        trackEvent(AnalyticsEvents.COLLECTIBLE_UNLOCKED, { achievement_id: item.id });
      });
      window.setTimeout(() => setAchievement(null), 5600);
    };

    window.addEventListener('ga-achievements-unlocked', handleUnlock);
    return () => window.removeEventListener('ga-achievements-unlocked', handleUnlock);
  }, []);

  if (!achievement) return null;

  const preview = getAchievementPreview(achievement);
  const specialSeal = isSpecialSeal(achievement);
  const shellClass = specialSeal
    ? 'border-amber-300/60 bg-[linear-gradient(145deg,rgba(24,18,8,0.98),rgba(47,32,10,0.95))] shadow-[0_24px_80px_rgba(15,23,42,0.58),0_0_46px_rgba(245,158,11,0.24)]'
    : 'border-blue-400/40 bg-[linear-gradient(145deg,rgba(8,13,24,0.96),rgba(14,25,45,0.94))] shadow-[0_22px_70px_rgba(15,23,42,0.52),0_0_34px_rgba(37,99,235,0.18)]';
  const glowClass = specialSeal
    ? 'bg-[radial-gradient(circle_at_16%_0%,rgba(251,191,36,0.30),transparent_38%),radial-gradient(circle_at_88%_18%,rgba(253,224,71,0.18),transparent_34%)]'
    : 'bg-[radial-gradient(circle_at_15%_0%,rgba(96,165,250,0.24),transparent_36%)]';
  const eyebrow = specialSeal ? 'Selo colecionavel liberado' : 'Conquista desbloqueada';

  return (
    <div className={`fixed bottom-5 right-5 z-[160] max-w-sm rounded-2xl border p-4 text-white backdrop-blur-xl ${shellClass}`}>
      <div className={`pointer-events-none absolute inset-0 rounded-2xl ${glowClass}`} />
      <div className="relative flex gap-3">
        <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${specialSeal ? 'border-amber-200/50 bg-amber-400/10' : 'border-blue-300/30 bg-blue-500/12'}`}>
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-black">GA</span>
          )}
          <div className={`pointer-events-none absolute inset-0 ${specialSeal ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_42%,rgba(251,191,36,0.16))]' : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_48%)]'}`} />
        </div>
        <div>
          <p className={`text-[9px] font-black uppercase tracking-[0.22em] ${specialSeal ? 'text-amber-200' : 'text-blue-200'}`}>{eyebrow}</p>
          <h3 className="mt-1 text-base font-black">{achievement.title}</h3>
          <p className="mt-1 text-xs font-bold text-slate-300">
            {getTierDisplay(achievement.tier, 'pt')}
            {extraCount > 0 ? ` +${extraCount}` : ''}
          </p>
          {specialSeal && (
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100/80">
              Item adicionado a Colecao da Obra
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementUnlockToast;
