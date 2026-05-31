import { getScopedStorageKey } from './persistence';

const BASE_KEY = 'ga_kids_custom_guitar';
const MAX_GUITARS = 10;

export interface KidsCustomGuitar {
  id: string;
  model: string;
  color: string;
  name: string;
  createdAt: string;
}

export const loadKidsCustomGuitars = (userId?: string | null): KidsCustomGuitar[] => {
  if (typeof window === 'undefined') return [];
  const key = getScopedStorageKey(BASE_KEY, userId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveKidsCustomGuitars = (guitars: KidsCustomGuitar[], userId?: string | null): void => {
  if (typeof window === 'undefined') return;
  const key = getScopedStorageKey(BASE_KEY, userId);
  window.localStorage.setItem(key, JSON.stringify(guitars));
};

export interface AddGuitarResult {
  guitars: KidsCustomGuitar[];
  newGuitar: KidsCustomGuitar;
  removedOldest: boolean;
}

export const addKidsCustomGuitar = (
  draft: Omit<KidsCustomGuitar, 'id' | 'createdAt'>,
  userId?: string | null,
): AddGuitarResult => {
  const existing = loadKidsCustomGuitars(userId);
  const newGuitar: KidsCustomGuitar = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  // newest first
  let guitars = [newGuitar, ...existing];
  let removedOldest = false;

  if (guitars.length > MAX_GUITARS) {
    guitars = guitars.slice(0, MAX_GUITARS);
    removedOldest = true;
  }

  saveKidsCustomGuitars(guitars, userId);
  return { guitars, newGuitar, removedOldest };
};
