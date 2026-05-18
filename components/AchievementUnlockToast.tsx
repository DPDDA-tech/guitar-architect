import React, { useEffect, useState } from 'react';
import { getAchievementById } from '../utils/achievementUtils';
import { getTierDisplay } from '../utils/tierNomenclature';
import type { Achievement } from '../types/achievement';

const AchievementUnlockToast: React.FC = () => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [extraCount, setExtraCount] = useState(0);

  useEffect(() => {
    const handleUnlock = (event: Event) => {
      const detail = (event as CustomEvent<{ achievementIds?: string[] }>).detail;
      const ids = detail?.achievementIds || [];
      if (ids.length === 0) return;
      const first = getAchievementById(ids[0]);
      if (!first) return;
      setAchievement(first);
      setExtraCount(Math.max(0, ids.length - 1));
      window.setTimeout(() => setAchievement(null), 5600);
    };

    window.addEventListener('ga-achievements-unlocked', handleUnlock);
    return () => window.removeEventListener('ga-achievements-unlocked', handleUnlock);
  }, []);

  if (!achievement) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[160] max-w-sm rounded-2xl border border-blue-400/40 bg-[linear-gradient(145deg,rgba(8,13,24,0.96),rgba(14,25,45,0.94))] p-4 text-white shadow-[0_22px_70px_rgba(15,23,42,0.52),0_0_34px_rgba(37,99,235,0.18)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_15%_0%,rgba(96,165,250,0.24),transparent_36%)]" />
      <div className="relative flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/12 text-lg font-black">
          GA
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-200">Conquista desbloqueada</p>
          <h3 className="mt-1 text-base font-black">{achievement.title}</h3>
          <p className="mt-1 text-xs font-bold text-slate-300">
            {getTierDisplay(achievement.tier, 'pt')}
            {extraCount > 0 ? ` +${extraCount}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AchievementUnlockToast;
