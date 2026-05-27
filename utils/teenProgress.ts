export type TeenRank = {
  id: string;
  label: string;
  minXp: number;
  accentClass: string;
};

export const TEEN_RANKS: TeenRank[] = [
  { id: 'rookie', label: 'Rookie', minXp: 0, accentClass: 'text-cyan-400' },
  { id: 'runner', label: 'Runner', minXp: 120, accentClass: 'text-violet-400' },
  { id: 'architect', label: 'Architect', minXp: 320, accentClass: 'text-fuchsia-400' },
  { id: 'neon', label: 'Neon Player', minXp: 620, accentClass: 'text-emerald-400' },
];

const STORAGE_KEY = 'ga_teens_xp_v1';

export const getTeensXp = (): number => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
};

export const addTeensXp = (amount: number): number => {
  const next = Math.max(0, getTeensXp() + Math.floor(amount));
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // no-op
  }
  return next;
};

export const getRankByXp = (xp: number): TeenRank => {
  let current = TEEN_RANKS[0];
  for (const rank of TEEN_RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  return current;
};

export const getNextRankByXp = (xp: number): TeenRank | null => {
  return TEEN_RANKS.find((rank) => rank.minXp > xp) ?? null;
};

export const getRankProgress = (xp: number) => {
  const current = getRankByXp(xp);
  const next = getNextRankByXp(xp);
  if (!next) return { current, next: null, percent: 100 };
  const span = Math.max(1, next.minXp - current.minXp);
  const offset = Math.max(0, xp - current.minXp);
  const percent = Math.min(100, Math.round((offset / span) * 100));
  return { current, next, percent };
};
