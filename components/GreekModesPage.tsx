import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import { GREEK_MODES, MODAL_BACKING_TRACKS, MODAL_PROGRESSIONS, GreekModeInfo } from '../data/greekModes';
import { recordAchievementEvent } from '../utils/achievementEvents';
import QuickToolsModal from './QuickToolsModal';

const PENDING_ACTION_KEY = 'ga_pending_fretboard_action';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const PanelSurface = ({ children, isLight, className = '' }: { children: React.ReactNode; isLight: boolean; className?: string }) => (
  <section className={`rounded-2xl border ${isLight ? 'border-[#c6d3e2] bg-white/95 shadow-[0_18px_50px_rgba(71,85,105,0.12)]' : 'border-blue-900/55 bg-[linear-gradient(145deg,#08101c,#050914)] shadow-[0_18px_54px_rgba(2,6,23,0.48)]'} ${className}`}>
    {children}
  </section>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const makePayload = (mode: GreekModeInfo, action: 'scale' | 'triads' | 'field' | 'progression' | 'startPractice', extra: Record<string, unknown> = {}) => ({
  source: 'study-module',
  action,
  root: mode.root,
  displayRoot: mode.root,
  scaleType: mode.scaleType,
  moduleTitle: 'Modos Gregos',
  moduleLabel: mode.name,
  createdAt: new Date().toISOString(),
  ...extra,
});

const pageCopy = {
  pt: {
    title: 'Modos Gregos',
    subtitle: 'Os modos gregos são variações da escala maior que mudam o centro tonal e criam cores emocionais diferentes.',
    modalWorkstation: 'Modal workstation',
    intro: 'Cada modo possui intervalos característicos que definem sua sonoridade. Aprender modos não significa decorar shapes, mas compreender tensão, repouso e intenção musical.',
    applyFretboard: 'Aplicar no braço',
    showSevenths: 'Ver tétrades',
    hearCharacter: 'Ouvir caráter modal',
    expandedDetail: 'Detalhe expandido',
    ionianComparison: 'Comparação com Jônio',
    ionianReference: 'Jônio é o ponto de referência maior natural.',
    avoidNote: 'Avoid note',
    practicalUse: 'Aplicação prática',
    references: 'Referências',
    cagedConnection: 'Conexão com CAGED',
    cagedTitle: (modeName: string, shape: string) => `Modo ${modeName} sobre shape ${shape}`,
    cagedBody: 'Use CAGED como região visual, não como prisão de shape. A tônica organiza o mapa, a nota característica define a cor modal e as tríades internas dão repouso.',
    applyModeCaged: 'Aplicar modo + CAGED',
    showTriads: 'Mostrar tríades internas',
    showTetrads: 'Mostrar tétrades',
    showTargets: 'Mostrar notas-alvo',
    comparator: 'Comparador modal',
    mode: 'Modo',
    formula: 'Fórmula',
    characteristicNote: 'Nota característica',
    feeling: 'Sensação',
    commonUse: 'Uso comum',
    compareFretboard: 'Comparar no fretboard',
    improvisation: 'Improviso modal',
    noShapes: 'Não toque modos como shapes isolados',
    improvBody: (modeName: string, interval: string, root: string) => `Pense em centro tonal, nota alvo, tensão modal e repouso. Em ${modeName}, enfatize ${interval} sem perder a tônica ${root}.`,
    highlightCharacteristic: 'Destacar nota característica',
    progressions: 'Progressões e backing tracks',
    modalThinking: 'Como pensar modos gregos',
    thinkingSteps: ['Escala maior', 'Centro tonal', 'Intervalo característico', 'Cor modal', 'Aplicação musical'],
    metronome: 'Metrônomo',
    tuner: 'Afinador',
  },
  en: {
    title: 'Greek Modes',
    subtitle: 'Greek modes are variations of the major scale that shift the tonal center and create different emotional colors.',
    modalWorkstation: 'Modal workstation',
    intro: 'Each mode has characteristic intervals that define its sound. Learning modes is not about memorizing shapes, but understanding tension, rest and musical intention.',
    applyFretboard: 'Apply to fretboard',
    showSevenths: 'Show seventh chords',
    hearCharacter: 'Hear modal character',
    expandedDetail: 'Expanded detail',
    ionianComparison: 'Comparison with Ionian',
    ionianReference: 'Ionian is the natural major reference point.',
    avoidNote: 'Avoid note',
    practicalUse: 'Practical use',
    references: 'References',
    cagedConnection: 'CAGED connection',
    cagedTitle: (modeName: string, shape: string) => `${modeName} mode over ${shape} shape`,
    cagedBody: 'Use CAGED as a visual region, not as a shape prison. The root organizes the map, the characteristic note defines the modal color, and internal triads provide resting points.',
    applyModeCaged: 'Apply mode + CAGED',
    showTriads: 'Show internal triads',
    showTetrads: 'Show seventh chords',
    showTargets: 'Show target notes',
    comparator: 'Modal comparator',
    mode: 'Mode',
    formula: 'Formula',
    characteristicNote: 'Characteristic note',
    feeling: 'Feeling',
    commonUse: 'Common use',
    compareFretboard: 'Compare on fretboard',
    improvisation: 'Modal improvisation',
    noShapes: 'Do not play modes as isolated shapes',
    improvBody: (modeName: string, interval: string, root: string) => `Think tonal center, target note, modal tension and rest. In ${modeName}, emphasize ${interval} without losing the ${root} root.`,
    highlightCharacteristic: 'Highlight characteristic note',
    progressions: 'Progressions and backing tracks',
    modalThinking: 'How to think about Greek modes',
    thinkingSteps: ['Major scale', 'Tonal center', 'Characteristic interval', 'Modal color', 'Musical application'],
    metronome: 'Metronome',
    tuner: 'Tuner',
  },
} as const;

const modeTranslations: Record<string, Partial<GreekModeInfo>> = {
  ionian: {
    name: 'Ionian',
    parentDegree: 'I degree',
    characteristic: 'Natural major',
    characteristicInterval: 'major 3rd and major 7th',
    avoidNote: '4 over maj7 chords, when it competes with the 3rd',
    feeling: 'bright / stable',
    usage: 'major grooves, resolved themes, pop, rock and tonal jazz',
    references: ['major-key songs', 'stable pop themes', 'tonal jazz'],
  },
  dorian: {
    name: 'Dorian',
    parentDegree: 'II degree',
    characteristic: 'minor with major sixth',
    characteristicInterval: 'major 6th',
    avoidNote: 'avoid resting too much on the 4th if the chord needs a clear 3rd',
    feeling: 'modern / fusion',
    usage: 'fusion, jazz, funk, modern rock and sophisticated minor vamps',
    references: ['fusion jams', 'modern minor vamps', 'funk-rock phrasing'],
  },
  phrygian: {
    name: 'Phrygian',
    parentDegree: 'III degree',
    characteristic: 'minor with flat second',
    characteristicInterval: 'b2',
    avoidNote: 'b2 needs intention because it creates immediate tension',
    feeling: 'Spanish / dark',
    usage: 'metal, flamenco, heavy rock and dark vamps',
    references: ['modal metal', 'Spanish phrasing', 'dark riffs'],
  },
  lydian: {
    name: 'Lydian',
    parentDegree: 'IV degree',
    characteristic: 'major with augmented fourth',
    characteristicInterval: '#4',
    avoidNote: 'almost no classic avoid note; #4 is the color',
    feeling: 'floating / cinematic',
    usage: 'cinema, fusion, ambient, open themes and maj7#11 chords',
    references: ['cinematic scores', 'modern fusion', 'ambient guitar'],
  },
  mixolydian: {
    name: 'Mixolydian',
    parentDegree: 'V degree',
    characteristic: 'modal dominant',
    characteristicInterval: 'b7',
    avoidNote: '4 against the major 3rd can sound too suspended',
    feeling: 'dominant / blues',
    usage: 'blues, classic rock, country, funk and static dominants',
    references: ['blues rock', 'country licks', 'dominant vamp'],
  },
  aeolian: {
    name: 'Aeolian',
    parentDegree: 'VI degree',
    characteristic: 'natural minor',
    characteristicInterval: 'b6',
    avoidNote: 'b6 can feel heavy if the harmony asks for Dorian',
    feeling: 'melancholic / natural minor',
    usage: 'minor rock, ballads, minor pop and natural progressions',
    references: ['minor rock', 'melancholic pop', 'modal ballads'],
  },
  locrian: {
    name: 'Locrian',
    parentDegree: 'VII degree',
    characteristic: 'modal diminished',
    characteristicInterval: 'b5 and b2',
    avoidNote: 'the whole mode is unstable; use it as tension and passing color',
    feeling: 'unstable / tense',
    usage: 'half-diminished chords, tense passages, jazz and resolution to I',
    references: ['minor jazz', 'chromatic passages', 'pre-resolution tension'],
  },
};

const getModeCopy = (mode: GreekModeInfo, lang: Lang): GreekModeInfo => (
  lang === 'pt' ? mode : { ...mode, ...modeTranslations[mode.id] }
);

const progressionTranslations: Record<string, { title: string; description: string }> = {
  'dorian-vamp': { title: 'Dorian: Dm7 -> G7', description: 'The major 6th appears as a modern color inside the minor vamp.' },
  'lydian-vamp': { title: 'Lydian: Cmaj7 -> D', description: 'The D chord highlights the Lydian #4 over C.' },
  'mixolydian-vamp': { title: 'Mixolydian: G7 vamp', description: 'Static dominant for blues, funk and rock.' },
  'phrygian-vamp': { title: 'Phrygian: Em -> F', description: 'The b2 appears directly and dramatically.' },
};

const backingTrackTranslations: Record<string, { title: string; difficulty: string }> = {
  'fusion-dorian': { title: 'Fusion Dorian', difficulty: 'Intermediate' },
  'rock-mixolydian': { title: 'Rock Mixolydian', difficulty: 'Beginner' },
  'cinematic-lydian': { title: 'Cinematic Lydian', difficulty: 'Intermediate' },
  'metal-phrygian': { title: 'Metal Phrygian', difficulty: 'Advanced' },
  'jazz-ionian': { title: 'Jazz Ionian', difficulty: 'Intermediate' },
};

const GreekModesPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [activeModeId, setActiveModeId] = useState('ionian');
  const [quickTool, setQuickTool] = useState<'tuner' | 'metronome' | null>(null);
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
  const copy = pageCopy[lang];
  const activeMode = useMemo(() => GREEK_MODES.find(mode => mode.id === activeModeId) || GREEK_MODES[0], [activeModeId]);
  const activeModeCopy = getModeCopy(activeMode, lang);
  const pageBackgroundStyle = isLight
    ? {
      backgroundColor: '#edf3f8',
      backgroundImage: 'linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }
    : undefined;

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

  const sendToFretboard = (mode: GreekModeInfo, action: 'scale' | 'triads' | 'field' | 'progression' | 'startPractice', extra: Record<string, unknown> = {}) => {
    recordAchievementEvent({ type: 'module_completion', moduleId: 'greek-modes' });
    if (action === 'scale' || action === 'startPractice') recordAchievementEvent({ type: 'exploration', key: 'apply_scale' });
    window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(makePayload(mode, action, extra)));
    navigateTo('/studio');
  };

  const openHeaderTool = (tool: 'tuner' | 'metronome') => {
    if (tool === 'metronome') recordAchievementEvent({ type: 'exploration', key: 'open_metronome' });
    setQuickTool(tool);
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>
              {copy.title}
            </h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {copy.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}
              title={isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode')}
              aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>{lang === 'pt' ? 'EN' : 'PORT'}</button>
            <button onClick={() => openHeaderTool('metronome')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>{copy.metronome}</button>
            <button onClick={() => openHeaderTool('tuner')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>{copy.tuner}</button>
            <button onClick={() => navigateTo('/studio')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">{t.backToFretboard}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] space-y-6 px-4 py-7">
        <PanelSurface isLight={isLight} className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative max-w-5xl">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-300">{copy.modalWorkstation}</p>
            <p className={`mt-4 text-lg font-black leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              {copy.intro}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {GREEK_MODES.map(mode => {
                const modeCopy = getModeCopy(mode, lang);
                return (
                <button key={mode.id} onClick={() => setActiveModeId(mode.id)} className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${activeMode.id === mode.id ? 'border-blue-400 bg-blue-600 text-white' : isLight ? 'border-blue-100 bg-white text-slate-700' : 'border-blue-950/60 bg-[#070d18] text-slate-200'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-70">{modeCopy.parentDegree}</p>
                  <h3 className="mt-1 font-black">{modeCopy.name}</h3>
                  <p className="mt-1 text-xs font-bold opacity-75">{modeCopy.feeling}</p>
                </button>
              )})}
            </div>
          </div>
        </PanelSurface>

        <section className="grid gap-4 lg:grid-cols-7">
          {GREEK_MODES.map(mode => {
            const modeCopy = getModeCopy(mode, lang);
            return (
            <article key={mode.id} className={`rounded-2xl border p-4 transition-all ${activeMode.id === mode.id ? (isLight ? 'border-blue-400 bg-blue-50/95 shadow-[0_18px_42px_rgba(37,99,235,0.22)] ring-2 ring-blue-200/80' : 'border-blue-300 bg-[linear-gradient(145deg,rgba(30,64,175,0.42),rgba(7,13,24,0.98))] shadow-[0_0_36px_rgba(37,99,235,0.28),0_18px_42px_rgba(2,6,23,0.34)] ring-2 ring-blue-400/40') : isLight ? 'border-[#c6d3e2] bg-white/98 shadow-[0_14px_34px_rgba(71,85,105,0.10)]' : 'border-blue-900/55 bg-[#070d18]/95 shadow-[0_12px_28px_rgba(2,6,23,0.28)]'}`}>
              <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${mode.colorClass}`} />
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">{String(mode.order).padStart(2, '0')} / {modeCopy.parentDegree}</p>
              <h2 className="mt-2 text-xl font-black">{modeCopy.name}</h2>
              <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{modeCopy.characteristic}</p>
              <p className="mt-3 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3 py-2 text-center text-xs font-black text-blue-300">{mode.formula}</p>
              <div className="mt-3 space-y-1 text-xs font-bold">
                <p>{lang === 'pt' ? 'Acorde' : 'Chord'}: {mode.chord}</p>
                <p>{lang === 'pt' ? 'Nota' : 'Note'}: {modeCopy.characteristicInterval}</p>
                <p>{lang === 'pt' ? 'Uso' : 'Use'}: {modeCopy.usage}</p>
              </div>
              <div className="mt-4 grid gap-2">
                <button onClick={() => sendToFretboard(mode, 'scale')} className="rounded-xl bg-blue-600 px-3 py-2 text-[9px] font-black uppercase text-white">{copy.applyFretboard}</button>
                <button onClick={() => sendToFretboard(mode, 'triads', { harmonyMode: 'TETRADS' })} className={`rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>{copy.showSevenths}</button>
                <button onClick={() => sendToFretboard(mode, 'startPractice', { tool: 'exercises', practiceMode: 'modalCharacter', characteristicInterval: mode.characteristicInterval, bpm: 76 })} className={`rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>{copy.hearCharacter}</button>
              </div>
            </article>
          )})}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <PanelSurface isLight={isLight} className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.expandedDetail}</p>
            <h2 className="mt-3 text-3xl font-black">{activeModeCopy.name}</h2>
            <p className={`mt-2 text-base font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {activeModeCopy.characteristic}. {lang === 'pt' ? 'Campo associado' : 'Associated field'}: {activeModeCopy.parentDegree} {lang === 'pt' ? 'da escala maior' : 'of the major scale'}.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                [copy.ionianComparison, activeMode.id === 'ionian' ? copy.ionianReference : `${lang === 'pt' ? 'Jônio muda para' : 'Ionian shifts to'} ${activeMode.formula}; ${lang === 'pt' ? 'a cor vem de' : 'the color comes from'} ${activeModeCopy.characteristicInterval}.`],
                [copy.avoidNote, activeModeCopy.avoidNote],
                [copy.practicalUse, activeModeCopy.usage],
                [copy.references, activeModeCopy.references.join(' / ')],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-950/60 bg-[#050914]'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-300">{label}</p>
                  <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {activeMode.badges.map(badge => (
                <span key={badge} className={`rounded-full border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-900/60 bg-blue-950/30 text-blue-200'}`}>{badge}</span>
              ))}
            </div>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.cagedConnection}</p>
            <h2 className="mt-3 text-2xl font-black">{copy.cagedTitle(activeModeCopy.name, activeMode.cagedShape)}</h2>
            <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {copy.cagedBody}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button onClick={() => sendToFretboard(activeMode, 'scale', { cagedShape: activeMode.cagedShape, showCharacteristic: true })} className="rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">{copy.applyModeCaged}</button>
              <button onClick={() => sendToFretboard(activeMode, 'triads', { harmonyMode: 'TRIADS' })} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>{copy.showTriads}</button>
              <button onClick={() => sendToFretboard(activeMode, 'field', { harmonyMode: 'TETRADS' })} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>{copy.showTetrads}</button>
              <button onClick={() => sendToFretboard(activeMode, 'startPractice', { tool: 'exercises', practiceMode: 'modalTargets' })} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>{copy.showTargets}</button>
            </div>
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.comparator}</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-left">
              <thead className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">
                <tr><th>{copy.mode}</th><th>{copy.formula}</th><th>{copy.characteristicNote}</th><th>{copy.feeling}</th><th>{copy.commonUse}</th></tr>
              </thead>
              <tbody>
                {GREEK_MODES.map(mode => {
                  const modeCopy = getModeCopy(mode, lang);
                  return (
                  <tr key={mode.id} className={`${isLight ? 'bg-white' : 'bg-[#070d18]'}`}>
                    <td className="rounded-l-xl p-3 font-black">{modeCopy.name}</td>
                    <td className="p-3 font-mono text-sm">{mode.formula}</td>
                    <td className="p-3 font-bold text-violet-400">{modeCopy.characteristicInterval}</td>
                    <td className="p-3 font-bold text-blue-400">{modeCopy.feeling}</td>
                    <td className="rounded-r-xl p-3 text-sm font-semibold">{modeCopy.usage}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          <button onClick={() => sendToFretboard(activeMode, 'scale', { compareMode: 'ionian-vs-active', showAlteredIntervals: true })} className="mt-4 rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">{copy.compareFretboard}</button>
        </PanelSurface>

        <div className="grid gap-6 xl:grid-cols-3">
          <PanelSurface isLight={isLight} className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.improvisation}</p>
            <h2 className="mt-3 text-2xl font-black">{copy.noShapes}</h2>
            <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{copy.improvBody(activeModeCopy.name, activeModeCopy.characteristicInterval, activeMode.root)}</p>
            <button onClick={() => sendToFretboard(activeMode, 'startPractice', { tool: 'exercises', practiceMode: 'modalResolution', bpm: 72 })} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">{copy.highlightCharacteristic}</button>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-6 xl:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.progressions}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {MODAL_PROGRESSIONS.map(progression => {
                const mode = GREEK_MODES.find(item => item.id === progression.modeId) || activeMode;
                const progressionCopy = lang === 'pt' ? progression : { ...progression, ...progressionTranslations[progression.id] };
                return (
                  <button key={progression.id} onClick={() => sendToFretboard(mode, 'progression', { progression: progression.title, chords: progression.chords })} className={`rounded-xl border p-4 text-left ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-950/60 bg-[#050914]'}`}>
                    <h3 className="font-black">{progressionCopy.title}</h3>
                    <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{progressionCopy.description}</p>
                  </button>
                );
              })}
              {MODAL_BACKING_TRACKS.map(track => {
                const mode = GREEK_MODES.find(item => item.id === track.modeId) || activeMode;
                const trackCopy = lang === 'pt' ? track : { ...track, ...backingTrackTranslations[track.id] };
                return (
                  <button key={track.id} onClick={() => sendToFretboard(mode, 'startPractice', { tool: 'exercises', practiceMode: 'modalBackingTrack', bpm: track.bpm })} className={`rounded-xl border p-4 text-left ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-950/60 bg-[#050914]'}`}>
                    <h3 className="font-black">{trackCopy.title}</h3>
                    <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{track.key} / {track.bpm} BPM / {trackCopy.difficulty}</p>
                  </button>
                );
              })}
            </div>
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.modalThinking}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {copy.thinkingSteps.map(step => (
              <div key={step} className={`rounded-xl border p-4 text-center text-sm font-black ${isLight ? 'border-blue-100 bg-white text-blue-700' : 'border-blue-950/60 bg-[#050914] text-blue-200'}`}>{step}</div>
            ))}
          </div>
        </PanelSurface>
      </main>
      <QuickToolsModal
        isOpen={quickTool !== null}
        initialTool={quickTool || 'metronome'}
        isLight={isLight}
        lang={lang}
        onClose={() => setQuickTool(null)}
      />
    </div>
  );
};

export default GreekModesPage;
