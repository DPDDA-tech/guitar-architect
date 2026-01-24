
import { AppState, Project } from '../types';

const CONFIG_KEY = 'ga_config';
const PROJECTS_KEY = 'ga_library';

export const saveConfig = (state: AppState) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(state));
};

export const loadConfig = (): AppState | null => {
  const data = localStorage.getItem(CONFIG_KEY);
  return data ? JSON.parse(data) : null;
};

export const getLibrary = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProjectToLibrary = (project: Project) => {
  const library = getLibrary();
  const index = library.findIndex(p => p.id === project.id);
  if (index >= 0) {
    library[index] = { ...project, lastUpdated: new Date().toISOString() };
  } else {
    library.push({ ...project, lastUpdated: new Date().toISOString() });
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(library));
};

export const deleteProject = (id: string) => {
  const library = getLibrary().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(library));
};

export const clearAllData = () => {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(PROJECTS_KEY);
};
