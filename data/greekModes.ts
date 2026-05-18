export interface GreekModeInfo {
  id: string;
  order: number;
  name: string;
  parentDegree: string;
  formula: string;
  notesInC: string;
  characteristic: string;
  characteristicInterval: string;
  avoidNote: string;
  chord: string;
  feeling: string;
  usage: string;
  references: string[];
  badges: string[];
  root: string;
  scaleType: string;
  progression: string[];
  cagedShape: string;
  colorClass: string;
}

export interface ModalProgression {
  id: string;
  modeId: string;
  title: string;
  key: string;
  chords: string[];
  description: string;
}

export interface ModalBackingTrack {
  id: string;
  title: string;
  modeId: string;
  key: string;
  bpm: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
}

export const GREEK_MODES: GreekModeInfo[] = [
  {
    id: 'ionian',
    order: 1,
    name: 'Jônio',
    parentDegree: 'I grau',
    formula: '1 2 3 4 5 6 7',
    notesInC: 'C D E F G A B',
    characteristic: 'Maior natural',
    characteristicInterval: '3 maior e 7 maior',
    avoidNote: '4 sobre acorde maj7, quando competir com a terça',
    chord: 'Cmaj7',
    feeling: 'brilhante / estável',
    usage: 'bases maiores, temas resolvidos, pop, rock e jazz tonal',
    references: ['canções em tom maior', 'temas pop estáveis', 'jazz tonal'],
    badges: ['Essential', 'Jazz'],
    root: 'C',
    scaleType: 'Major (Ionian)',
    progression: ['Cmaj7', 'Fmaj7', 'G7', 'Cmaj7'],
    cagedShape: 'C',
    colorClass: 'from-blue-500/24 to-cyan-400/12',
  },
  {
    id: 'dorian',
    order: 2,
    name: 'Dórico',
    parentDegree: 'II grau',
    formula: '1 2 b3 4 5 6 b7',
    notesInC: 'D E F G A B C',
    characteristic: 'menor com sexta maior',
    characteristicInterval: '6 maior',
    avoidNote: 'evitar repousar demais na 4 se o acorde pedir clareza de terça',
    chord: 'Dm7',
    feeling: 'moderno / fusion',
    usage: 'fusion, jazz, funk, rock moderno e vamps menores sofisticados',
    references: ['Santana', 'Pink Floyd', 'jam tracks fusion'],
    badges: ['Essential', 'Fusion'],
    root: 'D',
    scaleType: 'Dorian',
    progression: ['Dm7', 'G7'],
    cagedShape: 'A',
    colorClass: 'from-violet-500/24 to-blue-400/12',
  },
  {
    id: 'phrygian',
    order: 3,
    name: 'Frígio',
    parentDegree: 'III grau',
    formula: '1 b2 b3 4 5 b6 b7',
    notesInC: 'E F G A B C D',
    characteristic: 'menor com segunda menor',
    characteristicInterval: 'b2',
    avoidNote: 'b2 precisa de intenção, pois cria tensão imediata',
    chord: 'Em7sus(b9)',
    feeling: 'espanhol / sombrio',
    usage: 'metal, flamenco, rock pesado e vamps escuros',
    references: ['metal modal', 'frases espanholas', 'riffs escuros'],
    badges: ['Metal'],
    root: 'E',
    scaleType: 'Phrygian',
    progression: ['Em', 'F'],
    cagedShape: 'G',
    colorClass: 'from-rose-500/22 to-orange-400/12',
  },
  {
    id: 'lydian',
    order: 4,
    name: 'Lídio',
    parentDegree: 'IV grau',
    formula: '1 2 3 #4 5 6 7',
    notesInC: 'F G A B C D E',
    characteristic: 'maior com quarta aumentada',
    characteristicInterval: '#4',
    avoidNote: 'quase não há avoid clássico; a #4 é a cor',
    chord: 'Fmaj7#11',
    feeling: 'flutuante / cinematográfico',
    usage: 'cinema, fusion, ambient, temas abertos e acordes maj7#11',
    references: ['trilhas cinematográficas', 'fusion moderno', 'ambient guitar'],
    badges: ['Cinematic', 'Fusion'],
    root: 'F',
    scaleType: 'Lydian',
    progression: ['Cmaj7', 'D'],
    cagedShape: 'E',
    colorClass: 'from-cyan-500/24 to-emerald-400/12',
  },
  {
    id: 'mixolydian',
    order: 5,
    name: 'Mixolídio',
    parentDegree: 'V grau',
    formula: '1 2 3 4 5 6 b7',
    notesInC: 'G A B C D E F',
    characteristic: 'dominante modal',
    characteristicInterval: 'b7',
    avoidNote: '4 contra a terça maior pode soar suspensa demais',
    chord: 'G7',
    feeling: 'dominante / blues',
    usage: 'blues, rock clássico, country, funk e dominantes estáticos',
    references: ['blues rock', 'country licks', 'dominante vamp'],
    badges: ['Essential', 'Jazz'],
    root: 'G',
    scaleType: 'Mixolydian',
    progression: ['G7'],
    cagedShape: 'E',
    colorClass: 'from-amber-500/24 to-blue-400/12',
  },
  {
    id: 'aeolian',
    order: 6,
    name: 'Eólio',
    parentDegree: 'VI grau',
    formula: '1 2 b3 4 5 b6 b7',
    notesInC: 'A B C D E F G',
    characteristic: 'menor natural',
    characteristicInterval: 'b6',
    avoidNote: 'b6 pode pesar se a harmonia pedir dórico',
    chord: 'Am7',
    feeling: 'melancólico / menor natural',
    usage: 'rock menor, baladas, pop menor e progressões naturais',
    references: ['rock menor', 'pop melancólico', 'baladas modais'],
    badges: ['Essential'],
    root: 'A',
    scaleType: 'Natural Minor (Aeolian)',
    progression: ['Am', 'G', 'F', 'G'],
    cagedShape: 'A',
    colorClass: 'from-slate-500/26 to-violet-400/12',
  },
  {
    id: 'locrian',
    order: 7,
    name: 'Lócrio',
    parentDegree: 'VII grau',
    formula: '1 b2 b3 4 b5 b6 b7',
    notesInC: 'B C D E F G A',
    characteristic: 'diminuto modal',
    characteristicInterval: 'b5 e b2',
    avoidNote: 'modo inteiro é instável; use como tensão e passagem',
    chord: 'Bm7(b5)',
    feeling: 'instável / tenso',
    usage: 'meio-diminutos, passagens tensas, jazz e resolução para I',
    references: ['jazz menor', 'passagens cromáticas', 'tensão pré-resolução'],
    badges: ['Jazz', 'Advanced'],
    root: 'B',
    scaleType: 'Locrian',
    progression: ['Bm7b5', 'Cmaj7'],
    cagedShape: 'D',
    colorClass: 'from-zinc-500/26 to-red-400/10',
  },
];

