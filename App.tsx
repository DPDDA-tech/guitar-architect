import React, { useEffect, useState } from 'react';
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

const getCurrentPath = () => window.location.pathname;

const App: React.FC = () => {
  const [path, setPath] = useState(getCurrentPath());
  const [unlockedConstancyReward, setUnlockedConstancyReward] = useState<ConstancyReward | null>(null);

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
    const syncPath = () => setPath(getCurrentPath());
    window.addEventListener('popstate', syncPath);
    window.addEventListener('ga-route-change', syncPath);
    return () => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('ga-route-change', syncPath);
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

  const renderPage = () => {
  switch (path) {
    case '/harmonic-cycle':
      return <HarmonicCyclePage />;
    case '/learn':
      return <LearnPage />;
    case '/practice':
      return <PracticePage />;
    case '/chords':
      return <ChordsPage />;
    case '/caged':
      return <CagedPage />;
    case '/triads-trainer':
      return <TriadsTetradsPage openTrainer />;
    case '/triads-tetrads':
      return <TriadsTetradsPage />;
    case '/greek-modes':
      return <GreekModesPage />;
    case '/theme-collection':
      return <ThemeCollectionPage />;
    case '/profile':
      return <ProfilePage />;
    default:
      return <FretboardPanel />;
  }
};

  return (
    <>
      {renderPage()}
      <AchievementUnlockToast />
      {constancyToast}
      <DevRewardGrantPanel />
    </>
  );
};

export default App;