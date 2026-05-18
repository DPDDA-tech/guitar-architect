import { Lang } from '../i18n';

type LocalText = Record<Lang, string>;

export interface TheoryCard {
  id: string;
  title: string;
  formula: string;
  example: string;
}

export interface DiatonicDegree {
  degree: string;
  quality: string;
  example: string;
}

export interface InversionGroup {
  title: string;
  items: string[];
}

export interface PracticalExercise {
  id: string;
  title: LocalText;
  steps: Record<Lang, string[]>;
}

export interface TriadsTetradsAction {
  id: string;
  label: LocalText;
  payload: Record<string, unknown>;
}

export const TRIADS_TETRADS_COPY = {
  title: {
    pt: 'Tríades e Tétrades',
    en: 'Triads and Seventh Chords',
  },
  subtitle: {
    pt: 'Conecte acordes pequenos, tétrades e condução harmônica em todo o braço.',
    en: 'Connect small chord shapes, seventh chords and harmonic voice leading across the fretboard.',
  },
  intro: {
    pt: 'Tríades e tétrades são a base da harmonia aplicada no instrumento. Uma tríade resume o acorde em três notas essenciais; uma tétrade acrescenta a sétima e revela melhor a função harmônica. Nesta página, o estudo parte da construção intervalar e avança para inversões, grupos de cordas e condução por notas próximas no braço.',
    en: 'Triads and seventh chords are the foundation of applied harmony on the instrument. A triad reduces the chord to three essential notes; a seventh chord adds the seventh and clarifies harmonic function. This page moves from interval construction into inversions, string sets, and close voice leading on the fretboard.',
  },
};

export const TRIAD_FORMULAS: TheoryCard[] = [
  { id: 'major', title: 'Maior', formula: '1 · 3 · 5', example: 'C maior: C E G' },
  { id: 'minor', title: 'Menor', formula: '1 · b3 · 5', example: 'C menor: C Eb G' },
  { id: 'diminished', title: 'Diminuta', formula: '1 · b3 · b5', example: 'C diminuta: C Eb Gb' },
  { id: 'augmented', title: 'Aumentada', formula: '1 · 3 · #5', example: 'C aumentada: C E G#' },
];

export const TETRAD_FORMULAS: TheoryCard[] = [
  { id: 'maj7', title: 'Maj7', formula: '1 · 3 · 5 · 7', example: 'Cmaj7: C E G B' },
  { id: 'dom7', title: '7 dominante', formula: '1 · 3 · 5 · b7', example: 'C7: C E G Bb' },
  { id: 'm7', title: 'm7', formula: '1 · b3 · 5 · b7', example: 'Cm7: C Eb G Bb' },
  { id: 'm7b5', title: 'm7(b5)', formula: '1 · b3 · b5 · b7', example: 'Cm7(b5): C Eb Gb Bb' },
  { id: 'dim7', title: 'dim7', formula: '1 · b3 · b5 · bb7', example: 'Cdim7: C Eb Gb Bbb' },
  { id: 'mmaj7', title: 'mMaj7', formula: '1 · b3 · 5 · 7', example: 'CmMaj7: C Eb G B' },
];

export const MAJOR_FIELD_TETRADS: DiatonicDegree[] = [
  { degree: 'I', quality: 'maj7', example: 'Gmaj7' },
  { degree: 'II', quality: 'm7', example: 'Am7' },
  { degree: 'III', quality: 'm7', example: 'Bm7' },
  { degree: 'IV', quality: 'maj7', example: 'Cmaj7' },
  { degree: 'V', quality: '7', example: 'D7' },
  { degree: 'VI', quality: 'm7', example: 'Em7' },
  { degree: 'VII', quality: 'm7(b5)', example: 'F#m7(b5)' },
];

export const INVERSION_GROUPS: InversionGroup[] = [
  {
    title: 'Tríade C maior',
    items: ['Fundamental: C E G', '1ª inversão: E G C', '2ª inversão: G C E'],
  },
  {
    title: 'Tétrade Cmaj7',
    items: ['Fundamental: C E G B', '1ª inversão: E G B C', '2ª inversão: G B C E', '3ª inversão: B C E G'],
  },
];

export const STRING_SET_CARDS: LocalText[] = [
  {
    pt: 'Cordas agudas: ótimo para bases leves, arpejos e arranjos.',
    en: 'High strings: great for light comping, arpeggios, and arrangements.',
  },
  {
    pt: 'Cordas médias: região equilibrada para acompanhamento.',
    en: 'Middle strings: balanced register for accompaniment.',
  },
  {
    pt: 'Cordas graves: bom para riffs, power-triads e conduções fortes.',
    en: 'Low strings: useful for riffs, power-triads, and strong movement.',
  },
  {
    pt: 'Grupos móveis: permitem transportar a mesma estrutura pelo braço.',
    en: 'Movable sets: move the same structure across the fretboard.',
  },
];

