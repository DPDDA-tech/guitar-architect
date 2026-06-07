import React, { useEffect, useMemo, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';
import {
  TEEN_CHROMATIC_NOTES,
  getTeenChordExplorerShapes,
  getTeenChordQualityOptions,
  getTeenChordTuning,
  type TeenChordInstrument,
  type TeenChordQuality,
  type TeenChromaticNote,
} from '../data/teenChordExplorer';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const TeenChordExplorerPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const isLight = theme === 'light';
  const [instrument, setInstrument] = useState<TeenChordInstrument>('guitar');
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  const [noteIndex, setNoteIndex] = useState(0);
  const [quality, setQuality] = useState<TeenChordQuality>('major');
  const [shapeIndex, setShapeIndex] = useState(0);

  const note = TEEN_CHROMATIC_NOTES[noteIndex];
  const qualityOptions = useMemo(() => getTeenChordQualityOptions(instrument), [instrument]);
  const tuning = useMemo(() => getTeenChordTuning(instrument), [instrument]);
  const displayStrings = useMemo(
    () => (handedness === 'left' ? tuning.map((note, stringIndex) => ({ note, stringIndex })).reverse() : tuning.map((note, stringIndex) => ({ note, stringIndex }))),
    [handedness, tuning]
  );
  const shapes = useMemo(() => getTeenChordExplorerShapes(instrument, note, quality), [instrument, note, quality]);
  const activeShape = shapes[shapeIndex] ?? shapes[0] ?? null;

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

  const currentQualityLabel = qualityOptions.find((option) => option.id === quality)?.label ?? '';

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#02030a] text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.16),transparent_48%)]" />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">GA Teens</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Explorador de Acordes</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Descubra os acordes essenciais e seus formatos mais usados.
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Instrumento</p>
              <p className="mt-1 text-lg font-black uppercase">{instrument === 'guitar' ? 'Guitarra' : 'Baixo'}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Nota</p>
              <p className="mt-1 text-lg font-black">{note}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Qualidade</p>
              <p className="mt-1 text-lg font-black">{currentQualityLabel}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Modo do braço</p>
              <p className="mt-1 text-lg font-black">{handedness === 'right' ? 'Destro' : 'Canhoto'}</p>
            </div>
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            Fluxo rápido: escolha o instrumento, selecione a nota, troque a qualidade e navegue entre as formas para ver
            que o mesmo acorde pode aparecer em lugares diferentes do braço.
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {([
              { id: 'guitar', label: 'Guitarra' },
              { id: 'bass', label: 'Baixo' },
            ] as const).map((item) => (
              <button
                key={item.id}
                onClick={() => setInstrument(item.id)}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase transition-all ${
                  instrument === item.id
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                    : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-cyan-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {([
              { id: 'right', label: 'Destro' },
              { id: 'left', label: 'Canhoto' },
            ] as const).map((item) => (
              <button
                key={item.id}
                onClick={() => setHandedness(item.id)}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase transition-all ${
                  handedness === item.id
                    ? 'border-violet-400 bg-violet-500/20 text-violet-100'
                    : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
            <div className={`rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Nota atual</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => setNoteIndex((prev) => (prev - 1 + TEEN_CHROMATIC_NOTES.length) % TEEN_CHROMATIC_NOTES.length)}
                      className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                      aria-label="Nota anterior"
                    >
                      ←
                    </button>
                    <div className={`min-w-[88px] rounded-xl border px-4 py-2 text-center text-2xl font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'}`}>
                      {note}
                    </div>
                    <button
                      onClick={() => setNoteIndex((prev) => (prev + 1) % TEEN_CHROMATIC_NOTES.length)}
                      className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                      aria-label="Próxima nota"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Forma atual</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setShapeIndex((prev) => (prev - 1 + Math.max(shapes.length, 1)) % Math.max(shapes.length, 1))}
                      disabled={shapes.length <= 1}
                      className={`h-10 w-10 rounded-xl border text-lg font-black disabled:opacity-40 ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                      aria-label="Forma anterior"
                    >
                      ←
                    </button>
                    <div className={`min-w-[112px] rounded-xl border px-4 py-2 text-center text-sm font-black ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/40 bg-violet-500/10 text-violet-200'}`}>
                      {activeShape ? `${activeShape.label} de ${note}` : 'Sem forma'}
                    </div>
                    <button
                      onClick={() => setShapeIndex((prev) => (prev + 1) % Math.max(shapes.length, 1))}
                      disabled={shapes.length <= 1}
                      className={`h-10 w-10 rounded-xl border text-lg font-black disabled:opacity-40 ${isLight ? 'border-slate-300 bg-white text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                      aria-label="Próxima forma"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className={`min-w-[280px] rounded-[28px] border px-4 py-5 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                  <div className="grid" style={{ gridTemplateColumns: `64px repeat(${displayStrings.length}, minmax(36px, 1fr))` }}>
                    <div />
                    {displayStrings.map((item, index) => (
                      <div key={`${item.note}-${item.stringIndex}-${index}`} className="pb-3 text-center text-[11px] font-black uppercase tracking-[0.12em] text-cyan-400">
                        {item.note}
                      </div>
                    ))}
                    {Array.from({ length: 13 }, (_, fret) => (
                      <React.Fragment key={`fret-${fret}`}>
                        <div className={`flex items-center justify-center pr-2 text-[11px] font-black ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          {fret}
                        </div>
                        {displayStrings.map((item) => {
                          const dot = activeShape?.cells.find((cell) => cell.stringIndex === item.stringIndex && cell.fret === fret);
                          return (
                            <div
                              key={`cell-${fret}-${item.stringIndex}`}
                              className={`relative flex h-12 items-center justify-center border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}
                            >
                              <div className={`absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 ${isLight ? 'bg-slate-300' : 'bg-zinc-700'}`} />
                              {dot && (
                                <div
                                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black shadow-[0_0_16px_rgba(34,211,238,0.18)] ${
                                    dot.role === 'root'
                                      ? 'bg-cyan-400 text-slate-950'
                                      : dot.role === 'accent'
                                        ? 'bg-violet-400 text-white'
                                        : 'bg-amber-400 text-slate-950'
                                  }`}
                                >
                                  {dot.role === 'root' ? 'R' : dot.role === 'accent' ? 'A' : 'T'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`rounded-3xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Qualidades</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {qualityOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setQuality(option.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition-all ${
                        quality === option.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                          : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                            : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-cyan-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`rounded-3xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Notas rápidas</p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {TEEN_CHROMATIC_NOTES.map((item, index) => (
                    <button
                      key={item}
                      onClick={() => setNoteIndex(index)}
                      className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition-all ${
                        note === item
                          ? 'border-violet-400 bg-violet-500/20 text-violet-100'
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

              <div className={`rounded-3xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Leitura simples</p>
                <ul className={`mt-3 space-y-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  <li>R = tônica principal do desenho.</li>
                  <li>A = ponto forte para reconhecer o som.</li>
                  <li>T = nota de apoio do formato.</li>
                  <li>Use as setas para descobrir outras maneiras de tocar o mesmo acorde.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/teens')}
            className="rounded-xl border border-violet-500 bg-violet-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-violet-500"
          >
            Voltar ao Teens
          </button>
          <button
            onClick={() => navigateTo('/studio')}
            className="rounded-xl border border-cyan-500 bg-cyan-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-cyan-500"
          >
            Ir para Studio
          </button>
        </div>
      </main>
    </div>
  );
};

export default TeenChordExplorerPage;
