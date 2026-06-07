import { describe, expect, it } from 'vitest';
import {
  generateChordVoicings,
  getChordFormula,
  getFretboardBassNote,
  getFretboardChordNotes,
  identifyChordFromNotes
} from '../music/chordLibrary';
import { TUNINGS_PRESETS } from '../music/musicTheory';
import type { FretboardState } from '../types';

const baseState: FretboardState = {
  id: 'diagram-1',
  title: '',
  subtitle: '',
  notes: '',
  startFret: 0,
  endFret: 15,
  isLeftHanded: false,
  root: 'C',
  scaleType: 'Major (Ionian)',
  instrumentType: 'guitar-6',
  tuning: 'Standard',
  stringStatuses: ['normal', 'normal', 'normal', 'normal', 'normal', 'normal'],
  labelMode: 'none',
  harmonyMode: 'OFF',
  chordQuality: 'DIATONIC',
  chordDegree: 0,
  inversion: 0,
  colorMode: 'SINGLE',
  layers: {
    showInlays: true,
    showAllNotes: false,
    showScale: false,
    showTonic: false
  },
  markers: [],
  lines: []
};

const getShapeByString = (voicing: ReturnType<typeof generateChordVoicings>[number]) => {
  const shape: Array<number | null> = Array(6).fill(null);
  voicing.positions.forEach(position => {
    shape[position.string] = position.fret;
  });
  return shape;
};

