import { getKidsLang, getTeensLang, type AppLang } from '../../utils/ecosystemPreferences';

type RouteHeaderOverride = {
  title: string;
  subtitle: string;
};

const EN_HEADER_OVERRIDES: Record<string, RouteHeaderOverride> = {
  '/kids/first-steps': {
    title: 'First Steps',
    subtitle: 'Color the instrument shapes.',
  },
  '/kids/notes': {
    title: 'Getting to Know the Notes',
    subtitle: `Songs use musical notes. Let's discover them?`,
  },
  '/kids/note-friends': {
    title: 'Notes That Sound Good Together',
    subtitle: 'Some notes like to play together. Want to find out?',
  },
  '/kids/instruments': {
    title: 'Discovering Instruments',
    subtitle: 'Choose instruments and see models in detail.',
  },
  '/kids/workshop': {
    title: 'Discovering Instruments',
    subtitle: 'Choose instruments and see models in detail.',
  },
  '/kids/games': {
    title: 'Music Games',
    subtitle: 'Play, discover instruments, and train your musical memory.',
  },
  '/kids/games/memory': {
    title: 'Memory Game',
    subtitle: 'Find the pairs of instruments.',
  },
  '/kids/games/identify': {
    title: 'Which Instrument Is It?',
    subtitle: 'Look at the image and choose the right instrument.',
  },
  '/kids/games/cables': {
    title: 'Connect the Cables',
    subtitle: 'Match each instrument to the correct description.',
  },
  '/kids/games/rhythm': {
    title: 'Keep the Beat',
    subtitle: 'Tap to the rhythm and watch the character dance!',
  },
  '/kids/build-band': {
    title: 'Build the Band',
    subtitle: 'Choose instruments to create your first band.',
  },
  '/kids/sound-lengths': {
    title: 'Sound Lengths',
    subtitle: 'Discover short sounds, long sounds, and musical rests.',
  },
  '/kids/light-hunt': {
    title: 'Light Hunt',
    subtitle: 'Follow the lights across the musical fretboard.',
  },
  '/kids/custom-shop': {
    title: 'Custom Shop',
    subtitle: 'Create the instrument of your dreams!',
  },
  '/teens/garage': {
    title: 'GARAGE',
    subtitle: 'The GA Teens visual workshop: iconic builds, custom paint and sonic identity experiments.',
  },
  '/teens/garage/evh-frankenstein-tribute': {
    title: 'EVH Frankenstein Tribute',
    subtitle: 'How to create a visual replica inspired by the Red • White • Black phase of the Frankenstein guitar.',
  },
  '/teens/riff-challenges': {
    title: 'Riff Challenges',
    subtitle: 'Listen, memorize, and play back riffs.',
  },
  '/teens/rhythm-lab': {
    title: 'Rhythm Lab',
    subtitle: '3-phase learning system: LISTEN → UNDERSTAND → PLAY',
  },
  '/teens/batidas-populares': {
    title: 'Popular Strumming Patterns',
    subtitle: 'Learn strumming with traditional chord-chart arrows: LISTEN → UNDERSTAND → PLAY',
  },
  '/teens/cuidados-basicos': {
    title: 'Basic Care',
    subtitle: 'Simple habits that make your instrument last much longer.',
  },
  '/teens/scale-hunter': {
    title: 'Scale Hunter',
    subtitle: 'Hunt for fretboard patterns and play musical paths by region.',
  },
  '/teens/chord-builder': {
    title: 'Chord Builder',
    subtitle: 'Build harmonic blocks by feel and prepare for triads, tetrads, and inversions.',
  },
  '/teens/blueprint-reading': {
    title: 'Standard Notation + TAB Reading',
    subtitle: 'Standard notation as a musical map: pitch on the Y axis, time on the X axis, with TAB support.',
  },
};

export const getEcosystemLang = (ecosystem: 'kids' | 'teens'): AppLang => (
  ecosystem === 'kids' ? getKidsLang() : getTeensLang()
);

export const getLocalizedHeaderCopy = (
  ecosystem: 'kids' | 'teens',
  fallbackTitle: string,
  fallbackSubtitle: string,
): RouteHeaderOverride => {
  if (typeof window === 'undefined') {
    return { title: fallbackTitle, subtitle: fallbackSubtitle };
  }

  const lang = getEcosystemLang(ecosystem);
  if (lang !== 'en') {
    return { title: fallbackTitle, subtitle: fallbackSubtitle };
  }

  return EN_HEADER_OVERRIDES[window.location.pathname] ?? { title: fallbackTitle, subtitle: fallbackSubtitle };
};

export const getLocalizedBackLabel = (
  ecosystem: 'kids' | 'teens',
  backPath: string,
  fallbackLabel: string,
): string => {
  const lang = getEcosystemLang(ecosystem);
  if (lang !== 'en') {
    return fallbackLabel;
  }

  switch (backPath) {
    case '/kids':
      return 'Back to Kids';
    case '/kids/games':
      return 'Back to Games';
    case '/kids/notes':
      return 'Back to Notes';
    case '/teens':
      return 'Back to Teens';
    case '/teens/garage':
      return 'Back to Garage';
    case '/ecosystem':
      return 'Back to Ecosystem';
    default:
      return fallbackLabel;
  }
};
