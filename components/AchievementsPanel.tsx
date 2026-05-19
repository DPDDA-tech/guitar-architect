import React, { useMemo, useState, useEffect } from 'react';
import { ACHIEVEMENT_TIERS } from '../data/achievementTiers';
import {
  calculateAchievementProgress,
  getAchievementById,
  getOverallAchievementProgress,
  getRewardsForAchievement,
  getTotalAchievementXp,
  getUnlockedRewards,
  getVisibleAchievements,
  isAchievementUnlocked,
} from '../utils/achievementUtils';
import {
  getAchievementProgressState,
  getSelectedRewardBadgeId,
  getUnlockedAchievementIds,
  lockAchievement,
  resetAchievementProgress,
  resetAchievements,
  setSelectedRewardBadgeId,
  unlockAchievement,
} from '../utils/achievementStorage';
import { getTierDisplay, getTierName } from '../utils/tierNomenclature';
import type { Achievement } from '../types/achievement';
import { supabase } from '../src/lib/supabase';
import { isAdminEmail } from '../src/lib/userIdentity';
import { loadConfig } from '../utils/persistence';

interface AchievementsPanelProps {
  isLight: boolean;
}

const rarityClass: Record<Achievement['rarity'], string> = {
  common: 'border-slate-400/30 text-slate-200 bg-slate-950/24',
  rare: 'border-blue-400/35 text-blue-200 bg-blue-950/28',
  epic: 'border-violet-400/35 text-violet-200 bg-violet-950/28',
  legendary: 'border-amber-400/40 text-amber-200 bg-amber-950/30',
  mythic: 'border-fuchsia-300/45 text-fuchsia-100 bg-fuchsia-950/28',
  guitar_hero: 'border-cyan-200/55 text-cyan-100 bg-cyan-950/30',
};