describe('chord library', () => {
  it('returns chord formulas for common triads and tetrads', () => {
    expect(getChordFormula('major').intervals).toEqual([0, 4, 7]);
    expect(getChordFormula('minor').intervals).toEqual([0, 3, 7]);
    expect(getChordFormula('7').intervals).toEqual([0, 4, 7, 10]);
    expect(getChordFormula('maj7').intervals).toEqual([0, 4, 7, 11]);
    expect(getChordFormula('m7b5').intervals).toEqual([0, 3, 6, 10]);
    expect(getChordFormula('11').essentialIntervals).toEqual([0, 4, 5, 10]);
    expect(getChordFormula('13').essentialIntervals).toEqual([0, 4, 9, 10]);
  });

  it('identifies basic chords from selected notes', () => {
    expect(identifyChordFromNotes(['C', 'E', 'G']).bestMatch?.name).toBe('C');
    expect(identifyChordFromNotes(['A', 'C', 'E']).bestMatch?.name).toBe('Am');
    expect(identifyChordFromNotes(['G', 'B', 'D', 'F']).bestMatch?.name).toBe('G7');
    expect(identifyChordFromNotes(['C', 'E', 'G', 'B']).bestMatch?.name).toBe('Cmaj7');
    expect(identifyChordFromNotes(['B', 'D', 'F', 'A']).bestMatch?.name).toBe('Bm7b5');
    expect(identifyChordFromNotes(['C', 'E', 'F', 'A#']).bestMatch?.name).toBe('C11');
    expect(identifyChordFromNotes(['C', 'E', 'A', 'A#']).bestMatch?.name).toBe('C13');
  });

  it('identifies inversions and slash chords', () => {
    const result = identifyChordFromNotes(['E', 'G', 'C'], 'E');
    expect(result.bestMatch?.name).toBe('C/E');
    expect(result.bestMatch?.inversion).toBe('first');
    expect(result.bestMatch?.root).toBe('C');
  });

  it('reports missing intervals for partial chords', () => {
    const result = identifyChordFromNotes(['C', 'E']);
    expect(result.bestMatch?.name).toBe('C');
    expect(result.bestMatch?.missingIntervals).toContain('5');
  });

  it('extracts notes from markers and open strings', () => {
    const state: FretboardState = {
      ...baseState,
      stringStatuses: ['open', 'normal', 'normal', 'normal', 'normal', 'normal'],
      markers: [
        { id: 'm1', string: 1, fret: 1, shape: 'circle', color: '#2563eb' },
        { id: 'm2', string: 2, fret: 0, shape: 'circle', color: '#2563eb' },
        { id: 'm3', string: 4, fret: 3, shape: 'circle', color: '#2563eb' }
      ]
    };

    expect(getFretboardChordNotes(state, TUNINGS_PRESETS.Standard)).toEqual(['C', 'G', 'C', 'E']);
    expect(getFretboardBassNote(state, TUNINGS_PRESETS.Standard)).toBe('C');
  });

  it('generates playable C major voicings for standard guitar', () => {
    const voicings = generateChordVoicings('C', 'major', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 20
    });

    expect(voicings.length).toBeGreaterThan(0);
    expect(voicings[0].name.startsWith('C')).toBe(true);
    expect(voicings[0].notes).toEqual(expect.arrayContaining(['C', 'E', 'G']));
  });

  it('prioritizes known open major guitar shapes', () => {
    const cVoicings = generateChordVoicings('C', 'major', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 20
    });
    const gVoicings = generateChordVoicings('G', 'major', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 20
    });

    expect(cVoicings[0].name).toBe('C');
    expect(cVoicings[0].inversion).toBe('root');
    expect(cVoicings[0].isKnownShape).toBe(true);
    expect(getShapeByString(cVoicings[0])).toEqual([0, 1, 0, 2, 3, null]);
    expect(gVoicings[0].isKnownShape).toBe(true);
    expect(getShapeByString(gVoicings[0])).toEqual([3, 0, 0, 0, 2, 3]);
  });

  it('keeps traditional open-chord shapes stable for the studio chord tab', () => {
    const expectedShapes = [
      ['C', 'major', [0, 1, 0, 2, 3, null]],
      ['D', 'major', [2, 3, 2, 0, null, null]],
      ['E', 'major', [0, 0, 1, 2, 2, 0]],
      ['G', 'major', [3, 0, 0, 0, 2, 3]],
      ['A', 'minor', [0, 1, 2, 2, 0, null]],
      ['E', 'minor', [0, 0, 0, 2, 2, 0]],
      ['A', '7', [0, 2, 0, 2, 0, null]],
      ['G', '7', [1, 0, 0, 0, 2, 3]],
    ] as const;

    expectedShapes.forEach(([root, type, expectedShape]) => {
      const voicings = generateChordVoicings(root, type, TUNINGS_PRESETS.Standard, {
        maxFretSpan: 4,
        maxResults: 40,
        preferOpenChords: true,
        preferRootInBass: true,
      });

      expect(voicings[0]?.isKnownShape).toBe(true);
      expect(getShapeByString(voicings[0])).toEqual(expectedShape);
    });
  });

  it('includes movable barre shapes derived from open major forms', () => {
    const voicings = generateChordVoicings('C', 'major', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 240
    });
    const shapes = voicings.map(getShapeByString);

    expect(shapes).toContainEqual([3, 5, 5, 5, 3, null]);
    expect(shapes).toContainEqual([8, 8, 9, 10, 10, 8]);
  });

  it('prioritizes known open minor guitar shapes', () => {
    const voicings = generateChordVoicings('A', 'minor', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 30
    });

    expect(voicings[0].name).toBe('Am');
    expect(voicings[0].isKnownShape).toBe(true);
    expect(getShapeByString(voicings[0])).toEqual([0, 1, 2, 2, 0, null]);
  });

  it('includes movable minor barre shapes', () => {
    const voicings = generateChordVoicings('C', 'minor', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 240
    });
    const shapes = voicings.map(getShapeByString);

    expect(shapes).toContainEqual([3, 4, 5, 5, 3, null]);
    expect(shapes).toContainEqual([8, 8, 8, 10, 10, 8]);
  });

  it('includes known dominant seventh shapes', () => {
    const openVoicings = generateChordVoicings('A', '7', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 40
    });
    const movableVoicings = generateChordVoicings('C', '7', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 240
    });

    expect(openVoicings.map(getShapeByString)).toContainEqual([0, 2, 0, 2, 0, null]);
    expect(movableVoicings.map(getShapeByString)).toContainEqual([3, 5, 3, 5, 3, null]);
  });

  it('includes known minor seventh and major seventh shapes', () => {
    const am7Voicings = generateChordVoicings('A', 'm7', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 40
    });
    const cm7Voicings = generateChordVoicings('C', 'm7', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 240
    });
    const amaj7Voicings = generateChordVoicings('A', 'maj7', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 40
    });
    const cmaj7Voicings = generateChordVoicings('C', 'maj7', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 240
    });

    expect(am7Voicings.map(getShapeByString)).toContainEqual([0, 1, 0, 2, 0, null]);
    expect(cm7Voicings.map(getShapeByString)).toContainEqual([3, 4, 3, 5, 3, null]);
    expect(amaj7Voicings.map(getShapeByString)).toContainEqual([0, 2, 1, 2, 0, null]);
    expect(cmaj7Voicings.map(getShapeByString)).toContainEqual([3, 5, 4, 5, 3, null]);
  });

  it('sorts generated voicings by score descending', () => {
    const voicings = generateChordVoicings('D', 'major', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 20
    });

    expect(voicings.length).toBeGreaterThan(1);
    expect(voicings.every((voicing, index) => index === 0 || voicings[index - 1].score >= voicing.score)).toBe(true);
  });

  it('respects maxFretSpan when generating voicings', () => {
    const voicings = generateChordVoicings('F#', 'm7b5', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 30
    });

    expect(voicings.length).toBeGreaterThan(0);
    expect(voicings.every(voicing => voicing.fretSpan <= 4)).toBe(true);
  });

  it('limits generated voicings to practical four-finger fret shapes', () => {
    const voicings = generateChordVoicings('C', 'maj9', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 6,
      maxResults: 30
    });

    expect(voicings.length).toBeGreaterThan(0);
    expect(voicings.every(voicing => {
      const fretted = voicing.positions
        .filter(position => position.fret > 0)
        .map(position => position.fret);
      return new Set(fretted).size <= 4;
    })).toBe(true);
  });

  it('generates extended 11th and 13th voicings with didactic metadata', () => {
    const eleventhVoicings = generateChordVoicings('C', '11', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 6,
      maxResults: 30
    });
    const thirteenthVoicings = generateChordVoicings('C', '13', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 6,
      maxResults: 30
    });

    expect(eleventhVoicings.length).toBeGreaterThan(0);
    expect(thirteenthVoicings.length).toBeGreaterThan(0);
    expect(eleventhVoicings[0].intervals).toEqual(expect.arrayContaining(['1', '3', '11', 'b7']));
    expect(thirteenthVoicings[0].intervals).toEqual(expect.arrayContaining(['1', '3', '13', 'b7']));
    expect(['open', 'barre', 'movable', 'generated']).toContain(thirteenthVoicings[0].voicingStyle);
    expect(['easy', 'intermediate', 'advanced']).toContain(thirteenthVoicings[0].difficulty);
  });

  it('generates chord shapes for extended-range guitars and bass tunings', () => {
    const guitar8Voicings = generateChordVoicings('B', 'm7', ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'F#'], {
      maxFretSpan: 5,
      maxResults: 40
    });
    const bass5Voicings = generateChordVoicings('E', 'm7', ['G', 'D', 'A', 'E', 'B'], {
      maxFretSpan: 6,
      maxResults: 40
    });

    expect(guitar8Voicings.length).toBeGreaterThan(0);
    expect(bass5Voicings.length).toBeGreaterThan(0);
    expect(guitar8Voicings.every(voicing => voicing.positions.every(position => position.string < 8))).toBe(true);
    expect(bass5Voicings.every(voicing => voicing.positions.every(position => position.string < 5))).toBe(true);
  });
});
