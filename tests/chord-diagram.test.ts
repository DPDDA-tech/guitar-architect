import { describe, expect, it } from 'vitest';
import {
  buildChordRenderState,
  createChordDiagramDataFromVoicing,
  createReadonlyFretboardStateFromChordDiagramData,
  normalizeStringStatus,
} from '../utils/chordDiagram';
import { generateChordVoicings } from '../music/chordLibrary';
import { TUNINGS_PRESETS } from '../music/musicTheory';

describe('chord diagram utils', () => {
  it('normalizes legacy muted statuses', () => {
    expect(normalizeStringStatus('muted')).toBe('mute');
    expect(normalizeStringStatus('mute')).toBe('mute');
    expect(normalizeStringStatus('open')).toBe('open');
    expect(normalizeStringStatus(undefined)).toBe('normal');
  });

  it('renders open strings as OPEN without fret-zero markers', () => {
    const cMajor = generateChordVoicings('C', 'major', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 8,
      preferOpenChords: true,
      preferRootInBass: true,
    })[0];

    const renderState = buildChordRenderState({
      stringCount: TUNINGS_PRESETS.Standard.length,
      positions: cMajor.positions,
      mutedStrings: cMajor.mutedStrings,
      barre: cMajor.barre,
      shapeMode: 'lead-circle',
    });

    expect(renderState.stringStatuses).toEqual(['open', 'normal', 'open', 'normal', 'normal', 'mute']);
    expect(renderState.markers.every((marker) => marker.fret > 0)).toBe(true);
    expect(renderState.markers).toHaveLength(3);
  });

  it('prepares a reusable readonly diagram payload from a voicing', () => {
    const g7 = generateChordVoicings('G', '7', TUNINGS_PRESETS.Standard, {
      maxFretSpan: 4,
      maxResults: 8,
      preferOpenChords: true,
      preferRootInBass: true,
    })[0];

    const diagram = createChordDiagramDataFromVoicing(g7, TUNINGS_PRESETS.Standard);
    const state = createReadonlyFretboardStateFromChordDiagramData(diagram);

    expect(diagram.strings.map((stringState) => stringState.type)).toEqual(['fretted', 'open', 'open', 'open', 'fretted', 'fretted']);
    expect(state.startFret).toBe(0);
    expect(state.stringStatuses).toEqual(['normal', 'open', 'open', 'open', 'normal', 'normal']);
    expect(state.markers.map((marker) => marker.fret)).toEqual([1, 2, 3]);
  });
});
