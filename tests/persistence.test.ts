import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAllData, deleteProject, getLibrary, loadConfig, saveConfig, saveProjectToLibrary } from '../utils/persistence';
import type { AppState, Project } from '../types';

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'project-1',
  name: 'Project One',
  user: 'alice',
  lastUpdated: '2026-01-01T00:00:00.000Z',
  instances: [],
  globalTransposition: 0,
  ...overrides,
});

const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
};

describe('persistence', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    });
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves and loads config using the current user bootstrap key', () => {
    const config: AppState = {
      version: '1.8.6',
      activeProjectId: 'project-1',
      theme: 'light',
      lang: 'pt',
      currentUser: 'alice',
      defaultInstrument: 'guitar-6',
    };

    saveConfig(config);

    expect(loadConfig()).toEqual(config);
    expect(JSON.parse(localStorage.getItem('ga_config_alice') || '{}')).toEqual(config);
    expect(JSON.parse(localStorage.getItem('ga_config') || '{}')).toEqual(config);
  });

  it('saves, updates, loads, and deletes projects by user library key', () => {
    saveProjectToLibrary(makeProject());
    saveProjectToLibrary(makeProject({ name: 'Updated Project', globalTransposition: 2 }));
    saveProjectToLibrary(makeProject({ id: 'project-2', name: 'Second Project' }));

    expect(getLibrary('alice')).toHaveLength(2);
    expect(getLibrary('alice')[0]).toMatchObject({
      id: 'project-1',
      name: 'Updated Project',
      user: 'alice',
      globalTransposition: 2,
      lastUpdated: '2026-04-30T12:00:00.000Z',
    });
    expect(localStorage.getItem('ga_library_alice')).not.toBeNull();

    deleteProject('project-1', 'alice');

    expect(getLibrary('alice')).toEqual([
      expect.objectContaining({ id: 'project-2', name: 'Second Project' }),
    ]);
  });

  it('falls back to legacy ga_library data filtered by user', () => {
    localStorage.setItem(
      'ga_library',
      JSON.stringify([
        makeProject({ id: 'alice-project', user: 'alice' }),
        makeProject({ id: 'bob-project', user: 'bob' }),
      ])
    );

    expect(getLibrary('alice')).toEqual([
      expect.objectContaining({ id: 'alice-project', user: 'alice' }),
    ]);
  });

  it('clears bootstrap and legacy keys', () => {
    saveConfig({
      version: '1.8.6',
      activeProjectId: 'project-1',
      theme: 'dark',
      lang: 'en',
      currentUser: 'guest',
    });
    localStorage.setItem('ga_library', '[]');

    clearAllData();

    expect(localStorage.getItem('ga_config')).toBeNull();
    expect(localStorage.getItem('ga_library')).toBeNull();
  });
});
