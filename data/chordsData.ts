import { Lang } from '../i18n';
import { FretboardState } from '../types';

type LocalText = Record<Lang, string>;

export type ChordStudyCategory =
  | 'triads'
  | 'sevenths'
  | 'inversions'
  | 'extensions';

export interface ChordStudyModule {
  id: string;
  title: LocalText;
  subtitle: LocalText;
  category: ChordStudyCategory;
  formulas: { type: string; formula: string; example: string }[];
  body: LocalText;
  actions: ChordPageAction[];
}

export interface ChordLibraryItem {
  id: string;
  name: string;
  formula: string;
  intervals: string;
  degree: string;
  difficulty: 'easy' | 'medium' | 'hard';
  family: string;
  use: string;
  payload: Record<string, unknown>;
}

export interface ChordProgression {
  id: string;
  title: string;
  subtitle: string;
  chords: string[];
  function: string;
  payload: Record<string, unknown>;
}

export interface ChordPageAction {
  id: string;
  label: LocalText;
  payload: Record<string, unknown>;
}

const pendingAction = (
  action: 'scale' | 'field' | 'triads' | 'progression' | 'startPractice' | 'openTool',
  root: string,
  scaleType = 'Major (Ionian)',
  extra: Record<string, unknown> = {},
) => ({
  source: 'study-module',
  action,
  root,
  displayRoot: root,
  scaleType,
  ...extra,
});

const chordPayload = (
  root: string,
  chordQuality: FretboardState['chordQuality'],
  harmonyMode: 'TRIADS' | 'TETRADS' = 'TRIADS',
  extra: Record<string, unknown> = {},
) => pendingAction('triads', root, 'Major (Ionian)', {
  harmonyMode,
  chordQuality,
  chordDegree: 0,
  chordPageAction: 'SHOW_CHORD',
  ...extra,
});

export const CHORDS_COPY = {
  title: { pt: 'Acordes', en: 'Chords' },
  subtitle: {
    pt: 'Explore fórmulas, inversões, voicings, tensões e aplicação no braço.',
    en: 'Explore formulas, inversions, voicings, tensions and fretboard application.',
  },
  hero: {
    pt: 'Acordes são estruturas formadas pela sobreposição de intervalos. No Guitar Architect você pode visualizar fórmulas, tensões, inversões, voicings e aplicação prática diretamente no braço.',
    en: 'Chords are structures built by stacking intervals. In Guitar Architect you can visualize formulas, tensions, inversions, voicings, and practical fretboard application directly on the neck.',
  },
};

export const CHORD_HERO_CHIPS = ['Tríades', 'Tétrades', 'Voicings', 'Jazz', 'Rock', 'Fusion', 'Neo Soul', 'Campo Harmônico'];

