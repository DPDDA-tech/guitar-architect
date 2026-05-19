import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import {
  FIFTHS_CYCLE,
  HARMONIC_ROOT_OPTIONS,
  HarmonicCycleMode,
  getCycleDisplayNote,
  getHarmonicKeyInfo,
  getSuggestedProgressions,
  resolveProgression,
} from '../music/harmonicCycle';
import { normalizeNote } from '../music/musicTheory';
import { recordAchievementEvent } from '../utils/achievementEvents';

type FretboardAction = 'scale' | 'field' | 'triads' | 'progression';

const PENDING_ACTION_KEY = 'ga_pending_fretboard_action';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const describeArc = (cx: number, cy: number, outer: number, inner: number, startAngle: number, endAngle: number) => {
  const startOuter = polarToCartesian(cx, cy, outer, endAngle);
  const endOuter = polarToCartesian(cx, cy, outer, startAngle);
  const startInner = polarToCartesian(cx, cy, inner, startAngle);
  const endInner = polarToCartesian(cx, cy, inner, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outer} ${outer} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${inner} ${inner} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
};

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const getNoteColorFamily = (note: string) => {
  const letter = note.trim().charAt(0).toUpperCase();
  if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(letter)) return letter;
  return 'A';
};

const NOTE_COLOR_CLASS: Record<string, { dark: string; light: string; activeDark: string; activeLight: string; relativeDark: string; relativeLight: string; relativeRingDark: string; relativeRingLight: string; textLight: string }> = {
  C: {
    dark: 'fill-[#72202b] stroke-[#dc5b63]/46 hover:fill-[#8a2633]',
    light: 'fill-[#e9b7bd] stroke-[#c76d79]/70 hover:fill-[#df9fa8]',
    activeDark: 'fill-[#dc2626] stroke-red-100/68 opacity-90',
    activeLight: 'fill-[#dc2626] stroke-red-700/65 opacity-[0.88]',
    relativeDark: 'fill-[#5a1820] stroke-[#f87171]/18 opacity-[0.50]',
    relativeLight: 'fill-[#d89aa4] stroke-[#b85b69]/24 opacity-[0.58]',
    relativeRingDark: 'stroke-[#f87171]/32',
    relativeRingLight: 'stroke-[#b85b69]/30',
    textLight: 'fill-[#3f1d22]',
  },
  D: {
    dark: 'fill-[#7a3a1c] stroke-[#f59e0b]/42 hover:fill-[#904622]',
    light: 'fill-[#e6c49b] stroke-[#c58a45]/70 hover:fill-[#ddb27e]',
    activeDark: 'fill-[#ea720c] stroke-orange-100/64 opacity-90',
    activeLight: 'fill-[#d97706] stroke-amber-800/62 opacity-[0.88]',
    relativeDark: 'fill-[#5a2e17] stroke-[#fb923c]/17 opacity-[0.50]',
    relativeLight: 'fill-[#d1a777] stroke-[#a66f31]/24 opacity-[0.58]',
    relativeRingDark: 'stroke-[#fb923c]/30',
    relativeRingLight: 'stroke-[#a66f31]/28',
    textLight: 'fill-[#3f2a18]',
  },
  E: {
    dark: 'fill-[#1a5a3d] stroke-[#34d399]/42 hover:fill-[#20704a]',
    light: 'fill-[#aed9c3] stroke-[#579d77]/70 hover:fill-[#98cdae]',
    activeDark: 'fill-[#10a86f] stroke-emerald-100/62 opacity-90',
    activeLight: 'fill-[#10b981] stroke-emerald-800/58 opacity-[0.86]',
    relativeDark: 'fill-[#16412d] stroke-[#34d399]/17 opacity-[0.50]',
    relativeLight: 'fill-[#96c2a7] stroke-[#4f8f6a]/24 opacity-[0.58]',
    relativeRingDark: 'stroke-[#34d399]/30',
    relativeRingLight: 'stroke-[#4f8f6a]/28',
    textLight: 'fill-[#18382a]',
  },
  F: {
    dark: 'fill-[#12616a] stroke-[#22d3ee]/40 hover:fill-[#177782]',
    light: 'fill-[#a8dce0] stroke-[#4f9da8]/70 hover:fill-[#91cfd5]',
    activeDark: 'fill-[#06a6c8] stroke-cyan-100/62 opacity-90',
    activeLight: 'fill-[#06b6d4] stroke-cyan-800/58 opacity-[0.86]',
    relativeDark: 'fill-[#11474e] stroke-[#22d3ee]/17 opacity-[0.50]',
    relativeLight: 'fill-[#8dc3c8] stroke-[#438c96]/24 opacity-[0.58]',
    relativeRingDark: 'stroke-[#22d3ee]/30',
    relativeRingLight: 'stroke-[#438c96]/28',
    textLight: 'fill-[#17363b]',
  },
  G: {
    dark: 'fill-[#1d4b89] stroke-[#60a5fa]/46 hover:fill-[#245da5]',
    light: 'fill-[#aacbf5] stroke-[#5a8dcc]/70 hover:fill-[#93bdef]',
    activeDark: 'fill-[#2f75ff] stroke-blue-100/66 opacity-90',
    activeLight: 'fill-[#3b82f6] stroke-blue-800/60 opacity-[0.88]',
    relativeDark: 'fill-[#1d3b64] stroke-[#60a5fa]/18 opacity-[0.50]',
    relativeLight: 'fill-[#8fb1d9] stroke-[#4f7db6]/26 opacity-[0.58]',
    relativeRingDark: 'stroke-[#60a5fa]/32',
    relativeRingLight: 'stroke-[#4f7db6]/30',
    textLight: 'fill-[#172b4a]',
  },
  A: {
    dark: 'fill-[#38475f] stroke-[#94a3b8]/42 hover:fill-[#465873]',
    light: 'fill-[#c3cfdd] stroke-[#7f90a6]/68 hover:fill-[#b3c1d2]',
    activeDark: 'fill-[#64748b] stroke-slate-100/62 opacity-90',
    activeLight: 'fill-[#64748b] stroke-slate-800/56 opacity-[0.86]',
    relativeDark: 'fill-[#2d384a] stroke-[#94a3b8]/17 opacity-[0.50]',
    relativeLight: 'fill-[#abb7c5] stroke-[#728398]/24 opacity-[0.58]',
    relativeRingDark: 'stroke-[#94a3b8]/28',
    relativeRingLight: 'stroke-[#728398]/26',
    textLight: 'fill-[#1f2937]',
  },
  B: {
    dark: 'fill-[#75531b] stroke-[#fbbf24]/42 hover:fill-[#8c6422]',
    light: 'fill-[#dfc98b] stroke-[#b78b28]/70 hover:fill-[#d4b96c]',
    activeDark: 'fill-[#c98a17] stroke-yellow-100/62 opacity-90',
    activeLight: 'fill-[#ca8a04] stroke-yellow-800/58 opacity-[0.88]',
    relativeDark: 'fill-[#563e16] stroke-[#fbbf24]/17 opacity-[0.50]',
    relativeLight: 'fill-[#c5ad6b] stroke-[#9f7a22]/24 opacity-[0.58]',
    relativeRingDark: 'stroke-[#fbbf24]/30',
    relativeRingLight: 'stroke-[#9f7a22]/28',
    textLight: 'fill-[#3b2d16]',
  },
};

