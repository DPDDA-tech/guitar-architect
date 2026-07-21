import { describe, expect, it } from 'vitest';
import { parseProjectFile, serializeProjectFile } from '../utils/projectFile';
import type { FretboardState, ProjectFilePayload } from '../types';

describe('project file export/import', () => {
  const sampleInstances: FretboardState[] = [
    {
      id: 'diagram-1',
      title: 'My Diagram',
      subtitle: 'Test',
      notes: 'Some notes',
      startFret: 0,
      endFret: 12,
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
        showTonic: false,
      },
      markers: [],
      lines: []
    }
  ];

  const project = {
    id: 'project-1',
    name: 'Project One',
    user: 'alice',
    lastUpdated: '2026-01-01T00:00:00.000Z',
    instances: sampleInstances,
    globalTransposition: 0,
  };

  it('builds a valid export payload', () => {
    const payload = serializeProjectFile({
      projectId: project.id,
      projectName: project.name,
      user: project.user,
      instances: project.instances,
      globalTranspose: project.globalTransposition,
      theme: 'dark',
      lang: 'en',
      userLogo: 'https://example.com/logo.png',
      defaultInstrument: 'guitar-6',
      exportedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(payload.appVersion).toBe('1.8.7');
    expect(payload.project.name).toBe('Project One');
    expect(payload.settings.theme).toBe('dark');
    expect(payload.settings.lang).toBe('en');
    expect(payload.settings.userLogo).toBe('https://example.com/logo.png');
    expect(payload.project.instances).toEqual(sampleInstances);
    expect(payload.exportedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('parses a valid project file JSON string', () => {
    const payload = serializeProjectFile({
      projectId: project.id,
      projectName: project.name,
      user: project.user,
      instances: project.instances,
      globalTranspose: project.globalTransposition,
      theme: 'light',
      lang: 'pt',
      exportedAt: '2026-01-01T00:00:00.000Z',
    });
    const serialized = JSON.stringify(payload);

    const parsed = parseProjectFile(serialized);
    expect(parsed).toEqual(payload);
  });

  it('throws when parsing invalid project JSON', () => {
    expect(() => parseProjectFile('{"foo": "bar"}')).toThrow();
    expect(() => parseProjectFile('not json')).toThrow();
  });
});