export const CHORD_STUDY_MODULES: ChordStudyModule[] = [
  {
    id: 'triads',
    title: { pt: 'Tríade: 1 3 5', en: 'Triad: 1 3 5' },
    subtitle: { pt: 'Fundamental, terça e quinta como base do acorde.', en: 'Root, third, and fifth as the core of the chord.' },
    category: 'triads',
    body: {
      pt: 'A tríade mostra se o acorde é maior, menor, diminuto ou aumentado. No braço, ela deve ser estudada em grupos de cordas, inversões e regiões móveis.',
      en: 'The triad shows whether the chord is major, minor, diminished, or augmented. On the fretboard, study it through string sets, inversions, and movable regions.',
    },
    formulas: [
      { type: 'Maior', formula: '1 3 5', example: 'C E G' },
      { type: 'Menor', formula: '1 b3 5', example: 'C Eb G' },
      { type: 'Diminuta', formula: '1 b3 b5', example: 'C Eb Gb' },
      { type: 'Aumentada', formula: '1 3 #5', example: 'C E G#' },
    ],
    actions: [
      { id: 'show-triad', label: { pt: 'Mostrar no fretboard', en: 'Show on fretboard' }, payload: chordPayload('C', 'MAJOR') },
      { id: 'show-intervals', label: { pt: 'Mostrar intervalos', en: 'Show intervals' }, payload: pendingAction('openTool', 'C', 'Major (Ionian)', { tool: 'intervals' }) },
      { id: 'all-keys', label: { pt: 'Aplicar em tonalidades', en: 'Apply in keys' }, payload: pendingAction('startPractice', 'C', 'Major (Ionian)', { tool: 'exercises', practiceMode: 'allKeyTriads', bpm: 72 }) },
    ],
  },
  {
    id: 'sevenths',
    title: { pt: 'Tétrade: 1 3 5 7', en: 'Seventh chord: 1 3 5 7' },
    subtitle: { pt: 'A sétima revela função: repouso, dominante ou tensão.', en: 'The seventh reveals function: rest, dominant pull, or tension.' },
    category: 'sevenths',
    body: {
      pt: 'Tétrades expandem a tríade e deixam a função harmônica mais clara. Elas são essenciais para campo harmônico, jazz, blues, fusion e neo soul.',
      en: 'Seventh chords expand the triad and clarify harmonic function. They are essential for diatonic harmony, jazz, blues, fusion, and neo soul.',
    },
    formulas: [
      { type: 'Maj7', formula: '1 3 5 7', example: 'C E G B' },
      { type: '7', formula: '1 3 5 b7', example: 'C E G Bb' },
      { type: 'm7', formula: '1 b3 5 b7', example: 'C Eb G Bb' },
      { type: 'm7b5', formula: '1 b3 b5 b7', example: 'C Eb Gb Bb' },
      { type: 'dim7', formula: '1 b3 b5 bb7', example: 'C Eb Gb Bbb' },
    ],
    actions: [
      { id: 'apply-field', label: { pt: 'Aplicar Campo Harmônico', en: 'Apply Diatonic Harmony' }, payload: pendingAction('field', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS' }) },
      { id: 'show-function', label: { pt: 'Mostrar Função Harmônica', en: 'Show Harmonic Function' }, payload: pendingAction('field', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS', chordPageAction: 'SHOW_FUNCTIONS' }) },
    ],
  },
  {
    id: 'inversions',
    title: { pt: 'Inversões e condução', en: 'Inversions and voice leading' },
    subtitle: { pt: 'C → C/E → C/G como movimento, não como shape isolado.', en: 'C → C/E → C/G as movement, not isolated shapes.' },
    category: 'inversions',
    body: {
      pt: 'Inversões permitem condução suave: o menor movimento possível entre acordes. Drop 2 e Drop 3 espalham as vozes para abrir o som.',
      en: 'Inversions enable smooth voice leading: the smallest possible movement between chords. Drop 2 and Drop 3 spread voices for a wider sound.',
    },
    formulas: [
      { type: 'Root', formula: 'C E G', example: 'C' },
      { type: '1ª inv.', formula: 'E G C', example: 'C/E' },
      { type: '2ª inv.', formula: 'G C E', example: 'C/G' },
      { type: 'Drop 2', formula: '5 1 3 7', example: 'Cmaj7 drop 2' },
      { type: 'Drop 3', formula: '3 1 5 7', example: 'Cmaj7 drop 3' },
    ],
    actions: [
      { id: 'demo-neck', label: { pt: 'Demonstrar no braço', en: 'Demonstrate on neck' }, payload: chordPayload('C', 'MAJ7', 'TETRADS', { voicingMode: 'DROP2', chordPageAction: 'SHOW_INVERSIONS' }) },
      { id: 'voice-leading', label: { pt: 'Voice Leading', en: 'Voice Leading' }, payload: pendingAction('progression', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS', progression: 'I - vi - IV - V', chords: ['Cmaj7', 'Am7', 'Fmaj7', 'G7'], chordPageAction: 'VOICE_LEADING' }) },
    ],
  },
  {
    id: 'extensions',
    title: { pt: 'Tensões 9 11 13', en: 'Tensions 9 11 13' },
    subtitle: { pt: 'Brilho, suspensão e expansão harmônica.', en: 'Brightness, suspension, and harmonic expansion.' },
    category: 'extensions',
    body: {
      pt: 'Tensões adicionam cor. 9 traz brilho, 11 cria suspensão e 13 expande o acorde. Dominantes podem receber alterações e cores mais fortes.',
      en: 'Tensions add color. 9 adds brightness, 11 creates suspension, and 13 expands the chord. Dominants can receive alterations and stronger colors.',
    },
    formulas: [
      { type: '9', formula: 'brilho', example: 'Cmaj9' },
      { type: '11', formula: 'suspensão', example: 'Cm11' },
      { type: '13', formula: 'expansão', example: 'C13' },
      { type: '#11', formula: 'cor lídia', example: 'C7#11' },
    ],
    actions: [
      { id: 'hear-tensions', label: { pt: 'Ouvir tensões', en: 'Hear tensions' }, payload: pendingAction('openTool', 'C', 'Major (Ionian)', { tool: 'exercises', chordPageAction: 'HEAR_TENSIONS' }) },
      { id: 'apply-tensions', label: { pt: 'Aplicar no fretboard', en: 'Apply to fretboard' }, payload: chordPayload('C', 'MAJ7', 'TETRADS', { chordPageAction: 'APPLY_TENSIONS', voicingMode: 'DROP2' }) },
    ],
  },
];

export const CHORD_LIBRARY_ITEMS: ChordLibraryItem[] = [
  { id: 'c', name: 'C', formula: '1 3 5', intervals: 'C E G', degree: 'I', difficulty: 'easy', family: 'Maior', use: 'Base pop, rock e estudo de tríades.', payload: chordPayload('C', 'MAJOR') },
  { id: 'cm', name: 'Cm', formula: '1 b3 5', intervals: 'C Eb G', degree: 'i', difficulty: 'easy', family: 'Menor', use: 'Cor menor básica e arpejos simples.', payload: chordPayload('C', 'MINOR') },
  { id: 'c7', name: 'C7', formula: '1 3 5 b7', intervals: 'C E G Bb', degree: 'V7', difficulty: 'medium', family: 'Dominante', use: 'Blues, tensão dominante e resolução.', payload: chordPayload('C', 'DOM7', 'TETRADS') },
  { id: 'cmaj7', name: 'Cmaj7', formula: '1 3 5 7', intervals: 'C E G B', degree: 'Imaj7', difficulty: 'medium', family: 'Jazz', use: 'Repouso sofisticado, neo soul e fusion.', payload: chordPayload('C', 'MAJ7', 'TETRADS') },
  { id: 'cm7', name: 'Cm7', formula: '1 b3 5 b7', intervals: 'C Eb G Bb', degree: 'iim7', difficulty: 'medium', family: 'Menor', use: 'Menor funcional, jazz e progressões modais.', payload: chordPayload('C', 'MIN7', 'TETRADS') },
  { id: 'cm7b5', name: 'Cm7b5', formula: '1 b3 b5 b7', intervals: 'C Eb Gb Bb', degree: 'viiø', difficulty: 'hard', family: 'Diminuto', use: 'Meio diminuto, cadências menores e tensão.', payload: chordPayload('C', 'MIN7B5', 'TETRADS') },
  { id: 'csus4', name: 'Csus4', formula: '1 4 5', intervals: 'C F G', degree: 'sus', difficulty: 'easy', family: 'Suspenso', use: 'Suspensão antes da terça.', payload: chordPayload('C', 'MAJOR') },
  { id: 'cadd9', name: 'Cadd9', formula: '1 3 5 9', intervals: 'C E G D', degree: 'add9', difficulty: 'medium', family: 'Add9', use: 'Pop aberto, brilho e textura.', payload: chordPayload('C', 'MAJ7', 'TETRADS', { chordPageAction: 'ADD9_COLOR' }) },
  { id: 'c5', name: 'C5', formula: '1 5', intervals: 'C G', degree: '5', difficulty: 'easy', family: 'Power Chord', use: 'Rock, riffs e base pesada.', payload: chordPayload('C', 'MAJOR') },
  { id: 'c-e', name: 'C/E', formula: '3 no baixo', intervals: 'E C G', degree: 'I6', difficulty: 'medium', family: 'Slash Chords', use: 'Baixo conduzido e transições suaves.', payload: chordPayload('C', 'MAJOR', 'TRIADS', { inversion: 1 }) },
];

export const HARMONIC_EXPLORER_CHORDS = ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'];

export const VOICING_CATEGORIES = [
  { title: 'Open Chords', body: 'Acordes abertos para ressonância natural e repertório inicial.' },
  { title: 'Barre Chords', body: 'Formas móveis com pestana para transposição rápida.' },
  { title: 'Drop 2', body: 'Voicings abertos e equilibrados para jazz, fusion e arranjos.' },
  { title: 'Drop 3', body: 'Espaçamento mais amplo e baixo mais definido.' },
  { title: 'Shell Voicings', body: 'Fundamental, terça e sétima para acompanhamento elegante.' },
  { title: 'Quartal', body: 'Empilhamento em quartas para cor moderna.' },
  { title: 'Spread', body: 'Abertura grande para textura cinematográfica.' },
  { title: 'Cluster', body: 'Notas próximas para tensão controlada.' },
];

export const EXTENSION_PRESETS = [
  'Jazz Fusion',
  'Neo Soul',
  'Gospel',
  'Blues',
  'Lo-fi',
  'Lydian Dominant',
  'Altered Dominant',
];

export const CHORD_PAGE_ACTIONS: ChordPageAction[] = [
  { id: 'field', label: { pt: 'Mostrar Campo Harmônico', en: 'Show Diatonic Harmony' }, payload: pendingAction('field', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS', chordPageAction: 'SHOW_PROGRESSIONS' }) },
  { id: 'diatonic', label: { pt: 'Visualizar Acordes Diatônicos', en: 'View Diatonic Chords' }, payload: pendingAction('field', 'C', 'Major (Ionian)', { harmonyMode: 'TRIADS', chordPageAction: 'DIATONIC_SHAPES' }) },
  { id: 'voicings', label: { pt: 'Aplicar Voicings', en: 'Apply Voicings' }, payload: chordPayload('C', 'MAJ7', 'TETRADS', { voicingMode: 'DROP2', chordPageAction: 'APPLY_VOICINGS' }) },
  { id: 'inversions', label: { pt: 'Mostrar Inversões', en: 'Show Inversions' }, payload: chordPayload('C', 'MAJOR', 'TRIADS', { inversion: 1, chordPageAction: 'SHOW_INVERSIONS' }) },
  { id: 'tensions', label: { pt: 'Aplicar Tensões', en: 'Apply Tensions' }, payload: chordPayload('C', 'MAJ7', 'TETRADS', { voicingMode: 'DROP2', chordPageAction: 'APPLY_TENSIONS' }) },
  { id: 'random', label: { pt: 'Random Chord', en: 'Random Chord' }, payload: pendingAction('openTool', 'C', 'Major (Ionian)', { tool: 'changes', chordPageAction: 'RANDOM_CHORD' }) },
];

export const CHORD_PROGRESSIONS: ChordProgression[] = [
  { id: '251', title: 'II V I', subtitle: 'Cadência funcional essencial.', chords: ['Dm7', 'G7', 'Cmaj7'], function: 'Pré-dominante · Dominante · Tônica', payload: pendingAction('progression', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS', progression: 'ii - V - I', chords: ['Dm7', 'G7', 'Cmaj7'] }) },
  { id: '1625', title: 'I VI II V', subtitle: 'Turnaround clássico.', chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'], function: 'Tônica · Relativa · Pré · Dominante', payload: pendingAction('progression', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS', progression: 'I - vi - ii - V', chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'] }) },
  { id: 'blues', title: 'Blues 12 Compassos', subtitle: 'Dominantes em cadeia.', chords: ['C7', 'F7', 'G7'], function: 'I7 · IV7 · V7', payload: pendingAction('progression', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS', progression: '12 bar blues', chords: ['C7', 'F7', 'G7'] }) },
  { id: 'andaluz', title: 'Andaluz', subtitle: 'Menor descendente forte.', chords: ['Am', 'G', 'F', 'E'], function: 'i · VII · VI · V', payload: pendingAction('progression', 'A', 'Natural Minor (Aeolian)', { progression: 'i - VII - VI - V', chords: ['Am', 'G', 'F', 'E'] }) },
  { id: 'pop', title: 'Pop Progression', subtitle: 'I V vi IV.', chords: ['C', 'G', 'Am', 'F'], function: 'Tônica · Dominante · Relativa · Subdominante', payload: pendingAction('progression', 'C', 'Major (Ionian)', { progression: 'I - V - vi - IV', chords: ['C', 'G', 'Am', 'F'] }) },
  { id: 'neo-soul', title: 'Neo Soul', subtitle: 'Cores maj7, m9 e dominantes suaves.', chords: ['Cmaj7', 'Em7', 'Dm9', 'G13'], function: 'Cor · Movimento · Pré · Dominante', payload: pendingAction('progression', 'C', 'Major (Ionian)', { harmonyMode: 'TETRADS', progression: 'Neo Soul color', chords: ['Cmaj7', 'Em7', 'Dm9', 'G13'] }) },
];

export const CHORD_PRACTICE_CARDS = [
  'Acorde aleatório',
  'Inversão aleatória',
  'Reconhecer acorde',
  'Construir acorde',
  'Campo harmônico em 5 minutos',
  'Voice leading mínimo',
];

export const CHORD_QUIZ_CARDS = [
  'Qual a terça de G?',
  'Qual acorde possui b5?',
  'O que forma um dominante?',
  'Qual tensão traz brilho: 9, 11 ou 13?',
];
