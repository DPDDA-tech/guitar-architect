import { describe, expect, it } from 'vitest';
import type { FretboardState } from '../types';
import { buildProjectFileName, parseProjectFile, serializeProjectFile, slugifyProjectName } from '../utils/projectFile';

const makeFretboard = (): FretboardState => ({
  id: 'diagram-1',
  title: 'C Major',
  subtitle: 'Ionian',
  notes: 'Study notes',
  startFret: 0,
  endFret: 12,
  isLeftHanded: false,
  root: 'C',
  scaleType: 'Major (Ionian)',
  instrumentType: 'guitar-6',
  tuning: 'Standard',
  stringStatuses: ['normal', 'normal', 'normal', 'normal', 'normal', 'normal'],
  labelMode: 'interval',
  harmonyMode: 'TRIADS',
  voicingMode: 'DROP2',
  cagedShape: 'C',
  chordQuality: 'DIATONIC',
  chordDegree: 0,
  inversion: 0,
  colorMode: 'SINGLE',
  layers: {
    showInlays: true,
    showAllNotes: false,
    showScale: true,
    showTonic: true,
  },
  markers: [{ id: 'marker-1', string: 5, fret: 3, shape: 'circle', color: '#2563eb', finger: '1' }],
  lines: [],
});

describe('project file import/export', () => {
  it('builds a safe suggested file name', () => {
    expect(slugifyProjectName('Meu Projeto Nº 1')).toBe('meu-projeto-n-1');
    expect(buildProjectFileName('Meu Projeto', new Date('2026-05-01T12:00:00.000Z'))).toBe(
      'guitar-architect-meu-projeto-2026-05-01.json',
    );
  });

  it('serializes the complete current project with settings metadata', () => {
    const payload = serializeProjectFile({
      projectId: 'project-1',
      projectName: 'Lesson Pack',
      user: 'teacher',
      instances: [makeFretboard()],
      globalTranspose: 2,
      theme: 'dark',
      lang: 'pt',
      defaultInstrument: 'guitar-6',
      showTips: false,
      exportedAt: '2026-05-01T12:00:00.000Z',
    });

    expect(payload).toMatchObject({
      schema: 'guitar-architect-project',
      appVersion: '1.8.1',
      exportedAt: '2026-05-01T12:00:00.000Z',
      project: {
        id: 'project-1',
        name: 'Lesson Pack',
        user: 'teacher',
        globalTransposition: 2,
      },
      settings: {
        theme: 'dark',
        lang: 'pt',
        defaultInstrument: 'guitar-6',
        showTips: false,
      },
    });
    expect(payload.project.instances[0]).toMatchObject({ root: 'C', scaleType: 'Major (Ionian)' });
  });

  it('parses new project files and legacy project-shaped JSON', () => {
    const payload = serializeProjectFile({
      projectId: 'project-1',
      projectName: 'Import Me',
      user: 'alice',
      instances: [makeFretboard()],
      globalTranspose: 0,
      theme: 'light',
      lang: 'en',
      exportedAt: '2026-05-01T12:00:00.000Z',
    });

    expect(parseProjectFile(JSON.stringify(payload)).project.name).toBe('Import Me');
    expect(parseProjectFile(JSON.stringify(payload.project)).project.instances).toHaveLength(1);
  });

  it('rejects invalid project files', () => {
    expect(() => parseProjectFile(JSON.stringify({ hello: 'world' }))).toThrow(/Invalid Guitar Architect project file/);
  });
});
