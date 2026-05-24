export type PracticeCategory =
  | 'location'
  | 'intervals'
  | 'scales'
  | 'harmony'
  | 'caged'
  | 'rhythm'
  | 'improvisation'
  | 'technique';

export type PracticeDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'fretboard-master';

export type PracticeFocus =
  | 'ouvido'
  | 'braço'
  | 'tempo'
  | 'técnica'
  | 'harmonia'
  | 'improviso';

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  category: PracticeCategory;
  difficulty: PracticeDifficulty;
  durationMinutes: number;
  focus: PracticeFocus[];
  type: string;
  bpmStart?: number;
  bpmTarget?: number;
  targetCount?: number;
  payload: Record<string, unknown>;
}

export interface PracticeRoutine {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  exerciseIds: string[];
}

export interface PracticeProgress {
  completed: string[];
  bestTimes: Record<string, number>;
  maxBpm: Record<string, number>;
  streak: number;
  practicedMinutes: number;
  lastPracticeDate?: string;
}

const basePayload = (
  action: 'scale' | 'field' | 'triads' | 'progression' | 'startPractice',
  root = 'C',
  scaleType = 'Major (Ionian)',
  extra: Record<string, unknown> = {},
) => ({
  source: 'study-module',
  action,
  root,
  displayRoot: root,
  scaleType,
  tool: action === 'startPractice' ? 'exercises' : undefined,
  forceNewDiagram: true,
  ...extra,
});

