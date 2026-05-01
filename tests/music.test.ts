import { describe, expect, it } from 'vitest';
import {
  getFretForNote,
  getIntervalName,
  getNoteAt,
  normalizeNote,
  TUNINGS_PRESETS,
  transposeNote,
} from '../music/musicTheory';
import { getScaleNotes } from '../music/scales';

describe('music theory basics', () => {
  it('calculates common scales and modes', () => {
    expect(getScaleNotes('C', 'Major (Ionian)')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(getScaleNotes('A', 'Natural Minor (Aeolian)')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(getScaleNotes('D', 'Dorian')).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C']);
    expect(getScaleNotes('G', 'Mixolydian')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F']);
    expect(getScaleNotes('B', 'Locrian')).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A']);
    expect(getScaleNotes('E', 'Blues')).toEqual(['E', 'G', 'A', 'A#', 'B', 'D']);
  });

  it('normalizes enharmonic flats into the internal sharp-based system', () => {
    expect(normalizeNote('Eb')).toBe('D#');
    expect(normalizeNote('Bb')).toBe('A#');
    expect(normalizeNote('Db')).toBe('C#');
    expect(normalizeNote('Gb')).toBe('F#');
    expect(normalizeNote('Ab')).toBe('G#');
  });

  it('uses normalized roots when building scales', () => {
    expect(getScaleNotes('Eb', 'Major (Ionian)')).toEqual(['D#', 'F', 'G', 'G#', 'A#', 'C', 'D']);
    expect(getScaleNotes('Bb', 'Pentatonic Major')).toEqual(['A#', 'C', 'D', 'F', 'G']);
    expect(getScaleNotes('Db', 'Natural Minor (Aeolian)')).toEqual(['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B']);
  });

  it('calculates intervals and fret notes with enharmonic input', () => {
    expect(getIntervalName('Eb', 'Bb')).toBe('5');
    expect(getIntervalName('Db', 'F')).toBe('3');
    expect(transposeNote('Bb', 2)).toBe('C');
    expect(getNoteAt(0, 1, TUNINGS_PRESETS['Half-Step Down'])).toBe('E');
    expect(getFretForNote(0, 'F', TUNINGS_PRESETS.Standard, 1)).toBe(1);
  });
});
