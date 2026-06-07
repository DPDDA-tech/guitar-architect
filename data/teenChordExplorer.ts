export const TEEN_CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type TeenChromaticNote = typeof TEEN_CHROMATIC_NOTES[number];
export type TeenChordInstrument = 'guitar' | 'bass';
export type TeenGuitarQuality = 'major' | 'minor' | 'dominant7' | 'minor7';
export type TeenBassQuality = 'root' | 'root5' | 'arpeggioMajor' | 'arpeggioMinor' | 'arpeggio7' | 'arpeggioMinor7';
export type TeenChordQuality = TeenGuitarQuality | TeenBassQuality;
export type TeenToneRole = 'root' | 'accent' | 'guide';

export type TeenShapeCell = {
  stringIndex: number;
  fretOffset: number;
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

const GUITAR_TUNING: TeenChromaticNote[] = ['E', 'A', 'D', 'G', 'B', 'E'];
const BASS_TUNING: TeenChromaticNote[] = ['E', 'A', 'D', 'G'];

export const TEEN_GUITAR_QUALITIES: Array<{ id: TeenGuitarQuality; label: string }> = [
  { id: 'major', label: 'Maior' },
  { id: 'minor', label: 'Menor' },
  { id: 'dominant7', label: '7' },
  { id: 'minor7', label: 'm7' },
];

export const TEEN_BASS_QUALITIES: Array<{ id: TeenBassQuality; label: string }> = [
  { id: 'root', label: 'Tônica' },
  { id: 'root5', label: 'Tônica + Quinta' },
  { id: 'arpeggioMajor', label: 'Arpejo Maior' },
  { id: 'arpeggioMinor', label: 'Arpejo Menor' },
  { id: 'arpeggio7', label: 'Arpejo 7' },
  { id: 'arpeggioMinor7', label: 'Arpejo m7' },
];

const GUITAR_SHAPES: Record<TeenGuitarQuality, TeenShapeTemplate[]> = {
  major: [
    {
      id: 'g-major-form-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 1, role: 'accent' },
        { stringIndex: 4, fretOffset: 0, role: 'guide' },
        { stringIndex: 5, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-major-form-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 3,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 4, fretOffset: 2, role: 'accent' },
        { stringIndex: 5, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-major-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: 0, role: 'accent' },
        { stringIndex: 5, fretOffset: -2, role: 'guide' },
      ],
    },
  ],
  minor: [
    {
      id: 'g-minor-form-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 4, fretOffset: 0, role: 'guide' },
        { stringIndex: 5, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-minor-form-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 3,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'guide' },
        { stringIndex: 4, fretOffset: 1, role: 'accent' },
        { stringIndex: 5, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-minor-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: -1, role: 'accent' },
        { stringIndex: 5, fretOffset: -2, role: 'guide' },
      ],
    },
  ],
  dominant7: [
    {
      id: 'g-dom7-form-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'accent' },
        { stringIndex: 3, fretOffset: 1, role: 'guide' },
        { stringIndex: 4, fretOffset: 0, role: 'accent' },
        { stringIndex: 5, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-dom7-form-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 3,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 4, fretOffset: 2, role: 'guide' },
        { stringIndex: 5, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-dom7-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: -1, role: 'accent' },
        { stringIndex: 5, fretOffset: -1, role: 'guide' },
      ],
    },
  ],
  minor7: [
    {
      id: 'g-min7-form-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 0, role: 'accent' },
        { stringIndex: 3, fretOffset: 0, role: 'guide' },
        { stringIndex: 4, fretOffset: 0, role: 'accent' },
        { stringIndex: 5, fretOffset: 0, role: 'guide' },
      ],
    },
    {
      id: 'g-min7-form-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 3,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'accent' },
        { stringIndex: 4, fretOffset: 1, role: 'guide' },
        { stringIndex: 5, fretOffset: 0, role: 'accent' },
      ],
    },
    {
      id: 'g-min7-form-3',
      label: 'Forma 3',
      rootStringIndex: 3,
      preferredFret: 5,
      cells: [
        { stringIndex: 2, fretOffset: 0, role: 'guide' },
        { stringIndex: 3, fretOffset: 0, role: 'root' },
        { stringIndex: 4, fretOffset: -1, role: 'accent' },
        { stringIndex: 5, fretOffset: -2, role: 'guide' },
      ],
    },
  ],
};

