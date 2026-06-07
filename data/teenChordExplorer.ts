export const TEEN_CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type TeenChromaticNote = typeof TEEN_CHROMATIC_NOTES[number];
export type TeenChordInstrument = 'guitar' | 'bass';
export type TeenGuitarQuality =
  | 'major'
  | 'minor'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'sus4'
  | 'add9'
  | 'halfDiminished'
  | 'diminished'
  | 'augmented';
export type TeenBassQuality = 'root' | 'root5' | 'arpeggioMajor' | 'arpeggioMinor' | 'arpeggio7' | 'arpeggioMinor7';
export type TeenChordQuality = TeenGuitarQuality | TeenBassQuality;
export type TeenToneRole = 'root' | 'accent' | 'guide';

export type TeenShapeCell = {
  stringIndex: number;
  fretOffset: number;
  absoluteFret?: number;
  role: TeenToneRole;
};

export type TeenShapeTemplate = {
  id: string;
  label: string;
  rootStringIndex: number;
  preferredFret: number;
  cells: TeenShapeCell[];
};

export type TeenRenderedCell = {
  stringIndex: number;
  fret: number;
  role: TeenToneRole;
};

export type TeenRenderedShape = {
  id: string;
  label: string;
  rootFret: number;
  cells: TeenRenderedCell[];
};

const NOTE_INDEX: Record<TeenChromaticNote, number> = TEEN_CHROMATIC_NOTES.reduce((acc, note, index) => {
  acc[note] = index;
  return acc;
}, {} as Record<TeenChromaticNote, number>);

const GUITAR_TUNING: TeenChromaticNote[] = ['E', 'B', 'G', 'D', 'A', 'E'];
const BASS_TUNING: TeenChromaticNote[] = ['G', 'D', 'A', 'E'];

export const TEEN_GUITAR_QUALITIES: Array<{ id: TeenGuitarQuality; label: string }> = [
  { id: 'major', label: 'Maior' },
  { id: 'minor', label: 'Menor' },
  { id: 'dominant7', label: '7' },
  { id: 'major7', label: 'Maj7' },
  { id: 'minor7', label: 'm7' },
  { id: 'sus4', label: 'Sus4' },
  { id: 'add9', label: 'Add9' },
  { id: 'halfDiminished', label: 'm7b5' },
  { id: 'diminished', label: 'Dim' },
  { id: 'augmented', label: 'Aug' },
];

export const TEEN_BASS_QUALITIES: Array<{ id: TeenBassQuality; label: string }> = [
  { id: 'root', label: 'Tônica + Oitava' },
  { id: 'root5', label: 'Tônica + Quinta + Oitava' },
  { id: 'arpeggioMajor', label: 'Arpejo Maior (curto)' },
  { id: 'arpeggioMinor', label: 'Arpejo Menor (curto)' },
  { id: 'arpeggio7', label: 'Arpejo 7 (curto)' },
  { id: 'arpeggioMinor7', label: 'Arpejo m7 (curto)' },
];

