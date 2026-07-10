export type FingerExerciseCategory = 'chromatic' | 'pairs' | 'triads' | 'spider' | 'fixed' | 'stretch';

export interface FingerExerciseDefinition {
  id: string;
  category: FingerExerciseCategory;
  name: { pt: string; en: string };
  description: { pt: string; en: string };
  fingerOrder: number[];
  fretOffsets?: number[];
  heldFingers?: number[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export const FINGER_EXERCISE_CATEGORIES: Array<{ id: FingerExerciseCategory; label: { pt: string; en: string } }> = [
  { id: 'chromatic', label: { pt: 'Cromatismos', en: 'Chromatics' } },
  { id: 'pairs', label: { pt: 'Pares', en: 'Pairs' } },
  { id: 'triads', label: { pt: 'Trincas', en: 'Triads' } },
  { id: 'spider', label: { pt: 'Spider', en: 'Spider' } },
  { id: 'fixed', label: { pt: 'Dedos Fixos', en: 'Fixed Fingers' } },
  { id: 'stretch', label: { pt: 'Alongamentos', en: 'Stretches' } },
];

// A region always spans 4 frets (one per finger, offset 0-3 from its start
// fret) so finger-to-fret mapping stays consistent wherever the user starts
// on the neck. The start fret is a free numeric control rather than a fixed
// preset list, which is the simplest way to support "any region of the neck"
// without enumerating presets.
export const REGION_SPAN_FRETS = 4;
export const MIN_START_FRET = 1;
export const MAX_START_FRET = 17;
export const DEFAULT_START_FRET = 1;

export interface FingerExerciseRegion {
  startFret: number;
  endFret: number;
}

export const buildRegionFromStartFret = (startFret: number): FingerExerciseRegion => ({
  startFret,
  endFret: startFret + REGION_SPAN_FRETS - 1,
});

export const FINGER_EXERCISE_CATALOG: FingerExerciseDefinition[] = [
  // Cromatismos
  {
    id: 'chromatic-1234',
    category: 'chromatic',
    name: { pt: '1-2-3-4', en: '1-2-3-4' },
    description: {
      pt: 'Sequência ascendente clássica. Trabalha coordenação e consistência rítmica entre os quatro dedos.',
      en: 'Classic ascending sequence. Builds coordination and rhythmic consistency across all four fingers.',
    },
    fingerOrder: [1, 2, 3, 4],
    difficulty: 1,
  },
  {
    id: 'chromatic-4321',
    category: 'chromatic',
    name: { pt: '4-3-2-1', en: '4-3-2-1' },
    description: {
      pt: 'Sequência descendente. Inverte o padrão para reforçar independência do mínimo e do anelar.',
      en: 'Descending sequence. Reverses the pattern to reinforce independence of the pinky and ring finger.',
    },
    fingerOrder: [4, 3, 2, 1],
    difficulty: 2,
  },
  {
    id: 'chromatic-1324',
    category: 'chromatic',
    name: { pt: '1-3-2-4', en: '1-3-2-4' },
    description: {
      pt: 'Padrão alternado que exige mais controle e antecipação entre os dedos.',
      en: 'Alternating pattern that demands more control and anticipation between fingers.',
    },
    fingerOrder: [1, 3, 2, 4],
    difficulty: 3,
  },
  {
    id: 'chromatic-1423',
    category: 'chromatic',
    name: { pt: '1-4-2-3', en: '1-4-2-3' },
    description: {
      pt: 'Padrão alternado avançado, ótimo para quebrar movimentos automáticos e treinar independência real.',
      en: 'Advanced alternating pattern, great for breaking automatic movement and training real independence.',
    },
    fingerOrder: [1, 4, 2, 3],
    difficulty: 3,
  },

  // Pares
  {
    id: 'pairs-12',
    category: 'pairs',
    name: { pt: '1-2', en: '1-2' },
    description: {
      pt: 'Fortalece a abertura e a independência entre indicador e médio.',
      en: 'Strengthens the opening and independence between index and middle finger.',
    },
    fingerOrder: [1, 2],
    difficulty: 1,
  },
  {
    id: 'pairs-13',
    category: 'pairs',
    name: { pt: '1-3', en: '1-3' },
    description: {
      pt: 'Trabalha o salto entre indicador e anelar, pulando o médio.',
      en: 'Trains the jump between index and ring finger, skipping the middle finger.',
    },
    fingerOrder: [1, 3],
    difficulty: 2,
  },
  {
    id: 'pairs-14',
    category: 'pairs',
    name: { pt: '1-4', en: '1-4' },
    description: {
      pt: 'Maior abertura entre indicador e mínimo. Bom para alcance e estabilidade.',
      en: 'Wider stretch between index and pinky. Good for reach and stability.',
    },
    fingerOrder: [1, 4],
    difficulty: 3,
  },
  {
    id: 'pairs-23',
    category: 'pairs',
    name: { pt: '2-3', en: '2-3' },
    description: {
      pt: 'Independência entre médio e anelar, um dos pares mais difíceis de separar.',
      en: 'Independence between middle and ring finger, one of the hardest pairs to separate.',
    },
    fingerOrder: [2, 3],
    difficulty: 3,
  },
  {
    id: 'pairs-24',
    category: 'pairs',
    name: { pt: '2-4', en: '2-4' },
    description: {
      pt: 'Fortalece o médio em conjunto com o mínimo.',
      en: 'Strengthens the middle finger together with the pinky.',
    },
    fingerOrder: [2, 4],
    difficulty: 3,
  },
  {
    id: 'pairs-34',
    category: 'pairs',
    name: { pt: '3-4', en: '3-4' },
    description: {
      pt: 'Independência entre anelar e mínimo, par naturalmente mais conectado.',
      en: 'Independence between ring finger and pinky, a naturally more connected pair.',
    },
    fingerOrder: [3, 4],
    difficulty: 2,
  },

  // Trincas
  {
    id: 'triads-123',
    category: 'triads',
    name: { pt: '1-2-3', en: '1-2-3' },
    description: {
      pt: 'Controle de grupo com os três primeiros dedos, preparando o mínimo para entrar depois.',
      en: 'Group control with the first three fingers, preparing the pinky to join afterwards.',
    },
    fingerOrder: [1, 2, 3],
    difficulty: 2,
  },
  {
    id: 'triads-124',
    category: 'triads',
    name: { pt: '1-2-4', en: '1-2-4' },
    description: {
      pt: 'Pula o anelar, exigindo mais precisão do mínimo dentro do grupo.',
      en: 'Skips the ring finger, demanding more precision from the pinky within the group.',
    },
    fingerOrder: [1, 2, 4],
    difficulty: 3,
  },
  {
    id: 'triads-134',
    category: 'triads',
    name: { pt: '1-3-4', en: '1-3-4' },
    description: {
      pt: 'Pula o médio, trabalhando coordenação entre indicador, anelar e mínimo.',
      en: 'Skips the middle finger, training coordination between index, ring finger and pinky.',
    },
    fingerOrder: [1, 3, 4],
    difficulty: 3,
  },
  {
    id: 'triads-234',
    category: 'triads',
    name: { pt: '2-3-4', en: '2-3-4' },
    description: {
      pt: 'Grupo dos três últimos dedos, o trio mais difícil de controlar de forma independente.',
      en: 'The last three fingers as a group, the hardest trio to control independently.',
    },
    fingerOrder: [2, 3, 4],
    difficulty: 4,
  },

  // Spider
  {
    id: 'spider-1234-basic',
    category: 'spider',
    name: { pt: '1-2-3-4 (básico)', en: '1-2-3-4 (basic)' },
    description: {
      pt: 'Versão básica do clássico exercício spider: percorre o padrão 1-2-3-4 corda a corda, treinando troca de cordas e limpeza de execução.',
      en: 'Basic version of the classic spider exercise: walks the 1-2-3-4 pattern string by string, training string changes and clean execution.',
    },
    fingerOrder: [1, 2, 3, 4],
    difficulty: 3,
  },

  // Dedos Fixos
  {
    id: 'fixed-move12-hold34',
    category: 'fixed',
    name: { pt: 'Mover 1-2 mantendo 3-4', en: 'Move 1-2 holding 3-4' },
    description: {
      pt: 'Mantenha os dedos 3 e 4 pressionados enquanto os dedos 1 e 2 se movem. Trabalha independência real e reduz movimentos involuntários.',
      en: 'Keep fingers 3 and 4 pressed down while fingers 1 and 2 move. Trains real independence and reduces involuntary movement.',
    },
    fingerOrder: [1, 2],
    heldFingers: [3, 4],
    difficulty: 4,
  },
  {
    id: 'fixed-move23-hold14',
    category: 'fixed',
    name: { pt: 'Mover 2-3 mantendo 1-4', en: 'Move 2-3 holding 1-4' },
    description: {
      pt: 'Mantenha os dedos 1 e 4 pressionados enquanto os dedos 2 e 3 se movem entre eles. Excelente para controle muscular fino.',
      en: 'Keep fingers 1 and 4 pressed down while fingers 2 and 3 move between them. Excellent for fine muscular control.',
    },
    fingerOrder: [2, 3],
    heldFingers: [1, 4],
    difficulty: 5,
  },
  {
    id: 'fixed-move34-hold12',
    category: 'fixed',
    name: { pt: 'Mover 3-4 mantendo 1-2', en: 'Move 3-4 holding 1-2' },
    description: {
      pt: 'Mantenha os dedos 1 e 2 pressionados enquanto os dedos 3 e 4 se movem. Foca no controle do anelar e do mínimo.',
      en: 'Keep fingers 1 and 2 pressed down while fingers 3 and 4 move. Focuses on control of the ring finger and pinky.',
    },
    fingerOrder: [3, 4],
    heldFingers: [1, 2],
    difficulty: 4,
  },

  // Alongamentos
  {
    id: 'stretch-1-4',
    category: 'stretch',
    name: { pt: '1-4', en: '1-4' },
    description: {
      pt: 'Alongamento máximo entre indicador e mínimo dentro da região, trabalhando alcance e flexibilidade.',
      en: 'Maximum stretch between index and pinky within the region, training reach and flexibility.',
    },
    fingerOrder: [1, 4],
    fretOffsets: [0, 3],
    difficulty: 4,
  },
  {
    id: 'stretch-1-3-4',
    category: 'stretch',
    name: { pt: '1-3-4', en: '1-3-4' },
    description: {
      pt: 'Alongamento progressivo passando pelo anelar antes do mínimo.',
      en: 'Progressive stretch passing through the ring finger before the pinky.',
    },
    fingerOrder: [1, 3, 4],
    fretOffsets: [0, 2, 3],
    difficulty: 4,
  },
  {
    id: 'stretch-1-2-4',
    category: 'stretch',
    name: { pt: '1-2-4', en: '1-2-4' },
    description: {
      pt: 'Alongamento progressivo passando pelo médio antes do mínimo.',
      en: 'Progressive stretch passing through the middle finger before the pinky.',
    },
    fingerOrder: [1, 2, 4],
    fretOffsets: [0, 1, 3],
    difficulty: 4,
  },
];

export const getFingerExercisesByCategory = (category: FingerExerciseCategory): FingerExerciseDefinition[] =>
  FINGER_EXERCISE_CATALOG.filter((exercise) => exercise.category === category);
