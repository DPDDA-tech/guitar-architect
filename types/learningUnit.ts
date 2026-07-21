export type LearningUnitEditorialStatus = 'draft' | 'experimental' | 'reviewed' | 'stable';
export type LearningUnitVisibility = 'internal' | 'pilot' | 'public';
export type LearningMoment = 'discovery' | 'initiation' | 'fundamentals' | 'consolidation' | 'development' | 'autonomy' | 'pre-professionalization';
export type LearningModality = 'visual' | 'auditory' | 'combined';
export type LearningInteraction = 'observed' | 'moved' | 'played' | 'explored-tool';

export interface LearningCompanionPerspective {
  insight?: string;
  optionalExperiment?: string;
  closing?: string;
}

export interface LearningCompanionLayer {
  alice?: LearningCompanionPerspective;
  arthur?: LearningCompanionPerspective;
}

export interface LearningSourceRef {
  claimId: string;
  sourceIds: string[];
  status: 'verified' | 'experimental' | 'calibration-only';
}

export interface LearningChoice {
  id: string;
  label: string;
  feedback: string;
  expected?: boolean;
}

export interface LearningActivity {
  id: string;
  order: number;
  title: string;
  eyebrow: string;
  estimatedMinutes: [number, number];
  optional: boolean;
  instructions: string[];
  modalities: LearningModality[];
  completionChoices: Array<{ id: string; label: string }>;
}

export interface StudioContextContract {
  tool: 'metronome';
  mode: 'contextual';
  tempoMode: 'user-selectable';
  initialAudio: 'off';
  initialVisualPulse: true;
  restoreLastTempo: true;
  scoring: false;
  recording: false;
  allowFreeExploration: true;
}

export interface LearningUnit {
  id: string;
  version: string;
  contractVersion: string;
  sourceDossierVersion: string;
  editorialStatus: LearningUnitEditorialStatus;
  visibility: LearningUnitVisibility;
  language: 'pt-BR';
  moment: LearningMoment;
  domain: 'rhythm';
  title: string;
  subtitle: string;
  estimatedMinutes: [number, number];
  objective: string;
  opening: string[];
  boundaries: string[];
  activities: LearningActivity[];
  studioContext: StudioContextContract;
  conceptCheck: {
    prompt: string;
    choices: LearningChoice[];
    nonBlocking: true;
  };
  selfRecord: {
    optional: true;
    interactions: Array<{ id: LearningInteraction; label: string }>;
    perceptions: Array<{ id: string; label: string }>;
    nextPreferences: Array<{ id: string; label: string }>;
  };
  accessibility: {
    equivalentEntryModalities: LearningModality[];
    audioRequiresUserAction: true;
    screenReaderRequired: true;
    keyboardRequired: true;
    visualVolumeMeterRequired: false;
  };
  sourceRefs: LearningSourceRef[];
  companionPerspective?: LearningCompanionLayer;
}
