import { getScopedStorageKey } from '../../utils/persistence';

export interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  address: string;
  updatedAt: string;
}

const PROFILE_KEY = 'ga_user_profile';

const canUseLocalStorage = () => (
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined'
);

export const getDefaultUserProfile = (): UserProfile => ({
  displayName: '',
  email: '',
  phone: '',
  address: '',
  updatedAt: new Date().toISOString(),
});

export const loadUserProfile = (userId?: string | null): UserProfile => {
  if (!canUseLocalStorage()) return getDefaultUserProfile();

  const key = getScopedStorageKey(PROFILE_KEY, userId);
  try {
    const raw = window.localStorage.getItem(key) || window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return getDefaultUserProfile();
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...getDefaultUserProfile(),
      ...parsed,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return getDefaultUserProfile();
  }
};

export const saveUserProfile = (profile: UserProfile, userId?: string | null) => {
  const next = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  const key = getScopedStorageKey(PROFILE_KEY, userId);
  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, JSON.stringify(next));
  }

  return next;
};