const GUITAR_SHAPES: Record<TeenGuitarQuality, TeenShapeTemplate[]> = {
  major: [
    {
      id: 'g-major-form-1',
      label: 'Forma 1',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: -1, role: 'guide' },
        { stringIndex: 2, fretOffset: -3, role: 'accent' },
        { stringIndex: 1, fretOffset: -2, role: 'guide' },
        { stringIndex: 0, fretOffset: -3, role: 'accent' },
      ],
    },
    {
      id: 'g-major-form-4',
      label: 'Forma 4',
      rootStringIndex: 5,
      preferredFret: 3,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-major-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-major-form-3',
      label: 'Forma 3',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: -1, role: 'guide' },
        { stringIndex: 3, fretOffset: -3, role: 'accent' },
        { stringIndex: 2, fretOffset: -3, role: 'guide' },
        { stringIndex: 1, fretOffset: -3, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-major-form-5',
      label: 'Forma 5',
      rootStringIndex: 3,
      preferredFret: 10,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 3, role: 'accent' },
        { stringIndex: 0, fretOffset: 2, role: 'guide' },
      ],
    },
  ],
  minor: [
    {
      id: 'g-minor-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-minor-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-minor-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 3, role: 'accent' },
        { stringIndex: 0, fretOffset: 1, role: 'guide' },
      ],
    },
    {
      id: 'g-minor-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-minor-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
  ],
  dominant7: [
    {
      id: 'g-dom7-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-dom7-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-dom7-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 2, role: 'guide' },
      ],
    },
    {
      id: 'g-dom7-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: -1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-dom7-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
  minor7: [
    {
      id: 'g-min7-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-min7-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 1, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-min7-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 1, role: 'guide' },
      ],
    },
    {
      id: 'g-min7-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: -1, role: 'accent' },
        { stringIndex: 0, fretOffset: -1, role: 'guide' },
      ],
    },
    {
      id: 'g-min7-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
  major7: [
    {
      id: 'g-maj7-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 1, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-maj7-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 1, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-maj7-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 2, role: 'guide' },
      ],
    },
    {
      id: 'g-maj7-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-maj7-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 1, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
  sus4: [
    {
      id: 'g-sus4-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-sus4-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
        { stringIndex: 1, fretOffset: 3, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-sus4-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 3, role: 'accent' },
        { stringIndex: 0, fretOffset: 3, role: 'guide' },
      ],
    },
    {
      id: 'g-sus4-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 1, role: 'guide' },
      ],
    },
    {
      id: 'g-sus4-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
  add9: [
    {
      id: 'g-add9-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-add9-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 4, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 3, role: 'accent' },
      ],
    },
    {
      id: 'g-add9-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 3, role: 'accent' },
        { stringIndex: 0, fretOffset: 4, role: 'guide' },
      ],
    },
    {
      id: 'g-add9-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-add9-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
  halfDiminished: [
    {
      id: 'g-m7b5-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 1, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-m7b5-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 1, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 1, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-m7b5-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 1, role: 'guide' },
      ],
    },
    {
      id: 'g-m7b5-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -1, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: -1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-m7b5-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 1, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
  diminished: [
    {
      id: 'g-dim-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 1, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-dim-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 1, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, role: 'guide' },
        { stringIndex: 0, fretOffset: 2, role: 'accent' },
      ],
    },
    {
      id: 'g-dim-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 1, role: 'guide' },
      ],
    },
    {
      id: 'g-dim-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -1, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: -1, role: 'guide' },
      ],
    },
    {
      id: 'g-dim-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 1, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
  augmented: [
    {
      id: 'g-aug-form-1',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 1,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 3, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-aug-form-2',
      label: 'Forma 2',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 4, fretOffset: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 3, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
        { stringIndex: 1, fretOffset: 1, role: 'guide' },
        { stringIndex: 0, fretOffset: 1, role: 'accent' },
      ],
    },
    {
      id: 'g-aug-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 3, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 1, role: 'guide' },
      ],
    },
    {
      id: 'g-aug-form-4',
      label: 'Forma 4',
      rootStringIndex: 2,
      preferredFret: 7,
      cells: [
        { stringIndex: 3, fretOffset: -1, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 1, role: 'guide' },
      ],
    },
    {
      id: 'g-aug-form-5',
      label: 'Forma 5',
      rootStringIndex: 5,
      preferredFret: 8,
      cells: [
        { stringIndex: 5, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 3, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, role: 'guide' },
      ],
    },
  ],
};