const BASS_SHAPES: Record<TeenBassQuality, TeenShapeTemplate[]> = {
  root: [
    {
      id: 'b-root-form-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [{ stringIndex: 0, fretOffset: 0, role: 'root' }],
    },
    {
      id: 'b-root-form-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 3,
      cells: [{ stringIndex: 1, fretOffset: 0, role: 'root' }],
    },
  ],
  root5: [
    {
      id: 'b-root5-form-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
      ],
    },
    {
      id: 'b-root5-form-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 5,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
      ],
    },
  ],
  arpeggioMajor: [
    {
      id: 'b-arp-major-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 1, fretOffset: 4, role: 'guide' },
      ],
    },
    {
      id: 'b-arp-major-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 5,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 4, role: 'guide' },
      ],
    },
  ],
  arpeggioMinor: [
    {
      id: 'b-arp-minor-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
      ],
    },
    {
      id: 'b-arp-minor-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 5,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 1, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
      ],
    },
  ],
  arpeggio7: [
    {
      id: 'b-arp-7-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 2, role: 'accent' },
        { stringIndex: 1, fretOffset: 4, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
      ],
    },
    {
      id: 'b-arp-7-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 5,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
        { stringIndex: 2, fretOffset: 4, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
      ],
    },
  ],
  arpeggioMinor7: [
    {
      id: 'b-arp-m7-1',
      label: 'Forma 1',
      rootStringIndex: 0,
      preferredFret: 3,
      cells: [
        { stringIndex: 0, fretOffset: 0, role: 'root' },
        { stringIndex: 1, fretOffset: 1, role: 'accent' },
        { stringIndex: 1, fretOffset: 2, role: 'guide' },
        { stringIndex: 2, fretOffset: 2, role: 'accent' },
      ],
    },
    {
      id: 'b-arp-m7-2',
      label: 'Forma 2',
      rootStringIndex: 1,
      preferredFret: 5,
      cells: [
        { stringIndex: 1, fretOffset: 0, role: 'root' },
        { stringIndex: 2, fretOffset: 1, role: 'accent' },
        { stringIndex: 2, fretOffset: 2, role: 'guide' },
        { stringIndex: 3, fretOffset: 2, role: 'accent' },
      ],
    },
  ],
};

const getNoteFretCandidates = (openNote: TeenChromaticNote, targetNote: TeenChromaticNote) => {
  const openIndex = NOTE_INDEX[openNote];
  const targetIndex = NOTE_INDEX[targetNote];
  const candidates: number[] = [];
  for (let fret = 0; fret <= 12; fret += 1) {
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
  const candidates = getNoteFretCandidates(tuning[template.rootStringIndex], note)
    .filter((fret) => fret + minOffset >= 0 && fret + maxOffset <= 12);

  const rootFret = (candidates.length > 0 ? candidates : getNoteFretCandidates(tuning[template.rootStringIndex], note))
    .sort((left, right) => Math.abs(left - template.preferredFret) - Math.abs(right - template.preferredFret))[0];

  if (rootFret === undefined) {
    return null;
  }

  const cells = template.cells
    .map((cell) => ({ stringIndex: cell.stringIndex, fret: rootFret + cell.fretOffset, role: cell.role }))
    .filter((cell) => cell.fret >= 0 && cell.fret <= 12);

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
    const templates = GUITAR_SHAPES[quality as TeenGuitarQuality] ?? [];
    return templates
      .map((template) => renderTemplate(GUITAR_TUNING, note, template))
      .filter((shape): shape is TeenRenderedShape => Boolean(shape));
  }

  const templates = BASS_SHAPES[quality as TeenBassQuality] ?? [];
  return templates
    .map((template) => renderTemplate(BASS_TUNING, note, template))
    .filter((shape): shape is TeenRenderedShape => Boolean(shape));
};

export const getTeenChordQualityOptions = (instrument: TeenChordInstrument) =>
  instrument === 'guitar' ? TEEN_GUITAR_QUALITIES : TEEN_BASS_QUALITIES;

export const getTeenChordTuning = (instrument: TeenChordInstrument) =>
  instrument === 'guitar' ? GUITAR_TUNING : BASS_TUNING;
