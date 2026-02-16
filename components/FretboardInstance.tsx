
import React, { useState, useCallback, useRef, useMemo } from 'react';
import FretboardSVG from './FretboardSVG';
import { CHROMATIC_SCALE, INSTRUMENT_PRESETS, getNoteAt, getIntervalName, TUNINGS_PRESETS, getFretForNote } from '../music/musicTheory';
import { SCALES } from '../music/scales';
import { DEGREE_NAMES, CHORD_QUALITIES } from '../music/harmony';
import { translations, Lang } from '../i18n';
import { FretboardState, EditorMode, MarkerShape, ThemeMode, StringStatus, InstrumentType, LineThickness, TuningKey, CagedShape } from '../types';

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
}

const TIPS_PT = [
  "A Tônica (1) é o centro gravitacional da escala.",
  "Acordes Drop 2 são formados movendo a 2ª nota mais aguda para o baixo.",
  "O sistema CAGED conecta 5 shapes de tríades maiores por todo o braço.",
  "Use a 3ª e a 7ª para definir a intenção (maior/menor/dominante) do acorde.",
  "Escalas Pentatônicas são excelentes para improvisação blues/rock.",
  "A escala Menora Melódica sobe de um jeito e desce de outro no clássico.",
  "Inversões mudam a textura do acorde sem alterar sua função harmônica.",
  "O intervalo de 4ª aumentada (#4) cria a sonoridade característica do modo Lídio."
];

const TIPS_EN = [
  "The Tonic (1) is the gravitational center of the scale.",
  "Drop 2 chords are voiced by moving the 2nd highest note to the bottom.",
  "The CAGED system connects 5 major triad shapes across the neck.",
  "Use the 3rd and 7th to define the chord's quality and tension.",
  "Pentatonic scales are essential for blues/rock improvisation.",
  "The Melodic Minor scale differs ascending vs descending in classical theory.",
  "Inversions change the chord's texture without altering its function.",
  "The augmented 4th (#4) creates the characteristic Lydian mode sound."
];

const FretboardInstance: React.FC<FretboardInstanceProps> = ({ 
  state, updateState, onRemove, onMove, onAdd, isFirst, isLast, theme, lang, isExporting = false
}) => {
  const t = translations[lang];
  const [editorMode, setEditorMode] = useState<EditorMode>('marker');
  const [markerShape, setMarkerShape] = useState<MarkerShape>('circle');
  const [markerColor, setMarkerColor] = useState('#2563eb');
  const [lineThickness, setLineThickness] = useState<LineThickness>(4);
  const [lineStart, setLineStart] = useState<{string: number, fret: number} | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const historyRef = useRef<FretboardState[]>([]);
  const futureRef = useRef<FretboardState[]>([]);

  const currentTip = useMemo(() => {
    const list = lang === 'pt' ? TIPS_PT : TIPS_EN;
    return list[Math.floor(Math.random() * list.length)];
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

  const isLight = isExporting ? true : (theme === 'light');
  const PRESET_COLORS = ['#ef4444', '#2563eb', '#22c55e', '#eab308', '#000000', '#6366f1', '#ec4899'];
  const OBS_LIMIT = 1500;

  return (
    <div className={`diagram-container p-5 md:p-10 rounded-[32px] md:rounded-[48px] border shadow-2xl transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
      
      {/* HEADER DIAGRAMA */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-5 ${isExporting ? 'hidden-operational-btns' : ''}`}>
        <div className="flex-1">
          <input value={state.title} onChange={e => recordAction({...state, title: e.target.value})} className={`bg-transparent text-xl md:text-3xl font-black italic uppercase tracking-tighter focus:outline-none w-full ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`} placeholder={t.titlePlaceholder} />
          <input value={state.subtitle} onChange={e => recordAction({...state, subtitle: e.target.value})} className="bg-transparent text-[11px] md:text-lg font-bold text-zinc-400 focus:outline-none w-full uppercase tracking-wide mt-1" placeholder={t.subtitle} />
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 operational-btns">
           <button onClick={exportDataJSON} className={`px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl font-black text-[10px] md:text-[11px] uppercase border transition-all active:scale-90 ${copyFeedback ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
              {copyFeedback ? 'OK' : 'JSON'}
           </button>
           <button onClick={() => onAdd()} className="bg-blue-600 px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl text-white font-black text-[10px] md:text-[11px] uppercase active:scale-95 shadow-lg shadow-blue-500/20">NOVO</button>
           <button onClick={() => onAdd(state)} className="bg-zinc-800 px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl text-white font-black text-[10px] md:text-[11px] uppercase active:scale-95">{t.cloneCurrent}</button>
           <div className="flex gap-1 items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button onClick={() => onMove('up')} disabled={isFirst} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↑</button>
              <button onClick={() => onMove('down')} disabled={isLast} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↓</button>
           </div>
           <button onClick={onRemove} className="bg-red-50 text-red-600 w-11 h-11 flex items-center justify-center rounded-xl font-black text-xl transition-colors hover:bg-red-100">×</button>
        </div>
      </div>

      {/* CONTROLES TÉCNICOS */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border ${isLight ? 'bg-zinc-50 border-zinc-100 shadow-inner' : 'bg-zinc-800/50 border-zinc-700'} ${isExporting ? 'hidden' : ''}`}>
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
    TRÊS / CASAS
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

      <div className="relative group diagram-svg-wrapper">
         {/* Undo/Redo Reposicionados baseados na orientação */}
         <div className={`absolute top-6 ${state.isLeftHanded ? 'left-6' : 'right-6'} flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button onClick={undo} className="bg-white/90 backdrop-blur w-10 h-10 flex items-center justify-center rounded-xl border shadow-sm text-zinc-500 hover:text-blue-600 transition-colors">↺</button>
            <button onClick={redo} className="bg-white/90 backdrop-blur w-10 h-10 flex items-center justify-center rounded-xl border shadow-sm text-zinc-500 hover:text-blue-600 transition-colors">↻</button>
         </div>
         <FretboardSVG state={state} onEvent={handleEvent} theme={theme} isActive={false} selectedColor={markerColor} selectedShape={markerShape} editorMode={editorMode} isExport={isExporting} />
         
         <div className={`mt-10 flex flex-col md:flex-row gap-8 ${isExporting ? 'hidden-operational-btns' : ''}`}>
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
               <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span> DICAS
               </h4>
               <div className={`flex-1 flex items-center justify-center p-8 rounded-3xl border border-dashed transition-all ${isLight ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-800/30 border-zinc-700'}`}>
                  <div className="flex flex-col gap-1 text-center">
                     <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 italic leading-relaxed tracking-tight">
                        {currentTip}
                     </p>
                  </div>
               </div>
               <div className="text-center opacity-30 mt-1">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">v1.8.1 Engine • {lang === 'pt' ? 'Sistema Automático' : 'Automatic System'}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default React.memo(FretboardInstance);
