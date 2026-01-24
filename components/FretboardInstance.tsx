
import React, { useState, useCallback } from 'react';
import FretboardSVG from './FretboardSVG';
import { CHROMATIC_SCALE, TUNINGS } from '../music/musicTheory';
import { SCALES } from '../music/scales';
import { DEGREE_NAMES, ChordQuality } from '../music/harmony';
import { translations, Lang } from '../i18n';
import { FretboardState, EditorMode, Line, MarkerShape, ThemeMode, LineThickness, StringStatus } from '../types';

interface FretboardInstanceProps {
  state: FretboardState;
  updateState: (newState: FretboardState) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onAdd: (clone: boolean) => void;
  isFirst: boolean;
  isLast: boolean;
  theme: ThemeMode;
  lang: Lang;
  isActive: boolean;
  onActivate: () => void;
  isExporting?: boolean;
}

const FretboardInstance: React.FC<FretboardInstanceProps> = ({ 
  state, updateState, onRemove, onMove, onAdd, isFirst, isLast, theme, lang, isActive, onActivate, isExporting = false
}) => {
  const t = translations[lang];
  const [editorMode, setEditorMode] = useState<EditorMode>('marker');
  const [markerShape, setMarkerShape] = useState<MarkerShape>('circle');
  const [markerColor, setMarkerColor] = useState('#ef4444');
  const [thickness, setThickness] = useState<LineThickness>(4);
  const [lineStart, setLineStart] = useState<{ string: number, fret: number } | null>(null);
  const [history, setHistory] = useState<{past: FretboardState[], future: FretboardState[]}>({ past: [], future: [] });

  const recordAction = useCallback((newState: FretboardState) => {
    setHistory(h => ({ past: [...h.past, state].slice(-25), future: [] }));
    updateState(newState);
  }, [state, updateState]);

  const undo = () => {
    if (history.past.length === 0) return;
    const prev = history.past[history.past.length - 1];
    setHistory(h => ({ past: h.past.slice(0, -1), future: [state, ...h.future].slice(0, 25) }));
    updateState(prev);
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory(h => ({ past: [...h.past, state].slice(-25), future: h.future.slice(1) }));
    updateState(next);
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
        if (!lineStart) setLineStart({ string: event.string, fret: event.fret });
        else {
          const newLine: Line = { id: crypto.randomUUID(), start: lineStart, end: { string: event.string, fret: event.fret }, color: markerColor, width: thickness };
          recordAction({ ...state, lines: [...state.lines, newLine] });
          setLineStart(null);
        }
      }
    } else if (event.type === 'marker-finger') {
       const fingerCycle = ['1', '2', '3', '4', 'T', ''];
       const newMarkers = state.markers.map(m => {
         if (m.id === event.id) {
           const currentIdx = fingerCycle.indexOf(m.finger || '');
           const nextFinger = fingerCycle[(currentIdx + 1) % fingerCycle.length];
           return { ...m, finger: nextFinger };
         }
         return m;
       });
       recordAction({ ...state, markers: newMarkers });
    } else if (event.type === 'string-status') {
       const statusCycle: StringStatus[] = ['normal', 'open', 'mute'];
       const currentStatuses = [...(state.stringStatuses || ['normal','normal','normal','normal','normal','normal'])];
       const currentIdx = statusCycle.indexOf(currentStatuses[event.string] || 'normal');
       currentStatuses[event.string] = statusCycle[(currentIdx + 1) % statusCycle.length];
       recordAction({ ...state, stringStatuses: currentStatuses });
    } else if (event.type === 'line' && editorMode === 'line') {
      if (!lineStart) {
        const newLines = [...state.lines];
        newLines.splice(event.index, 1);
        recordAction({ ...state, lines: newLines });
      }
    }
  }, [editorMode, markerShape, markerColor, thickness, lineStart, state, recordAction]);

  const updateCustomTuning = (idx: number, note: string) => {
    const tuning = [...(state.customTuning || TUNINGS.Standard)];
    tuning[idx] = note;
    recordAction({ ...state, tuning: 'Custom', customTuning: tuning });
  };

  const PRESET_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000'];
  const isLight = isExporting ? true : (theme === 'light');
  const btnInactiveClass = isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-100';

  return (
    <div onClick={onActivate} className={`p-4 md:p-8 rounded-2xl md:rounded-3xl border transition-all duration-300 diagram-container ${isActive && !isExporting ? 'ring-2 ring-blue-500 shadow-2xl scale-[1.01]' : 'shadow-xl'} ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        <div className="flex-1 min-w-[280px] space-y-1 md:space-y-2">
          <input 
            value={state.title} 
            onChange={e => recordAction({...state, title: e.target.value})} 
            className={`bg-transparent text-xl md:text-3xl font-black focus:outline-none border-b-2 md:border-b-4 border-transparent focus:border-blue-500 transition-all w-full ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`} 
            placeholder={t.titlePlaceholder} 
            readOnly={isExporting}
          />
          <input 
            value={state.subtitle} 
            onChange={e => recordAction({...state, subtitle: e.target.value})} 
            className={`bg-transparent text-sm md:text-xl font-bold focus:outline-none w-full ${isLight ? 'text-zinc-700' : 'text-zinc-300'} ${isExporting ? '!text-zinc-500 !opacity-100' : 'opacity-70'}`} 
            placeholder={t.subtitle} 
            readOnly={isExporting}
          />
        </div>
        <div className={`flex items-center gap-2 md:gap-3 ${isExporting ? 'hidden' : ''}`}>
          <div className="flex bg-zinc-800/40 p-1 rounded-lg">
             <button onClick={undo} disabled={history.past.length === 0} className="p-2 hover:bg-zinc-700 rounded-lg disabled:opacity-20 transition-all text-white text-sm">⟲</button>
             <button onClick={redo} disabled={history.future.length === 0} className="p-2 hover:bg-zinc-700 rounded-lg disabled:opacity-20 transition-all text-white text-sm">⟳</button>
          </div>
          <button onClick={() => onMove('up')} disabled={isFirst} className="p-2 md:p-3.5 bg-zinc-800 rounded-lg md:rounded-xl hover:bg-zinc-700 text-white disabled:opacity-30 text-sm">↑</button>
          <button onClick={() => onMove('down')} disabled={isLast} className="p-2 md:p-3.5 bg-zinc-800 rounded-lg md:rounded-xl hover:bg-zinc-700 text-white disabled:opacity-30 text-sm">↓</button>
          <button onClick={onRemove} className="p-2 md:p-3.5 bg-red-950 text-red-500 rounded-lg md:rounded-xl hover:bg-red-900 transition-colors font-black text-[10px] uppercase tracking-widest">Del</button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 md:gap-12">
        <div className={`w-full xl:w-[350px] space-y-8 md:space-y-10 order-2 xl:order-1 ${isExporting ? 'hidden' : ''}`}>
          <section className="space-y-3 md:space-y-4">
            <h4 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.layers}</h4>
            <div className={`flex gap-1 p-1 rounded-xl mb-3 ${isLight ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
              <button onClick={() => recordAction({...state, labelMode: 'note'})} className={`flex-1 text-[9px] md:text-[10px] py-2 rounded-lg font-black transition-all ${state.labelMode === 'note' ? 'bg-blue-600 text-white shadow-md' : btnInactiveClass + ' opacity-60'}`}>{t.labelNotes}</button>
              <button onClick={() => recordAction({...state, labelMode: 'interval'})} className={`flex-1 text-[9px] md:text-[10px] py-2 rounded-lg font-black transition-all ${state.labelMode === 'interval' ? 'bg-blue-600 text-white shadow-md' : btnInactiveClass + ' opacity-60'}`}>{t.labelIntervals}</button>
              <button onClick={() => recordAction({...state, labelMode: 'fingering'})} className={`flex-1 text-[9px] md:text-[10px] py-2 rounded-lg font-black transition-all ${state.labelMode === 'fingering' ? 'bg-blue-600 text-white shadow-md' : btnInactiveClass + ' opacity-60'}`}>{t.labelFingering}</button>
              <button onClick={() => recordAction({...state, labelMode: 'none'})} className={`flex-1 text-[9px] md:text-[10px] py-2 rounded-lg font-black transition-all ${state.labelMode === 'none' ? 'bg-blue-600 text-white shadow-md' : btnInactiveClass + ' opacity-60'}`}>{t.labelNone}</button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-[10px] md:text-[11px]">
              {Object.entries(state.layers).map(([key, val]) => (
                <button key={key} onClick={() => recordAction({...state, layers: {...state.layers, [key]: !val}})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border text-left transition-all font-black uppercase tracking-tight ${val ? (isLight ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg') : (isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400')}`}>
                  {t[key.replace('show', '').charAt(0).toLowerCase() + key.replace('show', '').slice(1) as keyof typeof t] || key.replace('show', '')}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 md:space-y-4">
            <h4 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.general}</h4>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <select value={state.root} onChange={e => recordAction({...state, root: e.target.value})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold ${isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-800 text-white border-zinc-700'}`}>
                {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={state.scaleType} onChange={e => recordAction({...state, scaleType: e.target.value})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold ${isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-800 text-white border-zinc-700'}`}>
                {SCALES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <select value={state.tuning} onChange={e => recordAction({...state, tuning: e.target.value as any, customTuning: e.target.value === 'Custom' ? (state.customTuning || TUNINGS.Standard) : undefined})} className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-zinc-100'}`}>
               {Object.keys(TUNINGS).map(tk => <option key={tk} value={tk}>{tk}</option>)}
               <option value="Custom">{t.custom}</option>
            </select>
            
            {state.tuning === 'Custom' && (
              <div className="grid grid-cols-6 gap-1 p-2 bg-zinc-800/20 rounded-xl border border-dashed border-zinc-700">
                {(state.customTuning || TUNINGS.Standard).map((note, i) => (
                  <select key={i} value={note} onChange={e => updateCustomTuning(i, e.target.value)} className="bg-transparent text-[10px] font-black text-blue-500 outline-none appearance-none text-center">
                    {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                ))}
              </div>
            )}

            <div className={`space-y-2 md:space-y-3 p-3 md:p-4 rounded-xl md:rounded-2xl border ${isLight ? 'bg-zinc-100/50 border-zinc-200' : 'bg-zinc-800/20 border-zinc-800'}`}>
               <label className={`text-[9px] md:text-[10px] font-black block uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>NUT + {state.endFret} {t.fretLabel}</label>
               <input type="range" min="5" max="24" step="1" value={state.endFret} onChange={e => recordAction({...state, endFret: parseInt(e.target.value)})} className="w-full accent-blue-600" />
            </div>
            <label className={`flex items-center gap-3 md:gap-4 text-xs cursor-pointer font-bold select-none ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              <input type="checkbox" checked={state.isLeftHanded} onChange={() => recordAction({...state, isLeftHanded: !state.isLeftHanded})} className="w-4 h-4 md:w-5 md:h-5 rounded-lg accent-blue-600" />
              {t.leftHanded}
            </label>
          </section>

          <section className="space-y-3 md:space-y-4">
            <h4 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.harmony}</h4>
            <div className="space-y-2 md:space-y-3">
              <select value={state.harmonyMode} onChange={e => recordAction({...state, harmonyMode: e.target.value as any})} className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-zinc-100'}`}>
                <option value="OFF">{t.harmony} Off</option>
                <option value="TRIADS">Tríades / Triads</option>
                <option value="TETRADS">Tétrades / Tetrads</option>
              </select>
              {state.harmonyMode !== 'OFF' && (
                <>
                  <select value={state.chordQuality} onChange={e => recordAction({...state, chordQuality: e.target.value as ChordQuality})} className={`w-full p-2 md:p-3 rounded-xl text-[10px] md:text-xs font-bold ${isLight ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-blue-900/20 border-blue-900/30 text-blue-400'}`}>
                    <option value="DIATONIC">Diatônica (Segue Escala)</option>
                    <option value="MAJOR">Sempre Maior / Major</option>
                    <option value="MINOR">Sempre Menor / Minor</option>
                    <option value="DIM">Diminuta / Dim</option>
                    <option value="AUG">Aumentada / Aug</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <select value={state.chordDegree} onChange={e => recordAction({...state, chordDegree: parseInt(e.target.value)})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold ${isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-100'}`}>
                      {DEGREE_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                    <select value={state.inversion} onChange={e => recordAction({...state, inversion: parseInt(e.target.value)})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold ${isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-100'}`}>
                      <option value={0}>Root</option>
                      <option value={1}>1st Inv</option>
                      <option value={2}>2nd Inv</option>
                      {state.harmonyMode === 'TETRADS' && <option value={3}>3rd Inv</option>}
                    </select>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="space-y-3 md:space-y-4">
            <h4 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.editor}</h4>
            <div className={`flex gap-1.5 p-1 rounded-xl md:rounded-2xl ${isLight ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
              <button onClick={() => setEditorMode('marker')} className={`flex-1 text-[10px] md:text-xs py-2 md:py-3 rounded-lg md:rounded-xl font-black transition-all ${editorMode === 'marker' ? 'bg-blue-600 text-white shadow-lg' : btnInactiveClass + ' opacity-60'}`}>{t.marker}</button>
              <button onClick={() => setEditorMode('line')} className={`flex-1 text-[10px] md:text-xs py-2 md:py-3 rounded-lg md:rounded-xl font-black transition-all ${editorMode === 'line' ? 'bg-blue-600 text-white shadow-lg' : btnInactiveClass + ' opacity-60'}`}>{t.line}</button>
            </div>
            <div className="space-y-4 md:space-y-6">
               <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setMarkerColor(c)} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border-2 md:border-4 transition-all ${markerColor === c ? 'border-white scale-110' : 'border-transparent shadow-sm'}`} style={{backgroundColor: c}} />
                  ))}
                  <div className="relative group w-8 h-8 md:w-10 md:h-10">
                    <input 
                      type="color" 
                      value={markerColor} 
                      onChange={e => setMarkerColor(e.target.value)} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border-2 border-dashed border-zinc-500 flex items-center justify-center group-hover:border-zinc-300 transition-colors overflow-hidden" 
                      style={{ backgroundColor: !PRESET_COLORS.includes(markerColor) ? markerColor : 'transparent' }}
                    >
                      {!PRESET_COLORS.includes(markerColor) ? null : <span className="text-lg md:text-xl font-bold opacity-40">+</span>}
                    </div>
                  </div>
               </div>
               {editorMode === 'marker' ? (
                 <div className="flex gap-2 md:gap-3">
                    {['circle', 'square', 'triangle'].map(s => (
                      <button key={s} onClick={() => setMarkerShape(s as any)} className={`flex-1 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all shadow-sm ${markerShape === s ? 'border-blue-500 bg-blue-500/20 text-blue-500' : 'border-transparent bg-zinc-800/40 text-zinc-500 opacity-60'}`}>
                        {s === 'circle' ? '●' : s === 'square' ? '■' : '▲'}
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="flex gap-2 md:gap-3">
                    {[2, 4, 7].map(w => (
                      <button key={w} onClick={() => setThickness(w as any)} className={`flex-1 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-[9px] md:text-[10px] uppercase font-black transition-all shadow-sm ${thickness === w ? 'border-blue-500 bg-blue-500/20 text-blue-500' : 'border-transparent bg-zinc-800/40 text-zinc-500 opacity-60'}`}>
                        {w === 2 ? t.thin : w === 4 ? t.medium : t.thick}
                      </button>
                    ))}
                 </div>
               )}
            </div>
          </section>
        </div>

        <div className="flex-1 space-y-6 md:space-y-8 order-1 xl:order-2">
          {!isExporting && (
             <div className="text-[9px] font-black uppercase text-zinc-500 tracking-widest text-right">
                {t.statusTip}
             </div>
          )}
          <div className="w-full overflow-x-auto overflow-y-hidden pb-4 md:pb-0 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-zinc-800">
            <div className="min-w-[800px] md:min-w-0">
              <FretboardSVG 
                state={state} 
                editorMode={editorMode} 
                onEvent={handleEvent} 
                selectedColor={markerColor} 
                selectedShape={markerShape} 
                theme={theme} 
                isActive={isActive} 
                isExport={isExporting}
              />
            </div>
          </div>
          <textarea 
            value={state.notes} 
            onChange={e => recordAction({...state, notes: e.target.value})} 
            className={`w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border text-sm md:text-base min-h-[120px] md:min-h-[160px] focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium leading-relaxed ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'}`} 
            placeholder={t.notes + "..."} 
            readOnly={isExporting}
            style={isExporting ? { border: '1px solid #ddd', background: '#fff', color: '#333' } : {}}
          />
          <div className={`flex flex-col sm:flex-row justify-start gap-3 md:gap-4 pt-2 md:pt-4 ${isExporting ? 'hidden' : ''}`}>
             <button onClick={() => onAdd(false)} className="flex-1 bg-blue-600 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest">{t.createNew}</button>
             <button onClick={() => onAdd(true)} className="flex-1 bg-zinc-800 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs text-zinc-300 hover:bg-zinc-700 shadow-xl transition-all uppercase tracking-widest border border-zinc-700/50">{t.cloneCurrent}</button>
          </div>
          {isExporting && (
            <div className="text-right text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] pt-2 !text-zinc-500 opacity-80">
              {t.createdBy}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FretboardInstance);
