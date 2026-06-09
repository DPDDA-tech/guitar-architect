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
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
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
        quality: 'Qualidade',
        mode: 'Modo',
        handedness: 'Modo do braço',
        right: 'Destro',
        left: 'Canhoto',
        guitar: 'Guitarra',
        bass: 'Baixo',
        frets: 'Casas',
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
        quality: 'Quality',
        mode: 'Mode',
        handedness: 'Neck mode',
        right: 'Right',
        left: 'Left',
        guitar: 'Guitar',
        bass: 'Bass',
        frets: 'Frets',
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
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(139,92,246,0.18)'} 1px, transparent 1px)`,
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

    if (instrument === 'guitar') {
      const guitarLabels: Partial<Record<TeenChordQuality, string>> = {
        major: 'Major',
        minor: 'Minor',
        dominant7: '7',
        major7: 'Maj7',
        minor7: 'm7',
        sus4: 'Sus4',
        add9: 'Add9',
        halfDiminished: 'm7b5',
        diminished: 'Dim',
        augmented: 'Aug',
      };
      return guitarLabels[qualityId] ?? fallbackLabel;
    }

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

  const currentShapeLabel = activeShape
    ? lang === 'pt'
      ? `${activeShape.label} de ${note}`
      : `${activeShape.label.replace('Forma', 'Shape')} of ${note}`
    : lang === 'pt'
      ? 'Sem forma'
      : 'No shape';
  const arrowButtonClass = 'h-10 w-10 shrink-0 rounded-xl border text-lg font-black inline-flex items-center justify-center';
  const qualityButtonClass = 'min-h-[38px] min-w-[76px] rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase inline-flex items-center justify-center text-center leading-tight transition-all';

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <main className="relative mx-auto max-w-7xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={copy.back} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title={copy.title} subtitle={copy.subtitle} />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.instrument}</p>
              <p className="mt-1 text-base font-black uppercase">{instrument === 'guitar' ? copy.guitar : copy.bass}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.currentChord}</p>
              <p className="mt-1 text-base font-black">{note}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.quality}</p>
              <p className="mt-1 text-base font-black">{getDisplayQualityLabel(quality, qualityOptions.find((option) => option.id === quality)?.label ?? '')}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.currentShape}</p>
              <p className="mt-1 text-base font-black">{currentShapeLabel}</p>
            </div>
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/30 bg-violet-500/8 text-violet-200'}`}>
            {lang === 'pt'
              ? 'Escolha a nota, a qualidade e a forma do acorde. Depois alterne entre notas, intervalos ou somente shape para estudar o desenho no braço.'
              : 'Choose the note, chord quality and shape. Then switch between notes, intervals or shape only to study the pattern on the neck.'}
          </div>

          <div className={`mt-4 rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.instrument}</p>
                <div className="mt-2 flex gap-2">
                  {([
                    { id: 'guitar', label: copy.guitar },
                    { id: 'bass', label: copy.bass },
                  ] as const).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setInstrument(item.id)}
                      className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase leading-tight transition-all ${
                        instrument === item.id
                          ? isLight
                            ? 'border-violet-500 bg-violet-100 text-violet-900'
                            : 'border-violet-400 bg-violet-500/15 text-violet-50'
                          : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                            : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.handedness}</p>
                <div className="mt-2 flex gap-2">
                  {([
                    { id: 'right', label: copy.right },
                    { id: 'left', label: copy.left },
                  ] as const).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setHandedness(item.id)}
                      className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase leading-tight transition-all ${
                        handedness === item.id
                          ? isLight
                            ? 'border-violet-500 bg-violet-100 text-violet-900'
                            : 'border-violet-300 bg-violet-500/25 text-violet-50'
                          : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                            : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.frets}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setVisibleFrets((current) => Math.max(5, current - 1))}
                    className={`h-11 w-11 rounded-xl border text-xl font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Diminuir casas' : 'Decrease frets'}
                  >
                    −
                  </button>
                  <div className="min-w-[28px] text-center text-2xl font-black">{visibleFrets}</div>
                  <button
                    onClick={() => setVisibleFrets((current) => Math.min(24, current + 1))}
                    className={`h-11 w-11 rounded-xl border text-xl font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Aumentar casas' : 'Increase frets'}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] xl:items-start">
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.currentChord} / {copy.quickNotes}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setNoteIndex((prev) => (prev - 1 + TEEN_CHROMATIC_NOTES.length) % TEEN_CHROMATIC_NOTES.length)}
                    className={`${arrowButtonClass} ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Nota anterior' : 'Previous note'}
                  >
                    ←
                  </button>
                  <div className={`h-10 min-w-[88px] rounded-xl border px-4 text-center text-2xl font-black inline-flex items-center justify-center ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/40 bg-violet-500/10 text-violet-200'}`}>
                    {note}
                  </div>
                  <button
                    onClick={() => setNoteIndex((prev) => (prev + 1) % TEEN_CHROMATIC_NOTES.length)}
                    className={`${arrowButtonClass} ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Próxima nota' : 'Next note'}
                  >
                    →
                  </button>
                  <div className="grid flex-1 min-w-[280px] grid-cols-4 gap-2 sm:grid-cols-6">
                    {TEEN_CHROMATIC_NOTES.map((item, index) => (
                      <button
                        key={item}
                        onClick={() => setNoteIndex(index)}
                        className={`min-h-[44px] rounded-xl border px-2 py-2 text-[11px] font-black uppercase inline-flex items-center justify-center transition-all ${
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

              <div className="min-w-0">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.quality}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {topQualityOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setQuality(option.id)}
                      className={`${qualityButtonClass} ${
                        quality === option.id
                          ? isLight
                            ? 'border-violet-500 bg-violet-100 text-violet-900'
                            : 'border-violet-400 bg-violet-500/15 text-violet-50'
                          : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                            : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                      }`}
                    >
                      {getDisplayQualityLabel(option.id, option.label)}
                    </button>
                  ))}
                </div>
                {bottomQualityOptions.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {bottomQualityOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setQuality(option.id)}
                        className={`${qualityButtonClass} ${
                          quality === option.id
                            ? isLight
                              ? 'border-violet-500 bg-violet-100 text-violet-900'
                              : 'border-violet-400 bg-violet-500/15 text-violet-50'
                            : isLight
                              ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                              : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                        }`}
                      >
                        {getDisplayQualityLabel(option.id, option.label)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.currentShape}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShapeIndex((prev) => (prev - 1 + Math.max(shapes.length, 1)) % Math.max(shapes.length, 1))}
                    disabled={shapes.length <= 1}
                    className={`${arrowButtonClass} disabled:opacity-40 ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Forma anterior' : 'Previous shape'}
                  >
                    ←
                  </button>
                  <div className={`h-10 min-w-[132px] rounded-xl border px-4 text-center text-sm font-black inline-flex items-center justify-center ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/40 bg-violet-500/10 text-violet-200'}`}>
                    {currentShapeLabel}
                  </div>
                  <button
                    onClick={() => setShapeIndex((prev) => (prev + 1) % Math.max(shapes.length, 1))}
                    disabled={shapes.length <= 1}
                    className={`${arrowButtonClass} disabled:opacity-40 ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Próxima forma' : 'Next shape'}
                  >
                    →
                  </button>
                </div>
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

            <div className="mt-4 overflow-x-auto">
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
