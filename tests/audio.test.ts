import { describe, expect, it } from 'vitest';
import { CHROMATIC_SCALE, getNoteAt } from '../music/musicTheory';
import { getFrequencyForPosition } from '../utils/audio';

const noteFromFrequency = (frequency: number) => {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  return CHROMATIC_SCALE[((midi % 12) + 12) % 12];
};

describe('audio pitch mapping', () => {
  const standardGuitar = ['E', 'B', 'G', 'D', 'A', 'E'];

  it('plays C on the 6th and 5th guitar strings as the same C pitch', () => {
    const lowEStringC = getFrequencyForPosition('guitar-6', standardGuitar, 5, 8);
    const aStringC = getFrequencyForPosition('guitar-6', standardGuitar, 4, 3);

    expect(getNoteAt(5, 8, standardGuitar)).toBe('C');
    expect(getNoteAt(4, 3, standardGuitar)).toBe('C');
    expect(noteFromFrequency(lowEStringC)).toBe('C');
    expect(noteFromFrequency(aStringC)).toBe('C');
    expect(lowEStringC).toBeCloseTo(aStringC, 6);
  });

  it('keeps every visible standard guitar fret mapped to the displayed note name', () => {
    for (let string = 0; string < standardGuitar.length; string += 1) {
      for (let fret = 0; fret <= 15; fret += 1) {
        const displayedNote = getNoteAt(string, fret, standardGuitar);
        const playedNote = noteFromFrequency(getFrequencyForPosition('guitar-6', standardGuitar, string, fret));

        expect(playedNote).toBe(displayedNote);
      }
    }
  });
});
