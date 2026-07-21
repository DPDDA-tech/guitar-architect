import { describe, expect, it } from 'vitest';
import { getHarmonicKeyInfo, resolveProgression } from '../music/harmonicCycle';

describe('harmonic cycle theory helpers', () => {
  it('builds major key context with coherent sharp spellings', () => {
    const info = getHarmonicKeyInfo('E', 'major');

    expect(info.keySignature).toEqual({ count: 4, type: 'sharps', isTraditional: true });
    expect(info.scale).toEqual(['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']);
    expect(info.relative).toBe('C#m');
    expect(info.dominant).toBe('B');
    expect(info.subdominant).toBe('A');
    expect(info.harmonicField.map(item => `${item.degree}: ${item.chord}`)).toEqual([
      'I: E',
      'ii: F#m',
      'iii: G#m',
      'IV: A',
      'V: B',
      'vi: C#m',
      'vii°: D#°',
    ]);
  });

  it('builds natural minor context and resolves progressions', () => {
    const info = getHarmonicKeyInfo('E', 'minor');
    const progression = resolveProgression('i - VI - III - VII', info.harmonicField);

    expect(info.keySignature).toEqual({ count: 1, type: 'sharps', isTraditional: true });
    expect(info.scale).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
    expect(info.relative).toBe('G');
    expect(info.dominant).toBe('B');
    expect(info.subdominant).toBe('A');
    expect(info.harmonicField.map(item => `${item.degree}: ${item.chord}`)).toEqual([
      'i: Em',
      'ii°: F#°',
      'III: G',
      'iv: Am',
      'v: Bm',
      'VI: C',
      'VII: D',
    ]);
    expect(progression.map(item => item.chord)).toEqual(['Em', 'C', 'G', 'D']);
  });
});
