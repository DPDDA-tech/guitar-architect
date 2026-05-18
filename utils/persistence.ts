
import { AppState, Project } from '../types';
import { InstrumentType } from '../types';

// library agora é dinâmica por usuário
const getProjectsKey = (user: string) =>
  `ga_library_${user || 'guest'}`;

const CONFIG_KEY = 'ga_config';
const PROJECTS_KEY = 'ga_library';

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const saveConfig = (state: AppState) => {

  const key = `${CONFIG_KEY}_${state.currentUser || 'guest'}`;

  localStorage.setItem(
    key,
    JSON.stringify(state)
  );

  // bootstrap
  localStorage.setItem(
    CONFIG_KEY,
    JSON.stringify(state)
  );
};

export const loadConfig = (): AppState | null => {

  // 🔎 tenta descobrir último usuário salvo
  const global = localStorage.getItem(CONFIG_KEY);

  if (!global) return null;

  try {

    const parsed = JSON.parse(global);

    const userKey =
      `${CONFIG_KEY}_${parsed.currentUser || 'guest'}`;

    const userConfig =
      localStorage.getItem(userKey);

    return userConfig
      ? JSON.parse(userConfig)
      : parsed;

  } catch {

    return null;

  }

};


export const getLibrary = (user: string): Project[] => {
  const data = localStorage.getItem(
    getProjectsKey(user)
  );
  if (data) return JSON.parse(data);

  const legacyData = localStorage.getItem(PROJECTS_KEY);
  if (!legacyData) return [];

  try {
    return JSON.parse(legacyData).filter(
      (project: Project) => project.user === user
    );
  } catch {
    return [];
  }
};

export const listLocalUsers = (): string[] => {
  if (typeof localStorage === 'undefined') return [];

  const users = new Set<string>();
  const globalConfig = safeParse<AppState>(localStorage.getItem(CONFIG_KEY));
  if (globalConfig?.currentUser) users.add(globalConfig.currentUser);

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i) || '';
    if (key.startsWith(`${CONFIG_KEY}_`)) {
      const user = key.slice(`${CONFIG_KEY}_`.length);
      if (user && user !== 'guest') users.add(user);
    }
    if (key.startsWith('ga_library_')) {
      const user = key.slice('ga_library_'.length);
      if (user && user !== 'guest') users.add(user);
    }
  }

  const legacyProjects = safeParse<Project[]>(localStorage.getItem(PROJECTS_KEY));
  if (Array.isArray(legacyProjects)) {
    legacyProjects.forEach(project => {
      if (project.user) users.add(project.user);
    });
  }

  return Array.from(users).sort((a, b) => a.localeCompare(b));
};

export const saveProjectToLibrary = (project: Project) => {

  const library = getLibrary(project.user);

  // 🔒 procura projeto do mesmo usuário + mesmo id
  const index = library.findIndex(
    p =>
      p.id === project.id &&
      p.user === project.user
  );

  if (index >= 0) {

    library[index] = {
      ...project,
      lastUpdated: new Date().toISOString()
    };

  } else {

    library.push({
      ...project,
      lastUpdated: new Date().toISOString()
    });

  }

  localStorage.setItem(
    getProjectsKey(project.user),
    JSON.stringify(library)
  );
};

export const deleteProject = (
  id: string,
  user: string
) => {

  const library = getLibrary(user).filter(
    p => p.id !== id
  );

  localStorage.setItem(
    getProjectsKey(user),
    JSON.stringify(library)
  );
};


export const clearAllData = () => {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(PROJECTS_KEY);
};
