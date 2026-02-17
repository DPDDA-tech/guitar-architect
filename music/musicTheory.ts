
import { TuningKey, InstrumentType, Note } from '../types';

export const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const NOTE_MAP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'C#': 'C#', 'D#': 'D#', 'F#': 'F#', 'G#': 'G#', 'A#': 'A#',
  'E#': 'F', 'B#': 'C', 'Fb': 'E', 'Cb': 'B'
};

export const normalizeNote = (note: string): string => NOTE_MAP[note] || note;

export const INSTRUMENT_PRESETS: Record<InstrumentType, { strings: number, defaultTuning: Note[] }> = {
  'guitar-6': {
    strings: 6,
    defaultTuning: ['E', 'B', 'G', 'D', 'A', 'E']
  },

  'guitar-7': {
    strings: 7,
    defaultTuning: ['E', 'B', 'G', 'D', 'A', 'E', 'B']
  },

  'guitar-8': {
    strings: 8,
    defaultTuning: ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'F#']
  },

  'bass-4': {
    strings: 4,
    defaultTuning: ['G', 'D', 'A', 'E']
  },

  'bass-5': {
    strings: 5,
    defaultTuning: ['G', 'D', 'A', 'E', 'B']
  },
};

export const TUNINGS_PRESETS: Record<string, string[]> = {
  'Standard': ["E", "B", "G", "D", "A", "E"],
  'Drop D': ["E", "B", "G", "D", "A", "D"],
  'Drop C': ["D", "A", "F", "C", "G", "C"],
  'Open D': ["D", "A", "F#", "D", "A", "D"],
  'Open G': ["D", "B", "G", "D", "G", "D"],
  'DADGAD': ["D", "A", "G", "D", "A", "D"],
  'Half-Step Down': ["Eb", "Bb", "Gb", "Db", "Ab", "Eb"]
};

export const transposeNote = (note: string, semitones: number): string => {
  const normalized = normalizeNote(note);
  const idx = CHROMATIC_SCALE.indexOf(normalized);
  if (idx === -1) return note;
  const newIdx = (idx + (semitones % 12) + 12) % 12;
  return CHROMATIC_SCALE[newIdx];
};

export const getNoteAt = (stringIndex: number, fret: number, tuning: string[]): string => {
  const openNote = normalizeNote(tuning[stringIndex] || "E");
  const openIndex = CHROMATIC_SCALE.indexOf(openNote);
  if (openIndex === -1) return "C";
  return CHROMATIC_SCALE[(openIndex + fret) % 12];
};

export const getIntervalName = (root: string, note: string): string => {
  const rootIdx = CHROMATIC_SCALE.indexOf(normalizeNote(root));
  const noteIdx = CHROMATIC_SCALE.indexOf(normalizeNote(note));
  if (rootIdx === -1 || noteIdx === -1) return "1";

  const diff = (noteIdx - rootIdx + 12) % 12;
  const names = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];
  return names[diff];
};

/**
 *getFretForNote aprimorado com âncora de oitava (Octave Shield)
 *Encontra a casa mais próxima de uma nota alvo baseada em uma casa de referência,
 *garantindo que shapes não quebrem ao trocar afinações.
 */
export const getFretForNote = (stringIndex: number, targetNote: string, tuning: string[], referenceFret: number = 0): number => {
  const openNote = tuning[stringIndex];
  if (!openNote) return 0;

  const openIdx = CHROMATIC_SCALE.indexOf(normalizeNote(openNote));
  const targetIdx = CHROMATIC_SCALE.indexOf(normalizeNote(targetNote));

  let baseFret = (targetIdx - openIdx + 12) % 12;
  const possibleFrets = [baseFret, baseFret + 12, baseFret + 24].filter(f => f >= 0 && f <= 24);

  if (possibleFrets.length === 0) return baseFret % 25;

  return possibleFrets.reduce((prev, curr) =>
    Math.abs(curr - referenceFret) < Math.abs(prev - referenceFret) ? curr : prev
  );
};

// ==============================
// TYPES — Brush Engine
// ==============================

export interface ChordVoicing {
  notes: string[];
  intervals: string[];
  pitches: number[];
}

export interface BrushPath {
  path: { string: number; fret: number }[];
  playability: 'PLAYABLE' | 'THEORETICAL';
}

export const getAllChordBrushVoicings = (
  chordVoicing: ChordVoicing,
  tuning: string[],
  startFret: number,
  endFret: number,
  instrumentType: InstrumentType,
  voicingMode: 'CLOSE' | 'DROP2' | 'DROP3'
): BrushPath[] => {

  const { notes } = chordVoicing;
  if (!notes || notes.length < 3) return [];

  // ==============================
  // APPLY INVERSION ORDER
  // ==============================

  let orderedNotes = [...notes];

  const inversion = chordVoicing.pitches?.[0] / 4 || 0;

  if (notes.length === 3) {

    if (inversion === 1)
      orderedNotes = [notes[1], notes[2], notes[0]];

    if (inversion === 2)
      orderedNotes = [notes[2], notes[0], notes[1]];

  }

  if (notes.length === 4) {

    if (inversion === 1)
      orderedNotes = [notes[1], notes[2], notes[3], notes[0]];

    if (inversion === 2)
      orderedNotes = [notes[2], notes[3], notes[0], notes[1]];

    if (inversion === 3)
      orderedNotes = [notes[3], notes[0], notes[1], notes[2]];

  }

  // ==============================
  // BUILD NOTE LOCATIONS
  // ==============================

  const noteLocations: { string: number; fret: number }[][] = [];

  orderedNotes.forEach(note => {

    const locs: { string: number; fret: number }[] = [];

    // grave → agudo
    for (let s = tuning.length - 1; s >= 0; s--) {

      // range expandido para cobrir 24ª
      for (let f = startFret - 12; f <= endFret + 12; f++) {

        if (f < 0 || f > 24) continue;

        if (getNoteAt(s, f, tuning) === note) {
          locs.push({ string: s, fret: f });
        }

      }
    }

    noteLocations.push(locs);

  });

  // ==============================
  // SOLVER
  // ==============================

  const paths: BrushPath[] = [];

  const buildPaths = (
    idx: number,
    current: { string: number; fret: number }[]
  ) => {

    if (idx === noteLocations.length) {

      const frets = current.map(p => p.fret);
      const span = Math.max(...frets) - Math.min(...frets);

      const maxSpan = notes.length === 3 ? 5 : 7;
      if (span > maxSpan) return;

      paths.push({
        path: [...current],
        playability: 'PLAYABLE'
      });

      return;
    }

    noteLocations[idx].forEach(pos => {

      if (current.length > 0) {

        const last = current[current.length - 1];

        // direção: grave → agudo
        if (pos.string >= last.string) return;

        // salto máximo: 1 corda
        if (Math.abs(pos.string - last.string) > 1) return;

      }

      buildPaths(idx + 1, [...current, pos]);

    });

  };

  buildPaths(0, []);

  return paths;

};
