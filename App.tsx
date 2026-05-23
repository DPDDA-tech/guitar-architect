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

  if (path === '/harmonic-cycle') {
    return <><HarmonicCyclePage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/learn') {
    return <><LearnPage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/practice') {
    return <><PracticePage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/chords') {
    return <><ChordsPage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/caged') {
    return <><CagedPage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/triads-trainer') {
    return <><TriadsTetradsPage openTrainer /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/triads-tetrads') {
    return <><TriadsTetradsPage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/greek-modes') {
    return <><GreekModesPage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/theme-collection') {
    return <><ThemeCollectionPage /><AchievementUnlockToast />{constancyToast}</>;
  }

  if (path === '/profile') {
    return <><ProfilePage /><AchievementUnlockToast />{constancyToast}</>;
  }

  return <><FretboardPanel /><AchievementUnlockToast />{constancyToast}</>;
};

export default App;