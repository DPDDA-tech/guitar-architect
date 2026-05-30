import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import { recordAchievementEvent } from '../utils/achievementEvents';
import { returnToFretboard } from '../utils/fretboardNavigation';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';
import type { FretboardIntent } from '../types/fretboardIntent';

type StudyModuleId = 'learn' | 'practice' | 'chords' | 'caged' | 'triads-tetrads' | 'greek-modes';

interface StudyModulePageProps {
  moduleId: StudyModuleId;
}

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const MODULE_CONTENT: Record<StudyModuleId, {
  titlePt: string;
  titleEn: string;
  subtitlePt: string;
  subtitleEn: string;
  root: string;
  scaleType: string;
  action: 'scale' | 'field' | 'triads' | 'progression';
  cardsPt: string[];
  cardsEn: string[];
  ctasPt: string[];
  ctasEn: string[];
}> = {
  learn: {
    titlePt: 'Aprender',
    titleEn: 'Learn',
    subtitlePt: 'Construa intervalos, escalas, acordes e funções com apoio visual no braço.',
    subtitleEn: 'Build intervals, scales, chords and functions with visual fretboard support.',
    root: 'C',
    scaleType: 'Major (Ionian)',
    action: 'scale',
    cardsPt: ['Intervalos como distância musical', 'Escalas como mapas de notas', 'Acordes como empilhamento de terças', 'Funções tonais e resolução'],
    cardsEn: ['Intervals as musical distance', 'Scales as note maps', 'Chords as stacked thirds', 'Tonal functions and resolution'],
    ctasPt: ['Mostrar escala no braço', 'Aplicar tônica C', 'Ver campo harmônico'],
    ctasEn: ['Show scale on fretboard', 'Apply C tonic', 'See harmonic field'],
  },
  practice: {
    titlePt: 'Praticar',
    titleEn: 'Practice',
    subtitlePt: 'Treine localização, progressões, intervalos e resposta musical no instrumento.',
    subtitleEn: 'Practice location, progressions, intervals and musical response on the instrument.',
    root: 'A',
    scaleType: 'Natural Minor (Aeolian)',
    action: 'progression',
    cardsPt: ['Localizar notas por região', 'Trocas de acordes com metrônomo', 'Progressões essenciais', 'Memória visual do braço'],
    cardsEn: ['Find notes by region', 'Chord changes with metronome', 'Essential progressions', 'Fretboard visual memory'],
    ctasPt: ['Praticar Am - F - C - G', 'Mostrar escala menor', 'Abrir treino no braço'],
    ctasEn: ['Practice Am - F - C - G', 'Show minor scale', 'Open fretboard drill'],
  },
  chords: {
    titlePt: 'Acordes',
    titleEn: 'Chords',
    subtitlePt: 'Explore fórmulas, inversões, voicings, tensões e aplicação no braço.',
    subtitleEn: 'Explore formulas, inversions, voicings, tensions and fretboard application.',
    root: 'C',
    scaleType: 'Major (Ionian)',
    action: 'field',
    cardsPt: ['Tríade: 1 3 5', 'Tétrade: 1 3 5 7', 'Inversões e condução', 'Tensões 9, 11 e 13'],
    cardsEn: ['Triad: 1 3 5', 'Seventh chord: 1 3 5 7', 'Inversions and voice leading', 'Tensions 9, 11 and 13'],
    ctasPt: ['Mostrar campo harmônico', 'Visualizar acordes diatônicos', 'Aplicar voicings'],
    ctasEn: ['Show harmonic field', 'View diatonic chords', 'Apply voicings'],
  },
  caged: {
    titlePt: 'CAGED',
    titleEn: 'CAGED',
    subtitlePt: 'Entenda como formas C, A, G, E e D organizam acordes, arpejos e escalas.',
    subtitleEn: 'Understand how C, A, G, E and D shapes organize chords, arpeggios and scales.',
    root: 'C',
    scaleType: 'Major (Ionian)',
    action: 'triads',
    cardsPt: ['Cinco formas conectadas', 'Acorde, arpejo e escala no mesmo shape', 'Transposição por pestana', 'Mapeamento por regiões'],
    cardsEn: ['Five connected shapes', 'Chord, arpeggio and scale in one shape', 'Barre transposition', 'Region mapping'],
    ctasPt: ['Mostrar tríades CAGED', 'Aplicar shape no braço', 'Ver arpejos'],
    ctasEn: ['Show CAGED triads', 'Apply shape to fretboard', 'View arpeggios'],
  },
  'triads-tetrads': {
    titlePt: 'Tríades e Tétrades',
    titleEn: 'Triads & Seventh Chords',
    subtitlePt: 'Conecte acordes pequenos, tétrades e condução harmônica em todo o braço.',
    subtitleEn: 'Connect compact chords, seventh chords and harmonic voice leading across the fretboard.',
    root: 'G',
    scaleType: 'Major (Ionian)',
    action: 'triads',
    cardsPt: ['Tríades maiores, menores e diminutas', 'Tétrades diatônicas', 'Inversões em grupos de cordas', 'Condução por notas próximas'],
    cardsEn: ['Major, minor and diminished triads', 'Diatonic seventh chords', 'Inversions on string sets', 'Close-note voice leading'],
    ctasPt: ['Mostrar tríades no braço', 'Aplicar campo de G', 'Treinar inversões'],
    ctasEn: ['Show triads on fretboard', 'Apply G field', 'Practice inversions'],
  },
  'greek-modes': {
    titlePt: 'Modos Gregos',
    titleEn: 'Greek Modes',
    subtitlePt: 'Compare cores modais, notas características e uso prático no improviso.',
    subtitleEn: 'Compare modal colors, characteristic notes and practical improvisation use.',
    root: 'D',
    scaleType: 'Dorian',
    action: 'scale',
    cardsPt: ['Jônio e maior natural', 'Dórico e menor com sexta maior', 'Lídio e quarta aumentada', 'Mixolídio e dominante modal'],
    cardsEn: ['Ionian and natural major', 'Dorian and minor with major sixth', 'Lydian and raised fourth', 'Mixolydian and modal dominant'],
    ctasPt: ['Mostrar D dórico', 'Comparar modos', 'Aplicar no braço'],
    ctasEn: ['Show D Dorian', 'Compare modes', 'Apply to fretboard'],
  },
};

