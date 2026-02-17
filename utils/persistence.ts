
import { AppState, Project } from '../types';
import { InstrumentType } from '../types';

// library agora é dinâmica por usuário
const getProjectsKey = (user: string) =>
  `ga_library_${user || 'guest'}`;

const CONFIG_KEY = 'ga_config';
const PROJECTS_KEY = 'ga_library';

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
  return data ? JSON.parse(data) : [];
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
    PROJECTS_KEY,
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