type TonalVisualRole = 'primary' | 'relative' | 'progression' | 'default';

const RELATIVE_MINOR_LABELS: Record<string, string> = {
  C: 'Am',
  G: 'Em',
  D: 'Bm',
  A: 'F#m',
  E: 'C#m',
  B: 'G#m',
  'F#': 'D#m',
  Gb: 'Ebm',
  'C#': 'A#m',
  Db: 'Bbm',
  'G#': 'Fm',
  Ab: 'Fm',
  'D#': 'Cm',
  Eb: 'Cm',
  'A#': 'Gm',
  Bb: 'Gm',
  F: 'Dm',
};

const getSectorClass = (note: string, role: string, visualRole: TonalVisualRole, isLight: boolean, activeFamily = NOTE_COLOR_CLASS[getNoteColorFamily(note)] || NOTE_COLOR_CLASS.A) => {
  const family = NOTE_COLOR_CLASS[getNoteColorFamily(note)] || NOTE_COLOR_CLASS.A;
  if (visualRole === 'primary') {
    return isLight ? family.activeLight : family.activeDark;
  }
  if (visualRole === 'relative') {
    return `${isLight ? family.light : family.dark} ${isLight ? 'opacity-[0.68]' : 'opacity-[0.62]'}`;
  }
  if (visualRole === 'progression') {
    return isLight ? family.activeLight : family.activeDark;
  }

  if (role === 'dominant') {
    return `${isLight ? family.light : family.dark} opacity-95`;
  }
  if (role === 'subdominant') {
    return `${isLight ? family.light : family.dark} opacity-92`;
  }
  if (role === 'relative') {
    return `${isLight ? family.light : family.dark} opacity-82`;
  }
  if (role === 'diminished') {
    return `${isLight ? family.light : family.dark} opacity-74`;
  }

  return isLight ? family.light : family.dark;
};