const StudyModulePage: React.FC<StudyModulePageProps> = ({ moduleId }) => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
  const content = MODULE_CONTENT[moduleId];
  const title = lang === 'pt' ? content.titlePt : content.titleEn;
  const subtitle = lang === 'pt' ? content.subtitlePt : content.subtitleEn;
  const cards = lang === 'pt' ? content.cardsPt : content.cardsEn;
  const ctas = lang === 'pt' ? content.ctasPt : content.ctasEn;
  const panelClass = isLight
    ? 'border-[#c2d0e1] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,252,0.92))] shadow-[0_24px_70px_rgba(71,85,105,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]'
    : 'border-blue-900/40 bg-[linear-gradient(145deg,rgba(9,14,23,0.97),rgba(3,7,18,0.93))] shadow-[0_26px_90px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(96,165,250,0.05)]';
  const pageBackgroundStyle = isLight
    ? {
      backgroundColor: '#edf3f8',
      backgroundImage: 'linear-gradient(rgba(156,163,175,0.085) 1px, transparent 1px), linear-gradient(90deg, rgba(156,163,175,0.085) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }
    : undefined;

  const focusLine = useMemo(() => cards.slice(0, 3).join(' • '), [cards]);

  const mapLegacyActionToIntent = (
    action: 'scale' | 'field' | 'triads' | 'progression'
  ): FretboardIntent['action'] => {
    if (action === 'scale') return 'showScale';
    if (action === 'field') return 'showHarmonyField';
    if (action === 'triads') return 'showTriads';
    return 'showProgression';
  };

  const getTargetTabForAction = (action: FretboardIntent['action']): FretboardIntent['targetTab'] => {
    if (action === 'showScale') return 'scale';
    if (action === 'showHarmonyField' || action === 'showTriads' || action === 'showProgression') return 'harmony';
    if (action === 'startPractice' || action === 'openTool') return 'tools';
    return 'scale';
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

  const applyToFretboard = (label: string) => {
    recordAchievementEvent({ type: 'module_completion', moduleId });
    if (content.action === 'scale') {
      recordAchievementEvent({ type: 'exploration', key: 'apply_scale' });
    }
    const mappedAction = mapLegacyActionToIntent(content.action);
    sendFretboardIntent({
      source: 'study-module',
      action: mappedAction,
      targetTab: getTargetTabForAction(mappedAction),
      root: content.root,
      displayRoot: content.root,
      scaleType: content.scaleType,
      progression: moduleId === 'practice' ? 'i - VI - III - VII' : undefined,
      chords: moduleId === 'practice' ? ['Am', 'F', 'C', 'G'] : undefined,
      moduleTitle: title,
      moduleLabel: label,
    });
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>{title}</h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleTheme} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {isLight ? (lang === 'pt' ? 'Escuro' : 'Dark') : (lang === 'pt' ? 'Claro' : 'Light')}
            </button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {lang === 'pt' ? 'EN' : 'PORT'}
            </button>
            <button onClick={returnToFretboard} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
              {t.backToFretboard}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1700px] gap-6 px-4 py-7 lg:grid-cols-[1fr_0.78fr]">
        <section className={`rounded-2xl border p-6 ${panelClass}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Mapa de estudo' : 'Study Map'}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {cards.map((card, index) => (
              <article key={card} className={`rounded-xl border p-5 ${isLight ? 'border-[#d2deeb] bg-white/86' : 'border-blue-950/50 bg-[#080d16]/80'}`}>
                <span className="text-[9px] font-black uppercase text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="mt-3 text-lg font-black tracking-tight">{card}</h2>
              </article>
            ))}
          </div>
        </section>

        <aside className={`rounded-2xl border p-6 ${panelClass}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Conectar ao fretboard' : 'Connect to Fretboard'}</p>
          <p className={`mt-4 text-sm font-bold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{focusLine}</p>
          <div className="mt-6 space-y-3">
            {ctas.map(label => (
              <button key={label} onClick={() => applyToFretboard(label)} className={`${isLight ? 'border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_24px_rgba(37,99,235,0.22)]' : 'border border-blue-400/22 bg-[linear-gradient(180deg,#2e6af0,#1d4ed8)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_28px_rgba(15,23,42,0.32)]'} w-full rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white transition`}>
                {label}
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default StudyModulePage;
