
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
import Season1Page from './components/Season1Page';
import BrandPage from './components/BrandPage';
import AboutPage from './components/AboutPage';
import InstructorsGalleryPage from './components/InstructorsGalleryPage';
import InstructorProfilePage from './components/InstructorProfilePage';
import KidsPage from './components/KidsPage';
import KidsFirstStepsPage from './components/KidsFirstStepsPage';
import KidsNotesPage from './components/KidsNotesPage';
import KidsNoteFriendsPage from './components/KidsNoteFriendsPage';
import KidsWorkshopPage from './components/KidsWorkshopPage';
import KidsGamesPage from './components/KidsGamesPage';
import KidsMemoryGamePage from './components/KidsMemoryGamePage';
import KidsIdentifyGamePage from './components/KidsIdentifyGamePage';
import KidsCableGamePage from './components/KidsCableGamePage';
import KidsRhythmGamePage from './components/KidsRhythmGamePage';
import KidsBuildBandPage from './components/KidsBuildBandPage';
import KidsSoundLengthsPage from './components/KidsSoundLengthsPage';
import KidsLightHuntPage from './components/KidsLightHuntPage';
import KidsCustomShopPage from './components/KidsCustomShopPage';
import TeensPage from './components/TeensPage';
import TeenRiffChallengesPage from './components/TeenRiffChallengesPage';
import TeenRhythmLabPage from './components/TeenRhythmLabPage';
import TeenBatidasPopularesPage from './components/TeenBatidasPopularesPage';
import TeenBasicCarePage from './components/TeenBasicCarePage';
import TeenChordExplorerPage from './components/TeenChordExplorerPage';
import TeenTriadMapPage from './components/TeenTriadMapPage';
import TeenTetradMapPage from './components/TeenTetradMapPage';
import TeenChordGpsPage from './components/TeenChordGpsPage';
import TeenFingerIndependencePage from './components/TeenFingerIndependencePage';
import TeenScaleHunterPage from './components/TeenScaleHunterPage';
import TeenIntervalRadarPage from './components/TeenIntervalRadarPage';
import TeenChordBuilderPage from './components/TeenChordBuilderPage';
import TeenBlueprintReadingPage from './components/TeenBlueprintReadingPage';
import TeensGarageHubPage from './components/TeensGarageHubPage';
import TeensGarageEvhPage from './components/TeensGarageEvhPage';
import { supabase } from './src/lib/supabase';
import { hydrateSupporterFromServer } from './utils/supporterStorage';
import { loadConfig } from './utils/persistence';
import { cleanupStudioRuntime } from './utils/studioRuntime';
import { trackPageView } from './src/lib/analytics';

const getCurrentPath = () => window.location.pathname;

// Exceção deliberada: ao retornar da galeria de Arquitetos Musicais, a posição
// de scroll é restaurada pelo próprio InstructorsGalleryPage a partir do
// sessionStorage, em vez de reiniciar no topo.
const GALLERY_SCROLL_KEY = 'ga_instructors_gallery_scroll';

const hasRestorableGalleryScroll = (path: string): boolean => {
  if (path !== '/instructors') return false;
  try {
    const stored = sessionStorage.getItem(GALLERY_SCROLL_KEY);
    return stored !== null && Number.isFinite(Number(stored));
  } catch {
    return false;
  }
};

