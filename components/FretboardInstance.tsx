
import React, { useState, useCallback, useRef, useEffect } from 'react';
import FretboardSVG from './FretboardSVG';
import { CHROMATIC_SCALE, INSTRUMENT_PRESETS, getNoteAt, getIntervalName, TUNINGS_PRESETS, getFretForNote } from '../music/musicTheory';
import { SCALES } from '../music/scales';
import { DEGREE_NAMES, CHORD_QUALITIES } from '../music/harmony';
import { translations, Lang } from '../i18n';
import { FretboardState, EditorMode, MarkerShape, ThemeMode, StringStatus, InstrumentType, LineThickness, CagedShape, VoicingMode, TuningKey } from '../types';

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
    const confirmMsg = lang === 'pt' 
      ? "Resetar este diagrama?\n(Isso apagará notas, linhas, escalas e harmonias configuradas)" 
      : "Reset this diagram?\n(This will clear notes, lines, scales, and harmony settings)";
      
    if (window.confirm(confirmMsg)) {
      recordAction({ 
        ...state, 
        markers: [], 
        lines: [],
        harmonyMode: 'OFF',
        cagedShape: 'OFF',
        layers: {
          ...state.layers,
          showScale: false,
          showTonic: false,
          showAllNotes: false
        }
      });
    }
  };

  const changeTuning = (newTuningKey: TuningKey) => {
    const instrument = INSTRUMENT_PRESETS[state.instrumentType];
    const oldTuning = state.tuning === 'Custom' ? state.customTuning! : (TUNINGS_PRESETS[state.tuning] || instrument.defaultTuning);
    const newTuning = newTuningKey === 'Custom' ? (state.customTuning || instrument.defaultTuning) : (TUNINGS_PRESETS[newTuningKey] || instrument.defaultTuning);
    const updatedMarkers = state.markers.map(m => {
      const note = getNoteAt(m.string, m.fret, oldTuning);
      const newFret = getFretForNote(m.string, note, newTuning, 0); 
      return { ...m, fret: newFret };
    });
    recordAction({ ...state, tuning: newTuningKey, markers: updatedMarkers });
  };

  const exportDataJSON = () => {
    const instrument = INSTRUMENT_PRESETS[state.instrumentType];
    const tuning = state.tuning === 'Custom' ? state.customTuning! : (TUNINGS_PRESETS[state.tuning] || instrument.defaultTuning);
    const data = {
      diagram_id: state.id,
      meta: { title: state.title, instrument: state.instrumentType },
      tuning: { label: state.tuning, structure: tuning },
      theory: { root: state.root, scale: state.scaleType, harmony: state.harmonyMode },
      points: state.markers.map(m => {
        const note = getNoteAt(m.string, m.fret, tuning);
        return { string: instrument.strings - m.string, fret: m.fret, note, interval: getIntervalName(state.root, note) };
      })
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleEvent = useCallback((event: any) => {
    if (event.type === 'note') {
      if (editorMode === 'marker') {
        const existingIdx = state.markers.findIndex(m => m.string === event.string && m.fret === event.fret);
        let newMarkers = [...state.markers];
        if (existingIdx >= 0) newMarkers.splice(existingIdx, 1);
        else newMarkers.push({ id: crypto.randomUUID(), string: event.string, fret: event.fret, shape: markerShape, color: markerColor, finger: '1' });
        recordAction({ ...state, markers: newMarkers });
      } else if (editorMode === 'line') {
        if (!lineStart) { setLineStart({ string: event.string, fret: event.fret }); } 
        else {
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

  return (
    <div className={`p-8 rounded-[40px] border shadow-2xl transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8 gap-6">
        <div className="flex-1 space-y-1">
          <input value={state.title} onChange={e => recordAction({...state, title: e.target.value})} className={`bg-transparent text-4xl font-black italic uppercase tracking-tighter focus:outline-none w-full ${isLight ? 'text-zinc-900 placeholder-zinc-300' : 'text-zinc-100 placeholder-zinc-800'}`} placeholder={t.titlePlaceholder} />
          <input value={state.subtitle} onChange={e => recordAction({...state, subtitle: e.target.value})} className="bg-transparent text-xl font-bold text-zinc-400 focus:outline-none w-full" placeholder={t.subtitle} />
        </div>
        <div className="flex gap-2">
           <button onClick={exportDataJSON} className={`px-5 py-4 rounded-xl font-black text-[10px] uppercase border transition-all active:scale-95 ${copyFeedback ? 'bg-emerald-600 border-emerald-600 text-white' : (isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700')}`}>
             {copyFeedback ? (lang === 'pt' ? 'COPIADO!' : 'COPIED!') : 'DADOS'}
           </button>
           <button onClick={() => onAdd()} className="bg-blue-600 px-6 py-4 rounded-xl text-white font-black text-xs uppercase shadow-lg shadow-blue-200 hover:scale-105 transition-all">{t.createNew}</button>
           <button onClick={() => onAdd(state)} className={`px-6 py-4 rounded-xl font-black text-xs uppercase transition-all shadow-md ${isLight ? 'bg-zinc-800 text-white hover:bg-zinc-900' : 'bg-zinc-700 text-white hover:bg-zinc-600'}`}>{t.cloneCurrent}</button>
           <div className="flex flex-col gap-1 ml-4">
              <button onClick={() => onMove('up')} disabled={isFirst} className="bg-zinc-200 p-2 rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-zinc-300">↑</button>
              <button onClick={() => onMove('down')} disabled={isLast} className="bg-zinc-200 p-2 rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-zinc-300">↓</button>
           </div>
           <button onClick={onRemove} className="bg-red-800/10 text-red-700 px-4 rounded-xl font-black text-xs uppercase ml-2 hover:bg-red-800/20">Del</button>
        </div>
      </div>

      {/* TOOLBAR GRID */}
      <div className={`grid grid-cols-4 gap-8 mb-10 p-8 rounded-3xl border ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-800/50 border-zinc-700'}`}>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t.layers}</h4>
          <div className="grid grid-cols-2 gap-2">
            {['note', 'interval', 'fingering', 'none'].map(m => (
              <button key={m} onClick={() => recordAction({...state, labelMode: m as any})} className={`py-2 px-3 rounded-lg text-[9px] font-bold uppercase border transition-all ${state.labelMode === m ? 'bg-blue-600 border-blue-600 text-white shadow-md' : (isLight ? 'bg-white border-zinc-200 text-zinc-600' : 'bg-zinc-700 border-zinc-600 text-zinc-300')}`}>
                {m === 'none' ? t.labelNone : (m === 'note' ? t.labelNotes : (m === 'interval' ? t.labelIntervals : t.labelFingering))}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(state.layers).map(([key, val]) => (
              <button key={key} onClick={() => recordAction({...state, layers: {...state.layers, [key as any]: !val}})} className={`py-2 px-3 rounded-lg text-[9px] font-bold uppercase border transition-all ${val ? 'bg-blue-600 border-blue-600 text-white shadow-md' : (isLight ? 'bg-zinc-200/60 border-transparent text-zinc-500' : 'bg-zinc-700/50 border-transparent text-zinc-500')}`}>
                {key === 'showInlays' ? t.inlays : (key === 'showAllNotes' ? t.allNotes : (key === 'showScale' ? t.scaleNotes : t.tonicHighlight))}
              </button>
            ))}
          </div>
          <div className="flex p-1 rounded-xl bg-zinc-200/50">
            {(['SINGLE', 'MULTI'] as const).map(m => (
              <button key={m} onClick={() => recordAction({...state, colorMode: m})} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${state.colorMode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500'}`}>
                {m === 'SINGLE' ? t.colorSingle : t.colorMulti}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t.general}</h4>
          <div className="flex gap-2">
            <select value={state.root} title="Root" onChange={e => recordAction({...state, root: e.target.value})} className={`flex-1 p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
              {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={state.scaleType} title="Scale" onChange={e => recordAction({...state, scaleType: e.target.value})} className={`flex-1 p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
              {SCALES.map(s => <option key={s.name} value={s.name}>{(t.scales && t.scales[s.name as keyof typeof t.scales]) || s.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select value={state.instrumentType} title="Instrument" onChange={e => recordAction({...state, instrumentType: e.target.value as InstrumentType, stringStatuses: Array(INSTRUMENT_PRESETS[e.target.value as InstrumentType].strings).fill('normal')})} className={`flex-1 p-2 border rounded-lg text-xs font-black uppercase focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
              {[{ value: 'guitar-6', label: t.instr_guitar6 }, { value: 'guitar-7', label: t.instr_guitar7 }, { value: 'guitar-8', label: t.instr_guitar8 }, { value: 'bass-4', label: t.bass4 }, { value: 'bass-5', label: t.bass5 }].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button onClick={() => recordAction({...state, isLeftHanded: !state.isLeftHanded})} className={`px-3 py-2 border rounded-lg text-[9px] font-black uppercase transition-all ${state.isLeftHanded ? 'bg-blue-600 border-blue-600 text-white shadow-md' : (isLight ? 'bg-white border-zinc-200 text-zinc-500' : 'bg-zinc-700 border-zinc-600 text-zinc-400')}`}>
              {t.leftHanded}
            </button>
          </div>
          <select value={state.tuning} title="Tuning" onChange={e => changeTuning(e.target.value as TuningKey)} className={`w-full p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
            {Object.keys(TUNINGS_PRESETS).map(tk => <option key={tk} value={tk}>{tk}</option>)}
          </select>
          <div className="space-y-1">
             <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase"><span>Nut + {state.endFret} {t.fretLabel}</span></div>
             <input type="range" min="5" max="24" value={state.endFret} onChange={e => recordAction({...state, endFret: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t.geometry}</h4>
          <div className="flex flex-wrap gap-1.5">
             {(['OFF', 'C', 'A', 'G', 'E', 'D'] as CagedShape[]).map(sh => (
               <button key={sh} onClick={() => recordAction({...state, cagedShape: sh})} className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs border transition-all ${state.cagedShape === sh ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : (isLight ? 'bg-white border-zinc-200 text-zinc-500 hover:border-blue-500' : 'bg-zinc-700 border-zinc-600 text-zinc-400 hover:border-blue-500')}`}>
                 {sh}
               </button>
             ))}
          </div>
          <div className="p-3 rounded-xl bg-blue-600/5 border border-blue-600/10">
             <p className="text-[9px] font-black uppercase text-blue-600 tracking-tight leading-tight">Mapeamento Geométrico Ativo</p>
             <p className="text-[8px] font-medium text-zinc-400 mt-1">Shapes são adaptados dinamicamente para manter a integridade musical.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t.harmony}</h4>
          <div className="grid grid-cols-2 gap-2">
            <select value={state.harmonyMode} onChange={e => recordAction({...state, harmonyMode: e.target.value as any})} className={`p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
                <option value="OFF">Harmonia Off</option>
                <option value="TRIADS">Tríades</option>
                <option value="TETRADS">Tétrades</option>
            </select>
            <select value={state.voicingMode || 'CLOSE'} onChange={e => recordAction({...state, voicingMode: e.target.value as any})} className={`p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
                <option value="CLOSE">Close</option>
                <option value="DROP2">Drop 2</option>
                <option value="DROP3">Drop 3</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <select value={state.chordDegree} onChange={e => recordAction({...state, chordDegree: parseInt(e.target.value)})} className={`p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
                {DEGREE_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
             </select>
             <select value={state.inversion} onChange={e => recordAction({...state, inversion: parseInt(e.target.value)})} className={`p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
                <option value={0}>Root</option>
                <option value={1}>1st Inv</option>
                <option value={2}>2nd Inv</option>
                <option value={3}>3rd Inv</option>
             </select>
          </div>
          <select value={state.chordQuality} onChange={e => recordAction({...state, chordQuality: e.target.value as any})} className={`w-full p-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-700 border-zinc-600 text-zinc-100'}`}>
            {CHORD_QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
      </div>

      {/* EDITOR BAR */}
      <div className={`flex items-center gap-6 mb-4 p-4 rounded-2xl border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-800 border-zinc-700'}`}>
         <h4 className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">{t.editor}</h4>
         <div className="flex bg-blue-600/10 p-1 rounded-xl border border-blue-600/20">
            <button onClick={() => { setEditorMode('marker'); setLineStart(null); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${editorMode === 'marker' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-600'}`}>{t.marker}</button>
            <div className="w-[1px] bg-blue-600/20 mx-1"></div>
            <button onClick={() => { setEditorMode('line'); setLineStart(null); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${editorMode === 'line' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-600'}`}>{t.line}</button>
         </div>
         <div className="flex gap-2">
            {['circle', 'square', 'triangle'].map(s => (
              <button key={s} onClick={() => setMarkerShape(s as any)} className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${markerShape === s ? 'bg-white border-blue-500 text-blue-500 shadow-sm' : 'bg-zinc-300 border-transparent text-zinc-500 hover:bg-zinc-200'}`}>
                {s === 'circle' ? '●' : s === 'square' ? '■' : '▲'}
              </button>
            ))}
         </div>
         <div className="flex gap-2 p-1.5 bg-zinc-200/50 rounded-xl">
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => setMarkerColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${markerColor === c ? 'border-white scale-125 shadow-lg' : 'border-transparent'}`} style={{backgroundColor: c}} />
            ))}
         </div>
         <div className={`flex p-1 rounded-xl ${isLight ? 'bg-zinc-200' : 'bg-zinc-700'}`}>
            {[2, 4, 7].map(v => (
               <button key={v} onClick={() => setLineThickness(v as any)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${lineThickness === v ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500'}`}>
                  {v === 2 ? t.thin : (v === 4 ? t.medium : t.thick)}
               </button>
            ))}
         </div>
         <div className="ml-auto flex gap-1.5 items-center">
            <button onClick={undo} className="p-2 bg-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-300 transition-colors" title={t.undo}>⟲</button>
            <button onClick={redo} className="p-2 bg-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-300 transition-colors" title={t.redo}>⟳</button>
            
            <button onClick={clearContent} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase border border-red-100 hover:bg-red-100 transition-colors" title={t.clearDiagram}>{t.clearDiagram}</button>
            
            <button onClick={() => recordAction({...state, markers: [], lines: []})} className="p-2 bg-zinc-200 rounded-lg text-red-500 hover:bg-red-100 transition-colors" title={t.clearEditor}>Del</button>
         </div>
      </div>

      <div className="diagram-container relative">
        {lineStart && editorMode === 'line' && (
           <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-xl animate-pulse z-20">
              {lang === 'pt' ? 'Clique no destino para criar linha' : 'Click destination for line'}
           </div>
        )}
        <FretboardSVG state={state} editorMode={editorMode} onEvent={handleEvent} selectedColor={markerColor} selectedShape={markerShape} theme={theme} isActive={false} isExport={isExporting} />
        {state.startFret === 0 && (
           <div className="absolute top-0 left-0 text-[8px] font-black text-zinc-300 uppercase p-2 tracking-widest">{t.statusTip}</div>
        )}
      </div>

      <textarea value={state.notes} onChange={e => recordAction({...state, notes: e.target.value})} className={`w-full mt-6 p-6 rounded-3xl border text-sm font-medium italic min-h-[100px] outline-none transition-all ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`} placeholder={t.notes + "..."} />
    </div>
  );
};

export default React.memo(FretboardInstance);
