
import React, { useMemo, useCallback } from 'react';
import { getNoteAt, getIntervalName, INSTRUMENT_PRESETS, CHROMATIC_SCALE, getFretForNote, TUNINGS_PRESETS } from '../music/musicTheory';
import { getScaleNotes } from '../music/scales';
import { getChordNotes, getCagedPositions } from '../music/harmony';
import { FretboardState, EditorMode, ThemeMode, CagedShape } from '../types';

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
  onEvent,
  isExport = false 
}) => {
  const { 
    startFret, endFret, isLeftHanded, layers, root, scaleType, tuning, 
    customTuning, stringStatuses = [], labelMode, harmonyMode, chordDegree, 
    inversion, chordQuality, instrumentType, cagedShape = 'OFF', voicingMode = 'CLOSE',
    colorMode = 'SINGLE'
  } = state;
  
  const instrument = INSTRUMENT_PRESETS[instrumentType || 'guitar-6'];
  const numStrings = instrument.strings;

  const currentTuning = useMemo(() => {
    if (tuning === 'Custom' && customTuning) return customTuning;
    if (TUNINGS_PRESETS[tuning]) return TUNINGS_PRESETS[tuning];
    return instrument.defaultTuning;
  }, [tuning, customTuning, instrument]);

  const numFretsVisible = endFret - startFret + 1;
  const width = 1300; 
  const height = 150 + (numStrings * 45);
  const marginX = 100; 
  const marginY = 60;
  
  const fretWidth = (width - 2 * marginX) / (numFretsVisible - (startFret === 0 ? 0.4 : 0));
  const stringSpacing = (height - marginY - 60) / (numStrings - 1);

  const markerRadius = Math.max(12, Math.min(18, fretWidth * 0.42));
  const fontSize = Math.max(9, Math.min(13, markerRadius * 0.75));
  const isLight = isExport ? true : (theme === 'light');
  
  const colors = {
    fretboard: isLight ? '#ffffff' : '#18181b',
    fret: isLight ? '#cbd5e1' : '#3f3f46',
    nut: isLight ? '#0f172a' : '#f4f4f5',
    string: isLight ? '#94a3b8' : '#52525b',
    text: isLight ? '#475569' : '#94a3b8',
    inlay: isLight ? '#cbd5e1' : '#3f3f46',
    caged: isLight ? '#2563eb' : '#3b82f6',
    intervals: { '1': '#ef4444', 'b2': '#71717a', '2': '#3b82f6', 'b3': '#22c55e', '3': '#22c55e', '4': '#f97316', 'b5': '#3b82f6', '5': '#3b82f6', '#5': '#3b82f6', 'b6': '#a855f7', '6': '#a855f7', 'b7': '#eab308', '7': '#eab308' }
  };

  const getY = useCallback((stringIdx: number) => marginY + stringIdx * stringSpacing, [stringSpacing, marginY]);

  const scaleNotes = useMemo(() => getScaleNotes(root, scaleType), [root, scaleType]);
  
  const chordNotes = useMemo(() => {
    if (harmonyMode === 'OFF') return [];
    return getChordNotes(root, scaleType, chordDegree, harmonyMode === 'TETRADS', inversion, chordQuality, voicingMode);
  }, [root, scaleType, harmonyMode, chordDegree, inversion, chordQuality, voicingMode]);

  const cagedNotes = useMemo(() => {
    if (cagedShape === 'OFF') return [];
    // Calculamos as posições base do shape
    const basePositions = getCagedPositions(root, cagedShape, currentTuning);
    
    // Expandimos o shape por todo o braço seguindo a mesma geometria
    const allPositions: { string: number, fret: number }[] = [];
    basePositions.forEach(pos => {
      [0, 12, 24].forEach(offset => {
        const f = pos.fret + offset;
        if (f >= startFret && f <= endFret) {
          allPositions.push({ string: pos.string, fret: f });
        }
      });
    });
    return allPositions;
  }, [root, cagedShape, currentTuning, startFret, endFret]);

  const getX = useCallback((fret: number) => {
    const relativeFret = fret - startFret;
    const pos = marginX + (relativeFret * fretWidth);
    return isLeftHanded ? width - pos : pos;
  }, [startFret, fretWidth, isLeftHanded, width]);

  const getNoteX = useCallback((fret: number) => {
    if (fret === 0 && startFret === 0) return getX(0);
    const x = getX(fret);
    const shift = isLeftHanded ? fretWidth / 2 : -fretWidth / 2;
    return x + shift;
  }, [getX, fretWidth, isLeftHanded, startFret]);

  return (
    <div className={`relative rounded-[40px] overflow-hidden border ${isLight ? 'border-zinc-200 shadow-xl' : 'border-zinc-800'}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full select-none touch-none ${isLight ? 'bg-white' : 'bg-zinc-900'}`} onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (width / rect.width);
        const clickY = (e.clientY - rect.top) * (height / rect.height);
        const effectiveX = isLeftHanded ? width - clickX : clickX;
        const stringIdx = Math.round((clickY - marginY) / stringSpacing);
        if (stringIdx < 0 || stringIdx >= numStrings) return;
        if (effectiveX < marginX - 10 && startFret === 0) { onEvent({ type: 'string-status', string: stringIdx }); return; }
        let fret = 0;
        if (effectiveX < marginX + 15 && startFret === 0) { fret = 0; } 
        else { fret = Math.floor((effectiveX - marginX) / fretWidth) + startFret + 1; }
        if (fret >= startFret && fret <= endFret) onEvent({ type: 'note', string: stringIdx, fret });
      }}>
        <rect x="0" y="0" width={width} height={height} fill={colors.fretboard} />
        
        {/* Renderização de Status de Corda */}
        {startFret === 0 && Array.from({ length: numStrings }).map((_, s) => {
          const status = stringStatuses[s] || 'normal';
          const x = getNoteX(0) - 50;
          const y = getY(s);
          if (status === 'mute') return (
            <g key={`mute-${s}`} stroke="#ef4444" strokeWidth="4" opacity="0.8">
               <line x1={x-10} y1={y-10} x2={x+10} y2={y+10} /><line x1={x+10} y1={y-10} x2={x-10} y2={y+10} />
            </g>
          );
          if (status === 'open') return <circle key={`open-${s}`} cx={x} cy={y} r="10" fill="none" stroke="#22c55e" strokeWidth="4" opacity="0.8" />;
          return null;
        })}

        {layers.showInlays && [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].map(f => {
          if (f < startFret || f > endFret) return null;
          const x = getNoteX(f);
          if (f % 12 === 0) return <g key={`inlay-${f}`}><circle cx={x} cy={height / 2 - stringSpacing} r="8" fill={colors.inlay} /><circle cx={x} cy={height / 2 + stringSpacing} r="8" fill={colors.inlay} /></g>;
          return <circle key={`inlay-${f}`} cx={x} cy={height / 2} r="8" fill={colors.inlay} />;
        })}

        {Array.from({ length: endFret + 1 }).map((_, f) => {
          if (f < startFret) return null;
          const x = getX(f);
          const isNut = f === 0;
          return (
            <g key={`fret-${f}`}>
              <line x1={x} y1={marginY} x2={x} y2={height - 60} stroke={isNut ? colors.nut : colors.fret} strokeWidth={isNut ? 16 : 2.5} />
              <text x={f === 0 ? x : (isLeftHanded ? x + fretWidth/2 : x - fretWidth/2)} y={height - 15} textAnchor="middle" fontSize="11" fill={colors.text} fontWeight="900">{f === 0 ? 'NUT' : f}</text>
            </g>
          );
        })}

        {Array.from({ length: numStrings }).map((_, i) => <line key={`string-${i}`} x1={marginX} y1={getY(i)} x2={width - marginX} y2={getY(i)} stroke={colors.string} strokeWidth={2.5 + (i * 0.5)} pointerEvents="none" />)}
        
        {/* Layer de Geometria CAGED */}
        {cagedNotes.map((cn, i) => (
          <rect 
            key={`caged-${i}`} 
            x={getNoteX(cn.fret) - markerRadius - 4} 
            y={getY(cn.string) - markerRadius - 4} 
            width={(markerRadius * 2) + 8} 
            height={(markerRadius * 2) + 8} 
            rx="8"
            fill={colors.caged} 
            opacity="0.15" 
            pointerEvents="none"
          />
        ))}

        {state.lines.map(line => {
          if (line.start.string >= numStrings || line.end.string >= numStrings) return null;
          return <line key={line.id} x1={getNoteX(line.start.fret)} y1={getY(line.start.string)} x2={getNoteX(line.end.fret)} y2={getY(line.end.string)} stroke={line.color} strokeWidth={line.width} strokeLinecap="round" opacity="0.8" />;
        })}

        {Array.from({ length: numStrings }).map((_, s) => Array.from({ length: numFretsVisible }).map((_, fIdx) => {
          const f = fIdx + startFret;
          const note = getNoteAt(s, f, currentTuning);
          const isScale = scaleNotes.includes(note);
          const isChord = chordNotes.includes(note);
          const isTonic = note === root;
          const interval = getIntervalName(root, note);
          let fill = "transparent"; let opacity = 0;
          const getNoteFill = () => {
            if (colorMode === 'SINGLE') return colors.intervals['1'];
            return colors.intervals[interval.replace(/R/, '1') as keyof typeof colors.intervals] || '#444';
          };
          if (layers.showAllNotes) { fill = isLight ? "#cbd5e1" : "#444"; opacity = 1; }
          if (layers.showScale && isScale) { fill = getNoteFill(); opacity = 1; }
          if (harmonyMode !== 'OFF' && isChord) { fill = getNoteFill(); opacity = 1; }
          if (layers.showTonic && isTonic) { if (opacity === 0) fill = colors.intervals['1']; opacity = 1; }
          if (opacity === 0) return null;
          const x = getNoteX(f); const y = getY(s);
          const label = labelMode === 'note' ? note : (labelMode === 'interval' ? interval : '');
          return (
            <g key={`note-${s}-${f}`} opacity={opacity} pointerEvents="none">
              {isTonic && layers.showTonic && <circle cx={x} cy={y} r={markerRadius + 5} fill="none" stroke={colors.intervals['1']} strokeWidth="2.5" />}
              <circle cx={x} cy={y} r={markerRadius} fill={fill} stroke={isLight ? "#fff" : "#000"} strokeWidth="1.5" />
              {label && <text x={x} y={y + (fontSize/2.5)} textAnchor="middle" fontSize={fontSize} fill="#fff" fontWeight="black">{label}</text>}
            </g>
          );
        }))}

        {state.markers.map(m => {
          if (m.string >= numStrings) return null;
          const x = getNoteX(m.fret); const y = getY(m.string);
          const note = getNoteAt(m.string, m.fret, currentTuning);
          const label = labelMode === 'note' ? note : (labelMode === 'interval' ? getIntervalName(root, note) : (labelMode === 'fingering' ? m.finger || '' : ''));
          return (
            <g key={m.id}>
              {m.shape === 'circle' && <circle cx={x} cy={y} r={markerRadius} fill={m.color} stroke="#fff" strokeWidth="2.5" />}
              {m.shape === 'square' && <rect x={x - markerRadius} y={y - markerRadius} width={markerRadius*2} height={markerRadius*2} fill={m.color} stroke="#fff" strokeWidth="2.5" />}
              {m.shape === 'triangle' && <path d={`M ${x} ${y - markerRadius} L ${x + markerRadius} ${y + markerRadius} L ${x - markerRadius} ${y + markerRadius} Z`} fill={m.color} stroke="#fff" strokeWidth="2.5" />}
              {label && <text x={x} y={y + (fontSize/2.5)} textAnchor="middle" fontSize={fontSize} fill="#fff" fontWeight="black" pointerEvents="none">{label}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default React.memo(FretboardSVG);
