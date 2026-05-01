import { describe, expect, it } from 'vitest';
import { getCagedPositions, getChordNotes } from '../music/harmony';
import { TUNINGS_PRESETS } from '../music/musicTheory';

describe('harmony', () => {
  it('calculates explicit seventh chord qualities', () => {
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 0, 'MAJ7')).toEqual(['C', 'E', 'G', 'B']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 0, 'MIN7')).toEqual(['C', 'D#', 'G', 'A#']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 0, 'DOM7')).toEqual(['C', 'E', 'G', 'A#']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 0, 'MIN7B5')).toEqual(['C', 'D#', 'F#', 'A#']);
  });

  it('calculates diatonic triads and tetrads by degree', () => {
    expect(getChordNotes('C', 'Major (Ionian)', 0, false, 0, 'DIATONIC')).toEqual(['C', 'E', 'G']);
    expect(getChordNotes('C', 'Major (Ionian)', 1, false, 0, 'DIATONIC')).toEqual(['D', 'F', 'A']);
    expect(getChordNotes('C', 'Major (Ionian)', 4, true, 0, 'DIATONIC')).toEqual(['G', 'B', 'D', 'F']);
    expect(getChordNotes('A', 'Natural Minor (Aeolian)', 0, true, 0, 'DIATONIC')).toEqual(['A', 'C', 'E', 'G']);
  });

  it('rotates inversions without changing chord membership', () => {
    expect(getChordNotes('C', 'Major (Ionian)', 0, false, 0, 'MAJOR')).toEqual(['C', 'E', 'G']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, false, 1, 'MAJOR')).toEqual(['E', 'G', 'C']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, false, 2, 'MAJOR')).toEqual(['G', 'C', 'E']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 3, 'MAJ7')).toEqual(['B', 'C', 'E', 'G']);
  });

  it('applies drop2 and drop3 voicings to tetrads after inversion', () => {
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 0, 'MAJ7', 'DROP2')).toEqual(['G', 'C', 'E', 'B']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 0, 'MAJ7', 'DROP3')).toEqual(['E', 'C', 'G', 'B']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 1, 'DOM7', 'DROP2')).toEqual(['A#', 'E', 'G', 'C']);
    expect(getChordNotes('C', 'Major (Ionian)', 0, true, 1, 'DOM7', 'DROP3')).toEqual(['G', 'E', 'A#', 'C']);
  });

  it('returns CAGED positions for standard tuning shapes', () => {
    expect(getCagedPositions('C', 'C', TUNINGS_PRESETS.Standard)).toEqual([
      { string: 1, fret: 1 },
      { string: 2, fret: 0 },
      { string: 3, fret: 2 },
      { string: 4, fret: 3 },
      { string: 0, fret: 0 },
    ]);
  });
});
