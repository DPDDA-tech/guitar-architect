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

export const loadUserProfile = (): UserProfile => {
  if (!canUseLocalStorage()) return getDefaultUserProfile();

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
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

export const saveUserProfile = (profile: UserProfile) => {
  const next = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (canUseLocalStorage()) {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }

  return next;
};
