import { AppState, Project } from '../types';
import { InstrumentType } from '../types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isStableUserStorageId = (userId?: string | null) => (
  userId === 'guest' || Boolean(userId && UUID_REGEX.test(userId))
);

/**
 * Gera uma chave de storage escopada por usuário (UUID) ou guest.
 */
export function getScopedStorageKey(baseKey: string, userId?: string | null) {
  // Impede que e-mail ou displayName sejam usados como chave de persistência
  const isGuest = !userId || userId === 'guest';
  return isGuest ? `${baseKey}_guest` : `${baseKey}_${userId}`;
}

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

export const saveConfig = (state: AppState, userId?: string | null) => {
  const effectiveId = userId || state.currentUser;
  const key = getScopedStorageKey(CONFIG_KEY, effectiveId);
  
  // Salva o estado completo na chave escopada (UUID ou guest)
  localStorage.setItem(
    key,
    JSON.stringify(state)
  );

  // Mirror global (Bootstrap leve): apenas o essencial para restaurar a sessão
  // NÃO inclui userLogo, projetos ativos ou dados de profile
  const bootstrapConfig = {
    version: state.version,
    currentUser: effectiveId,
    theme: state.theme,
    lang: state.lang,
    defaultInstrument: state.defaultInstrument,
    showTips: state.showTips,
  };

  localStorage.setItem(
    CONFIG_KEY,
    JSON.stringify(bootstrapConfig)
  );
};

export const loadConfig = (userId?: string | null): AppState | null => {
  // 🔎 tenta descobrir último usuário salvo
  const global = localStorage.getItem(CONFIG_KEY);
  if (!global) return null;

  try {
    const parsed = JSON.parse(global);
    const targetId = userId || parsed.currentUser;

    const userKey = getScopedStorageKey(CONFIG_KEY, targetId);
    const userConfig = localStorage.getItem(userKey);

    return userConfig
      ? JSON.parse(userConfig)
      : parsed;

  } catch {

    return null;

  }

};

export const getLibrary = (userId?: string | null): Project[] => {
  const key = getScopedStorageKey(PROJECTS_KEY, userId);
  const effectiveUserId = userId || 'guest';
  const scopedLibrary = safeParse<unknown>(localStorage.getItem(key));

  if (Array.isArray(scopedLibrary)) {
    return scopedLibrary.filter((project): project is Project => (
      typeof project === 'object' &&
      project !== null &&
      (project as Partial<Project>).user === effectiveUserId
    ));
  }

  // Fallback apenas para projetos legados sem UUID
  const legacyLibrary = safeParse<unknown>(localStorage.getItem(PROJECTS_KEY));
  if (!Array.isArray(legacyLibrary)) return [];

  return legacyLibrary.filter((project): project is Project => (
    typeof project === 'object' &&
    project !== null &&
    (project as Partial<Project>).user === effectiveUserId
  ));
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

export const saveProjectToLibrary = (project: Project, userId?: string | null) => {
  const effectiveId = userId || project.user;
  const library = getLibrary(effectiveId);

  // 🔒 procura projeto do mesmo usuário + mesmo id
  const index = library.findIndex(p => p.id === project.id);

  if (index >= 0) {
    library[index] = { ...project, lastUpdated: new Date().toISOString() };

  } else {
    library.push({ ...project, lastUpdated: new Date().toISOString() });
  }

  localStorage.setItem(
    getScopedStorageKey(PROJECTS_KEY, effectiveId),
    JSON.stringify(library)
  );
};

export const deleteProject = (
  id: string,
  userId: string
) => {
  const library = getLibrary(userId).filter(p => p.id !== id);

  localStorage.setItem(
    getScopedStorageKey(PROJECTS_KEY, userId),
    JSON.stringify(library)
  );
};


export const clearAllData = () => {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(PROJECTS_KEY);
};
