
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import FretboardSVG from './FretboardSVG';
import { CHROMATIC_SCALE, INSTRUMENT_PRESETS, getNoteAt, getIntervalName, TUNINGS_PRESETS, getFretForNote } from '../music/musicTheory';
import { SCALES } from '../music/scales';
import { DEGREE_NAMES, CHORD_QUALITIES } from '../music/harmony';
import { translations, Lang } from '../i18n';
import { FretboardState, EditorMode, MarkerShape, ThemeMode, StringStatus, InstrumentType, LineThickness, TuningKey, CagedShape } from '../types';
import NewDiagramWizard from './NewDiagramWizard';
import { getMusicTip, MusicTip } from '../utils/musicTips';

interface FretboardInstanceProps {
  state: FretboardState;
  updateState: (newState: FretboardState) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onAdd: (cloneData?: FretboardState) => void;
  isFirst: boolean;
  isLast: boolean;
  theme: ThemeMode;
  lang: Lang;
  isActive: boolean;
  onActivate: () => void;
  isExporting?: boolean;
  globalTranspose?: number;
  onGlobalTranspose?: (semitones: number) => void;
  showTips?: boolean;
  onToggleTips?: () => void;
}


const FretboardInstance: React.FC<FretboardInstanceProps> = ({ 
  state, updateState, onRemove, onMove, onAdd, isFirst, isLast, theme, lang, isExporting = false, globalTranspose = 0, onGlobalTranspose, showTips = true, onToggleTips
}) => {
  const t = translations[lang];
  const [editorMode, setEditorMode] = useState<EditorMode>('marker');
  const [markerShape, setMarkerShape] = useState<MarkerShape>('circle');
  const [markerColor, setMarkerColor] = useState('#2563eb');
  const [lineThickness, setLineThickness] = useState<LineThickness>(4);
  const [lineStart, setLineStart] = useState<{string: number, fret: number} | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [noteClickFeedback, setNoteClickFeedback] = useState<{ string: number; fret: number } | null>(null);
  const [creationHint, setCreationHint] = useState<string | null>(null);
  const [wizardMode, setWizardMode] = useState<'initial' | 'add'>('add');
  const noteClickTimeoutRef = useRef<number | null>(null);
  const creationHintTimeoutRef = useRef<number | null>(null);
  
  const historyRef = useRef<FretboardState[]>([]);
  const futureRef = useRef<FretboardState[]>([]);
  const [musicTip, setMusicTip] = useState<MusicTip>({
    text: lang === 'pt'
      ? 'Aguarde, buscando uma dica de teoria de música...'
      : 'Loading a music theory tip...',
    source: lang === 'pt' ? 'Biblioteca interna' : 'Internal library',
    fetchedAt: new Date().toISOString()
  });

  useEffect(() => {
    let active = true;

    getMusicTip(lang).then((tip) => {
      if (active) {
        setMusicTip(tip);
      }
    }).catch(() => {
      // fallback já tratado na utilitária
    });

    return () => {
      active = false;
    };
  }, [lang]);

  const recordAction = useCallback((newState: FretboardState) => {
    historyRef.current.push({...state});
    if (historyRef.current.length > 30) historyRef.current.shift();
    futureRef.current = [];
    updateState(newState);
  }, [state, updateState]);

  const undo = () => {
    if (historyRef.current.length > 0) {
      const prev = historyRef.current.pop()!;
      futureRef.current.push({...state});
      updateState(prev);
    }
  };

  const redo = () => {
    if (futureRef.current.length > 0) {
      const next = futureRef.current.pop()!;
      historyRef.current.push({...state});
      updateState(next);
    }
  };

  const clearContent = () => {
    if (window.confirm(t.clearDiagram + "?")) {
      recordAction({ 
        ...state, 
        markers: [], 
        lines: [],
        harmonyMode: 'OFF',
        cagedShape: 'OFF'
      });
    }
  };

  const changeTuning = (newTuningKey: TuningKey) => {
    const instrument = INSTRUMENT_PRESETS[state.instrumentType];
    const oldTuning = state.tuning === 'Custom' ? (state.customTuning || instrument.defaultTuning) : (TUNINGS_PRESETS[state.tuning] || instrument.defaultTuning);
    const newTuning = newTuningKey === 'Custom' ? (state.customTuning || instrument.defaultTuning) : (TUNINGS_PRESETS[newTuningKey] || instrument.defaultTuning);
    
    const updatedMarkers = state.markers.map(m => {
      const note = getNoteAt(m.string, m.fret, oldTuning);
      const newFret = getFretForNote(m.string, note, newTuning, m.fret); 
      return { ...m, fret: newFret };
    });
    recordAction({ ...state, tuning: newTuningKey, markers: updatedMarkers });
  };

  const handleNewDiagramCreate = useCallback((newState: FretboardState) => {
    const isEmptyDiagram =
      state.markers.length === 0 &&
      state.lines.length === 0 &&
      !state.title &&
      !state.subtitle &&
      !state.notes;

    if (wizardMode === 'initial' && isFirst && isEmptyDiagram) {
      updateState(newState);
    } else {
      onAdd(newState);
    }

    setCreationHint(t.newDiagramCreated);
    if (creationHintTimeoutRef.current) {
      window.clearTimeout(creationHintTimeoutRef.current);
    }
    creationHintTimeoutRef.current = window.setTimeout(() => setCreationHint(null), 4000);
  }, [onAdd, t, state, isFirst, updateState, wizardMode]);

  const exportDataJSON = () => {
    const instrument = INSTRUMENT_PRESETS[state.instrumentType];
    const tuning = state.tuning === 'Custom' ? (state.customTuning || instrument.defaultTuning) : (TUNINGS_PRESETS[state.tuning] || instrument.defaultTuning);
    const data = {
      diagramId: state.id,
      meta: { title: state.title, instrument: state.instrumentType },
      tuning: { label: state.tuning, structure: tuning },
      theory: { root: state.root, scale: state.scaleType, harmony: state.harmonyMode },
      points: state.markers.map(m => {
        const note = getNoteAt(m.string, m.fret, tuning);
        return { 
          string: instrument.strings - m.string, 
          fret: m.fret, 
          note, 
          interval: getIntervalName(state.root, note) 
        };
      })
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

{/* FRETBOARD RANGE */}
<div className="space-y-3">
  <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">
    FRET RANGE
  </span>

  <div className="flex items-center gap-2">

    {/* START */}
    <input
      type="number"
      min={0}
      max={state.endFret - 1}
      value={state.startFret}
      onChange={e =>
        recordAction({
          ...state,
          startFret: Math.max(
            0,
            Math.min(Number(e.target.value), state.endFret - 1)
          )
        })
      }
      className="w-16 p-2 border rounded-lg text-xs font-black text-center bg-white"
    />

    <span className="text-xs font-black text-zinc-400">→</span>

    {/* END */}
    <input
      type="number"
      min={state.startFret + 1}
      max={36}
      value={state.endFret}
      onChange={e =>
        recordAction({
          ...state,
          endFret: Math.min(
            36,
            Math.max(Number(e.target.value), state.startFret + 1)
          )
        })
      }
      className="w-16 p-2 border rounded-lg text-xs font-black text-center bg-white"
    />

  </div>

  {/* PRESETS */}
  <div className="grid grid-cols-5 gap-1">
    {[12, 15, 17, 21, 24].map(f => (
      <button
        key={f}
        onClick={() =>
          recordAction({
            ...state,
            startFret: 0,
            endFret: f
          })
        }
        className="py-1 rounded-md text-[8px] font-black bg-zinc-200 hover:bg-blue-600 hover:text-white transition-all"
      >
        {f}
      </button>
    ))}
  </div>
</div>

  const handleEvent = useCallback((event: any) => {
    if (event.type === 'note') {
      setNoteClickFeedback({ string: event.string, fret: event.fret });
      if (noteClickTimeoutRef.current) {
        window.clearTimeout(noteClickTimeoutRef.current);
      }
      noteClickTimeoutRef.current = window.setTimeout(() => setNoteClickFeedback(null), 280);

      if (editorMode === 'marker') {
        const existingIdx = state.markers.findIndex(m => m.string === event.string && m.fret === event.fret);
        let newMarkers = [...state.markers];
        if (existingIdx >= 0) {
           if (state.labelMode === 'fingering') {
              const fingers = ['1', '2', '3', '4', 'T'];
              const currentFinger = newMarkers[existingIdx].finger || '1';
              const nextIdx = (fingers.indexOf(currentFinger) + 1) % fingers.length;
              newMarkers[existingIdx] = { ...newMarkers[existingIdx], finger: fingers[nextIdx] };
           } else {
              newMarkers.splice(existingIdx, 1);
           }
        } else {
          newMarkers.push({ id: crypto.randomUUID(), string: event.string, fret: event.fret, shape: markerShape, color: markerColor, finger: '1' });
        }
        recordAction({ ...state, markers: newMarkers });
      } else if (editorMode === 'line') {
        if (!lineStart) {
          setLineStart({ string: event.string, fret: event.fret });
        } else {
          const newLine = { id: crypto.randomUUID(), start: lineStart, end: { string: event.string, fret: event.fret }, color: markerColor, width: lineThickness };
          recordAction({ ...state, lines: [...state.lines, newLine] });
          setLineStart(null);
        }
      }
    } else if (event.type === 'string-status') {
       const statusCycle: StringStatus[] = ['normal', 'open', 'mute'];
       const currentStatuses = [...(state.stringStatuses || Array(INSTRUMENT_PRESETS[state.instrumentType].strings).fill('normal'))];
       const currentIdx = statusCycle.indexOf(currentStatuses[event.string] || 'normal');
       currentStatuses[event.string] = statusCycle[(currentIdx + 1) % statusCycle.length];
       recordAction({ ...state, stringStatuses: currentStatuses });
    }
  }, [markerShape, markerColor, editorMode, lineStart, lineThickness, state, recordAction]);

  useEffect(() => {
    return () => {
      if (noteClickTimeoutRef.current) {
        window.clearTimeout(noteClickTimeoutRef.current);
      }
      if (creationHintTimeoutRef.current) {
        window.clearTimeout(creationHintTimeoutRef.current);
      }
    };
  }, []);

  const isLight = isExporting ? true : (theme === 'light');
  const isFretboardEmpty = state.markers.length === 0 && state.lines.length === 0;
  const PRESET_COLORS = ['#ef4444', '#2563eb', '#22c55e', '#eab308', '#000000', '#6366f1', '#ec4899'];
  const OBS_LIMIT = 1500;
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [activeControlTab, setActiveControlTab] = useState<string>('base');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (isFirst && typeof window !== 'undefined' && window.localStorage) {
      if (!window.localStorage.getItem('ga_onboarding_completed')) {
        setWizardMode('initial');
        setShowWizard(true);
      }
    }
  }, [isFirst]);

  const controlTabs = [
    { id: 'base', label: 'Base' },
    { id: 'visual', label: 'Visual' },
    { id: 'harmony', label: lang === 'pt' ? 'Harmonia' : 'Harmony' },
    { id: 'editor', label: lang === 'pt' ? 'Editor' : 'Editor' },
    ...(showAdvanced ? [{ id: 'advanced', label: lang === 'pt' ? 'Avancado' : 'Advanced' }] : [])
  ] as const;

  const panelShell = isLight
    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
    : 'bg-zinc-950 border-zinc-800 text-zinc-100';

  const controlInputClass = 'w-full p-3 border rounded-xl text-sm font-black outline-none bg-white text-zinc-900 shadow-sm';
  const controlButtonBase = 'py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all';
  const activeButtonClass = 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20';
  const inactiveButtonClass = 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300';
  const quickButtonClass = `px-3 py-2 rounded-lg border text-[9px] font-black uppercase transition-all active:scale-95 ${isLight ? 'bg-white border-zinc-200 text-zinc-600 hover:border-blue-400 hover:text-blue-600' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-400'}`;
  const quickActiveButtonClass = 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20';
  const markerShapeIcon = (shape: MarkerShape) => {
    if (shape === 'circle') return <span className="h-3.5 w-3.5 rounded-full border-2 border-current" />;
    if (shape === 'square') return <span className="h-3.5 w-3.5 border-2 border-current" />;
    return <span className="h-0 w-0 border-x-[7px] border-b-[13px] border-x-transparent border-b-current" />;
  };
  const toggleQuickPanel = (tab: string) => {
    if (activeControlTab === tab && isControlPanelOpen) {
      setIsControlPanelOpen(false);
      return;
    }
    setActiveControlTab(tab);
    setIsControlPanelOpen(true);
  };
  const toggleHarmonyLayer = (layer: 'showScale' | 'showTonic') => {
    recordAction({...state, layers: {...state.layers, [layer]: !state.layers[layer]}});
    if (!(activeControlTab === 'harmony' && isControlPanelOpen)) {
      setActiveControlTab('harmony');
      setIsControlPanelOpen(true);
    }
  };

  const renderControls = () => {
    if (activeControlTab === 'base') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.instrument}</span>
              <select value={state.instrumentType} onChange={e => recordAction({...state, instrumentType: e.target.value as InstrumentType, tuning: 'Standard', stringStatuses: Array(INSTRUMENT_PRESETS[e.target.value as InstrumentType].strings).fill('normal')})} className={controlInputClass}>
                <option value="guitar-6">{t.instr_guitar6}</option><option value="guitar-7">{t.instr_guitar7}</option><option value="guitar-8">{t.instr_guitar8}</option><option value="bass-4">{t.bass4}</option><option value="bass-5">{t.bass5}</option>
              </select>
            </div>
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.tuning}</span>
              <select value={state.tuning} onChange={e => changeTuning(e.target.value as TuningKey)} className={controlInputClass}>
                {Object.keys(TUNINGS_PRESETS).map(tk => <option key={tk} value={tk}>{tk}</option>)}
              </select>
            </div>
          </div>

          <button onClick={() => recordAction({...state, isLeftHanded: !state.isLeftHanded})} className={`w-full px-4 py-3 rounded-xl border font-black text-[9px] uppercase transition-all ${state.isLeftHanded ? 'bg-zinc-800 text-white border-zinc-800' : inactiveButtonClass}`}>{t.leftHanded}</button>

          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">TRASTES / CASAS</span>
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={state.endFret - 1} value={state.startFret} onChange={e => recordAction({...state, startFret: Math.max(0, Math.min(Number(e.target.value), state.endFret - 1))})} className="w-20 p-2 rounded-lg border text-[11px] font-black text-center bg-white text-zinc-900" />
              <span className="text-[10px] font-black text-zinc-400">→</span>
              <input type="number" min={state.startFret + 1} max={24} value={state.endFret} onChange={e => recordAction({...state, endFret: Math.min(24, Math.max(Number(e.target.value), state.startFret + 1))})} className="w-20 p-2 rounded-lg border text-[11px] font-black text-center bg-white text-zinc-900" />
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[12, 15, 17, 21, 24].map(f => (
                <button key={f} onClick={() => recordAction({...state, startFret: 0, endFret: f})} className="py-1 rounded-md text-[8px] font-black bg-zinc-200 text-zinc-700 hover:bg-blue-600 hover:text-white transition-all">{f}</button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeControlTab === 'visual') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.labels}</span>
            <div className="grid grid-cols-2 gap-2">
              {['note', 'interval', 'fingering', 'none'].map(m => (
                <button key={m} onClick={() => recordAction({...state, labelMode: m as any})} className={`${controlButtonBase} ${state.labelMode === m ? activeButtonClass : inactiveButtonClass}`}>
                  {m === 'fingering' ? t.labelFingering : m === 'note' ? t.labelNotes : m === 'interval' ? t.labelIntervals : t.labelNone}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.layers}</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => recordAction({...state, layers: {...state.layers, showInlays: !state.layers.showInlays}})} className={`${controlButtonBase} ${state.layers.showInlays ? activeButtonClass : inactiveButtonClass}`}>{t.inlays}</button>
              <button onClick={() => recordAction({...state, layers: {...state.layers, showAllNotes: !state.layers.showAllNotes}})} className={`${controlButtonBase} ${state.layers.showAllNotes ? activeButtonClass : inactiveButtonClass}`}>{t.allNotes}</button>
              <button onClick={() => recordAction({...state, layers: {...state.layers, showScale: !state.layers.showScale}})} className={`${controlButtonBase} ${state.layers.showScale ? activeButtonClass : inactiveButtonClass}`}>{t.scaleNotes}</button>
              <button onClick={() => recordAction({...state, layers: {...state.layers, showTonic: !state.layers.showTonic}})} className={`${controlButtonBase} ${state.layers.showTonic ? activeButtonClass : inactiveButtonClass}`}>{t.tonicHighlight}</button>
            </div>
          </div>
        </div>
      );
    }

    if (activeControlTab === 'harmony') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.tonic}</span>
            <select value={state.root} onChange={e => recordAction({...state, root: e.target.value})} className={controlInputClass}>
              {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.scaleNotes}</span>
            <select value={state.scaleType} onChange={e => recordAction({...state, scaleType: e.target.value})} className={controlInputClass}>
              {SCALES.map(s => <option key={s.name} value={s.name}>{lang === 'pt' ? (t.scales as any)[s.name] || s.name : s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['OFF', 'TRIADS', 'TETRADS'].map(m => (
              <button key={m} onClick={() => recordAction({...state, harmonyMode: m as any})} className={`${controlButtonBase} ${state.harmonyMode === m ? activeButtonClass : inactiveButtonClass}`}>{m}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.degree}</span>
              <select value={state.chordDegree} onChange={e => recordAction({...state, chordDegree: Number(e.target.value)})} className={controlInputClass}>
                {DEGREE_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.inversion}</span>
              <select value={state.inversion} onChange={e => recordAction({...state, inversion: Number(e.target.value)})} className={controlInputClass}>
                <option value="0">Root</option><option value="1">1ª Inv</option><option value="2">2ª Inv</option><option value="3">3ª Inv</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.quality}</span>
            <select value={state.chordQuality} onChange={e => recordAction({...state, chordQuality: e.target.value as any})} className={controlInputClass}>
              {CHORD_QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['CLOSE', 'DROP2', 'DROP3'].map(v => (
              <button key={v} onClick={() => recordAction({...state, voicingMode: v as any})} title={t.tooltipVoicing} className={`${controlButtonBase} ${(state.voicingMode || 'CLOSE') === v ? 'bg-zinc-800 border-zinc-800 text-white' : inactiveButtonClass}`}>{v}</button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <select value={state.inversion} onChange={e => recordAction({...state, inversion: Number(e.target.value)})} title={t.tooltipInversion} className={controlInputClass}>
              <option value="0">Root</option><option value="1">1ª Inv</option><option value="2">2ª Inv</option><option value="3">3ª Inv</option>
            </select>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{lang === 'pt' ? 'Vozes' : 'Voicings'}</span>
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">{t.geometry}</span>
            <div className="grid grid-cols-6 gap-1 mt-2">
              {['OFF', 'C', 'A', 'G', 'E', 'D'].map(s => (
                <button key={s} onClick={() => recordAction({...state, cagedShape: s as CagedShape})} title={t.tooltipCaged} className={`${controlButtonBase} ${state.cagedShape === s ? activeButtonClass : inactiveButtonClass}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeControlTab === 'editor') {
      return (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 p-1.5 bg-white border border-zinc-200 rounded-xl">
              <button onClick={() => setEditorMode('marker')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${editorMode === 'marker' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.marker}</button>
              <button onClick={() => setEditorMode('line')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${editorMode === 'line' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.line}</button>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              {lang === 'pt' ? 'Modo ativo:' : 'Active mode:'} <span className="text-zinc-900 font-black">{editorMode === 'marker' ? t.marker : t.line}</span>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            {['circle', 'square', 'triangle'].map(s => (
              <button key={s} onClick={() => setMarkerShape(s as MarkerShape)} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${markerShape === s ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300'}`}>
                {s === 'circle' && <span className="text-xl">●</span>}
                {s === 'square' && <span className="text-xl">■</span>}
                {s === 'triangle' && <span className="text-xl">▲</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {[2, 4, 7].map(w => (
              <button key={w} onClick={() => setLineThickness(w as LineThickness)} className={`${controlButtonBase} flex-1 ${lineThickness === w ? 'bg-zinc-800 border-zinc-800 text-white' : inactiveButtonClass}`}>
                {w === 2 ? t.thin : w === 4 ? t.medium : t.thick}
              </button>
            ))}
          </div>
          <div className="flex gap-2 p-1 bg-white border border-zinc-200 rounded-xl">
            <button onClick={() => recordAction({...state, colorMode: 'SINGLE'})} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${state.colorMode === 'SINGLE' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.colorSingle}</button>
            <button onClick={() => recordAction({...state, colorMode: 'MULTI'})} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${state.colorMode === 'MULTI' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.colorMulti}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(c => <button key={c} onClick={() => setMarkerColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${markerColor === c ? 'scale-110 border-blue-500 shadow-md' : 'border-transparent'}`} style={{background: c}} />)}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={undo} className={`${controlButtonBase} ${inactiveButtonClass}`}>UNDO</button>
            <button onClick={redo} className={`${controlButtonBase} ${inactiveButtonClass}`}>REDO</button>
            <button onClick={clearContent} className="py-2.5 rounded-lg text-[9px] font-black uppercase border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all">{t.clearDiagram}</button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button onClick={exportDataJSON} className={`w-full px-4 py-3 rounded-xl font-black text-[10px] uppercase border transition-all active:scale-95 ${copyFeedback ? 'bg-emerald-600 text-white border-emerald-600' : inactiveButtonClass}`}>
          {copyFeedback ? 'OK' : 'JSON'}
        </button>
        <p className="text-[10px] font-bold leading-relaxed text-zinc-400 uppercase">
            {lang === 'pt' ? 'Copie este JSON e use Importar JSON no menu global do projeto.' : 'Copy this JSON and use Import JSON from the global project menu.'}
          </p>
        </div>
    );
  };

  return (
    <div className={`diagram-container p-5 md:p-10 rounded-[32px] md:rounded-[48px] border shadow-2xl transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
      
      {/* HEADER DIAGRAMA */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-5 ${isExporting ? 'hidden-operational-btns' : ''}`}>
        <div className="flex-1">
          <input value={state.title} onChange={e => recordAction({...state, title: e.target.value})} className={`bg-transparent text-xl md:text-3xl font-black italic uppercase tracking-tighter focus:outline-none w-full ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`} placeholder={t.titlePlaceholder} />
          <input value={state.subtitle} onChange={e => recordAction({...state, subtitle: e.target.value})} className="bg-transparent text-[11px] md:text-lg font-bold text-zinc-400 focus:outline-none w-full uppercase tracking-wide mt-1" placeholder={t.subtitle} />
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 operational-btns">
           <button onClick={() => setIsControlPanelOpen(prev => !prev)} className={`px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl font-black text-[10px] md:text-[11px] uppercase border transition-all active:scale-90 ${isControlPanelOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
              {lang === 'pt' ? 'CONTROLES' : 'TOOLS'}
           </button>
           <button onClick={() => { setWizardMode('add'); setShowWizard(true); }} className="bg-blue-600 px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl text-white font-black text-[10px] md:text-[11px] uppercase active:scale-95 shadow-lg shadow-blue-500/20">NOVO</button>
           <button onClick={() => onAdd(state)} className="bg-zinc-800 px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl text-white font-black text-[10px] md:text-[11px] uppercase active:scale-95">{t.cloneCurrent}</button>
           <div className="flex gap-1.5 items-center bg-blue-50 dark:bg-zinc-800 p-1.5 rounded-xl border border-blue-200 dark:border-zinc-700 shadow-sm [&>button]:bg-white [&>button]:text-zinc-800 [&>button]:border [&>button]:border-zinc-300 [&>button]:shadow-sm">
              <button onClick={() => onMove('up')} disabled={isFirst} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↑</button>
              <button onClick={() => onMove('down')} disabled={isLast} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↓</button>
           </div>
           <button onClick={onRemove} className="bg-red-50 text-red-600 w-11 h-11 flex items-center justify-center rounded-xl font-black text-xl transition-colors hover:bg-red-100">×</button>
        </div>
      </div>

      {/* CONTROLES TÉCNICOS */}
      <div className={`hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border ${isLight ? 'bg-zinc-50 border-zinc-100 shadow-inner' : 'bg-zinc-800/50 border-zinc-700'} ${isExporting ? 'hidden' : ''}`}>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
             <span className="w-2 h-2 bg-blue-500 rounded-full"></span> {t.layers}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {['note', 'interval', 'fingering', 'none'].map(m => (
              <button key={m} onClick={() => recordAction({...state, labelMode: m as any})} className={`py-3 rounded-lg text-[10px] font-black uppercase border transition-all ${state.labelMode === m ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}>
                {m === 'fingering' ? t.labelFingering : m === 'note' ? t.labelNotes : m === 'interval' ? t.labelIntervals : t.labelNone}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => recordAction({...state, layers: {...state.layers, showInlays: !state.layers.showInlays}})} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${state.layers.showInlays ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-200/50 text-zinc-400'}`}>{t.inlays}</button>
            <button onClick={() => recordAction({...state, layers: {...state.layers, showAllNotes: !state.layers.showAllNotes}})} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${state.layers.showAllNotes ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-200/50 text-zinc-400'}`}>{t.allNotes}</button>
            <button onClick={() => recordAction({...state, layers: {...state.layers, showScale: !state.layers.showScale}})} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${state.layers.showScale ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-200/50 text-zinc-400'}`}>{t.scaleNotes}</button>
            <button onClick={() => recordAction({...state, layers: {...state.layers, showTonic: !state.layers.showTonic}})} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${state.layers.showTonic ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-200/50 text-zinc-400'}`}>{t.tonicHighlight}</button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> {t.general}
          </h4>
          <div className="flex gap-2">
            <select value={state.root} onChange={e => recordAction({...state, root: e.target.value})} className="flex-1 p-3 border rounded-xl text-sm font-black outline-none bg-white shadow-sm focus:ring-2 ring-blue-500/20 text-zinc-900 transition-all">
              {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={() => recordAction({...state, isLeftHanded: !state.isLeftHanded})} className={`px-4 rounded-xl border font-black text-[9px] uppercase transition-all ${state.isLeftHanded ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white border-zinc-200 text-zinc-500'}`}>{t.leftHanded}</button>
          </div>
          <select value={state.scaleType} onChange={e => recordAction({...state, scaleType: e.target.value})} className="w-full p-3 border rounded-xl text-sm font-black outline-none bg-white text-zinc-900 shadow-sm">
             {SCALES.map(s => <option key={s.name} value={s.name}>{lang === 'pt' ? (t.scales as any)[s.name] || s.name : s.name}</option>)}
          </select>
          {/* FRETBOARD RANGE */}
<div className="flex flex-col gap-2 mt-2">

  <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">
    TRASTES / CASAS
  </span>

  {/* INPUTS */}
  <div className="flex items-center gap-2">

    {/* START */}
    <input
      type="number"
      min={0}
      max={state.endFret - 1}
      value={state.startFret}
      onChange={e =>
        recordAction({
          ...state,
          startFret: Math.max(
            0,
            Math.min(
              Number(e.target.value),
              state.endFret - 1
            )
          )
        })
      }
      className="
        w-16 p-2 rounded-lg border
        text-[11px] font-black text-center
        bg-white text-zinc-900
      "
    />

    <span className="text-[10px] font-black text-zinc-400">→</span>

    {/* END */}
    <input
      type="number"
      min={state.startFret + 1}
      max={36}
      value={state.endFret}
      onChange={e =>
        recordAction({
          ...state,
          endFret: Math.min(
            36,
            Math.max(
              Number(e.target.value),
              state.startFret + 1
            )
          )
        })
      }
      className="
        w-16 p-2 rounded-lg border
        text-[11px] font-black text-center
        bg-white text-zinc-900
      "
    />

  </div>

  {/* PRESETS RÁPIDOS */}
  <div className="grid grid-cols-5 gap-1 mt-1">

    {[12, 15, 17, 21, 24].map(f => (
      <button
        key={f}
        onClick={() =>
          recordAction({
            ...state,
            startFret: 0,
            endFret: f
          })
        }
        className="
          py-1 rounded-md
          text-[8px] font-black
          bg-zinc-200 text-zinc-700
          hover:bg-blue-600 hover:text-white
          transition-all
        "
      >
        {f}
      </button>
    ))}

  </div>

</div>

          <div className="flex flex-col gap-1 mt-1">
             <span className="text-[8px] font-black uppercase text-zinc-400 ml-1 tracking-widest">{t.geometry}</span>
             <div className="grid grid-cols-6 gap-1">
                {['OFF', 'C', 'A', 'G', 'E', 'D'].map(s => (
                   <button key={s} onClick={() => recordAction({...state, cagedShape: s as CagedShape})} className={`py-2 rounded-lg text-[9px] font-black border transition-all ${state.cagedShape === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-zinc-200 text-zinc-500'}`}>{s}</button>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
             <span className="w-2 h-2 bg-purple-500 rounded-full"></span> {t.harmony}
          </h4>
          <div className="grid grid-cols-3 gap-1">
             {['OFF', 'TRIADS', 'TETRADS'].map(m => (
               <button key={m} onClick={() => recordAction({...state, harmonyMode: m as any})} className={`py-3 rounded-lg text-[9px] font-black uppercase border transition-all ${state.harmonyMode === m ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-zinc-200 text-zinc-500'}`}>{m}</button>
             ))}
          </div>
          <div className="flex gap-2">
            <select value={state.chordDegree} onChange={e => recordAction({...state, chordDegree: Number(e.target.value)})} className="flex-1 p-3 border rounded-lg text-sm font-black bg-white text-zinc-900">
               {DEGREE_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <select value={state.inversion} onChange={e => recordAction({...state, inversion: Number(e.target.value)})} className="flex-1 p-3 border rounded-lg text-sm font-black bg-white text-zinc-900">
               <option value="0">Root</option><option value="1">1ª Inv</option><option value="2">2ª Inv</option><option value="3">3ª Inv</option>
            </select>
          </div>
          <div className="flex flex-col gap-3">
            <select value={state.chordQuality} onChange={e => recordAction({...state, chordQuality: e.target.value as any})} className="w-full p-3 border rounded-lg text-sm font-black bg-white text-zinc-900">
               {CHORD_QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <div className="flex gap-2 p-1 bg-white border border-zinc-200 rounded-xl">
               <button onClick={() => recordAction({...state, colorMode: 'SINGLE'})} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${state.colorMode === 'SINGLE' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.colorSingle}</button>
               <button onClick={() => recordAction({...state, colorMode: 'MULTI'})} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${state.colorMode === 'MULTI' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.colorMulti}</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span> {t.editor}
           </h4>
           <div className="flex gap-2">
              <select value={state.instrumentType} onChange={e => recordAction({...state, instrumentType: e.target.value as InstrumentType, tuning: 'Standard', stringStatuses: Array(INSTRUMENT_PRESETS[e.target.value as InstrumentType].strings).fill('normal')})} className="flex-1 p-3 border rounded-lg text-[11px] font-black bg-white text-zinc-900">
                 <option value="guitar-6">{t.instr_guitar6}</option><option value="guitar-7">{t.instr_guitar7}</option><option value="guitar-8">{t.instr_guitar8}</option><option value="bass-4">{t.bass4}</option><option value="bass-5">{t.bass5}</option>
              </select>
              <select value={state.tuning} onChange={e => changeTuning(e.target.value as TuningKey)} className="flex-1 p-3 border rounded-lg text-[11px] font-black bg-white text-zinc-900">
                 {Object.keys(TUNINGS_PRESETS).map(tk => <option key={tk} value={tk}>{tk}</option>)}
              </select>
           </div>
           
           <div className="space-y-3">
              <div className="flex gap-2 p-1.5 bg-white border border-zinc-200 rounded-xl">
                 <button onClick={() => setEditorMode('marker')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${editorMode === 'marker' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.marker}</button>
                 <button onClick={() => setEditorMode('line')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${editorMode === 'line' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>{t.line}</button>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                 <div className="flex justify-center gap-2">
                    {['circle', 'square', 'triangle'].map(s => (
                       <button key={s} onClick={() => setMarkerShape(s as MarkerShape)} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${markerShape === s ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300'}`}>
                          {s === 'circle' && <span className="text-xl">●</span>} 
                          {s === 'square' && <span className="text-xl">■</span>} 
                          {s === 'triangle' && <span className="text-xl">▲</span>}
                       </button>
                    ))}
                 </div>
                 <div className="flex gap-1">
                    {[2, 4, 7].map(w => (
                       <button key={w} onClick={() => setLineThickness(w as LineThickness)} className={`flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase border transition-all ${lineThickness === w ? 'bg-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-400'}`}>
                          {w === 2 ? t.thin : w === 4 ? t.medium : t.thick}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex justify-between items-center gap-3">
              <div className="flex gap-1.5">
                 {PRESET_COLORS.map(c => <button key={c} onClick={() => setMarkerColor(c)} className={`w-7 h-7 rounded-full border-2 transition-transform ${markerColor === c ? 'scale-110 border-blue-500 shadow-md' : 'border-transparent'}`} style={{background: c}} />)}
              </div>
              <button onClick={clearContent} className="text-[10px] font-black text-red-500 uppercase hover:underline">{t.clearDiagram}</button>
           </div>
        </div>
      </div>

      <div className={`operational-btns mb-5 hidden md:block md:pr-[420px] ${isExporting ? 'hidden' : ''}`}>
        <div className={`flex flex-col gap-3 rounded-2xl border px-3 py-3 shadow-sm md:flex-row md:items-center md:justify-between ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
            <button onClick={() => toggleQuickPanel('editor')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'editor' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Editor' : 'Editor'}
            </button>
            <button onClick={() => toggleQuickPanel('visual')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'visual' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Rótulos' : 'Labels'}
            </button>
            <button onClick={() => toggleHarmonyLayer('showScale')} className={`${quickButtonClass} shrink-0 ${state.layers.showScale ? quickActiveButtonClass : ''}`}>
              {t.scaleNotes}
            </button>
            <button onClick={() => toggleHarmonyLayer('showTonic')} className={`${quickButtonClass} shrink-0 ${state.layers.showTonic ? quickActiveButtonClass : ''}`}>
              {t.tonicHighlight}
            </button>
          </div>

          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
            {onGlobalTranspose && (
              <div className={`flex shrink-0 items-center gap-1 rounded-xl border px-1.5 py-1 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
                <span className="px-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {lang === 'pt' ? 'Transp.' : 'Transp.'}
                </span>
                <button onClick={() => onGlobalTranspose(-1)} className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-black text-blue-600 transition-colors hover:bg-blue-50">-</button>
                <div className="flex min-w-[28px] flex-col items-center justify-center px-1">
                  <span className={`text-[10px] font-black leading-none ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                    {globalTranspose === 0 ? '0' : globalTranspose > 0 ? `+${globalTranspose}` : globalTranspose}
                  </span>
                  <button onClick={() => onGlobalTranspose(0)} className="text-[7px] font-black uppercase leading-none text-zinc-400 hover:text-red-500">
                    reset
                  </button>
                </div>
                <button onClick={() => onGlobalTranspose(1)} className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-black text-blue-600 transition-colors hover:bg-blue-50">+</button>
              </div>
            )}
            <div className={`flex shrink-0 items-center gap-2 rounded-xl border px-2 py-1.5 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {lang === 'pt' ? 'Trastes' : 'Frets'}
              </span>
              <input type="number" min={0} max={state.endFret - 1} value={state.startFret} onChange={e => recordAction({...state, startFret: Math.max(0, Math.min(Number(e.target.value), state.endFret - 1))})} className="w-12 rounded-md border border-zinc-200 bg-white px-1 py-1 text-center text-[10px] font-black text-zinc-900" />
              <span className="text-[10px] font-black text-zinc-400">-</span>
              <input type="number" min={state.startFret + 1} max={24} value={state.endFret} onChange={e => recordAction({...state, endFret: Math.min(24, Math.max(Number(e.target.value), state.startFret + 1))})} className="w-12 rounded-md border border-zinc-200 bg-white px-1 py-1 text-center text-[10px] font-black text-zinc-900" />
            </div>
            <button onClick={undo} className={`${quickButtonClass} shrink-0`} title={t.undo} aria-label={t.undo}>↶</button>
            <button onClick={redo} className={`${quickButtonClass} shrink-0`} title={t.redo} aria-label={t.redo}>↷</button>
            <button onClick={clearContent} className="shrink-0 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-[9px] font-black uppercase text-red-600 transition-all hover:bg-red-100 active:scale-95">
              {t.clearDiagram}
            </button>
          </div>
        </div>
      </div>

      <div className={`operational-btns ${isExporting ? 'hidden' : ''}`}>
        <div className={`fixed inset-x-0 bottom-0 z-[80] max-h-[78vh] overflow-y-auto border-t p-4 shadow-2xl transition-transform md:fixed md:inset-x-auto md:right-6 md:top-28 md:bottom-6 md:w-[390px] md:max-h-none md:rounded-2xl md:border ${panelShell} ${isControlPanelOpen ? 'translate-y-0 md:translate-y-0' : 'translate-y-[calc(100%-52px)] md:translate-y-0 md:translate-x-[calc(100%+32px)]'}`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                {lang === 'pt' ? 'Painel' : 'Panel'}
              </p>
              <h3 className="text-sm font-black uppercase tracking-tight">
                {lang === 'pt' ? 'Controles do Diagrama' : 'Diagram Controls'}
              </h3>
            </div>
            <button onClick={() => setIsControlPanelOpen(prev => !prev)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase border ${isLight ? 'bg-white border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`}>
              {isControlPanelOpen ? (lang === 'pt' ? 'Fechar' : 'Close') : (lang === 'pt' ? 'Abrir' : 'Open')}
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1 mb-4">
            {controlTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveControlTab(tab.id);
                  setIsControlPanelOpen(true);
                }}
                className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${activeControlTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : isLight ? 'bg-white text-zinc-500 hover:text-blue-600' : 'bg-zinc-900 text-zinc-400 hover:text-blue-400'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pb-16 md:pb-0">
            {isControlPanelOpen && renderControls()}
            {!showAdvanced && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <button onClick={() => setShowAdvanced(true)} className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all text-[10px] font-black uppercase">
                  {lang === 'pt' ? 'Mais opções' : 'More options'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative group diagram-svg-wrapper md:pr-[420px]">
         {/* Undo / Redo Responsivo */}
<div
  className={`
    hidden
    flex gap-2 z-20 transition-all

    /* Desktop — posição original */
    md:absolute md:top-6
    ${state.isLeftHanded ? 'md:left-6' : 'md:right-6'}

    /* Mobile — fixa fora do fretboard */
    max-md:fixed
    max-md:bottom-4
    max-md:${state.isLeftHanded ? 'left-4' : 'right-4'}

    /* Visibilidade */
    opacity-100 md:opacity-0
    md:group-hover:opacity-100
  `}
>
  <button
    onClick={undo}
    className="
      bg-white/90 backdrop-blur
      w-10 h-10 flex items-center justify-center
      rounded-xl border shadow-sm
      text-zinc-500 hover:text-blue-600
      transition-colors
    "
  >
    ↺
  </button>

  <button
    onClick={redo}
    className="
      bg-white/90 backdrop-blur
      w-10 h-10 flex items-center justify-center
      rounded-xl border shadow-sm
      text-zinc-500 hover:text-blue-600
      transition-colors
    "
  >
    ↻
  </button>
</div>

         <div className="relative">
            {creationHint && (
              <div className="mb-4 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
                {creationHint}
              </div>
            )}
            {isFretboardEmpty && (
              <div className="pointer-events-none absolute inset-x-0 top-[12%] mx-auto w-full text-center">
                <div className="inline-flex max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-500/40 bg-zinc-950/80 px-5 py-4 text-sm font-black uppercase tracking-[0.3em] text-zinc-300 backdrop-blur-lg">
                  {t.emptyFretboard}
                  <span className="mt-2 text-[11px] font-semibold text-zinc-400">
                    {t.emptyFretboardHint}
                  </span>
                </div>
              </div>
            )}
            {!isExporting && isControlPanelOpen && activeControlTab === 'editor' && (
              <div className={`absolute left-3 top-3 z-20 hidden max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 shadow-lg backdrop-blur-xl md:flex ${isLight ? 'bg-white/90 border-zinc-200' : 'bg-zinc-950/90 border-zinc-800'}`}>
                <button onClick={() => setEditorMode('marker')} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${editorMode === 'marker' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>
                  {t.marker}
                </button>
                <button onClick={() => setEditorMode('line')} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${editorMode === 'line' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>
                  {t.line}
                </button>
                <div className="flex items-center gap-1">
                  {PRESET_COLORS.slice(0, 5).map(c => (
                    <button key={c} onClick={() => setMarkerColor(c)} className={`h-6 w-6 rounded-full border-2 transition-transform ${markerColor === c ? 'scale-110 border-blue-500' : 'border-white/80'}`} style={{background: c}} />
                  ))}
                </div>
                {editorMode === 'marker' ? (
                  <div className="flex items-center gap-1">
                    {(['circle', 'square', 'triangle'] as MarkerShape[]).map(s => (
                      <button key={s} onClick={() => setMarkerShape(s)} className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[11px] font-black transition-all ${markerShape === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-zinc-200 text-zinc-500'}`} title={s}>
                        {markerShapeIcon(s)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {[
                      { value: 2, label: lang === 'pt' ? 'F' : 'T', title: t.thin },
                      { value: 4, label: lang === 'pt' ? 'M' : 'M', title: t.medium },
                      { value: 7, label: lang === 'pt' ? 'G' : 'T', title: t.thick }
                    ].map(option => (
                      <button key={option.value} onClick={() => setLineThickness(option.value as LineThickness)} className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[11px] font-black transition-all ${lineThickness === option.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-zinc-200 text-zinc-500'}`} title={option.title}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <FretboardSVG state={state} onEvent={handleEvent} theme={theme} isActive={false} selectedColor={markerColor} selectedShape={markerShape} editorMode={editorMode} isExport={isExporting} feedbackNote={noteClickFeedback} />
         </div>
         
         <div className={`mt-10 hidden flex-col md:flex md:flex-row gap-8 ${isExporting ? 'hidden-operational-btns' : ''}`}>
            <div className="md:w-[70%] flex flex-col gap-4">
               <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span> {t.notes}
               </h4>
               <div className="relative group/obs">
                  <textarea 
                     value={state.notes} 
                     maxLength={OBS_LIMIT}
                     onChange={e => recordAction({...state, notes: e.target.value})} 
                     className={`w-full h-40 p-6 rounded-3xl border text-[11px] font-bold italic tracking-tight focus:ring-4 transition-all resize-none outline-none leading-relaxed ${isLight ? 'bg-zinc-50 border-zinc-100 text-zinc-500 focus:ring-blue-50 focus:border-blue-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400 focus:ring-blue-900/20'}`} 
                     placeholder={t.notesPlaceholder} 
                  />
                  <div className={`absolute bottom-4 right-6 font-mono text-[9px] font-black tracking-widest transition-colors ${state.notes.length >= OBS_LIMIT * 0.9 ? 'text-red-500' : 'text-zinc-400 opacity-60'}`}>
                     {state.notes.length.toString().padStart(4, '0')} / {OBS_LIMIT}
                  </div>
               </div>
            </div>
            
            <div className="md:w-[30%] flex flex-col gap-4">
               <div className="flex items-center justify-between gap-3">
                 <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span> DICAS
                 </h4>
                 {onToggleTips && (
                   <button onClick={onToggleTips} className={`rounded-lg border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] transition-all ${showTips ? 'border-zinc-200 text-zinc-400 hover:text-red-500' : 'border-blue-200 bg-blue-50 text-blue-600'}`}>
                     {showTips ? (lang === 'pt' ? 'Ocultar' : 'Hide') : (lang === 'pt' ? 'Mostrar' : 'Show')}
                   </button>
                 )}
               </div>
               {showTips ? (
               <div className={`flex-1 flex items-center justify-center p-8 rounded-3xl border border-dashed transition-all ${isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-800/30 border-zinc-700'}`}>
                  <div className="flex flex-col gap-3 text-center">
                     <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 italic leading-relaxed tracking-tight">
                        {musicTip.text}
                     </p>
                     {musicTip.sourceUrl ? (
                       <a href={musicTip.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 hover:text-blue-600 transition-colors">
                         <span>{lang === 'pt' ? 'Fonte:' : 'Source:'} {musicTip.source}</span>
                         <span className="text-[8px] normal-case tracking-normal font-bold opacity-70">{musicTip.sourceUrl.replace(/^https?:\/\//, '')}</span>
                       </a>
                     ) : (
                       <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                         {lang === 'pt' ? 'Fonte:' : 'Source:'} {musicTip.source}
                       </p>
                     )}
                  </div>
               </div>
               ) : (
                 <div className={`flex-1 flex items-center justify-center p-8 rounded-3xl border border-dashed transition-all ${isLight ? 'bg-zinc-50/50 border-zinc-200 text-zinc-400' : 'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                   <p className="text-center text-[10px] font-black uppercase tracking-[0.2em]">
                     {lang === 'pt' ? 'Dicas ocultas neste perfil' : 'Tips hidden for this profile'}
                   </p>
                 </div>
               )}
               <div className="text-center opacity-30 mt-1">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">v1.8.1 Engine • {lang === 'pt' ? 'Sistema Automático' : 'Automatic System'}</span>
               </div>
            </div>
         </div>
      </div>
      {showWizard && <NewDiagramWizard onCreate={handleNewDiagramCreate} onClose={() => setShowWizard(false)} lang={lang} />}
    </div>
  );
};

export default React.memo(FretboardInstance);