export const PRACTICE_EXERCISES: PracticeExercise[] = [
  {
    id: 'find-all-c',
    title: 'Encontrar todas as notas C',
    description: 'Treine reconhecimento instantâneo de uma nota em todo o braço.',
    category: 'location',
    difficulty: 'beginner',
    durationMinutes: 3,
    focus: ['braço'],
    type: 'Localização',
    targetCount: 12,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'findNotes', targetNote: 'C', timeLimitSeconds: 60, highlightTargets: true }),
  },
  {
    id: 'find-tonics',
    title: 'Encontrar todas as tônicas',
    description: 'Localize a tônica da tonalidade em várias cordas e regiões.',
    category: 'location',
    difficulty: 'beginner',
    durationMinutes: 4,
    focus: ['braço', 'harmonia'],
    type: 'Localização',
    targetCount: 10,
    payload: basePayload('startPractice', 'A', 'Natural Minor (Aeolian)', { practiceMode: 'findTonics', targetDegree: '1', timeLimitSeconds: 75 }),
  },
  {
    id: 'find-octaves',
    title: 'Encontrar oitavas',
    description: 'Conecte a mesma nota em regiões diferentes do instrumento.',
    category: 'intervals',
    difficulty: 'beginner',
    durationMinutes: 4,
    focus: ['braço', 'ouvido'],
    type: 'Intervalos',
    targetCount: 8,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'octaves', intervals: [0, 12], timeLimitSeconds: 75 }),
  },
  {
    id: 'interval-fifths',
    title: 'Quintas justas no braço',
    description: 'Encontre quintas a partir de tônicas distribuídas pelo fretboard.',
    category: 'intervals',
    difficulty: 'intermediate',
    durationMinutes: 5,
    focus: ['braço', 'ouvido'],
    type: 'Intervalos',
    targetCount: 8,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'intervalTargets', intervals: [0, 7], timeLimitSeconds: 90 }),
  },
  {
    id: 'major-scale-position',
    title: 'Escala maior em posição única',
    description: 'Aplique a escala maior em uma região antes de conectar o braço inteiro.',
    category: 'scales',
    difficulty: 'beginner',
    durationMinutes: 5,
    focus: ['braço', 'tempo'],
    type: 'Escala',
    bpmStart: 72,
    bpmTarget: 96,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'scaleBpm', fretWindow: [5, 8], bpm: 72 }),
  },
  {
    id: 'minor-pentatonic-a',
    title: 'Pentatônica menor de A',
    description: 'Use uma pentatônica musical e conecte notas-alvo com metrônomo.',
    category: 'scales',
    difficulty: 'beginner',
    durationMinutes: 5,
    focus: ['braço', 'tempo', 'improviso'],
    type: 'Escala',
    bpmStart: 76,
    bpmTarget: 108,
    payload: basePayload('startPractice', 'A', 'Pentatonic Minor', { practiceMode: 'scaleBpm', bpm: 76 }),
  },
  {
    id: 'ii-v-i-c',
    title: 'II-V-I em C',
    description: 'Pratique resolução harmônica com Dm, G e C.',
    category: 'harmony',
    difficulty: 'intermediate',
    durationMinutes: 5,
    focus: ['harmonia', 'tempo'],
    type: 'Progressão',
    bpmStart: 80,
    bpmTarget: 110,
    payload: basePayload('progression', 'C', 'Major (Ionian)', { progression: 'ii - V - I', chords: ['Dm', 'G', 'C'], practiceMode: 'progression', bpm: 80 }),
  },
  {
    id: 'pop-progression-c',
    title: 'I-V-vi-IV em C',
    description: 'Treine uma progressão essencial com foco em condução e tempo.',
    category: 'harmony',
    difficulty: 'beginner',
    durationMinutes: 5,
    focus: ['harmonia', 'tempo'],
    type: 'Progressão',
    bpmStart: 78,
    bpmTarget: 112,
    payload: basePayload('progression', 'C', 'Major (Ionian)', { progression: 'I - V - vi - IV', chords: ['C', 'G', 'Am', 'F'], bpm: 78 }),
  },
  {
    id: 'caged-connect-shapes',
    title: 'Conectar shapes CAGED',
    description: 'Navegue entre duas regiões CAGED usando tônicas e notas comuns.',
    category: 'caged',
    difficulty: 'intermediate',
    durationMinutes: 6,
    focus: ['braço', 'harmonia'],
    type: 'CAGED',
    bpmStart: 70,
    bpmTarget: 96,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'cagedConnection', cagedAction: 'CONNECT_CAGED_REGIONS', shapeSequence: ['C', 'A', 'G', 'E', 'D'], bpm: 70 }),
  },
  {
    id: 'caged-find-shape-a',
    title: 'Complete o shape A',
    description: 'Localize tônica, tríade e escala dentro de um shape móvel.',
    category: 'caged',
    difficulty: 'intermediate',
    durationMinutes: 5,
    focus: ['braço', 'harmonia'],
    type: 'CAGED',
    targetCount: 7,
    payload: basePayload('startPractice', 'D', 'Major (Ionian)', { practiceMode: 'cagedShape', shape: 'A', targetCount: 7 }),
  },
  {
    id: 'sincronia-zero',
    title: 'Sincronia Zero',
    description: 'Escolha qualquer corda. Toque uma nota por clique do metrônomo, mantendo regularidade e relaxamento.',
    category: 'rhythm',
    difficulty: 'beginner',
    durationMinutes: 3,
    focus: ['tempo'],
    type: 'Ritmo',
    bpmStart: 60,
    bpmTarget: 80,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'rhythm', subdivision: 'quarters', quickTab: 'visual' }),
  },
  {
    id: 'quarter-notes-metronome',
    title: 'Semínimas com metrônomo',
    description: 'Toque notas simples com regularidade e ataque consistente.',
    category: 'rhythm',
    difficulty: 'beginner',
    durationMinutes: 3,
    focus: ['tempo'],
    type: 'Ritmo',
    bpmStart: 70,
    bpmTarget: 100,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'rhythm', subdivision: 'quarters', bpm: 70 }),
  },
  {
    id: 'eighth-note-alternation',
    title: 'Alternância em colcheias',
    description: 'Estude fluxo contínuo com palhetada alternada e metrônomo.',
    category: 'rhythm',
    difficulty: 'intermediate',
    durationMinutes: 4,
    focus: ['tempo', 'técnica'],
    type: 'Ritmo',
    bpmStart: 76,
    bpmTarget: 116,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'rhythm', subdivision: 'eighths', picking: 'alternate', bpm: 76 }),
  },
  {
    id: 'call-response-three-notes',
    title: 'Call & response: 3 notas',
    description: 'Ouça/visualize uma frase curta e responda com variação.',
    category: 'improvisation',
    difficulty: 'intermediate',
    durationMinutes: 5,
    focus: ['ouvido', 'improviso'],
    type: 'Improviso',
    bpmStart: 72,
    bpmTarget: 96,
    payload: basePayload('startPractice', 'A', 'Pentatonic Minor', { practiceMode: 'callResponse', phraseLength: 3, bpm: 72 }),
  },
  {
    id: 'target-note-per-chord',
    title: 'Alvo por acorde',
    description: 'Resolva frases em notas-alvo enquanto a progressão muda.',
    category: 'improvisation',
    difficulty: 'advanced',
    durationMinutes: 6,
    focus: ['improviso', 'harmonia'],
    type: 'Improviso',
    bpmStart: 76,
    bpmTarget: 108,
    payload: basePayload('progression', 'C', 'Major (Ionian)', { progression: 'ii - V - I', chords: ['Dm', 'G', 'C'], practiceMode: 'targetNotes', targetDegrees: ['3', '7'], bpm: 76 }),
  },
  {
    id: 'alternate-picking-one-string',
    title: 'Alternate Picking: uma corda',
    description: 'Controle direção da palheta em uma única corda antes de cruzar cordas.',
    category: 'technique',
    difficulty: 'beginner',
    durationMinutes: 4,
    focus: ['técnica', 'tempo'],
    type: 'Técnica',
    bpmStart: 72,
    bpmTarget: 120,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'alternatePicking', strings: [0], picking: 'alternate', bpm: 72 }),
  },
  {
    id: 'alternate-picking-crossing',
    title: 'Alternate Picking: crossing',
    description: 'Cruze cordas mantendo ataque regular e movimento pequeno.',
    category: 'technique',
    difficulty: 'intermediate',
    durationMinutes: 5,
    focus: ['técnica', 'tempo'],
    type: 'Técnica',
    bpmStart: 68,
    bpmTarget: 112,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'alternatePicking', crossing: true, strings: [2, 1, 0], bpm: 68 }),
  },
  {
    id: 'inside-outside-picking',
    title: 'Inside / Outside Picking',
    description: 'Compare ataques internos e externos entre duas cordas.',
    category: 'technique',
    difficulty: 'advanced',
    durationMinutes: 6,
    focus: ['técnica', 'tempo'],
    type: 'Técnica',
    bpmStart: 62,
    bpmTarget: 104,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'insideOutsidePicking', strings: [1, 0], bpm: 62 }),
  },
  {
    id: 'spider-1234',
    title: 'Spider 1234',
    description: 'Padrão clássico de independência e coordenação entre dedos.',
    category: 'technique',
    difficulty: 'beginner',
    durationMinutes: 5,
    focus: ['técnica', 'tempo'],
    type: 'Spider',
    bpmStart: 60,
    bpmTarget: 96,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'spider', pattern: '1234', bpm: 60 }),
  },
  {
    id: 'spider-1324',
    title: 'Spider 1324',
    description: 'Quebre automatismos da mão esquerda com permutação controlada.',
    category: 'technique',
    difficulty: 'intermediate',
    durationMinutes: 5,
    focus: ['técnica', 'tempo'],
    type: 'Spider',
    bpmStart: 56,
    bpmTarget: 92,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'spider', pattern: '1324', bpm: 56 }),
  },
  {
    id: 'legato-basics',
    title: 'Legato Basics',
    description: 'Hammer-on e pull-off com volume equilibrado e sem tensão.',
    category: 'technique',
    difficulty: 'beginner',
    durationMinutes: 4,
    focus: ['técnica'],
    type: 'Legato',
    bpmStart: 64,
    bpmTarget: 96,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'legato', articulation: ['hammer-on', 'pull-off'], bpm: 64 }),
  },
  {
    id: 'speed-builder',
    title: 'Speed Builder',
    description: 'Aumente BPM em pequenos passos mantendo som limpo.',
    category: 'technique',
    difficulty: 'advanced',
    durationMinutes: 8,
    focus: ['técnica', 'tempo'],
    type: 'Velocidade',
    bpmStart: 80,
    bpmTarget: 132,
    payload: basePayload('startPractice', 'C', 'Major (Ionian)', { practiceMode: 'speedBuilder', autoBpmIncrease: true, bpmStep: 5, bpm: 80 }),
  },
];

