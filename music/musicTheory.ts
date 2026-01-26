
import { TuningKey, InstrumentType } from '../types';

export const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const NOTE_MAP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'C#': 'C#', 'D#': 'D#', 'F#': 'F#', 'G#': 'G#', 'A#': 'A#',
  'E#': 'F', 'B#': 'C', 'Fb': 'E', 'Cb': 'B'
};

// Fixed: Exported normalizeNote so it can be imported in other files like harmony.ts
export const normalizeNote = (note: string): string => NOTE_MAP[note] || note;

export const INSTRUMENT_PRESETS: Record<InstrumentType, { strings: number, defaultTuning: string[] }> = {
  'guitar-6': { strings: 6, defaultTuning: ["E", "B", "G", "D", "A", "E"] },
  'guitar-7': { strings: 7, defaultTuning: ["E", "B", "G", "D", "A", "E", "B"] },
  'guitar-8': { strings: 8, defaultTuning: ["E", "B", "G", "D", "A", "E", "B", "F#"] },
  'bass-4': { strings: 4, defaultTuning: ["G", "D", "A", "E"] },
  'bass-5': { strings: 5, defaultTuning: ["G", "D", "A", "E", "B"] },
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

export const getIntervalName = (root: string, target: string): string => {
  const rootIdx = CHROMATIC_SCALE.indexOf(normalizeNote(root));
  const targetIdx = CHROMATIC_SCALE.indexOf(normalizeNote(target));
  if (rootIdx === -1 || targetIdx === -1) return "1";
  const diff = (targetIdx - rootIdx + 12) % 12;
  const intervals = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];
  return intervals[diff];
};

export const getFretForNote = (stringIndex: number, targetNote: string, tuning: string[], referenceFret: number = 0): number => {
  const openNote = tuning[stringIndex];
  if (!openNote) return 0;
  
  const openIdx = CHROMATIC_SCALE.indexOf(normalizeNote(openNote));
  const targetIdx = CHROMATIC_SCALE.indexOf(normalizeNote(targetNote));
  
  let fret = (targetIdx - openIdx + 12) % 12;
  
  const octaves = [0, 12, 24];
  let closestFret = fret;
  let minDiff = Math.abs(fret - referenceFret);
  
  octaves.forEach(offset => {
    const candidate = fret + offset;
    if (candidate >= 0 && candidate <= 24) {
      const diff = Math.abs(candidate - referenceFret);
      if (diff < minDiff) {
        minDiff = diff;
        closestFret = candidate;
      }
    }
  });

  return closestFret;
};
