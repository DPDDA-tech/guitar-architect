
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

const getCurrentPath = () => window.location.pathname;

const App: React.FC = () => {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    const syncPath = () => setPath(getCurrentPath());
    window.addEventListener('popstate', syncPath);
    window.addEventListener('ga-route-change', syncPath);
    return () => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('ga-route-change', syncPath);
    };
  }, []);

  if (path === '/harmonic-cycle') {
    return <><HarmonicCyclePage /><AchievementUnlockToast /></>;
  }

  if (path === '/learn') {
    return <><LearnPage /><AchievementUnlockToast /></>;
  }

  if (path === '/practice') {
    return <><PracticePage /><AchievementUnlockToast /></>;
  }

  if (path === '/chords') {
    return <><ChordsPage /><AchievementUnlockToast /></>;
  }

  if (path === '/caged') {
    return <><CagedPage /><AchievementUnlockToast /></>;
  }

  if (path === '/triads-trainer') {
    return <><TriadsTetradsPage openTrainer /><AchievementUnlockToast /></>;
  }

  if (path === '/triads-tetrads') {
    return <><TriadsTetradsPage /><AchievementUnlockToast /></>;
  }

  if (path === '/greek-modes') {
    return <><GreekModesPage /><AchievementUnlockToast /></>;
  }

  if (path === '/theme-collection') {
    return <><ThemeCollectionPage /><AchievementUnlockToast /></>;
  }

  if (path === '/profile') {
    return <><ProfilePage /><AchievementUnlockToast /></>;
  }

  return <><FretboardPanel /><AchievementUnlockToast /></>;
};

export default App;