const App: React.FC = () => {
  const [path, setPath] = useState(getCurrentPath());
  const [unlockedConstancyReward, setUnlockedConstancyReward] = useState<ConstancyReward | null>(null);
  const [syncTimestamp, setSyncTimestamp] = useState(0);

  useEffect(() => {
    trackPageView(path);
  }, [path]);

  useEffect(() => {
    try {
      const result = recordConstancyVisit(new Date(), loadConfig()?.currentUser ?? undefined);

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
          recordConstancyVisit(new Date(), currentSession.user.id);
          await hydrateSupporterFromServer(currentSession.user.id);
        }
      } catch (err) {
        console.error(`[AppBoot] Sync initialization failed:`, err);
      }
    };

    // 2. Escuta mudanças de auth (login/logout) para disparar sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log(`[AppBoot] User signed in: ${session.user.id}. Triggering sync...`);
        recordConstancyVisit(new Date(), session.user.id);
        window.setTimeout(() => {
          void hydrateSupporterFromServer(session.user.id).catch((err) => {
            console.error('[AppBoot] Deferred hydrate failed:', err);
          });
        }, 0);
      }

      if (event === 'SIGNED_OUT') {
        setPath('/');
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new Event('ga-route-change'));
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

    // Rastreado fora do state do React (não dispara re-render) para saber de
    // qual rota o usuário está saindo no momento em que 'ga-route-change' é
    // disparado, já que window.location.pathname já foi atualizado pelo
    // pushState antes do evento chegar até aqui.
    let previousPath = getCurrentPath();

    const applyPathChange = () => {
      const nextPath = getCurrentPath();
      setPath(prevPath => {
        if (nextPath !== prevPath) cleanupStudioRuntime(nextPath);
        return nextPath;
      });
      return nextPath;
    };

    const handlePopState = () => {
      previousPath = applyPathChange();
    };

    // Navegação interna via pushState (botões, links, cards, menus e atalhos)
    // deve iniciar no topo da nova página, salvo a exceção deliberada de
    // retorno à galeria de Arquitetos Musicais — e somente quando a rota
    // anterior era de fato um perfil de arquiteto, para não restaurar uma
    // chave de scroll remanescente de uma navegação não relacionada (ex.:
    // Home → Galeria após o usuário ter saído de um perfil por outro caminho).
    // O botão voltar/avançar nativo do navegador (popstate) não é afetado,
    // preservando a restauração de scroll padrão do navegador para esse caso.
    const handleInternalNavigation = () => {
      const departedFromProfile = previousPath.startsWith('/instructors/');
      const nextPath = applyPathChange();
      const isReturningToGalleryWithScroll =
        departedFromProfile && hasRestorableGalleryScroll(nextPath);
      if (!isReturningToGalleryWithScroll) {
        window.scrollTo(0, 0);
      }
      previousPath = nextPath;
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('ga-route-change', handleInternalNavigation);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('ga-route-change', handleInternalNavigation);
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

    if (currentPath.startsWith('/instructors/')) {
      const instructorId = currentPath.split('/instructors/')[1]?.split('/')[0] ?? '';
      return <InstructorProfilePage instructorId={instructorId} />;
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
      case '/season-1': return <Season1Page />;
      case '/brand': return <BrandPage />;
      case '/nossa-marca': return <BrandPage />;
      case '/about': return <AboutPage />;
      case '/instructors': return <InstructorsGalleryPage />;
      case '/kids': return <KidsPage />;
      case '/kids/first-steps': return <KidsFirstStepsPage />;
      case '/kids/notes': return <KidsNotesPage />;
      case '/kids/note-friends': return <KidsNoteFriendsPage />;
      case '/kids/instruments': return <KidsWorkshopPage />;
      case '/kids/workshop': return <KidsWorkshopPage />;
      case '/kids/games': return <KidsGamesPage />;
      case '/kids/games/memory': return <KidsMemoryGamePage />;
      case '/kids/games/identify': return <KidsIdentifyGamePage />;
      case '/kids/games/cables': return <KidsCableGamePage />;
      case '/kids/games/rhythm': return <KidsRhythmGamePage />;
      case '/kids/build-band': return <KidsBuildBandPage />;
      case '/kids/sound-lengths': return <KidsSoundLengthsPage />;
      case '/kids/light-hunt': return <KidsLightHuntPage />;
      case '/kids/custom-shop': return <KidsCustomShopPage />;
      case '/teens': return <TeensPage />;
      case '/teens/garage': return <TeensGarageHubPage />;
      case '/teens/garage/evh-frankenstein-tribute': return <TeensGarageEvhPage />;
      case '/teens/riff-challenges': return <TeenRiffChallengesPage />;
      case '/teens/rhythm-lab': return <TeenRhythmLabPage />;
      case '/teens/batidas-populares': return <TeenBatidasPopularesPage />;
      case '/teens/cuidados-basicos': return <TeenBasicCarePage />;
      case '/teens/explorador-de-acordes': return <TeenChordExplorerPage />;
      case '/teens/triad-map': return <TeenTriadMapPage />;
      case '/teens/tetrad-map': return <TeenTetradMapPage />;
      case '/teens/gps-dos-acordes': return <TeenChordGpsPage />;
      case '/teens/independencia-dos-dedos': return <TeenFingerIndependencePage />;
      case '/teens/scale-hunter': return <TeenScaleHunterPage />;
      case '/teens/radar-de-intervalos': return <TeenIntervalRadarPage />;
      case '/teens/chord-builder': return <TeenChordBuilderPage />;
      case '/teens/blueprint-reading': return <TeenBlueprintReadingPage />;
      case '/studio': return <FretboardPanel />;
      case '/': return <EcosystemPage />;
      default: return <EcosystemPage />;
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
