
import React, { useMemo, useCallback } from 'react';
import { getNoteAt, getIntervalName, TUNINGS } from '../music/musicTheory';
import { getScaleNotes } from '../music/scales';
import { getChordNotes } from '../music/harmony';
import { FretboardState, EditorMode, ThemeMode } from '../types';

interface FretboardSVGProps {
  state: FretboardState;
  editorMode: EditorMode;
  onEvent: (event: any) => void;
  selectedColor: string;
  selectedShape: 'circle' | 'square' | 'triangle';
  theme: ThemeMode;
  isActive: boolean;
  isExport?: boolean;
}

const FretboardSVG: React.FC<FretboardSVGProps> = ({ 
  state, 
  theme, 
  isActive, 
  onEvent,
  isExport = false 
}) => {
  const { 
    startFret, endFret, isLeftHanded, layers, root, scaleType, tuning, 
    customTuning, stringStatuses, labelMode, harmonyMode, chordDegree, 
    inversion, chordQuality 
  } = state;
  
  const currentTuning = useMemo(() => {
    if (tuning === 'Custom' && customTuning) return customTuning;
    return TUNINGS[tuning as keyof typeof TUNINGS] || TUNINGS.Standard;
  }, [tuning, customTuning]);

  const numFretsVisible = endFret - startFret + 1;
  const width = 1300; 
  const height = 320; 
  const marginX = 60;
  const marginY = 80;
  
  const fretWidth = (width - 2 * marginX) / (numFretsVisible - (startFret === 0 ? 0.4 : 0));
  const stringSpacing = (height - marginY - 40) / 5;

  const markerRadius = Math.max(12, Math.min(18, fretWidth * 0.42));
  const fontSize = Math.max(9, Math.min(13, markerRadius * 0.75));

  const currentTheme = isExport ? 'light' : theme;
  const isLight = currentTheme === 'light';
  
  const colors = {
    fretboard: isLight ? '#fdfdfd' : '#18181b',
    fret: isLight ? '#d1d5db' : '#3f3f46',
    nut: isLight ? '#1f2937' : '#f4f4f5',
    string: isLight ? '#9ca3af' : '#52525b',
    text: isLight ? '#9ca3af' : '#71717a',
    inlay: isLight ? '#e5e7eb' : '#27272a'
  };

  const scaleNotes = useMemo(() => getScaleNotes(root, scaleType), [root, scaleType]);
  const chordNotes = useMemo(() => {
    if (harmonyMode === 'OFF') return [];
    return getChordNotes(root, scaleType, chordDegree, harmonyMode === 'TETRADS', inversion, chordQuality);
  }, [root, scaleType, harmonyMode, chordDegree, inversion, chordQuality]);

  const getX = useCallback((fret: number) => {
    const relativeFret = fret - startFret;
    const pos = marginX + (relativeFret * fretWidth);
    return isLeftHanded ? width - pos : pos;
  }, [startFret, fretWidth, isLeftHanded]);

  const getNoteX = useCallback((fret: number) => {
    if (fret === 0 && startFret === 0) return getX(0);
    const x = getX(fret);
    const shift = isLeftHanded ? fretWidth / 2 : -fretWidth / 2;
    return x + shift;
  }, [getX, fretWidth, isLeftHanded, startFret]);

  const getY = useCallback((stringIdx: number) => marginY + stringIdx * stringSpacing, [stringSpacing, marginY]);

  const renderFret = (fret: number) => {
    const x = getX(fret);
    const isNut = fret === 0;
    return (
      <g key={`fret-${fret}`}>
        <line 
          x1={x} y1={marginY} x2={x} y2={height - 40} 
          stroke={isNut ? colors.nut : colors.fret} 
          strokeWidth={isNut ? 12 : 2.5} 
        />
        <text 
          x={fret === 0 ? x : (isLeftHanded ? x + fretWidth/2 : x - fretWidth/2)} 
          y={height - 15} 
          textAnchor="middle" 
          fontSize="11" 
          fill={colors.text}
          fontWeight="900"
        >
          {fret}
        </text>
      </g>
    );
  };

  const renderStringStatus = (s: number) => {
    const status = stringStatuses[s] || 'normal';
    if (status === 'normal') return null;
    const x = getNoteX(0);
    const y = getY(s) - 30;
    return (
      <g key={`status-${s}`}>
        {status === 'mute' ? (
          <path d={`M ${x-6} ${y-6} L ${x+6} ${y+6} M ${x+6} ${y-6} L ${x-6} ${y+6}`} stroke={isLight ? '#ef4444' : '#f87171'} strokeWidth="3" />
        ) : (
          <circle cx={x} cy={y} r="6" fill="none" stroke={isLight ? '#22c55e' : '#4ade80'} strokeWidth="3" />
        )}
      </g>
    );
  };

  const renderNoteMarker = (s: number, f: number) => {
    const note = getNoteAt(s, f, currentTuning);
    const isScale = scaleNotes.includes(note);
    const isChord = chordNotes.includes(note);
    const isTonic = note === root;

    let fill = "transparent";
    let opacity = 0;

    if (layers.showAllNotes) { fill = isLight ? "#9ca3af" : "#444"; opacity = 1; }
    if (layers.showScale && isScale) { fill = isLight ? "#b91c1c" : "#822"; opacity = 1; }
    if (harmonyMode !== 'OFF' && isChord) { fill = isLight ? "#2563eb" : "#24a"; opacity = 1; }
    if (layers.showTonic && isTonic) { fill = isLight ? "#ef4444" : "#a22"; opacity = 1; }

    if (opacity === 0) return null;

    const x = getNoteX(f);
    const y = getY(s);
    const label = labelMode === 'note' ? note : (labelMode === 'interval' ? getIntervalName(root, note) : '');

    return (
      <g key={`note-${s}-${f}`} opacity={opacity} pointerEvents="none">
        {isTonic && layers.showTonic && (
           <circle cx={x} cy={y} r={markerRadius + 4} fill="none" stroke={fill} strokeWidth="3" opacity="0.3" />
        )}
        <circle cx={x} cy={y} r={markerRadius} fill={fill} stroke={isLight ? "#fff" : "#000"} strokeWidth="1.5" />
        {label && (
          <text x={x} y={y + (fontSize/2.5)} textAnchor="middle" fontSize={fontSize} fill="#fff" fontWeight="black" style={{fontFamily: 'sans-serif'}}>{label}</text>
        )}
      </g>
    );
  };

  const renderManualMarkers = () => state.markers.map(m => {
    const x = getNoteX(m.fret);
    const y = getY(m.string);
    const note = getNoteAt(m.string, m.fret, currentTuning);
    const isTonic = note === root && layers.showTonic;
    
    let label = '';
    if (labelMode === 'note') label = note;
    else if (labelMode === 'interval') label = getIntervalName(root, note);
    else if (labelMode === 'fingering') label = m.finger || '';

    return (
      <g key={m.id} pointerEvents="all" onClick={(e) => {
        if (labelMode === 'fingering') {
          e.stopPropagation();
          onEvent({ type: 'marker-finger', id: m.id });
        }
      }}>
        {isTonic && <circle cx={x} cy={y} r={markerRadius + 5} fill="none" stroke={m.color} strokeWidth="3" opacity="0.4" />}
        {m.shape === 'circle' && <circle cx={x} cy={y} r={markerRadius} fill={m.color} stroke="#fff" strokeWidth="2.5" />}
        {m.shape === 'square' && <rect x={x - markerRadius} y={y - markerRadius} width={markerRadius*2} height={markerRadius*2} fill={m.color} stroke="#fff" strokeWidth="2.5" />}
        {m.shape === 'triangle' && <path d={`M ${x} ${y - markerRadius} L ${x + markerRadius} ${y + markerRadius} L ${x - markerRadius} ${y + markerRadius} Z`} fill={m.color} stroke="#fff" strokeWidth="2.5" />}
        {label && (
          <text x={x} y={y + (fontSize/2.5)} textAnchor="middle" fontSize={fontSize} fill="#fff" fontWeight="black" pointerEvents="none" style={{fontFamily: 'sans-serif'}}>{label}</text>
        )}
      </g>
    );
  });

  const renderLines = () => state.lines.map((l, idx) => {
    const x1 = getNoteX(l.start.fret);
    const y1 = getY(l.start.string);
    const x2 = getNoteX(l.end.fret);
    const y2 = getY(l.end.string);
    return (
      <g key={l.id} className="cursor-pointer group" onClick={(e) => { e.stopPropagation(); onEvent({ type: 'line', index: idx }); }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={l.color} strokeWidth={l.width} strokeLinecap="round" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={l.width + 3} strokeOpacity="0.2" className="hidden group-hover:block" />
      </g>
    );
  });

  return (
    <div className={`relative ${isActive && !isExport ? 'ring-2 md:ring-4 ring-blue-500/50 shadow-2xl' : ''} rounded-xl md:rounded-2xl overflow-hidden`}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className={`w-full select-none touch-none ${isLight ? 'bg-zinc-50' : 'bg-zinc-900'}`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) * (width / rect.width);
          const clickY = (e.clientY - rect.top) * (height / rect.height);
          
          if (clickY < marginY - 10) {
            const sIdx = [0,1,2,3,4,5].find(s => Math.abs(clickY - (getY(s) - 30)) < 20);
            if (sIdx !== undefined) {
               onEvent({ type: 'string-status', string: sIdx });
               return;
            }
          }

          const stringIdx = Math.round((clickY - marginY) / stringSpacing);
          if (stringIdx < 0 || stringIdx > 5) return;
          const effectiveX = isLeftHanded ? width - clickX : clickX;
          let fret = Math.abs(effectiveX - marginX) < fretWidth / 3 && startFret === 0 ? 0 : Math.floor((effectiveX - marginX) / fretWidth) + startFret + 1;
          if (fret >= startFret && fret <= endFret) onEvent({ type: 'note', string: stringIdx, fret });
        }}
      >
        <rect x="0" y="0" width={width} height={height} fill={colors.fretboard} />
        {Array.from({ length: endFret + 1 }).map((_, i) => i >= startFret && renderFret(i))}
        {layers.showInlays && (
           <g opacity={isLight ? 0.4 : 0.8}>
             {(() => {
               const singleInlays = [3, 5, 7, 9, 15, 17, 19, 21];
               const doubleInlays = [12, 24];
               const el = [];
               for (const f of singleInlays) if (f >= startFret && f <= endFret && f > 0) el.push(<circle key={`inlay-${f}`} cx={getNoteX(f)} cy={marginY + stringSpacing * 2.5} r={9} fill={colors.inlay} />);
               for (const f of doubleInlays) if (f >= startFret && f <= endFret && f > 0) {
                 el.push(<circle key={`inlay-d1-${f}`} cx={getNoteX(f)} cy={marginY + stringSpacing * 1.5} r={9} fill={colors.inlay} />);
                 el.push(<circle key={`inlay-d2-${f}`} cx={getNoteX(f)} cy={marginY + stringSpacing * 3.5} r={9} fill={colors.inlay} />);
               }
               return el;
             })()}
           </g>
        )}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`string-${i}`} x1={marginX} y1={getY(i)} x2={width - marginX} y2={getY(i)} stroke={colors.string} strokeWidth={2 + (i * 0.8)} pointerEvents="none" />
        ))}
        {Array.from({ length: 6 }).map((_, s) => renderStringStatus(s))}
        {Array.from({ length: 6 }).map((_, s) => Array.from({ length: numFretsVisible }).map((_, fIdx) => renderNoteMarker(s, fIdx + startFret)))}
        {renderLines()}
        {renderManualMarkers()}
      </svg>
    </div>
  );
};

export default React.memo(FretboardSVG);
