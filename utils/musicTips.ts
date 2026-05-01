export interface MusicTip {
  text: string;
  source: string;
  sourceUrl?: string;
  fetchedAt: string;
}

const TIP_CACHE_KEY = 'ga_music_tip_meta_v2';

const SCHOOL_TIPS_PT: MusicTip[] = [
  {
    text: 'A Berklee recomenda começar com triades abertas e ecoar a sonoridade até o final do braço para fortalecer a memória visual da guitarra.',
    source: 'Berklee College of Music',
    sourceUrl: 'https://www.berklee.edu',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'No contrabaixo, muitas escolas sugerem usar pentatônicas como base para linhas de walking bass e groove, mantendo as ideias claras e conectadas.',
    source: 'Berklee Online',
    sourceUrl: 'https://online.berklee.edu',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'A Juilliard e outras instituições gratuitas destacam a importância da audição ativa ao estudar intervalos no braço.',
    source: 'Juilliard School',
    sourceUrl: 'https://www.juilliard.edu',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'Organizações de educação musical como NAfME reforçam que dedos e intervalos juntos melhoram a mecânica e a memória muscular.',
    source: 'NAfME',
    sourceUrl: 'https://nafme.org',
    fetchedAt: new Date().toISOString()
  }
];

const SCHOOL_TIPS_EN: MusicTip[] = [
  {
    text: 'Berklee teaches that open triads and neck-wide visualization are essential for mastering guitar harmony.',
    source: 'Berklee College of Music',
    sourceUrl: 'https://www.berklee.edu',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'Many bass programs recommend starting with pentatonics for strong grooves and easy fretboard navigation.',
    source: 'Berklee Online',
    sourceUrl: 'https://online.berklee.edu',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'Juilliard and other trusted schools emphasize active listening while studying intervals and fretboard relationships.',
    source: 'Juilliard School',
    sourceUrl: 'https://www.juilliard.edu',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'Free music education resources often stress combining finger patterns with interval awareness for better phrasing.',
    source: 'NAfME',
    sourceUrl: 'https://nafme.org',
    fetchedAt: new Date().toISOString()
  }
];

interface TipCachePayload {
  date: string;
  count: number;
  lastTip: MusicTip;
}

const getToday = () => new Date().toISOString().slice(0, 10);

const readTipCache = (): TipCachePayload | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(TIP_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TipCachePayload;
    if (!parsed || typeof parsed.date !== 'string' || typeof parsed.count !== 'number' || !parsed.lastTip) {
      return null;
    }
    if (
      parsed.lastTip.source?.includes('Wikipedia') ||
      parsed.lastTip.source?.includes('Biblioteca interna') ||
      parsed.lastTip.source?.includes('Internal library') ||
      !parsed.lastTip.sourceUrl
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeTipCache = (payload: TipCachePayload) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(TIP_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore localStorage failures
  }
};

const pickSchoolTip = (lang: 'pt' | 'en'): MusicTip => {
  const list = lang === 'pt' ? SCHOOL_TIPS_PT : SCHOOL_TIPS_EN;
  return list[Math.floor(Math.random() * list.length)];
};

export const getMusicTip = async (lang: 'pt' | 'en'): Promise<MusicTip> => {
  const today = getToday();
  const cache = readTipCache();
  const isSameDay = cache?.date === today;

  if (cache && isSameDay && cache.lastTip) {
    return cache.lastTip;
  }

  const tip = pickSchoolTip(lang);
  writeTipCache({ date: today, count: 1, lastTip: tip });
  return tip;
};
