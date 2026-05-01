import { describe, expect, it } from 'vitest';
import type { FretboardState, Project } from '../types';
import { getIntervalName, getNoteAt, INSTRUMENT_PRESETS, TUNINGS_PRESETS } from '../music/musicTheory';

const makeFretboard = (overrides: Partial<FretboardState> = {}): FretboardState => ({
  id: 'diagram-1',
  title: 'C Major Shape',
  subtitle: '',
  notes: '',
  startFret: 0,
  endFret: 15,
  isLeftHanded: false,
  root: 'C',
  scaleType: 'Major (Ionian)',
  instrumentType: 'guitar-6',
  tuning: 'Standard',
  stringStatuses: Array(INSTRUMENT_PRESETS['guitar-6'].strings).fill('normal'),
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
    showTonic: false,
  },
  markers: [
    { id: 'marker-1', string: 5, fret: 3, shape: 'circle', color: '#2563eb', finger: '1' },
    { id: 'marker-2', string: 4, fret: 3, shape: 'circle', color: '#2563eb', finger: '3' },
  ],
  lines: [],
  ...overrides,
});

const buildCurrentDiagramExportPayload = (state: FretboardState) => {
  const instrument = INSTRUMENT_PRESETS[state.instrumentType];
  const tuning = state.tuning === 'Custom'
    ? state.customTuning || instrument.defaultTuning
    : TUNINGS_PRESETS[state.tuning] || instrument.defaultTuning;

  return {
    diagramId: state.id,
    meta: { title: state.title, instrument: state.instrumentType },
    tuning: { label: state.tuning, structure: tuning },
    theory: { root: state.root, scale: state.scaleType, harmony: state.harmonyMode },
    points: state.markers.map((marker) => {
      const note = getNoteAt(marker.string, marker.fret, tuning);
      return {
        string: instrument.strings - marker.string,
        fret: marker.fret,
        note,
        interval: getIntervalName(state.root, note),
      };
    }),
  };
};

describe('JSON import/export contract', () => {
  it('matches the current single-diagram export JSON shape', () => {
    expect(buildCurrentDiagramExportPayload(makeFretboard())).toEqual({
      diagramId: 'diagram-1',
      meta: { title: 'C Major Shape', instrument: 'guitar-6' },
      tuning: { label: 'Standard', structure: ['E', 'B', 'G', 'D', 'A', 'E'] },
      theory: { root: 'C', scale: 'Major (Ionian)', harmony: 'OFF' },
      points: [
        { string: 1, fret: 3, note: 'G', interval: '5' },
        { string: 2, fret: 3, note: 'C', interval: '1' },
      ],
    });
  });

  it('accepts the current project import JSON shape', () => {
    const diagram = makeFretboard({ id: 'diagram-2', title: 'Imported' });
    const project: Project = {
      id: 'project-1',
      name: 'Imported Project',
      user: 'alice',
      lastUpdated: '2026-04-30T12:00:00.000Z',
      instances: [diagram],
      globalTransposition: 3,
    };

    const parsed = JSON.parse(JSON.stringify(project));

    expect(Array.isArray(parsed.instances)).toBe(true);
    expect(parsed.name).toBe('Imported Project');
    expect(parsed.globalTransposition).toBe(3);
    expect(parsed.instances[0]).toMatchObject({
      id: 'diagram-2',
      title: 'Imported',
      root: 'C',
      scaleType: 'Major (Ionian)',
      instrumentType: 'guitar-6',
      tuning: 'Standard',
    });
  });

  it('accepts the current single-diagram import JSON shape with theory and points', () => {
    const payload = {
      meta: { title: 'Imported Lick', instrument: 'guitar-6' },
      tuning: { label: 'Standard', structure: TUNINGS_PRESETS.Standard },
      theory: { root: 'Eb', scale: 'Dorian', harmony: 'TRIADS' },
      points: [
        { string: 1, fret: 3, note: 'G', interval: '3' },
        { string: 2, fret: 4, note: 'D#', interval: '1' },
      ],
    };

    const parsed = JSON.parse(JSON.stringify(payload));

    expect(parsed.theory).toBeTruthy();
    expect(parsed.meta.instrument).toBe('guitar-6');
    expect(parsed.theory.root).toBe('Eb');
    expect(parsed.theory.scale).toBe('Dorian');
    expect(parsed.points).toEqual([
      expect.objectContaining({ string: 1, fret: 3 }),
      expect.objectContaining({ string: 2, fret: 4 }),
    ]);
  });
});