const GUITAR_OPEN_SHAPES: Partial<Record<TeenGuitarQuality, Partial<Record<TeenChromaticNote, TeenShapeTemplate>>>> = {
  major: {
    C: {
      id: 'g-major-open-c',
      label: 'Forma 1',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 3, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 1, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'accent' },
      ],
    },
    A: {
      id: 'g-major-open-a',
      label: 'Forma 1',
      rootStringIndex: 4,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'guide' },
      ],
    },
    E: {
      id: 'g-major-open-e',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 1, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 0, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'accent' },
      ],
    },
    G: {
      id: 'g-major-open-g',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 3,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: 3, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 0, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 3, role: 'accent' },
      ],
    },
    D: {
      id: 'g-major-open-d',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 3, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 2, role: 'guide' },
      ],
    },
  },
  minor: {
    A: {
      id: 'g-minor-open-a',
      label: 'Forma 1',
      rootStringIndex: 4,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'guide' },
      ],
    },
    E: {
      id: 'g-minor-open-e',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 0, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'accent' },
      ],
    },
    D: {
      id: 'g-minor-open-d',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 3, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 1, role: 'guide' },
      ],
    },
  },
  dominant7: {
    A: {
      id: 'g-dom7-open-a',
      label: 'Forma 1',
      rootStringIndex: 4,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'accent' },
      ],
    },
    E: {
      id: 'g-dom7-open-e',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 1, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'guide' },
      ],
    },
    D: {
      id: 'g-dom7-open-d',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 2, role: 'guide' },
      ],
    },
    G: {
      id: 'g-dom7-open-g',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 3,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: 3, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 0, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 1, role: 'guide' },
      ],
    },
    C: {
      id: 'g-dom7-open-c',
      label: 'Forma 1',
      rootStringIndex: 4,
      preferredFret: 3,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 3, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 3, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 1, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'accent' },
      ],
    },
  },
  minor7: {
    A: {
      id: 'g-min7-open-a',
      label: 'Forma 1',
      rootStringIndex: 4,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 1, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'accent' },
      ],
    },
    E: {
      id: 'g-min7-open-e',
      label: 'Forma 1',
      rootStringIndex: 5,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 0, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 0, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 0, role: 'guide' },
      ],
    },
    D: {
      id: 'g-min7-open-d',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 0,
      cells: [
        { stringIndex: 5, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 4, fretOffset: 0, absoluteFret: -1, role: 'root' },
        { stringIndex: 3, fretOffset: 0, absoluteFret: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 0, absoluteFret: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, absoluteFret: 1, role: 'accent' },
        { stringIndex: 0, fretOffset: 0, absoluteFret: 1, role: 'guide' },
      ],
    },
  },
};

const BASS_SHAPES: Record<TeenBassQuality, TeenShapeTemplate[]> = {
  root: [
    {
      id: 'b-root-form-1',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 3,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
      ],
    },
    {
      id: 'b-root-form-2',
      label: 'Forma 2',
      rootStringIndex: 2,
      preferredFret: 3,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 0, fretOffset: 2, role: 'guide' },
      ],
    },
  ],
  root5: [
    {
      id: 'b-root5-form-1',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 3,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
      ],
    },
    {
      id: 'b-root5-form-2',
      label: 'Forma 2',
      rootStringIndex: 2,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 0, fretOffset: 2, role: 'guide' },
      ],
    },
  ],
  arpeggioMajor: [
    {
      id: 'b-arp-major-1',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 3,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: -1, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
      ],
    },
    {
      id: 'b-arp-major-2',
      label: 'Forma 2',
      rootStringIndex: 2,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: -1, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 2, role: 'accent' },
      ],
    },
  ],
  arpeggioMinor: [
    {
      id: 'b-arp-minor-1',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 3,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: -2, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
      ],
    },
    {
      id: 'b-arp-minor-2',
      label: 'Forma 2',
      rootStringIndex: 2,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: -2, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 2, role: 'accent' },
      ],
    },
  ],
  arpeggio7: [
    {
      id: 'b-arp-7-1',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 3,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: -1, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'b-arp-7-2',
      label: 'Forma 2',
      rootStringIndex: 2,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: -1, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
  ],
  arpeggioMinor7: [
    {
      id: 'b-arp-m7-1',
      label: 'Forma 1',
      rootStringIndex: 3,
      preferredFret: 3,
      cells: [
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: -2, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 1, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'b-arp-m7-2',
      label: 'Forma 2',
      rootStringIndex: 2,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: -2, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 0, fretOffset: 0, role: 'accent' },
      ],
    },
  ],
};