export const PRACTICE_ROUTINES: PracticeRoutine[] = [
  {
    id: 'routine-15',
    title: 'Rotina 15 min',
    description: 'Localização, escala, ritmo e harmonia em ciclo curto.',
    durationMinutes: 15,
    exerciseIds: ['find-all-c', 'major-scale-position', 'quarter-notes-metronome', 'ii-v-i-c'],
  },
  {
    id: 'routine-speed',
    title: 'Rotina velocidade',
    description: 'Coordenação, palhetada alternada, spider e speed builder.',
    durationMinutes: 20,
    exerciseIds: ['alternate-picking-one-string', 'alternate-picking-crossing', 'spider-1234', 'speed-builder'],
  },
  {
    id: 'routine-improv',
    title: 'Rotina improviso',
    description: 'Pentatônica, call & response, alvos e CAGED.',
    durationMinutes: 18,
    exerciseIds: ['minor-pentatonic-a', 'call-response-three-notes', 'target-note-per-chord', 'caged-connect-shapes'],
  },
  {
    id: 'routine-endurance',
    title: 'Rotina resistência',
    description: 'Ritmo, colcheias, legato e controle contínuo.',
    durationMinutes: 18,
    exerciseIds: ['eighth-note-alternation', 'legato-basics', 'spider-1324', 'speed-builder'],
  },
];

export const DEFAULT_PRACTICE_PROGRESS: PracticeProgress = {
  completed: [],
  bestTimes: {},
  maxBpm: {},
  streak: 0,
  practicedMinutes: 0,
};
