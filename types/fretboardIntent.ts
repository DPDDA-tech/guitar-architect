export type FretboardIntentSource =
  | 'learn'
  | 'practice'
  | 'chords'
  | 'caged'
  | 'triads-tetrads'
  | 'triad-trainer'
  | 'greek-modes'
  | 'harmonic-cycle'
  | 'study-module'
  | 'teens-riff'
  | 'teens-scale'
  | 'teens-chord'
  | 'teens-rhythm'
  | 'teens-blueprint'
  | 'legacy';

export type FretboardIntentAction =
  | 'showScale'
  | 'showHarmonyField'
  | 'showTriads'
  | 'showProgression'
  | 'openTool'
  | 'startPractice'
  | 'scale'
  | 'field'
  | 'triads'
  | 'progression';

export type FretboardIntentTool = 'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes';
export type FretboardIntentTab = 'visual' | 'scale' | 'harmony' | 'tools' | 'chords';
export type FretboardIntentHarmonyMode = 'OFF' | 'TRIADS' | 'TETRADS';
export type FretboardIntentActiveEngine = 'scale' | 'caged' | 'harmony' | 'triadTetrad' | 'trainer' | 'off';

export interface FretboardIntentInstruction {
  title?: string;
  description: string;
  hint?: string;
  source?: 'learn' | 'practice' | 'exercise' | 'system' | string;
  durationMs?: number;
  persistent?: boolean;
}

export interface FretboardIntent {
  version: 1;
  source: FretboardIntentSource;
  action: FretboardIntentAction;
  root: string;
  scaleType: string;
  createdAt: string;
  displayRoot?: string;
  moduleTitle?: string;
  moduleLabel?: string;
  targetTab?: FretboardIntentTab;
  tool?: FretboardIntentTool;
  bpm?: number;
  progression?: string | { name?: string; chords?: string[] };
  chords?: string[];
  harmonyMode?: FretboardIntentHarmonyMode;
  activeEngine?: FretboardIntentActiveEngine;
  chordQuality?: string;
  chordDegree?: number;
  inversion?: number;
  voicingMode?: string;
  practiceExerciseId?: string;
  instruction?: FretboardIntentInstruction;
  focusFirstRegion?: boolean;
  region?: { focusFirstRegion?: boolean; startFret?: number; endFret?: number };
  caged?: {
    cagedAction?: string;
    shape?: string;
    shapeSequence?: string[];
    overlays?: string[];
    fullNeck?: boolean;
    horizontalConnection?: boolean;
    [key: string]: unknown;
  };
  extras?: Record<string, unknown>;
  [key: string]: unknown;
}