export const VOICE_LEADING_EXAMPLE = [
  'Gmaj7: G B D F#',
  'Am7: A C E G',
  'Bm7: B D F# A',
  'Cmaj7: C E G B',
];

export const PRACTICAL_EXERCISES: PracticalExercise[] = [
  {
    id: 'c-major-triads',
    title: { pt: 'Exercício 1 — Tríades em C maior', en: 'Exercise 1 — Triads in C major' },
    steps: {
      pt: ['Toque C, Dm, Em, F, G, Am, Bdim usando apenas tríades.', 'Primeiro em estado fundamental.', 'Depois em inversões.'],
      en: ['Play C, Dm, Em, F, G, Am, Bdim using only triads.', 'Start in root position.', 'Then move through inversions.'],
    },
  },
  {
    id: 'g-major-tetrads',
    title: { pt: 'Exercício 2 — Campo harmônico em G com tétrades', en: 'Exercise 2 — G major diatonic seventh chords' },
    steps: {
      pt: ['Toque Gmaj7, Am7, Bm7, Cmaj7, D7, Em7, F#m7(b5).', 'Procure manter os acordes na mesma região do braço.'],
      en: ['Play Gmaj7, Am7, Bm7, Cmaj7, D7, Em7, F#m7(b5).', 'Keep the chords in the same fretboard region.'],
    },
  },
  {
    id: 'three-string-inversions',
    title: { pt: 'Exercício 3 — Inversões em três cordas', en: 'Exercise 3 — Inversions on three strings' },
    steps: {
      pt: ['Escolha um grupo de cordas.', 'Toque a tríade maior em fundamental, 1ª inversão e 2ª inversão.', 'Repita em 12 tonalidades.'],
      en: ['Choose one string set.', 'Play the major triad in root position, first inversion, and second inversion.', 'Repeat in 12 keys.'],
    },
  },
  {
    id: 'minimal-voice-leading',
    title: { pt: 'Exercício 4 — Condução mínima', en: 'Exercise 4 — Minimal voice leading' },
    steps: {
      pt: ['Escolha I vi IV V.', 'Em G: Gmaj7, Em7, Cmaj7, D7.', 'Monte os acordes usando as notas mais próximas possíveis.'],
      en: ['Choose I vi IV V.', 'In G: Gmaj7, Em7, Cmaj7, D7.', 'Build chords using the closest available notes.'],
    },
  },
  {
    id: 'musical-application',
    title: { pt: 'Exercício 5 — Aplicação musical', en: 'Exercise 5 — Musical application' },
    steps: {
      pt: ['Escolha uma música simples.', 'Substitua acordes cheios por tríades.', 'Depois experimente tétrades para adicionar cor harmônica.'],
      en: ['Choose a simple song.', 'Replace full chords with triads.', 'Then use seventh chords to add harmonic color.'],
    },
  },
];

const pendingAction = (
  action: 'triads' | 'field' | 'startPractice',
  root: string,
  scaleType: string,
  extra: Record<string, unknown> = {},
) => ({
  source: 'study-module',
  action,
  root,
  displayRoot: root,
  scaleType,
  ...extra,
});

export const TRIADS_TETRADS_ACTIONS: TriadsTetradsAction[] = [
  {
    id: 'show-triads',
    label: { pt: 'Mostrar tríades no braço', en: 'Show triads on fretboard' },
    payload: pendingAction('triads', 'C', 'Major (Ionian)', {
      harmonyMode: 'TRIADS',
      moduleTitle: 'Tríades e Tétrades',
      moduleLabel: 'Tríades maiores, menores e diminutas',
    }),
  },
  {
    id: 'apply-g-tetrads',
    label: { pt: 'Aplicar campo de G com tétrades', en: 'Apply G field with seventh chords' },
    payload: pendingAction('field', 'G', 'Major (Ionian)', {
      harmonyMode: 'TETRADS',
      moduleTitle: 'Tríades e Tétrades',
      moduleLabel: 'Gmaj7 · Am7 · Bm7 · Cmaj7 · D7 · Em7 · F#m7(b5)',
      chords: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F#m7(b5)'],
    }),
  },
  {
    id: 'train-inversions',
    label: { pt: 'Treinar inversões', en: 'Practice inversions' },
    payload: pendingAction('startPractice', 'C', 'Major (Ionian)', {
      harmonyMode: 'TRIADS',
      tool: 'exercises',
      practiceMode: 'triadInversions',
      stringSets: ['1-2-3', '2-3-4', '3-4-5', '4-5-6'],
      moduleTitle: 'Tríades e Tétrades',
      moduleLabel: 'Inversões em grupos de cordas',
      bpm: 72,
    }),
  },
];
