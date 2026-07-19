import type { LearningInteraction } from './learningUnit';

export type MyAcademyPerception = 'clear' | 'sometimes' | 'unclear' | 'no-answer';
export type MyAcademyNextPreference = 'repeat' | 'review' | 'studio' | 'continue';

export interface MyAcademySelfRecord {
  unitId: 'NMC-RIT-001';
  unitVersion: string;
  recordedAt: string;
  declaredByUser: true;
  interaction: LearningInteraction | null;
  perception: MyAcademyPerception | null;
  nextPreference: MyAcademyNextPreference | null;
}

export interface MyAcademySuggestion {
  preference: MyAcademyNextPreference | null;
  title: string;
  explanation: string;
  actionLabel: string;
  destination: '/my-academy/prototype/nmc-rit-001' | '/studio' | '#mapa';
}
