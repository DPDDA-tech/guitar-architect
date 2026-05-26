
import React, { useEffect, useState, Suspense } from 'react';
import FretboardPanel from './components/FretboardPanel';
import HarmonicCyclePage from './components/HarmonicCyclePage';
import LearnPage from './components/LearnPage';
import CagedPage from './components/CagedPage';
import PracticePage from './components/PracticePage';
import TriadsTetradsPage from './components/TriadsTetradsPage';
import ChordsPage from './components/ChordsPage';
import ThemeCollectionPage from './components/ThemeCollectionPage';
import GreekModesPage from './components/GreekModesPage';
import ProfilePage from './components/ProfilePage';
import AchievementUnlockToast from './components/AchievementUnlockToast';
import { recordConstancyVisit } from './utils/constancyStorage';
import { constancyRewards, type ConstancyReward } from './data/constancyRewards';
import { ConstancyUnlockToast } from './components/ConstancyUnlockToast';
import { DevRewardGrantPanel } from './components/DevRewardGrantPanel';
import AdminRewardsPage from './components/AdminRewardsPage';
import EcosystemPage from './components/EcosystemPage';
import KidsPage from './components/KidsPage';
import TeensPage from './components/TeensPage';
import { supabase } from './src/lib/supabase';
import { hydrateSupporterFromServer } from './utils/supporterStorage';

const getCurrentPath = () => window.location.pathname;

const App: React.FC = () => {
  const [path, setPath] = useState(getCurrentPath());
  const [unlockedConstancyReward, setUnlockedConstancyReward] = useState<ConstancyReward | null>(null);
  const [syncTimestamp, setSyncTimestamp] = useState(0);

  useEffect(() => {
    try {
      const result = recordConstancyVisit();

      if (result.newlyUnlockedRewardIds.length > 0) {
        const reward = constancyRewards.find(
          item => item.id === result.newlyUnlockedRewardIds[0]
        );

        if (reward) {
          setUnlockedConstancyReward(reward);
          window.setTimeout(() => setUnlockedConstancyReward(null), 6000);
        }
      }
    } catch {
      // TODO: Integrar toasts e UI premium de constância.
    }
  }, []);

  useEffect(() => {
    const initAuthSync = async () => {
      try {
        // 1. Tenta sincronizar imediatamente com a sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user?.id) {
          await hydrateSupporterFromServer(currentSession.user.id);
        }
      } catch (err) {
        console.error(`[AppBoot] Sync initialization failed:`, err);
      }
    };

    // 2. Escuta mudanças de auth (login/logout) para disparar sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log(`[AppBoot] User signed in: ${session.user.id}. Triggering sync...`);
        await hydrateSupporterFromServer(session.user.id);
      }
    });

    // 3. Escuta o evento de conclusão de sync para atualizar a UI localmente
    const handleSyncCompleted = () => {
      console.log(`[AppBoot] Sync completed event received. Refreshing UI...`);
      setSyncTimestamp(Date.now());
    };

    window.addEventListener('ga-supporter-sync-completed', handleSyncCompleted);
    window.addEventListener('ga-pinned-badges-updated', handleSyncCompleted);

    initAuthSync();

    const syncPath = () => setPath(getCurrentPath());
    window.addEventListener('popstate', syncPath);
    window.addEventListener('ga-route-change', syncPath);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('ga-route-change', syncPath);
      window.removeEventListener('ga-supporter-sync-completed', handleSyncCompleted);
      window.removeEventListener('ga-pinned-badges-updated', handleSyncCompleted);
    };
  }, []);

  const constancyToast = unlockedConstancyReward ? (
    <ConstancyUnlockToast
      rewardTitle={unlockedConstancyReward.title}
      rewardDescription={unlockedConstancyReward.description}
      rewardImage={unlockedConstancyReward.image}
      onClose={() => setUnlockedConstancyReward(null)}
    />
  ) : null;

  const devPanel = <DevRewardGrantPanel />;

  const renderPage = () => {
    const currentPath = window.location.pathname;
    console.log(`[AppRouter] Path State: ${path} | URL Path: ${currentPath}`);

    if (currentPath === '/admin/rewards') {
      console.log('[AppRouter] Route matched: admin rewards');
      return <AdminRewardsPage />;
    }

    switch (path) {
      case '/harmonic-cycle': return <HarmonicCyclePage />;
      case '/learn': return <LearnPage />;
      case '/practice': return <PracticePage />;
      case '/chords': return <ChordsPage />;
      case '/caged': return <CagedPage />;
      case '/triads-trainer': return <TriadsTetradsPage openTrainer />;
      case '/triads-tetrads': return <TriadsTetradsPage />;
      case '/greek-modes': return <GreekModesPage />;
      case '/theme-collection': return <ThemeCollectionPage />;
      case '/profile': return <ProfilePage />;
      case '/admin/rewards': return <AdminRewardsPage />;
      case '/ecosystem': return <EcosystemPage />;
      case '/kids': return <KidsPage />;
      case '/teens': return <TeensPage />;
      default: return <FretboardPanel />;
    }
  };

  return (
    <>
      {renderPage()} 
      <AchievementUnlockToast />
      {constancyToast}
      {devPanel}
    </>
  );
};

export default App;