const lightRarityClass: Record<Achievement['rarity'], string> = {
  common: 'border-slate-200 text-slate-600 bg-slate-50',
  rare: 'border-blue-200 text-blue-700 bg-blue-50',
  epic: 'border-violet-200 text-violet-700 bg-violet-50',
  legendary: 'border-amber-200 text-amber-700 bg-amber-50',
  mythic: 'border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50',
  guitar_hero: 'border-cyan-200 text-cyan-700 bg-cyan-50',
};

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ isLight }) => {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => getUnlockedAchievementIds());
  const [progressState, setProgressState] = useState(() => getAchievementProgressState());
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(() => getSelectedRewardBadgeId());
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setIsAdmin(isAdminEmail(data.user?.email));
        // Get current user ID from local config for passing to functions
        const config = loadConfig();
        setCurrentUserId(config?.currentUser);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  const visibleAchievements = useMemo(() => getVisibleAchievements(unlockedIds), [unlockedIds]);
  const unlockedRewards = useMemo(() => getUnlockedRewards(unlockedIds), [unlockedIds]);
  const totalXp = useMemo(() => getTotalAchievementXp(unlockedIds), [unlockedIds]);
  const overallProgress = useMemo(() => getOverallAchievementProgress(unlockedIds), [unlockedIds]);

  const toggleAchievement = (id: string) => {
    if (!isAdmin) {
      console.warn('[GA] Admin permission required to unlock achievements');
      return;
    }
    
    const achievement = getAchievementById(id);
    if (achievement?.asset.status !== 'ready') return;
    const next = isAchievementUnlocked(id, unlockedIds) ? lockAchievement(id, currentUserId) : unlockAchievement(id, currentUserId);
    setUnlockedIds(next);
  };

  const reset = () => {
    if (!isAdmin) {
      console.warn('[GA] Admin permission required to reset achievements');
      return;
    }
    
    resetAchievements(currentUserId);
    resetAchievementProgress(currentUserId);
    setSelectedRewardBadgeId(null, currentUserId);
    setUnlockedIds([]);
    setProgressState({});
    setSelectedBadgeId(null);
  };

  const selectBadge = (rewardId: string) => {
    const next = setSelectedRewardBadgeId(rewardId, currentUserId);
    setSelectedBadgeId(next);
  };

  return (
    <section className={`mt-8 rounded-2xl border p-5 ${isLight ? 'border-[#c2d0e1] bg-white/95 shadow-[0_24px_70px_rgba(71,85,105,0.16)]' : 'border-blue-900/50 bg-[linear-gradient(145deg,#08101c,#050914)] shadow-[0_24px_72px_rgba(2,6,23,0.52)]'}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-300">Achievements / Rewards</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Conquistas, tiers e logos desbloqueaveis</h2>
          <p className={`mt-2 max-w-4xl text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Catalogo local com tiers, XP, criterios e assets. O localStorage guarda apenas o estado do usuario; tiers sem imagem permanecem em preparacao.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-800/60 bg-blue-950/30 text-blue-200'}`}>
            {overallProgress}% progresso
          </span>
          <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-800/60 bg-emerald-950/24 text-emerald-200'}`}>
            {totalXp} XP
          </span>
          <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-800/60 bg-amber-950/24 text-amber-200'}`}>
            {unlockedRewards.length} rewards
          </span>
          {isAdmin && (
            <button 
              onClick={reset} 
              className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50' : 'border-blue-900/55 bg-[#050914] text-slate-400 hover:bg-blue-950/40'}`}
            >
              Reset dev
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {ACHIEVEMENT_TIERS.map(tier => {
          const count = visibleAchievements.filter(achievement => achievement.tier === tier.tier).length;
          return (
            <div key={tier.tier} className={`rounded-xl border p-3 ${isLight ? 'border-[#d4dfeb] bg-[#f8fbff]' : 'border-blue-900/45 bg-[#050914]'}`}>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">{getTierDisplay(tier.tier, 'pt')}</p>
              <h3 className="mt-1 text-sm font-black">{tier.title}</h3>
              <p className={`mt-1 text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{count} conquistas</p>
            </div>
          );
        })}
      </div>

      {unlockedRewards.length > 0 && (
        <div className={`mt-5 rounded-xl border p-4 ${isLight ? 'border-[#d4dfeb] bg-[#f8fbff]' : 'border-blue-900/50 bg-[#050914]'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Identidade ativa</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {unlockedRewards.filter(reward => reward.usableInProfile).map(reward => (
              <button
                key={reward.id}
                onClick={() => selectBadge(reward.id)}
                className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase transition ${selectedBadgeId === reward.id ? 'border-blue-300 bg-blue-600 text-white shadow-[0_10px_28px_rgba(37,99,235,0.35)]' : isLight ? 'border-blue-200 bg-white text-blue-700' : 'border-blue-900/70 bg-[#070d18] text-blue-200'}`}
              >
                {selectedBadgeId === reward.id ? 'Selecionado: ' : 'Usar: '}
                {reward.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`mt-5 rounded-xl border p-4 ${isLight ? 'border-[#d4dfeb] bg-[#f8fbff]' : 'border-blue-900/50 bg-[#050914]'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Novas trilhas de desbloqueio</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            ['Lealdade', 'dias distintos usando o app', 'tierothers-loyalty-founder-01'],
            ['Vínculo', 'tempo desde o primeiro registro local', 'tierothers-tenure-epic-01'],
            ['Aniversário', 'eventos comemorativos do Guitar Architect', 'tierothers-anniversary-2026-01'],
          ].map(([title, description, slug]) => (
            <div key={title} className={`rounded-xl border p-3 ${isLight ? 'border-blue-100 bg-white' : 'border-blue-950/60 bg-[#070d18]'}`}>
              <h3 className="text-sm font-black">{title}</h3>
              <p className={`mt-1 text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-blue-300">{slug}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleAchievements.map(achievement => {
          const unlocked = isAchievementUnlocked(achievement.id, unlockedIds);
          const rewards = getRewardsForAchievement(achievement.id);
          const hiddenLocked = achievement.hidden && !unlocked;
          const progress = calculateAchievementProgress(achievement, progressState, unlockedIds);
          const achievementImage = unlocked && achievement.asset.path
            ? achievement.asset.path
            : '/tier0/tier0-ga6-oficial.webp';
          return (
            <article key={achievement.id} className={`rounded-xl border p-4 transition hover:-translate-y-0.5 ${unlocked ? isLight ? 'border-blue-300 bg-blue-50/80' : 'border-blue-700/70 bg-[#081426]' : isLight ? 'border-[#d2deeb] bg-white/90' : 'border-blue-900/60 bg-[#070d18]'}`}>
              <div className={`relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-xl border ${unlocked ? isLight ? 'border-blue-200 bg-blue-50' : 'border-blue-900/60 bg-blue-950/20' : isLight ? 'border-slate-200 bg-[radial-gradient(circle_at_50%_35%,#f8fbff_0%,#e8eef6_58%,#d9e3ee_100%)]' : 'border-slate-800 bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,0.14),rgba(2,6,23,0.92)_62%,rgba(0,0,0,0.96)_100%)]'}`}>
                {!unlocked && (
                  <>
                    <div className={`absolute inset-0 ${isLight ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(148,163,184,0.08)_44%,rgba(15,23,42,0.08))]' : 'bg-[linear-gradient(135deg,rgba(96,165,250,0.10),transparent_48%,rgba(255,255,255,0.05))]'}`} />
                    <img src="/tier0/tier0-ga6-oficial.webp" alt="" className={`absolute h-24 w-24 scale-110 object-contain blur-[6px] ${isLight ? 'opacity-20 grayscale brightness-75 contrast-150' : 'opacity-24 grayscale brightness-125 contrast-125'}`} />
                  </>
                )}
                <img src={achievementImage} alt="" className={`relative h-20 w-20 object-contain transition ${unlocked ? 'opacity-100' : isLight ? 'opacity-30 grayscale brightness-50 contrast-150' : 'opacity-34 grayscale brightness-125 contrast-125'}`} />
                {!unlocked && (
                  <div className={`absolute inset-0 flex items-center justify-center ${isLight ? 'bg-white/12' : 'bg-black/14'}`}>
                    <span className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase ${isLight ? 'border-slate-300/80 bg-white/70 text-slate-700 shadow-[0_10px_28px_rgba(71,85,105,0.18)]' : 'border-white/20 bg-black/50 text-white shadow-[0_0_22px_rgba(37,99,235,0.16)]'}`}>
                      Locked
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {unlocked ? 'Unlocked' : hiddenLocked ? 'Hidden' : 'Locked'} / {getTierDisplay(achievement.tier, 'pt')}
                  </p>
                  <h3 className="mt-2 text-lg font-black">{hiddenLocked ? 'Conquista secreta' : achievement.title}</h3>
                </div>
                <span className={`rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase ${isLight ? lightRarityClass[achievement.rarity] : rarityClass[achievement.rarity]}`}>
                  {getTierName(achievement.tier, 'pt')}
                </span>
              </div>
              <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {hiddenLocked ? 'Continue praticando para revelar esta conquista.' : achievement.description}
              </p>
              {!hiddenLocked && (
                <div className="mt-4">
                  <div className={`h-2 overflow-hidden rounded-full ${isLight ? 'bg-slate-200' : 'bg-slate-900'}`}>
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <div className={`mt-2 flex justify-between text-[9px] font-black uppercase ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    <span>{progress.label}</span>
                    <span>{achievement.xp} XP</span>
                  </div>
                </div>
              )}
              {!hiddenLocked && (
                <div className="mt-4 rounded-lg border border-blue-900/30 px-3 py-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-300">{achievement.asset.status === 'ready' ? 'Asset oficial' : 'Asset em breve'}</p>
                  <p className={`mt-1 text-xs font-black ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {achievement.asset.status === 'ready' ? achievement.asset.slug : 'Imagem ainda nao disponivel. Aguarde para concluir este desbloqueio.'}
                  </p>
                </div>
              )}
              {rewards.length > 0 && !hiddenLocked && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {rewards.map(reward => (
                    <span key={reward.id} className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 bg-white text-blue-700' : 'border-blue-900/60 bg-[#050914] text-blue-200'}`}>
                      {reward.type}: {reward.asset.status === 'ready' ? reward.asset.slug : 'asset em breve'}
                    </span>
                  ))}
                </div>
              )}
              {isAdmin && !isCheckingAdmin && (
                <button
                  onClick={() => toggleAchievement(achievement.id)}
                  className="mt-4 w-full cursor-pointer rounded-xl border border-blue-400/30 bg-blue-600 px-3 py-2 text-[9px] font-black uppercase text-white"
                >
                  {unlocked ? 'Bloquear dev' : 'Desbloquear dev'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AchievementsPanel;
