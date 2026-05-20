import type { FretboardState, InstrumentType, Project, ProjectFilePayload, ThemeMode, UserInstrument } from '../types';
import type { AchievementProgressState } from '../types/achievement';

const APP_VERSION = '1.8.7';

export interface ProjectFileInput {
  projectId: string;
  projectName: string;
  user: string;
  instances: FretboardState[];
  globalTranspose: number;
  theme: ThemeMode;
  lang: 'pt' | 'en';
  defaultInstrument?: InstrumentType;
  userLogo?: string;
  showTips?: boolean;
  themeCollection?: ProjectFilePayload['settings']['themeCollection'];
  achievements?: {
    unlockedAchievementIds: string[];
    progress: AchievementProgressState;
    selectedRewardBadgeId?: string | null;
  };
  instruments?: UserInstrument[];
  exportedAt?: string;
}

export const slugifyProjectName = (name: string) => {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'projeto';
};

export const buildProjectFileName = (projectName: string, date = new Date()) => {
  const isoDate = date.toISOString().slice(0, 10);
  return `guitar-architect-${slugifyProjectName(projectName)}-${isoDate}.json`;
};

export const serializeProjectFile = (input: ProjectFileInput): ProjectFilePayload => {
  const exportedAt = input.exportedAt || new Date().toISOString();
  const project: Project = {
    id: input.projectId,
    name: input.projectName,
    user: input.user,
    lastUpdated: exportedAt,
    instances: input.instances,
    globalTransposition: input.globalTranspose,
  };

  return {
    schema: 'guitar-architect-project',
    appVersion: APP_VERSION,
    exportedAt,
    project,
    settings: {
      theme: input.theme,
      lang: input.lang,
      defaultInstrument: input.defaultInstrument,
      userLogo: input.userLogo,
      showTips: input.showTips,
      themeCollection: input.themeCollection,
      achievements: input.achievements,
    },
    instruments: input.instruments,
  };
};

const readStringArray = (value: unknown) => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasMinimalFretboardShape = (value: unknown): value is FretboardState => {
  if (!isObject(value)) return false;
  return (
    typeof value.root === 'string' &&
    typeof value.scaleType === 'string'
  );
};

const hasMinimalProjectShape = (value: unknown): value is Project => {
  if (!isObject(value)) return false;
  return (
    (typeof value.name === 'string' || typeof value.id === 'string') &&
    Array.isArray(value.instances)
  );
};

const normalizeFretboard = (data: any): FretboardState => ({
  id: data.id || crypto.randomUUID(),
  title: data.title || '',
  subtitle: data.subtitle || '',
  notes: data.notes || '',
  startFret: data.startFret ?? 0,
  endFret: data.endFret ?? 24,
  isLeftHanded: !!data.isLeftHanded,
  root: data.root || 'C',
  scaleType: data.scaleType || 'Major (Ionian)',
  instrumentType: data.instrumentType || 'guitar-6',
  tuning: data.tuning || 'Standard',
  stringStatuses: Array.isArray(data.stringStatuses) ? data.stringStatuses : [],
  labelMode: data.labelMode || 'note',
  harmonyMode: data.harmonyMode || 'OFF',
  chordQuality: data.chordQuality || 'MAJOR',
  chordDegree: data.chordDegree ?? 0,
  inversion: data.inversion ?? 0,
  colorMode: data.colorMode || 'MULTI',
  layers: isObject(data.layers) ? data.layers : {
    showInlays: true,
    showAllNotes: false,
    showScale: true,
    showTonic: true,
  },
  markers: Array.isArray(data.markers) ? data.markers : [],
  lines: Array.isArray(data.lines) ? data.lines : [],
  ...data
});

export const parseProjectFile = (raw: string): ProjectFilePayload => {
  const parsed = JSON.parse(raw) as any;

  if (isObject(parsed) && parsed.schema === 'guitar-architect-project' && isObject(parsed.project)) {
    const settings = isObject(parsed.settings) ? (parsed.settings as any) : null;
    const project = parsed.project;
    
    const themeCollection = isObject(settings.themeCollection)
      ? {
        activeThemeId: typeof settings.themeCollection.activeThemeId === 'string' ? settings.themeCollection.activeThemeId : '',
        unlockedThemeIds: readStringArray(settings.themeCollection.unlockedThemeIds),
      }
      : undefined;

    const achievements = (settings && isObject(settings.achievements)) ? {
        unlockedAchievementIds: readStringArray(settings.achievements.unlockedAchievementIds),
        progress: isObject(settings.achievements.progress) ? settings.achievements.progress as AchievementProgressState : {},
        selectedRewardBadgeId: typeof settings.achievements.selectedRewardBadgeId === 'string' ? settings.achievements.selectedRewardBadgeId : null,
      }
      : undefined;
    return {
      schema: 'guitar-architect-project',
      appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : APP_VERSION,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      project: {
        id: project.id || crypto.randomUUID(),
        name: project.name || 'Projeto Importado',
        user: project.user || 'guest',
        lastUpdated: project.lastUpdated || new Date().toISOString(),
        instances: Array.isArray(project.instances) ? project.instances.map(normalizeFretboard) : [],
        globalTransposition: Number(project.globalTransposition || 0),
      } as Project,
      settings: {
        theme: settings.theme === 'dark' ? 'dark' : 'light',
        lang: settings.lang === 'en' ? 'en' : 'pt',
        defaultInstrument: settings.defaultInstrument as InstrumentType | undefined,
        userLogo: typeof settings.userLogo === 'string' ? settings.userLogo : undefined,
        showTips: typeof settings.showTips === 'boolean' ? settings.showTips : undefined,
        themeCollection,
        achievements,
      },
      instruments: Array.isArray(parsed.instruments) ? parsed.instruments as UserInstrument[] : undefined,
    };
  }

  if (hasMinimalProjectShape(parsed)) {
    return {
      schema: 'guitar-architect-project',
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      project: {
        ...parsed,
        globalTransposition: Number(parsed.globalTransposition || 0),
      },
      settings: {
        theme: 'light',
        lang: 'pt',
      },
    };
  }

  throw new Error('Invalid Guitar Architect project file');
};
