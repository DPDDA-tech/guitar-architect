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

const AWARDS_STORAGE_KEY = 'ga_teens_xp_awards_v1';

const getAwardedKeys = (): Set<string> => {
  try {
    const raw = window.localStorage.getItem(AWARDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
};

const persistAwardedKeys = (keys: Set<string>) => {
  try {
    window.localStorage.setItem(AWARDS_STORAGE_KEY, JSON.stringify(Array.from(keys)));
  } catch {
    // no-op
  }
};

export const hasTeensXpAward = (key: string): boolean => getAwardedKeys().has(key);

// XP de conquista: a primeira conclusão de uma chave (ex.: um quiz, um riff, uma combinação
// de escala+shape+modo no Scale Hunter) dá `fullXp`; conclusões repetidas da MESMA chave dão
// `repeatXp` (0 por padrão). Não substitui addTeensXp — ferramentas de prática repetitiva
// (Batidas Populares, Rhythm Lab) continuam chamando addTeensXp direto, sem dedup.
export const addTeensXpOnce = (
  key: string,
  fullXp: number,
  repeatXp = 0,
): { xp: number; total: number; firstTime: boolean } => {
  const keys = getAwardedKeys();
  const firstTime = !keys.has(key);
  const amount = firstTime ? fullXp : repeatXp;
  if (firstTime) {
    keys.add(key);
    persistAwardedKeys(keys);
  }
  const total = amount > 0 ? addTeensXp(amount) : getTeensXp();
  return { xp: amount, total, firstTime };
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
