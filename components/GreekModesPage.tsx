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

const GreekModesPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [activeModeId, setActiveModeId] = useState('ionian');
  const [quickTool, setQuickTool] = useState<'tuner' | 'metronome' | null>(null);
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
  const activeMode = useMemo(() => GREEK_MODES.find(mode => mode.id === activeModeId) || GREEK_MODES[0], [activeModeId]);
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
    navigateTo('/');
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
              Modos Gregos
            </h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Os modos gregos são variações da escala maior que mudam o centro tonal e criam cores emocionais diferentes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleTheme} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>{isLight ? 'Escuro' : 'Claro'}</button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>{lang === 'pt' ? 'EN' : 'PORT'}</button>
            <button onClick={() => openHeaderTool('metronome')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>Metrônomo</button>
            <button onClick={() => openHeaderTool('tuner')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>Afinador</button>
            <button onClick={() => navigateTo('/')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">{t.backToFretboard}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] space-y-6 px-4 py-7">
        <PanelSurface isLight={isLight} className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative max-w-5xl">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-300">Modal workstation</p>
            <p className={`mt-4 text-lg font-black leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              Cada modo possui intervalos característicos que definem sua sonoridade. Aprender modos não significa decorar shapes, mas compreender tensão, repouso e intenção musical.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {GREEK_MODES.map(mode => (
                <button key={mode.id} onClick={() => setActiveModeId(mode.id)} className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${activeMode.id === mode.id ? 'border-blue-400 bg-blue-600 text-white' : isLight ? 'border-blue-100 bg-white text-slate-700' : 'border-blue-950/60 bg-[#070d18] text-slate-200'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-70">{mode.parentDegree}</p>
                  <h3 className="mt-1 font-black">{mode.name}</h3>
                  <p className="mt-1 text-xs font-bold opacity-75">{mode.feeling}</p>
                </button>
              ))}
            </div>
          </div>
        </PanelSurface>

        <section className="grid gap-4 lg:grid-cols-7">
          {GREEK_MODES.map(mode => (
            <article key={mode.id} className={`rounded-2xl border p-4 ${isLight ? 'border-[#c6d3e2] bg-white/98 shadow-[0_14px_34px_rgba(71,85,105,0.10)]' : 'border-blue-900/55 bg-[#070d18]/95 shadow-[0_12px_28px_rgba(2,6,23,0.28)]'}`}>
              <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${mode.colorClass}`} />
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">{String(mode.order).padStart(2, '0')} / {mode.parentDegree}</p>
              <h2 className="mt-2 text-xl font-black">{mode.name}</h2>
              <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{mode.characteristic}</p>
              <p className="mt-3 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3 py-2 text-center text-xs font-black text-blue-300">{mode.formula}</p>
              <div className="mt-3 space-y-1 text-xs font-bold">
                <p>Acorde: {mode.chord}</p>
                <p>Nota: {mode.characteristicInterval}</p>
                <p>Uso: {mode.usage}</p>
              </div>
              <div className="mt-4 grid gap-2">
                <button onClick={() => sendToFretboard(mode, 'scale')} className="rounded-xl bg-blue-600 px-3 py-2 text-[9px] font-black uppercase text-white">Aplicar no braço</button>
                <button onClick={() => sendToFretboard(mode, 'triads', { harmonyMode: 'TETRADS' })} className={`rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>{lang === 'pt' ? 'Ver tétrades' : 'Show seventh chords'}</button>
                <button onClick={() => sendToFretboard(mode, 'startPractice', { tool: 'exercises', practiceMode: 'modalCharacter', characteristicInterval: mode.characteristicInterval, bpm: 76 })} className={`rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>Ouvir caráter modal</button>
              </div>
            </article>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <PanelSurface isLight={isLight} className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Detalhe expandido</p>
            <h2 className="mt-3 text-3xl font-black">{activeMode.name}</h2>
            <p className={`mt-2 text-base font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{activeMode.characteristic}. Campo associado: {activeMode.parentDegree} da escala maior.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ['Comparação com Jônio', activeMode.id === 'ionian' ? 'Jônio é o ponto de referência maior natural.' : `Jônio muda para ${activeMode.formula}; a cor vem de ${activeMode.characteristicInterval}.`],
                ['Avoid note', activeMode.avoidNote],
                ['Aplicação prática', activeMode.usage],
                ['Referências', activeMode.references.join(' / ')],
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
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Conexão com CAGED</p>
            <h2 className="mt-3 text-2xl font-black">Modo {activeMode.name} sobre shape {activeMode.cagedShape}</h2>
            <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Use CAGED como região visual, não como prisão de shape. A tônica organiza o mapa, a nota característica define a cor modal e as tríades internas dão repouso.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button onClick={() => sendToFretboard(activeMode, 'scale', { cagedShape: activeMode.cagedShape, showCharacteristic: true })} className="rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">Aplicar modo + CAGED</button>
              <button onClick={() => sendToFretboard(activeMode, 'triads', { harmonyMode: 'TRIADS' })} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>Mostrar tríades internas</button>
              <button onClick={() => sendToFretboard(activeMode, 'field', { harmonyMode: 'TETRADS' })} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>Mostrar tétrades</button>
              <button onClick={() => sendToFretboard(activeMode, 'startPractice', { tool: 'exercises', practiceMode: 'modalTargets' })} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 text-blue-700' : 'border-blue-900/60 text-blue-200'}`}>Mostrar notas-alvo</button>
            </div>
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Comparador modal</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-left">
              <thead className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">
                <tr><th>Modo</th><th>Fórmula</th><th>Nota característica</th><th>Sensação</th><th>Uso comum</th></tr>
              </thead>
              <tbody>
                {GREEK_MODES.map(mode => (
                  <tr key={mode.id} className={`${isLight ? 'bg-white' : 'bg-[#070d18]'}`}>
                    <td className="rounded-l-xl p-3 font-black">{mode.name}</td>
                    <td className="p-3 font-mono text-sm">{mode.formula}</td>
                    <td className="p-3 font-bold text-violet-400">{mode.characteristicInterval}</td>
                    <td className="p-3 font-bold text-blue-400">{mode.feeling}</td>
                    <td className="rounded-r-xl p-3 text-sm font-semibold">{mode.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => sendToFretboard(activeMode, 'scale', { compareMode: 'ionian-vs-active', showAlteredIntervals: true })} className="mt-4 rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">Comparar no fretboard</button>
        </PanelSurface>

        <div className="grid gap-6 xl:grid-cols-3">
          <PanelSurface isLight={isLight} className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Improviso modal</p>
            <h2 className="mt-3 text-2xl font-black">Não toque modos como shapes isolados</h2>
            <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Pense em centro tonal, nota alvo, tensão modal e repouso. Em {activeMode.name}, enfatize {activeMode.characteristicInterval} sem perder a tônica {activeMode.root}.</p>
            <button onClick={() => sendToFretboard(activeMode, 'startPractice', { tool: 'exercises', practiceMode: 'modalResolution', bpm: 72 })} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">Destacar nota característica</button>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-6 xl:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Progressões e backing tracks</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {MODAL_PROGRESSIONS.map(progression => {
                const mode = GREEK_MODES.find(item => item.id === progression.modeId) || activeMode;
                return (
                  <button key={progression.id} onClick={() => sendToFretboard(mode, 'progression', { progression: progression.title, chords: progression.chords })} className={`rounded-xl border p-4 text-left ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-950/60 bg-[#050914]'}`}>
                    <h3 className="font-black">{progression.title}</h3>
                    <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{progression.description}</p>
                  </button>
                );
              })}
              {MODAL_BACKING_TRACKS.map(track => {
                const mode = GREEK_MODES.find(item => item.id === track.modeId) || activeMode;
                return (
                  <button key={track.id} onClick={() => sendToFretboard(mode, 'startPractice', { tool: 'exercises', practiceMode: 'modalBackingTrack', bpm: track.bpm })} className={`rounded-xl border p-4 text-left ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-950/60 bg-[#050914]'}`}>
                    <h3 className="font-black">{track.title}</h3>
                    <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{track.key} / {track.bpm} BPM / {track.difficulty}</p>
                  </button>
                );
              })}
            </div>
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Como pensar modos gregos</p>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {['Escala maior', 'Centro tonal', 'Intervalo característico', 'Cor modal', 'Aplicação musical'].map(step => (
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
