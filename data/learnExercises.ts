import type { LearnAction } from './learnModules';

export type ExerciseDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export type ExerciseCategory =
  | 'coordination'
  | 'rhythm'
  | 'scale'
  | 'interval'
  | 'technique'
  | 'legato'
  | 'picking';

export interface LearnExercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  bpm?: number;
  notes?: string[];
  intervals?: number[];
  strings?: number[];
  actions?: LearnAction[];
}

export const LEARN_EXERCISES: LearnExercise[] = [
  {
    id: 'single-string-major-c',
    title: 'Escala maior em uma corda',
    description: 'Estudo horizontal para enxergar intervalos sem depender de desenhos verticais.',
    category: 'scale',
    difficulty: 'beginner',
    bpm: 70,
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    strings: [0],
  },
  {
    id: 'single-string-descending',
    title: 'Descida horizontal controlada',
    description: 'Retorno pela mesma corda para reforçar localização, direção e tônica.',
    category: 'scale',
    difficulty: 'beginner',
    bpm: 66,
    notes: ['C', 'B', 'A', 'G', 'F', 'E', 'D', 'C'],
    intervals: [12, 11, 9, 7, 5, 4, 2, 0],
    strings: [0],
  },
  {
    id: 'chromatic-1234',
    title: 'Cromático 1-2-3-4',
    description: 'Padrão mecânico básico para coordenação entre dedos e palhetada alternada.',
    category: 'coordination',
    difficulty: 'beginner',
    bpm: 60,
    intervals: [0, 1, 2, 3],
    strings: [5, 4, 3, 2, 1, 0],
  },
  {
    id: 'chromatic-1324',
    title: 'Cromático 1-3-2-4',
    description: 'Variação de independência para quebrar automatismos da mão esquerda.',
    category: 'coordination',
    difficulty: 'intermediate',
    bpm: 58,
    intervals: [0, 2, 1, 3],
    strings: [5, 4, 3, 2, 1, 0],
  },
  {
    id: 'diatonic-degrees-c',
    title: 'Graus diatônicos em C',
    description: 'Estudo de tonalidade com graus e tônica como pontos de referência.',
    category: 'scale',
    difficulty: 'beginner',
    bpm: 76,
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: 'rhythm-subdivision-ladder',
    title: 'Escada de subdivisões',
    description: 'Mesmo material melódico tocado em semínimas, colcheias, tercinas e semicolcheias.',
    category: 'rhythm',
    difficulty: 'intermediate',
    bpm: 72,
    notes: ['C', 'D', 'E', 'F'],
    intervals: [0, 2, 4, 5],
  },
  {
    id: 'thirds-c-major',
    title: 'Escala em terças',
    description: 'Sequência intervalar para estudar a escala como relação entre notas.',
    category: 'interval',
    difficulty: 'intermediate',
    bpm: 72,
    notes: ['C', 'E', 'D', 'F', 'E', 'G', 'F', 'A'],
    intervals: [0, 4, 2, 5, 4, 7, 5, 9],
  },
  {
    id: 'fourths-c-major',
    title: 'Escala em quartas',
    description: 'Estudo intervalar para abrir o ouvido e quebrar linearidade excessiva.',
    category: 'interval',
    difficulty: 'intermediate',
    bpm: 68,
    notes: ['C', 'F', 'D', 'G', 'E', 'A', 'F', 'B'],
    intervals: [0, 5, 2, 7, 4, 9, 5, 11],
  },
  {
    id: 'tremolo-four-repeats',
    title: 'Tremolo com quatro repetições',
    description: 'Controle de ataque e constância rítmica antes de aumentar velocidade.',
    category: 'picking',
    difficulty: 'intermediate',
    bpm: 84,
    notes: ['C', 'C', 'C', 'C', 'D', 'D', 'D', 'D'],
    strings: [1],
  },
  {
    id: 'legato-basic-ho-po',
    title: 'Hammer-on e pull-off básico',
    description: 'Sequência curta para legato limpo sem excesso de força.',
    category: 'legato',
    difficulty: 'beginner',
    bpm: 64,
    intervals: [0, 2, 4, 2, 0],
    strings: [0],
  },
  {
    id: 'muting-control-two-strings',
    title: 'Controle de ruído em duas cordas',
    description: 'Alternância entre cordas com atenção ao abafamento e limpeza sonora.',
    category: 'technique',
    difficulty: 'intermediate',
    bpm: 66,
    notes: ['E', 'G', 'A', 'C'],
    strings: [1, 0],
  },
  {
    id: 'picking-comparison-arpeggio',
    title: 'Alternate vs sweep em arpejo',
    description: 'Comparação técnica para perceber direção, economia de movimento e clareza.',
    category: 'picking',
    difficulty: 'advanced',
    bpm: 62,
    notes: ['C', 'E', 'G', 'C'],
    intervals: [0, 4, 7, 12],
    strings: [3, 2, 1, 0],
  },
];
