import type { FretboardState, InstrumentType, Project, ProjectFilePayload, ThemeMode } from '../types';

const APP_VERSION = '1.8.6';

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
    },
  };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasMinimalFretboardShape = (value: unknown): value is FretboardState => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.root === 'string' &&
    typeof value.scaleType === 'string' &&
    typeof value.instrumentType === 'string' &&
    typeof value.tuning === 'string' &&
    Array.isArray(value.stringStatuses) &&
    Array.isArray(value.markers) &&
    Array.isArray(value.lines) &&
    isObject(value.layers)
  );
};

const hasMinimalProjectShape = (value: unknown): value is Project => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.user === 'string' &&
    Array.isArray(value.instances) &&
    value.instances.every(hasMinimalFretboardShape)
  );
};

export const parseProjectFile = (raw: string): ProjectFilePayload => {
  const parsed = JSON.parse(raw) as unknown;

  if (isObject(parsed) && parsed.schema === 'guitar-architect-project' && hasMinimalProjectShape(parsed.project)) {
    const settings = isObject(parsed.settings) ? parsed.settings : {};
    return {
      schema: 'guitar-architect-project',
      appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : APP_VERSION,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      project: {
        ...parsed.project,
        globalTransposition: Number(parsed.project.globalTransposition || 0),
      },
      settings: {
        theme: settings.theme === 'dark' ? 'dark' : 'light',
        lang: settings.lang === 'en' ? 'en' : 'pt',
        defaultInstrument: settings.defaultInstrument as InstrumentType | undefined,
        userLogo: typeof settings.userLogo === 'string' ? settings.userLogo : undefined,
        showTips: typeof settings.showTips === 'boolean' ? settings.showTips : undefined,
      },
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
