export type ExerciseInstrumentFamily = 'guitar' | 'bass' | 'both';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategory =
  | 'technique'
  | 'scale'
  | 'harmony'
  | 'caged'
  | 'triads'
  | 'arpeggio'
  | 'rhythm'
  | 'bass';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  instrumentFamily: ExerciseInstrumentFamily;
  difficulty: ExerciseDifficulty;
  bpmRange?: {
    min: number;
    max: number;
  };
  tags: string[];
}
