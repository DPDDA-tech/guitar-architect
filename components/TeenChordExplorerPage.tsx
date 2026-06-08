import React, { useEffect, useMemo, useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import ChordDiagramViewer, { type ChordDiagramDisplayMode } from './chords/ChordDiagramViewer';
import { createChordDiagramDataFromTeenShape } from '../utils/chordDiagram';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import {
  TEEN_CHROMATIC_NOTES,
  getTeenChordExplorerShapes,
  getTeenChordQualityOptions,
  getTeenChordTuning,
  type TeenChordInstrument,
  type TeenChordQuality,
} from '../data/teenChordExplorer';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const cycleDisplayMode = (
  currentMode: ChordDiagramDisplayMode,
  target: 'note' | 'interval',
): ChordDiagramDisplayMode => {
  if (target === 'note') {
    if (currentMode === 'note-chord') return 'note-all';
    if (currentMode === 'note-all') return 'none';
    return 'note-chord';
  }

  if (currentMode === 'interval-chord') return 'interval-all';
  if (currentMode === 'interval-all') return 'none';
  return 'interval-chord';
};

const TeenChordExplorerPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getTeensLang());
  const isLight = theme === 'light';
  const [instrument, setInstrument] = useState<TeenChordInstrument>('guitar');
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  const [noteIndex, setNoteIndex] = useState(0);
  const [quality, setQuality] = useState<TeenChordQuality>('major');
  const [shapeIndex, setShapeIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<ChordDiagramDisplayMode>('none');
  const [visibleFrets, setVisibleFrets] = useState(15);

  const note = TEEN_CHROMATIC_NOTES[noteIndex];
  const copy = lang === 'pt'
    ? {
        title: 'Explorador de Acordes',
        subtitle: 'Descubra os acordes essenciais e seus formatos mais usados.',
        instrument: 'Instrumento',
        note: 'Nota',
        quality: 'Qualidade',
        mode: 'Modo',
        handedness: 'Modo do braço',
        right: 'Destro',
        left: 'Canhoto',
        guitar: 'Guitarra',
        bass: 'Baixo',
        quickFlow: 'Fluxo rápido: escolha o instrumento, selecione a nota, troque a qualidade e navegue entre as formas para ver que o mesmo acorde pode aparecer em lugares diferentes do braço.',
        frets: 'Casas',
        language: 'Idioma',
        quickNotes: 'Notas rápidas',
        currentChord: 'Acorde atual',
        currentShape: 'Forma atual',
        showNotes: 'Mostrar notas',
        showIntervals: 'Mostrar intervalos',
        shapeOnly: 'Somente shape',
        noShape: 'Nenhuma forma disponível para este acorde.',
        back: 'Voltar ao Teens',
        studio: 'Ir para Studio',
      }
    : {
        title: 'Chord Explorer',
        subtitle: 'Discover essential chords and their most common shapes.',
        instrument: 'Instrument',
        note: 'Note',
        quality: 'Quality',
        mode: 'Mode',
        handedness: 'Neck mode',
        right: 'Right',
        left: 'Left',
        guitar: 'Guitar',
        bass: 'Bass',
        quickFlow: 'Quick flow: choose the instrument, select the note, change the quality and move through the shapes to see how the same chord appears in different neck areas.',
        frets: 'Frets',
        language: 'Language',
        quickNotes: 'Quick notes',
        currentChord: 'Current chord',
        currentShape: 'Current shape',
        showNotes: 'Show notes',
        showIntervals: 'Show intervals',
        shapeOnly: 'Shape only',
        noShape: 'No shape available for this chord.',
        back: 'Back to Teens',
        studio: 'Go to Studio',
      };
  const qualityOptions = useMemo(() => getTeenChordQualityOptions(instrument), [instrument]);
  const tuning = useMemo(() => getTeenChordTuning(instrument), [instrument]);
  const shapes = useMemo(() => getTeenChordExplorerShapes(instrument, note, quality), [instrument, note, quality]);
  const activeShape = shapes[shapeIndex] ?? shapes[0] ?? null;
  const diagramData = useMemo(() => {
    if (!activeShape) return null;
    return createChordDiagramDataFromTeenShape(activeShape, tuning, instrument, note);
  }, [activeShape, tuning, instrument, note]);

  const primaryGuitarQualities: TeenChordQuality[] = ['major', 'minor', 'dominant7', 'major7', 'minor7'];
  const secondaryGuitarQualities: TeenChordQuality[] = ['sus4', 'halfDiminished', 'diminished', 'augmented', 'add9'];
  const topQualityOptions = instrument === 'guitar'
    ? qualityOptions.filter((option) => primaryGuitarQualities.includes(option.id))
    : qualityOptions;
  const bottomQualityOptions = instrument === 'guitar'
    ? qualityOptions.filter((option) => secondaryGuitarQualities.includes(option.id))
    : [];

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#1e1b4b'} 1px, transparent 1px)`,
    backgroundSize: '100% 30px',
  };

  useEffect(() => {
    const firstQuality = qualityOptions[0]?.id as TeenChordQuality | undefined;
    if (!qualityOptions.some((option) => option.id === quality)) {
      setQuality(firstQuality ?? 'major');
    }
  }, [quality, qualityOptions]);

  useEffect(() => {
    setShapeIndex(0);
  }, [instrument, note, quality]);

  useEffect(() => {
    (window as any).ga_lang = lang;
    localStorage.setItem('ga_teens_lang', lang);
  }, [lang]);

  const getDisplayQualityLabel = (qualityId: TeenChordQuality, fallbackLabel: string) => {
    if (lang === 'pt') return fallbackLabel;
    if (instrument === 'bass') {
      const bassLabels: Partial<Record<TeenChordQuality, string>> = {
        root: 'Root + Octave',
        root5: 'Root + Fifth + Octave',
        arpeggioMajor: 'Major Arpeggio (short)',
        arpeggioMinor: 'Minor Arpeggio (short)',
        arpeggio7: '7 Arpeggio (short)',
        arpeggioMinor7: 'm7 Arpeggio (short)',
      };
      return bassLabels[qualityId] ?? fallbackLabel;
    }
    return fallbackLabel;
  };
  const currentQualityLabel = getDisplayQualityLabel(
    quality,
    qualityOptions.find((option) => option.id === quality)?.label ?? ''
  );
  const arrowButtonClass = `h-10 w-10 shrink-0 rounded-xl border text-lg font-black inline-flex items-center justify-center`;
  const qualityButtonClass = `min-h-[44px] min-w-[96px] rounded-xl border px-4 py-2 text-xs font-black uppercase inline-flex items-center justify-center text-center leading-tight transition-all`;

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ga_teens_theme', next);
      return next;
    });
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'pt' ? 'en' : 'pt'));
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#02030a] text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <main className="relative mx-auto max-w-7xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={copy.back} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title={copy.title} subtitle={copy.subtitle} />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.instrument}</p>
              <p className="mt-1 text-lg font-black uppercase">{instrument === 'guitar' ? copy.guitar : copy.bass}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.note}</p>
              <p className="mt-1 text-lg font-black">{note}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.quality}</p>
              <p className="mt-1 text-lg font-black">{currentQualityLabel}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.mode}</p>
              <p className="mt-1 text-lg font-black">{handedness === 'right' ? copy.right : copy.left}</p>
            </div>
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {copy.quickFlow}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,430px)_220px_minmax(0,1fr)]">
            <div className={`rounded-3xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.instrument}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {([
                      { id: 'guitar', label: 'Guitarra' },
                      { id: 'bass', label: 'Baixo' },
                    ] as const).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setInstrument(item.id)}
                        className={`h-10 rounded-xl border px-4 text-xs font-black uppercase transition-all ${
                          instrument === item.id
                            ? isLight
                              ? 'border-cyan-500 bg-cyan-100 text-cyan-900'
                              : 'border-cyan-300 bg-cyan-500/25 text-cyan-50'
                            : isLight
                              ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                              : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-cyan-500'
                        }`}
                      >
                        {item.id === 'guitar' ? copy.guitar : copy.bass}
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.handedness}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {([
                      { id: 'right', label: 'Destro' },
                      { id: 'left', label: 'Canhoto' },
                    ] as const).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setHandedness(item.id)}
                        className={`h-10 rounded-xl border px-4 text-xs font-black uppercase transition-all ${
                          handedness === item.id
                            ? isLight
                              ? 'border-violet-500 bg-violet-100 text-violet-900'
                              : 'border-violet-300 bg-violet-500/25 text-violet-50'
                            : isLight
                              ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                              : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                        }`}
                      >
                        {item.id === 'right' ? copy.right : copy.left}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`rounded-[28px] border px-4 py-3 self-start ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.frets}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <button
                      onClick={() => setVisibleFrets((current) => Math.max(5, current - 1))}
                      className={`h-11 w-11 rounded-xl border text-xl font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-slate-100 text-blue-600 hover:border-cyan-500'}`}
                      aria-label="Diminuir casas"
                    >
                      -
                    </button>
                    <div className="min-w-[28px] text-center text-2xl font-black">{visibleFrets}</div>
                    <button
                      onClick={() => setVisibleFrets((current) => Math.min(24, current + 1))}
                      className={`h-11 w-11 rounded-xl border text-xl font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-slate-100 text-blue-600 hover:border-cyan-500'}`}
                      aria-label="Aumentar casas"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
              <div className="grid h-full grid-cols-2 place-items-center gap-4">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.mode}</p>
                  <button
                    onClick={handleToggleTheme}
                    className={`mt-3 h-12 w-12 rounded-2xl border inline-flex items-center justify-center transition-all ${
                      isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                        : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'
                    }`}
                    aria-label="Alternar tema"
                  >
                    {isLight ? <MoonIcon /> : <SunIcon />}
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.language}</p>
                  <button
                    onClick={handleToggleLang}
                    className={`mt-3 h-12 min-w-[52px] rounded-2xl border px-3 text-sm font-black uppercase inline-flex items-center justify-center transition-all ${
                      isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                        : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'
                    }`}
                    aria-label="Alternar idioma"
                  >
                    {lang.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.quickNotes}</p>
              <div className="mt-3 grid grid-cols-6 gap-3">
                {TEEN_CHROMATIC_NOTES.map((item, index) => (
                  <button
                    key={item}
                    onClick={() => setNoteIndex(index)}
                    className={`h-10 rounded-xl border px-3 text-xs font-black uppercase inline-flex items-center justify-center transition-all ${
                      note === item
                        ? isLight
                          ? 'border-violet-500 bg-violet-100 text-violet-900'
                          : 'border-violet-300 bg-violet-500/25 text-violet-50'
                        : isLight
                          ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                          : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
            <div className="grid gap-5 lg:grid-cols-[auto_auto_minmax(0,1fr)] lg:gap-8 xl:gap-12">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.currentChord}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setNoteIndex((prev) => (prev - 1 + TEEN_CHROMATIC_NOTES.length) % TEEN_CHROMATIC_NOTES.length)}
                    className={`${arrowButtonClass} ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                    aria-label="Nota anterior"
                  >
                    ←
                  </button>
                  <div className={`h-10 min-w-[88px] rounded-xl border px-4 text-center text-2xl font-black inline-flex items-center justify-center ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'}`}>
                    {note}
                  </div>
                  <button
                    onClick={() => setNoteIndex((prev) => (prev + 1) % TEEN_CHROMATIC_NOTES.length)}
                    className={`${arrowButtonClass} ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                    aria-label="Próxima nota"
                  >
                    →
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.currentShape}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setShapeIndex((prev) => (prev - 1 + Math.max(shapes.length, 1)) % Math.max(shapes.length, 1))}
                    disabled={shapes.length <= 1}
                    className={`${arrowButtonClass} disabled:opacity-40 ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="Forma anterior"
                  >
                    ←
                  </button>
                  <div className={`h-10 min-w-[132px] rounded-xl border px-4 text-center text-sm font-black inline-flex items-center justify-center ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/40 bg-violet-500/10 text-violet-200'}`}>
                    {activeShape ? `${activeShape.label} de ${note}` : 'Sem forma'}
                  </div>
                  <button
                    onClick={() => setShapeIndex((prev) => (prev + 1) % Math.max(shapes.length, 1))}
                    disabled={shapes.length <= 1}
                    className={`${arrowButtonClass} disabled:opacity-40 ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="Próxima forma"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">{copy.quality}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {topQualityOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setQuality(option.id)}
                      className={`${qualityButtonClass} ${
                        quality === option.id
                          ? isLight
                            ? 'border-cyan-500 bg-cyan-100 text-cyan-900'
                            : 'border-cyan-300 bg-cyan-500/25 text-cyan-50'
                          : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                            : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-cyan-500'
                      }`}
                    >
                      {getDisplayQualityLabel(option.id, option.label)}
                    </button>
                  ))}
                </div>
                {instrument === 'guitar' && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {bottomQualityOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setQuality(option.id)}
                        className={`${qualityButtonClass} ${
                          quality === option.id
                            ? isLight
                              ? 'border-cyan-500 bg-cyan-100 text-cyan-900'
                              : 'border-cyan-300 bg-cyan-500/25 text-cyan-50'
                            : isLight
                              ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                              : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-cyan-500'
                        }`}
                      >
                        {getDisplayQualityLabel(option.id, option.label)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
              <button
                onClick={() => setDisplayMode((currentMode) => cycleDisplayMode(currentMode, 'note'))}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight transition-all ${
                  displayMode === 'note-chord' || displayMode === 'note-all'
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                    : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-emerald-500'
                }`}
              >
                {displayMode === 'note-chord' ? (lang === 'pt' ? 'Notas: acorde' : 'Notes: chord') : displayMode === 'note-all' ? (lang === 'pt' ? 'Notas: todas' : 'Notes: all') : copy.showNotes}
              </button>
              <button
                onClick={() => setDisplayMode((currentMode) => cycleDisplayMode(currentMode, 'interval'))}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight transition-all ${
                  displayMode === 'interval-chord' || displayMode === 'interval-all'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                    : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:border-amber-400'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-amber-500'
                }`}
              >
                {displayMode === 'interval-chord' ? (lang === 'pt' ? 'Intervalos: acorde' : 'Intervals: chord') : displayMode === 'interval-all' ? (lang === 'pt' ? 'Intervalos: todos' : 'Intervals: all') : copy.showIntervals}
              </button>
              <button
                onClick={() => setDisplayMode('none')}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight transition-all ${
                  displayMode === 'none'
                    ? isLight
                      ? 'border-violet-500 bg-violet-100 text-violet-900'
                      : 'border-violet-300 bg-violet-500/25 text-violet-50'
                    : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                }`}
              >
                {copy.shapeOnly}
              </button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <div className={`min-w-[960px] rounded-[28px] border px-4 py-5 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                {diagramData ? (
                  <ChordDiagramViewer
                    diagram={diagramData}
                    theme={theme}
                    isLeftHanded={handedness === 'left'}
                    displayMode={displayMode}
                    visibleFrets={visibleFrets}
                    className="w-full"
                  />
                ) : (
                  <div className={`py-12 text-center text-sm font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {copy.noShape}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/teens')}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            {copy.back}
          </button>
          <button
            onClick={() => navigateTo('/studio')}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] transition-all hover:from-cyan-500 hover:to-sky-400 active:scale-95"
          >
            {copy.studio}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TeenChordExplorerPage;
