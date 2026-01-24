
import { AppState } from '../types';

const STORAGE_KEY = 'guitar_architect_data';

export const saveToStorage = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to storage", e);
  }
};

export const loadFromStorage = (): AppState | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load from storage", e);
    return null;
  }
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