export const MODAL_PROGRESSIONS: ModalProgression[] = [
  { id: 'dorian-vamp', modeId: 'dorian', title: 'Dórico: Dm7 -> G7', key: 'D', chords: ['Dm7', 'G7'], description: 'A 6 maior aparece como cor moderna dentro do vamp menor.' },
  { id: 'lydian-vamp', modeId: 'lydian', title: 'Lídio: Cmaj7 -> D', key: 'C', chords: ['Cmaj7', 'D'], description: 'O acorde D evidencia a #4 lidia sobre C.' },
  { id: 'mixolydian-vamp', modeId: 'mixolydian', title: 'Mixolídio: G7 vamp', key: 'G', chords: ['G7'], description: 'Dominante estático para blues, funk e rock.' },
  { id: 'phrygian-vamp', modeId: 'phrygian', title: 'Frígio: Em -> F', key: 'E', chords: ['Em', 'F'], description: 'O b2 aparece de forma direta e dramática.' },
];

export const MODAL_BACKING_TRACKS: ModalBackingTrack[] = [
  { id: 'fusion-dorian', title: 'Fusion Dórico', modeId: 'dorian', key: 'D', bpm: 92, difficulty: 'Intermediário' },
  { id: 'rock-mixolydian', title: 'Rock Mixolídio', modeId: 'mixolydian', key: 'G', bpm: 104, difficulty: 'Iniciante' },
  { id: 'cinematic-lydian', title: 'Cinematic Lídio', modeId: 'lydian', key: 'C', bpm: 76, difficulty: 'Intermediário' },
  { id: 'metal-phrygian', title: 'Metal Frígio', modeId: 'phrygian', key: 'E', bpm: 118, difficulty: 'Avançado' },
  { id: 'jazz-ionian', title: 'Jazz Jônio', modeId: 'ionian', key: 'C', bpm: 88, difficulty: 'Intermediário' },
];