const baseNote = (chord: string) => normalizeNote(chord.replace(/m|°|Â°/g, ''));

const HarmonicCyclePage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [root, setRoot] = useState('C');
  const [mode, setMode] = useState<HarmonicCycleMode>('major');
  const [selectedProgression, setSelectedProgression] = useState('');
  const [isTonicHovered, setIsTonicHovered] = useState(false);
  const t = translations[lang].harmonicCycle;
  const isLight = theme === 'light';
  const panelClass = isLight
    ? 'border-[#c2d0e1] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,252,0.92))] shadow-[0_24px_70px_rgba(71,85,105,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm'
    : 'border-blue-900/40 bg-[linear-gradient(145deg,rgba(9,14,23,0.97),rgba(3,7,18,0.93))] shadow-[0_26px_90px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(96,165,250,0.05)]';
  const cardClass = isLight
    ? 'border-[#d2deeb] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,253,0.94))] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_30px_rgba(71,85,105,0.09)] backdrop-blur-sm'
    : 'border-blue-950/50 bg-[linear-gradient(165deg,rgba(18,25,37,0.90),rgba(6,10,18,0.84))] shadow-[inset_0_1px_0_rgba(96,165,250,0.065),0_12px_34px_rgba(2,6,23,0.20)]';
  const inputClass = isLight
    ? 'border-[#cbd7e6] bg-white text-zinc-950 focus:border-blue-400 shadow-sm'
    : 'border-blue-950/70 bg-[#0e121a] text-white focus:border-blue-500';
  const neutralButtonClass = isLight
    ? 'border-[#cbd7e6] bg-white text-zinc-700 shadow-sm hover:border-blue-400 hover:text-blue-700'
    : 'border-blue-950/70 bg-[#0e121a] text-zinc-100 hover:border-blue-500';

  const info = useMemo(() => getHarmonicKeyInfo(root, mode), [root, mode]);
  const progressions = useMemo(() => getSuggestedProgressions(mode), [mode]);
  const progressionChords = useMemo(
    () => selectedProgression ? resolveProgression(selectedProgression, info.harmonicField) : [],
    [info.harmonicField, selectedProgression],
  );
  const selectedCycleIndex = Math.max(
    0,
    FIFTHS_CYCLE.findIndex(item => item.split('/').some(note => normalizeNote(note) === normalizeNote(info.displayRoot))),
  );
  const highlightedRoots = new Set(progressionChords.map(item => baseNote(item.chord)));
  const roleByRoot = new Map(info.harmonicField.map(item => [normalizeNote(item.note), item.role]));
  const relativeRoot = mode === 'major'
    ? normalizeNote(info.relative.replace(/m|°|Â°/g, ''))
    : normalizeNote(info.relative);
  const activeFamily = NOTE_COLOR_CLASS[getNoteColorFamily(info.displayRoot)] || NOTE_COLOR_CLASS.A;
  const centerStrokeClass = isLight ? activeFamily.relativeRingLight : activeFamily.relativeRingDark;
  const getVisualRole = (note: string, role: string, highlighted: boolean): TonalVisualRole => {
    const normalized = normalizeNote(note);
    if (role === 'tonic') return 'primary';
    if (normalized === relativeRoot) return 'relative';
    if (highlighted) return 'progression';
    return 'default';
  };
  const pageBackgroundStyle = isLight
    ? {
      backgroundColor: '#edf3f8',
      backgroundImage:
        'linear-gradient(rgba(156,163,175,0.085) 1px, transparent 1px), linear-gradient(90deg, rgba(156,163,175,0.085) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }
    : undefined;

  const keySignatureText = info.keySignature.type === 'none'
    ? t.none
    : `${info.keySignature.count} ${info.keySignature.type === 'sharps' ? t.sharps : t.flats}`;

  const applyToFretboard = (action: FretboardAction) => {
    if (action === 'scale') {
      recordAchievementEvent({ type: 'exploration', key: 'apply_scale' });
    }
    if (action === 'progression') {
      recordAchievementEvent({ type: 'exploration', key: 'harmonic_cycle_progression' });
    }
    window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({
      source: 'harmonic-cycle',
      action,
      root: info.root,
      displayRoot: info.displayRoot,
      scaleType: mode === 'major' ? 'Major (Ionian)' : 'Natural Minor (Aeolian)',
      progression: selectedProgression,
      chords: action === 'field'
        ? info.harmonicField.map(item => item.chord)
        : progressionChords.map(item => item.chord),
      harmonyMode: action === 'field' || action === 'progression' ? 'TETRADS' : action === 'triads' ? 'TRIADS' : 'OFF',
      createdAt: new Date().toISOString(),
    }));
    navigateTo('/');
  };

  const persistConfigPatch = (patch: Partial<AppState>) => {
    const current = loadConfig();
    if (!current) return;
    saveConfig({ ...current, ...patch });
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    setTheme(nextTheme);
    persistConfigPatch({ theme: nextTheme });
  };

  const toggleLang = () => {
    const nextLang: Lang = lang === 'pt' ? 'en' : 'pt';
    setLang(nextLang);
    persistConfigPatch({ lang: nextLang });
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <style>{`
        @keyframes ga-core-breathe {
          0%, 100% { opacity: 0.56; transform: scale(1); }
          50% { opacity: 0.74; transform: scale(1.008); }
        }
        @keyframes ga-tone-fade {
          0% { opacity: 0.82; }
          100% { opacity: 1; }
        }
        @keyframes ga-ring-drift {
          0%, 100% { opacity: 0.34; transform: rotate(0deg); }
          50% { opacity: 0.52; transform: rotate(0.7deg); }
        }
        .ga-core-breathe {
          animation: ga-core-breathe 13.5s ease-in-out infinite;
          transform-origin: 180px 180px;
        }
        .ga-tone-fade {
          animation: ga-tone-fade 420ms ease-out;
        }
        .ga-ring-drift {
          animation: ga-ring-drift 11s ease-in-out infinite;
          transform-origin: 180px 180px;
        }
      `}</style>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>{t.title}</h1>
            <p className={`mt-2 max-w-2xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleTheme} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${neutralButtonClass}`}>
              {isLight ? (lang === 'pt' ? 'Escuro' : 'Dark') : (lang === 'pt' ? 'Claro' : 'Light')}
            </button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${neutralButtonClass}`}>
              {lang === 'pt' ? 'EN' : 'PORT'}
            </button>
            <button onClick={() => navigateTo('/')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
              {t.backToFretboard}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1700px] gap-6 px-4 py-7 lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-[0.95fr_0.85fr_0.8fr]">
        <section className={`rounded-2xl border p-6 shadow-2xl ${panelClass}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">{t.tonic}</span>
              <select value={root} onChange={event => { setRoot(event.target.value); setSelectedProgression(''); }} className={`w-full rounded-xl border px-3 py-3 text-xs font-black uppercase outline-none ${inputClass}`}>
                {HARMONIC_ROOT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">{t.mode}</span>
              <select value={mode} onChange={event => { setMode(event.target.value as HarmonicCycleMode); setSelectedProgression(''); }} className={`w-full rounded-xl border px-3 py-3 text-xs font-black uppercase outline-none ${inputClass}`}>
                <option value="major">{t.major}</option>
                <option value="minor">{t.minor}</option>
              </select>
            </label>
          </div>

          <div className="mt-7 flex justify-center overflow-hidden">
            <svg viewBox="0 0 360 360" className={`aspect-square w-full max-w-[520px] overflow-visible ${isLight ? 'drop-shadow-[0_34px_72px_rgba(71,85,105,0.18)]' : 'drop-shadow-[0_30px_74px_rgba(15,23,42,0.50)]'}`}>
              <defs>
                <radialGradient id="cycleCore" cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor={isLight ? '#fbfdff' : '#241114'} />
                  <stop offset="38%" stopColor={isLight ? '#eef5fb' : '#0f0a11'} />
                  <stop offset="72%" stopColor={isLight ? '#eeeae5' : '#08070c'} />
                  <stop offset="100%" stopColor={isLight ? '#dfe7f0' : '#05070d'} />
                </radialGradient>
                <radialGradient id="cycleGravity" cx="50%" cy="50%" r="62%">
                  <stop offset="0%" stopColor={isLight ? '#fca5a5' : '#f87171'} stopOpacity={isLight ? '0.15' : '0.14'} />
                  <stop offset="42%" stopColor={isLight ? '#60a5fa' : '#2563eb'} stopOpacity={isLight ? '0.075' : '0.075'} />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="cycleTechnicalSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isLight ? '#ffffff' : '#60a5fa'} stopOpacity={isLight ? '0.26' : '0.15'} />
                  <stop offset="52%" stopColor="#2563eb" stopOpacity={isLight ? '0.03' : '0.10'} />
                  <stop offset="100%" stopColor={isLight ? '#94a3b8' : '#020617'} stopOpacity={isLight ? '0.16' : '0.20'} />
                </linearGradient>
                <linearGradient id="segmentBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={isLight ? '0.32' : '0.13'} />
                  <stop offset="42%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#020617" stopOpacity={isLight ? '0.16' : '0.30'} />
                </linearGradient>
                <linearGradient id="segmentTopSheen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={isLight ? '0.28' : '0.12'} />
                  <stop offset="30%" stopColor="#ffffff" stopOpacity={isLight ? '0.11' : '0.035'} />
                  <stop offset="100%" stopColor="#020617" stopOpacity={isLight ? '0.10' : '0.18'} />
                </linearGradient>
                <linearGradient id="diagonalReflection" x1="12%" y1="0%" x2="88%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={isLight ? '0.18' : '0.08'} />
                  <stop offset="42%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={isLight ? '0.05' : '0.025'} />
                </linearGradient>
                <filter id="cycleGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation={isLight ? '1.1' : '1.7'} floodColor={isLight ? '#ef4444' : '#f87171'} floodOpacity={isLight ? '0.09' : '0.16'} />
                </filter>
                <filter id="relativeGlow" x="-24%" y="-24%" width="148%" height="148%">
                  <feDropShadow dx="0" dy="0" stdDeviation={isLight ? '0.55' : '0.85'} floodColor={isLight ? '#64748b' : '#93c5fd'} floodOpacity={isLight ? '0.055' : '0.065'} />
                </filter>
                <filter id="sectorLift" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy={isLight ? '12' : '7'} stdDeviation={isLight ? '9.5' : '5.2'} floodColor={isLight ? '#64748b' : '#020617'} floodOpacity={isLight ? '0.16' : '0.20'} />
                </filter>
                <filter id="coreInset" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation={isLight ? '2.1' : '2.2'} floodColor={isLight ? '#8f1d2c' : '#f87171'} floodOpacity={isLight ? '0.11' : '0.12'} />
                  <feDropShadow dx="0" dy="10" stdDeviation={isLight ? '9' : '8'} floodColor="#020617" floodOpacity={isLight ? '0.13' : '0.32'} />
                </filter>
              </defs>
              <circle cx="180" cy="180" r="166" className={isLight ? 'fill-none stroke-slate-300/12' : 'fill-none stroke-blue-950/34'} strokeWidth={isLight ? '0.45' : '0.9'} />
              <circle cx="180" cy="180" r="156" className={`ga-ring-drift ${isLight ? 'fill-none stroke-blue-300/16' : 'fill-none stroke-blue-800/26'}`} strokeWidth={isLight ? '0.45' : '0.65'} strokeDasharray="2 8" />
              <circle cx="180" cy="180" r="103" className={isLight ? 'fill-none stroke-slate-300/24' : 'fill-none stroke-blue-950/22'} strokeWidth="0.8" />
              <circle cx="180" cy="180" r="78" className={`ga-ring-drift ${isLight ? 'fill-none stroke-blue-300/24' : 'fill-none stroke-blue-800/20'}`} strokeWidth="0.65" strokeDasharray="1.6 7" />
              {[...Array(12)].map((_, tickIndex) => {
                const angle = tickIndex * 30;
                const from = polarToCartesian(180, 180, 158, angle);
                const to = polarToCartesian(180, 180, 166, angle);
                return (
                  <line
                    key={tickIndex}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={isLight ? 'stroke-slate-300/24' : 'stroke-blue-900/45'}
                    strokeWidth={isLight ? '0.5' : '0.8'}
                  />
                );
              })}
              <circle cx="180" cy="180" r="136" className={`pointer-events-none fill-none ${centerStrokeClass} ${isLight ? 'opacity-[0.12]' : 'opacity-[0.24]'}`} strokeWidth="4.2" filter="url(#cycleGlow)" />
              <circle cx="180" cy="180" r="124" className={`pointer-events-none fill-none ${centerStrokeClass} ${isLight ? 'opacity-10' : 'opacity-20'}`} strokeWidth="1" strokeDasharray="7 10" />
              {FIFTHS_CYCLE.map((item, index) => {
                const relativeIndex = (index - selectedCycleIndex + 12) % 12;
                const centerAngle = relativeIndex * 30;
                const startAngle = centerAngle - 13.2;
                const endAngle = centerAngle + 13.2;
                const label = getCycleDisplayNote(item, info.accidental);
                const normalized = normalizeNote(label);
                const role = roleByRoot.get(normalized) || 'neighbor';
                const highlighted = highlightedRoots.has(normalized);
                const visualRole = getVisualRole(label, role, highlighted);
                const labelPoint = polarToCartesian(180, 180, 130, centerAngle);
                const relativeLabel = RELATIVE_MINOR_LABELS[label] || `${label}m`;
                const relativeLabelPoint = polarToCartesian(180, 180, 91, centerAngle);
                const isRelativePair = normalizeNote(label) === normalizeNote(info.displayRoot);
                const family = NOTE_COLOR_CLASS[getNoteColorFamily(label)] || NOTE_COLOR_CLASS.A;

                return (
                  <g
                    key={item}
                    className="group ga-tone-fade cursor-pointer transition-transform duration-500 hover:scale-[1.008]"
                    style={{ transformOrigin: '180px 180px' }}
                    onMouseEnter={() => visualRole === 'primary' && setIsTonicHovered(true)}
                    onMouseLeave={() => visualRole === 'primary' && setIsTonicHovered(false)}
                    onClick={() => { setRoot(label); setSelectedProgression(''); }}
                  >
                    {visualRole === 'relative' && (
                      <title>{lang === 'pt' ? `Relativa menor: ${info.relative}` : `Relative minor: ${info.relative}`}</title>
                    )}
                    <path d={describeArc(180, 180, 154, 103, startAngle, endAngle)} className={`${getSectorClass(label, role, visualRole, isLight, activeFamily)} stroke-[0.75] transition-all duration-300 ${isLight ? 'group-hover:stroke-slate-500/65' : 'group-hover:stroke-slate-200/35'}`} filter={visualRole === 'primary' || visualRole === 'progression' ? 'url(#cycleGlow)' : visualRole === 'relative' ? 'url(#relativeGlow)' : 'url(#sectorLift)'} />
                    <path d={describeArc(180, 180, 153, 104, startAngle + 1.5, endAngle - 1.5)} className="pointer-events-none fill-[url(#segmentBevel)] opacity-55" />
                    <path d={describeArc(180, 180, 153, 127, startAngle + 2, endAngle - 2)} className="pointer-events-none fill-[url(#segmentTopSheen)] opacity-75" />
                    <path d={describeArc(180, 180, 150, 111, startAngle + 3.2, endAngle - 3.2)} className="pointer-events-none fill-[url(#diagonalReflection)] opacity-50" />
                    <path
                      d={describeArc(180, 180, 99, 83, startAngle + 2.2, endAngle - 2.2)}
                      className={`pointer-events-none transition-opacity duration-500 ${isLight ? 'fill-[#d9b2b5] stroke-[#8f525a]/32 group-hover:opacity-[0.62]' : 'fill-[#3a151b] stroke-[#fda4af]/20 group-hover:opacity-[0.52]'} ${isRelativePair ? (isLight ? 'opacity-[0.56]' : 'opacity-[0.46]') : (isLight ? 'opacity-[0.28]' : 'opacity-[0.24]')}`}
                      strokeWidth="0.62"
                      filter={isRelativePair ? 'url(#relativeGlow)' : undefined}
                    />
                    <path
                      d={describeArc(180, 180, 98, 91, startAngle + 3.2, endAngle - 3.2)}
                      className="pointer-events-none fill-white opacity-0 transition-opacity duration-500 group-hover:opacity-[0.10]"
                    />
                    {visualRole === 'relative' && (
                      <>
                        <path
                          d={describeArc(180, 180, 157, 151, startAngle + 2, endAngle - 2)}
                          className={`pointer-events-none fill-none ${isLight ? activeFamily.relativeRingLight : activeFamily.relativeRingDark} ${isTonicHovered ? 'opacity-[0.28]' : 'opacity-[0.16]'} transition-opacity duration-700`}
                          strokeWidth="0.65"
                          filter="url(#relativeGlow)"
                        />
                        <path
                          d={describeArc(180, 180, 118, 112, startAngle + 3, endAngle - 3)}
                          className={`pointer-events-none fill-none ${isLight ? activeFamily.relativeRingLight : activeFamily.relativeRingDark} ${isTonicHovered ? 'opacity-[0.18]' : 'opacity-[0.08]'} transition-opacity duration-700`}
                          strokeWidth="0.45"
                        />
                      </>
                    )}
                    <path d={describeArc(180, 180, 154, 149, startAngle + 2.4, endAngle - 2.4)} className="pointer-events-none fill-white opacity-[0.08]" />
                    <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" className={`pointer-events-none text-[13px] font-black transition-colors duration-300 ${visualRole === 'primary' || visualRole === 'progression' ? 'fill-white' : isLight ? `${family.textLight} group-hover:fill-slate-950` : visualRole === 'relative' ? 'fill-slate-100 group-hover:fill-white' : 'fill-slate-200 group-hover:fill-white'}`}>
                      {label}
                    </text>
                    <text
                      x={relativeLabelPoint.x}
                      y={relativeLabelPoint.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`pointer-events-none text-[7px] font-black transition-opacity duration-500 ${isLight ? 'fill-[#7a3f47]' : 'fill-red-100'} ${isRelativePair ? (isLight ? 'opacity-[0.82]' : 'opacity-[0.72]') : (isLight ? 'opacity-[0.44]' : 'opacity-[0.38]')}`}
                    >
                      {relativeLabel}
                    </text>
                  </g>
                );
              })}
              <circle cx="180" cy="180" r="154" className={isLight ? 'fill-none stroke-[#91a8c3]/18' : 'fill-none stroke-blue-950/42'} strokeWidth="0.55" />
              <circle cx="180" cy="180" r="103" className={isLight ? 'fill-none stroke-[#91a8c3]/16' : 'fill-none stroke-blue-950/38'} strokeWidth="0.55" />
              <circle cx="180" cy="180" r="82" className="ga-core-breathe fill-[url(#cycleGravity)]" />
              <circle cx="180" cy="180" r="75" className={`fill-[url(#cycleCore)] ${centerStrokeClass}`} strokeWidth="1.2" filter="url(#coreInset)" />
              <circle cx="180" cy="180" r="62" className={isLight ? 'fill-none stroke-slate-300/70' : 'fill-none stroke-blue-950/45'} strokeWidth="0.85" />
              <circle cx="180" cy="180" r="48" className={isLight ? 'fill-none stroke-red-200/32' : 'fill-none stroke-red-900/30'} strokeWidth="0.65" strokeDasharray="1.4 7" />
              <text x="180" y="163" textAnchor="middle" className={`${isLight ? 'fill-blue-600' : 'fill-blue-100'} text-[10px] font-black uppercase tracking-[0.16em]`}>{t.selectedKey}</text>
              <text x="180" y="192" textAnchor="middle" className={`${isLight ? 'fill-zinc-950' : 'fill-white'} text-[26px] font-black`}>{info.keyName}</text>
              <text x="180" y="218" textAnchor="middle" className={`${isLight ? 'fill-slate-500' : 'fill-zinc-400'} text-[9px] font-black uppercase tracking-[0.18em]`}>{keySignatureText}</text>
            </svg>
          </div>
        </section>

        <section className={`rounded-2xl border p-5 shadow-2xl ${panelClass}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [t.selectedKey, mode === 'major' ? `${info.displayRoot} ${t.major}` : `${info.displayRoot} ${t.minor}`],
              [t.keySignature, keySignatureText],
              [t.scale, info.scale.join(' ')],
              [mode === 'major' ? t.relativeMinor : t.relativeMajor, info.relative],
              [mode === 'major' ? t.dominant : t.diatonicDominant, info.dominant],
              [t.subdominant, info.subdominant],
            ].map(([label, value], index) => (
              <div key={label} className={`rounded-xl border p-5 ${cardClass} ${index === 0 || index === 2 ? (isLight ? 'ring-1 ring-blue-100/80' : 'ring-1 ring-blue-900/18') : ''}`}>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                <p className={`mt-2.5 font-black tracking-tight ${index === 0 || index === 2 ? 'text-[21px]' : 'text-lg'} ${isLight ? 'text-zinc-950' : 'text-zinc-100'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className={`mt-6 rounded-xl border p-5 ${cardClass}`}>
            <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">{t.harmonicField}</h2>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
              {info.harmonicField.map(item => (
                <button key={item.degree} onClick={() => setSelectedProgression(item.degree)} className={`rounded-xl border px-3 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue-500 ${isLight ? 'border-[#dde5ef] bg-white/78 hover:bg-white' : 'border-blue-950/60 bg-[#080b11] hover:bg-[#101827]'}`}>
                  <span className="block text-[9px] font-black uppercase text-zinc-500">{item.degree}</span>
                  <span className={`mt-1.5 block text-sm font-black ${isLight ? 'text-zinc-950' : 'text-zinc-100'}`}>{item.chord}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-6 rounded-xl border p-5 ${isLight ? 'border-[#d3deeb] bg-[#eef4fb] shadow-inner shadow-white/60' : 'border-blue-950/60 bg-blue-950/10 shadow-inner shadow-blue-950/20'}`}>
            <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">{t.actions}</h2>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <button onClick={() => applyToFretboard('scale')} className={`${isLight ? 'border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_24px_rgba(37,99,235,0.22)] hover:bg-[linear-gradient(180deg,#5b96f5,#2f6fe8)]' : 'border border-blue-400/22 bg-[linear-gradient(180deg,#2e6af0,#1d4ed8)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_28px_rgba(15,23,42,0.32)] hover:bg-[linear-gradient(180deg,#3775f4,#2563eb)]'} rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white transition`}>{t.showScale}</button>
              <button onClick={() => applyToFretboard('field')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase transition hover:border-blue-500 ${isLight ? 'border-blue-200 bg-white/80 text-blue-700 hover:bg-white' : 'border-blue-900/60 bg-[#080b11] text-blue-100'}`}>{t.showField}</button>
              <button onClick={() => applyToFretboard('triads')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase transition hover:border-blue-500 ${isLight ? 'border-blue-200 bg-white/80 text-blue-700 hover:bg-white' : 'border-blue-900/60 bg-[#080b11] text-blue-100'}`}>{t.showTriads}</button>
              <button onClick={() => applyToFretboard('progression')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase transition hover:border-blue-500 ${isLight ? 'border-blue-200 bg-white/80 text-blue-700 hover:bg-white' : 'border-blue-900/60 bg-[#080b11] text-blue-100'}`}>{t.practiceProgression}</button>
            </div>
          </div>
        </section>

        <aside className={`rounded-2xl border p-6 shadow-2xl lg:col-span-2 xl:col-span-1 ${panelClass}`}>
          <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">{t.progressions}</h2>
          <div className="mt-5 space-y-2.5">
            {progressions.map(progression => (
              <button key={progression} onClick={() => setSelectedProgression(progression)} className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm font-black transition duration-200 ${selectedProgression === progression ? (isLight ? 'border-blue-400 bg-blue-500 text-white shadow-lg shadow-blue-200/40' : 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-950/25') : isLight ? 'border-[#d3deeb] bg-white text-slate-700 shadow-sm hover:border-blue-300' : 'border-blue-950/60 bg-[#0d1017] text-zinc-300 hover:-translate-y-0.5 hover:border-blue-700 hover:bg-[#111827]'}`}>
                {progression}
              </button>
            ))}
          </div>

          <div className={`mt-6 rounded-xl border p-5 ${cardClass}`}>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500">{t.resultingChords}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(progressionChords.length > 0 ? progressionChords : info.harmonicField).map(item => (
                <span key={`${item.degree}-${item.chord}`} className={`rounded-lg border px-3 py-2 text-xs font-black ${isLight ? 'border-blue-200 bg-white text-blue-700 shadow-sm' : 'border-blue-900/50 bg-[#080b11] text-blue-100'}`}>
                  {item.degree}: {item.chord}
                </span>
              ))}
            </div>
            {mode === 'minor' && selectedProgression.includes('V') && (
              <p className="mt-4 text-xs font-bold text-amber-200">{t.harmonicDominantHint}</p>
            )}
            <button onClick={() => applyToFretboard('progression')} className={`${isLight ? 'border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_24px_rgba(37,99,235,0.22)] hover:bg-[linear-gradient(180deg,#5b96f5,#2f6fe8)]' : 'border border-blue-400/22 bg-[linear-gradient(180deg,#2e6af0,#1d4ed8)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_28px_rgba(15,23,42,0.32)] hover:bg-[linear-gradient(180deg,#3775f4,#2563eb)]'} mt-4 w-full rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white transition`}>
              {t.showOnFretboard}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default HarmonicCyclePage;