const getNoteFretCandidates = (openNote: TeenChromaticNote, targetNote: TeenChromaticNote) => {
  const openIndex = NOTE_INDEX[openNote];
  const targetIndex = NOTE_INDEX[targetNote];
  const candidates: number[] = [];
  for (let fret = 0; fret <= 24; fret += 1) {
    if ((openIndex + fret) % 12 === targetIndex) {
      candidates.push(fret);
    }
  }
  return candidates;
};

const renderTemplate = (
  tuning: TeenChromaticNote[],
  note: TeenChromaticNote,
  template: TeenShapeTemplate
): TeenRenderedShape | null => {
  const minOffset = Math.min(...template.cells.map((cell) => cell.fretOffset));
  const maxOffset = Math.max(...template.cells.map((cell) => cell.fretOffset));
  const candidates = getNoteFretCandidates(tuning[template.rootStringIndex], note);

  const rootFret = candidates
    .filter((fret) => fret + minOffset >= 0 && fret + maxOffset <= 24)
    .sort((a, b) => {
      if (template.preferredFret <= 3) return a - b;
      return Math.abs(a - template.preferredFret) - Math.abs(b - template.preferredFret);
    })[0];

  if (rootFret === undefined) {
    return null;
  }

  const cells = template.cells
    .map((cell) => {
      if (cell.absoluteFret !== undefined) {
        if (cell.absoluteFret === -1) return null;
        return { stringIndex: cell.stringIndex, fret: cell.absoluteFret, role: cell.role };
      }
      return { stringIndex: cell.stringIndex, fret: rootFret + cell.fretOffset, role: cell.role };
    })
    .filter((cell): cell is TeenRenderedCell => cell !== null && cell.fret >= 0 && cell.fret <= 24);

  return {
    id: template.id,
    label: template.label,
    rootFret,
    cells,
  };
};

export const getTeenChordExplorerShapes = (
  instrument: TeenChordInstrument,
  note: TeenChromaticNote,
  quality: TeenChordQuality
): TeenRenderedShape[] => {
  if (instrument === 'guitar') {
    const openTemplate = GUITAR_OPEN_SHAPES[quality as TeenGuitarQuality]?.[note];
    const templates = GUITAR_SHAPES[quality as TeenGuitarQuality] ?? [];
    const resolvedTemplates = openTemplate
      ? [openTemplate, ...templates.slice(1)]
      : templates;
    return resolvedTemplates
      .filter((template): template is TeenShapeTemplate => Boolean(template))
      .map((template) => renderTemplate(GUITAR_TUNING, note, template))
      .filter((shape): shape is TeenRenderedShape => Boolean(shape))
      .sort((left, right) => left.rootFret - right.rootFret)
      .map((shape, index) => ({
        ...shape,
        label: `Forma ${index + 1}`,
      }));
  }

  const templates = BASS_SHAPES[quality as TeenBassQuality] ?? [];
  return templates
    .map((template) => renderTemplate(BASS_TUNING, note, template))
    .filter((shape): shape is TeenRenderedShape => Boolean(shape))
    .sort((left, right) => left.rootFret - right.rootFret)
    .map((shape, index) => ({
      ...shape,
      label: `Forma ${index + 1}`,
    }));
};

export const getTeenChordQualityOptions = (instrument: TeenChordInstrument) =>
  instrument === 'guitar' ? TEEN_GUITAR_QUALITIES : TEEN_BASS_QUALITIES;

export const getTeenChordTuning = (instrument: TeenChordInstrument) =>
  instrument === 'guitar' ? GUITAR_TUNING : BASS_TUNING;

