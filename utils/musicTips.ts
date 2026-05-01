export interface MusicTip {
  text: string;
  source: string;
  sourceUrl?: string;
  fetchedAt: string;
}

const TIP_CACHE_KEY = 'ga_music_tip_meta';
const DAILY_FETCH_LIMIT = 3;

const SCHOOL_PAGES_PT = [
  'Berklee_College_of_Music',
  'Teoria_musical',
  'Guitarra',
  'Contrabaixo',
  'Escalas_pentatônicas',
  'Improvisação_musical'
];

const SCHOOL_PAGES_EN = [
  'Berklee_College_of_Music',
  'Music_theory',
  'Guitar',
  'Electric_bass',
  'Pentatonic_scale',
  'Musical_improvisation',
  'Music_education'
];

const FALLBACK_TIPS_PT: MusicTip[] = [
  {
    text: 'A Teoria musical funciona como mapa: ela mostra as relações entre notas, acordes e escalas no braço do instrumento.',
    source: 'Biblioteca interna',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'No contrabaixo, as escalas pentatônicas são aliadas poderosas para construir linhas simples e eficazes.',
    source: 'Biblioteca interna',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'O sistema CAGED ajuda guitarristas a localizar inversões e padrões de acorde ao longo do braço.',
    source: 'Biblioteca interna',
    fetchedAt: new Date().toISOString()
  }
];

const FALLBACK_TIPS_EN: MusicTip[] = [
  {
    text: 'Music theory is like a roadmap: it reveals the relationships between notes, chords, and scales on the neck.',
    source: 'Internal library',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'On bass, pentatonic scales are a powerful ally for building simple and effective lines.',
    source: 'Internal library',
    fetchedAt: new Date().toISOString()
  },
  {
    text: 'The CAGED system helps guitarists locate inversions and chord patterns across the neck.',
    source: 'Internal library',
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

const pickFallbackTip = (lang: 'pt' | 'en'): MusicTip => {
  const list = lang === 'pt' ? FALLBACK_TIPS_PT : FALLBACK_TIPS_EN;
  return list[Math.floor(Math.random() * list.length)];
};

const buildTipFromWiki = async (lang: 'pt' | 'en'): Promise<MusicTip> => {
  const topics = lang === 'pt' ? SCHOOL_PAGES_PT : SCHOOL_PAGES_EN;
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const domain = lang === 'pt' ? 'pt.wikipedia.org' : 'en.wikipedia.org';
  const url = `https://${domain}/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const extract = typeof data.extract === 'string' ? data.extract.trim() : '';
  if (!extract) {
    throw new Error('No extract available');
  }

  const text = extract.length > 260 ? `${extract.slice(0, 260).trim()}...` : extract;
  const pageTitle = data.title || topic.replace(/_/g, ' ');
  const source = `${pageTitle} • Wikipedia`;
  const sourceUrl = data.content_urls?.desktop?.page || url;

  return {
    text,
    source,
    sourceUrl,
    fetchedAt: new Date().toISOString()
  };
};

export const getMusicTip = async (lang: 'pt' | 'en'): Promise<MusicTip> => {
  const today = getToday();
  const cache = readTipCache();
  const isSameDay = cache?.date === today;

  if (cache && isSameDay && cache.lastTip) {
    return cache.lastTip;
  }

  const currentCount = isSameDay ? cache.count : 0;
  const nextCount = currentCount + 1;

  if (currentCount >= DAILY_FETCH_LIMIT) {
    const fallback = pickFallbackTip(lang);
    writeTipCache({ date: today, count: currentCount, lastTip: fallback });
    return fallback;
  }

  try {
    const tip = await buildTipFromWiki(lang);
    writeTipCache({ date: today, count: nextCount, lastTip: tip });
    return tip;
  } catch {
    const fallback = pickFallbackTip(lang);
    writeTipCache({ date: today, count: currentCount, lastTip: fallback });
    return fallback;
  }
};
