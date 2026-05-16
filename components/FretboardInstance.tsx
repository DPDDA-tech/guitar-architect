
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import FretboardSVG from './FretboardSVG';
import PracticeTools from './PracticeTools';
import OnboardingTour, { TourStep } from './OnboardingTour';
import { CHROMATIC_SCALE, INSTRUMENT_PRESETS, getNoteAt, TUNINGS_PRESETS, getFretForNote } from '../music/musicTheory';
import { getScaleNotes, SCALES } from '../music/scales';
import { DEGREE_NAMES, CHORD_QUALITIES } from '../music/harmony';
import { translations, Lang } from '../i18n';
import { FretboardState, EditorMode, MarkerShape, ThemeMode, StringStatus, InstrumentType, LineThickness, TuningKey, CagedShape, Note, Marker, Line } from '../types';
import NewDiagramWizard from './NewDiagramWizard';
import { getMusicTip, MusicTip } from '../utils/musicTips';
import { getFrequencyForNoteName, getFrequencyForPosition, playChord, playFrequencies, playSingleNote } from '../utils/audio';
import {
  CHORD_TYPES,
  ChordType,
  ChordVoicingCandidate,
  generateChordVoicings,
  getChordFormula,
  getFretboardBassNote,
  getFretboardChordNotes,
  identifyChordFromNotes
} from '../music/chordLibrary';

interface FretboardInstanceProps {
  state: FretboardState;
  updateState: (newState: FretboardState) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onAdd: (cloneData?: FretboardState) => void;
  isFirst: boolean;
  isLast: boolean;
  diagramNumber: number;
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

type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
type GuidedStudyAction =
  | { type: 'scale'; root: string; scaleType: string }
  | { type: 'chord'; root: string; symbol: string; chordType: ChordType }
  | { type: 'harmony'; mode: 'TRIADS' | 'TETRADS'; root: string; scaleType: string }
  | { type: 'notes'; note: Note; strings: number[] }
  | { type: 'connection'; root: string; scaleType: string; from: [number, number]; to: [number, number] }
  | { type: 'intervalTargets'; root: string; intervals: number[] }
  | { type: 'chordScale'; root: string; symbol: string; chordType: ChordType; scaleType: string }
  | { type: 'region'; root: string; scaleType: string; frets: [number, number] };

interface GuidedStudy {
  id: string;
  level: LearningLevel;
  minutes: 5 | 10;
  title: string;
  description: string;
  goal: string;
  why: string;
  actionLabel: string;
  action: GuidedStudyAction;
  steps: string[];
}


const FretboardInstance: React.FC<FretboardInstanceProps> = ({ 
  state, updateState, onRemove, onMove, onAdd, isFirst, isLast, diagramNumber, theme, lang, isActive, onActivate, isExporting = false, globalTranspose = 0, onGlobalTranspose, showTips = true, onToggleTips
}) => {
  const t = translations[lang];
  const [editorMode, setEditorMode] = useState<EditorMode>('marker');
  const [markerShape, setMarkerShape] = useState<MarkerShape>('circle');
  const [markerColor, setMarkerColor] = useState('#2563eb');
  const [lineThickness, setLineThickness] = useState<LineThickness>(4);
  const [lineStart, setLineStart] = useState<{string: number, fret: number} | null>(null);
  const [noteClickFeedback, setNoteClickFeedback] = useState<{ string: number; fret: number } | null>(null);
  const [creationHint, setCreationHint] = useState<string | null>(null);
  const [wizardMode, setWizardMode] = useState<'initial' | 'add'>('add');
  const [chordLibraryMode, setChordLibraryMode] = useState<'find' | 'identify'>('identify');
  const [chordFinderRoot, setChordFinderRoot] = useState(state.root);
  const [chordFinderType, setChordFinderType] = useState<ChordType>('major');
  const [chordFinderSpan, setChordFinderSpan] = useState<4 | 5 | 6>(4);
  const [preferOpenChords, setPreferOpenChords] = useState(true);
  const [preferRootInBass, setPreferRootInBass] = useState(true);
  const [selectedChordVoicingIndex, setSelectedChordVoicingIndex] = useState(0);
  const [chordDifficultyFilter, setChordDifficultyFilter] = useState<'all' | ChordVoicingCandidate['difficulty']>('all');
  const [favoriteChordVoicings, setFavoriteChordVoicings] = useState<ChordVoicingCandidate[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('ga_favorite_chord_voicings') || '[]');
    } catch {
      return [];
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showEmptyFretboardHint, setShowEmptyFretboardHint] = useState(false);
  const noteClickTimeoutRef = useRef<number | null>(null);
  const creationHintTimeoutRef = useRef<number | null>(null);
  const emptyFretboardHintTimeoutRef = useRef<number | null>(null);
  
  const historyRef = useRef<FretboardState[]>([]);
  const futureRef = useRef<FretboardState[]>([]);
  const initialPlaceholderConsumedRef = useRef(false);
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

  const getCurrentTuning = useCallback(() => {
    const instrument = INSTRUMENT_PRESETS[state.instrumentType];
    if (state.tuning === 'Custom' && state.customTuning) {
      return state.customTuning.slice(0, instrument.strings);
    }
    if (TUNINGS_PRESETS[state.tuning]) {
      const preset = TUNINGS_PRESETS[state.tuning];
      const base = [...instrument.defaultTuning];
      for (let i = 0; i < Math.min(preset.length, base.length); i++) {
        base[i] = preset[i] as Note;
      }
      return base.slice(0, instrument.strings);
    }
    return instrument.defaultTuning.slice(0, instrument.strings);
  }, [state.customTuning, state.instrumentType, state.tuning]);

  const handleNewDiagramCreate = useCallback((newState: FretboardState) => {
    const newStateWithInlays = {
      ...newState,
      layers: {
        ...newState.layers,
        showInlays: true
      }
    };
    const isEmptyDiagram =
      state.markers.length === 0 &&
      state.lines.length === 0 &&
      !state.title &&
      !state.subtitle &&
      !state.notes;

    if (wizardMode === 'initial' && isFirst && isLast && isEmptyDiagram && !initialPlaceholderConsumedRef.current) {
      initialPlaceholderConsumedRef.current = true;
      updateState(newStateWithInlays);
    } else {
      onAdd(newStateWithInlays);
    }

    setCreationHint(t.newDiagramCreated);
    if (creationHintTimeoutRef.current) {
      window.clearTimeout(creationHintTimeoutRef.current);
    }
    creationHintTimeoutRef.current = window.setTimeout(() => setCreationHint(null), 4000);
  }, [onAdd, t, state, isFirst, updateState, wizardMode]);


  const handleEvent = useCallback((event: any) => {
    if (event.type === 'note') {
      setNoteClickFeedback({ string: event.string, fret: event.fret });
      if (noteClickTimeoutRef.current) {
        window.clearTimeout(noteClickTimeoutRef.current);
      }
      noteClickTimeoutRef.current = window.setTimeout(() => setNoteClickFeedback(null), 280);

      if (soundEnabled) {
        const frequency = getFrequencyForPosition(state.instrumentType, getCurrentTuning(), event.string, event.fret);
        playSingleNote(frequency).catch(() => undefined);
      }

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
  }, [markerShape, markerColor, editorMode, lineStart, lineThickness, state, recordAction, soundEnabled, getCurrentTuning]);

  useEffect(() => {
    return () => {
      if (noteClickTimeoutRef.current) {
        window.clearTimeout(noteClickTimeoutRef.current);
      }
      if (creationHintTimeoutRef.current) {
        window.clearTimeout(creationHintTimeoutRef.current);
      }
      if (emptyFretboardHintTimeoutRef.current) {
        window.clearTimeout(emptyFretboardHintTimeoutRef.current);
      }
    };
  }, []);

  const isLight = isExporting ? true : (theme === 'light');
  const isFretboardVisuallyEmpty =
    state.markers.length === 0 &&
    state.lines.length === 0 &&
    !state.layers.showAllNotes &&
    !state.layers.showScale &&
    !state.layers.showTonic &&
    state.harmonyMode === 'OFF';

  useEffect(() => {
    if (emptyFretboardHintTimeoutRef.current) {
      window.clearTimeout(emptyFretboardHintTimeoutRef.current);
    }

    if (!isFretboardVisuallyEmpty || isExporting) {
      setShowEmptyFretboardHint(false);
      return;
    }

    setShowEmptyFretboardHint(true);
    emptyFretboardHintTimeoutRef.current = window.setTimeout(() => {
      setShowEmptyFretboardHint(false);
    }, 4500);

    return () => {
      if (emptyFretboardHintTimeoutRef.current) {
        window.clearTimeout(emptyFretboardHintTimeoutRef.current);
      }
    };
  }, [isFretboardVisuallyEmpty, isExporting]);
  const PRESET_COLORS = ['#ef4444', '#2563eb', '#22c55e', '#eab308', '#000000', '#6366f1', '#ec4899'];
  const OBS_LIMIT = 1500;
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [activeControlTab, setActiveControlTab] = useState<string>('learn');
  const [preferredPracticeTool, setPreferredPracticeTool] = useState<'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes' | undefined>(undefined);
  const [isBeginnerMode, setIsBeginnerMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('ga_beginner_mode') !== 'false';
  });
  const [activeStudyId, setActiveStudyId] = useState(() => {
    if (typeof window === 'undefined') return 'first-scale';
    return window.localStorage.getItem('ga_last_study') || 'first-scale';
  });
  const [studyStepIndex, setStudyStepIndex] = useState(0);
  const [lessonSnapshot, setLessonSnapshot] = useState<FretboardState | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const tourReturnStateRef = useRef<{ isControlPanelOpen: boolean; activeControlTab: string; chordLibraryMode: 'find' | 'identify'; state: FretboardState; editorMode: EditorMode } | null>(null);
  const [scaleShortcutCloseTarget, setScaleShortcutCloseTarget] = useState<'showScale' | 'showTonic' | null>(null);

  useEffect(() => {
    const closePanels = () => setIsControlPanelOpen(false);
    const openPanel = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: string; chordMode?: 'find' | 'identify'; tool?: 'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes' }>).detail;
      if (!detail?.tab) return;
      const isSamePracticeTool = detail.tab === 'tools' && detail.tool && activeControlTab === 'tools' && preferredPracticeTool === detail.tool;
      const isSamePanel = activeControlTab === detail.tab && (!detail.tool || isSamePracticeTool);
      if (isControlPanelOpen && isSamePanel) {
        setIsControlPanelOpen(false);
        return;
      }
      if (detail.tab === 'chords' && detail.chordMode) setChordLibraryMode(detail.chordMode);
      if (detail.tab === 'tools' && detail.tool) setPreferredPracticeTool(detail.tool);
      setActiveControlTab(detail.tab);
      setIsControlPanelOpen(true);
    };
    window.addEventListener('ga-close-diagram-panels', closePanels);
    window.addEventListener('ga-open-diagram-panel', openPanel);
    return () => {
      window.removeEventListener('ga-close-diagram-panels', closePanels);
      window.removeEventListener('ga-open-diagram-panel', openPanel);
    };
  }, [activeControlTab, isControlPanelOpen, preferredPracticeTool]);

  const currentTuning = useMemo(() => {
    return getCurrentTuning();
  }, [getCurrentTuning]);
  const chordIdentification = useMemo(() => {
    const notes = getFretboardChordNotes(state, currentTuning);
    const bass = getFretboardBassNote(state, currentTuning);
    return identifyChordFromNotes(notes, bass);
  }, [state, currentTuning]);
  const chordVoicings = useMemo(() => generateChordVoicings(chordFinderRoot, chordFinderType, currentTuning, {
    maxFretSpan: chordFinderSpan,
    maxResults: 240,
    preferOpenChords,
    preferRootInBass
  }), [chordFinderRoot, chordFinderSpan, chordFinderType, currentTuning, preferOpenChords, preferRootInBass]);
  const recommendedChordVoicingId = chordVoicings[0]?.id;
  const browseChordVoicings = useMemo(() => {
    const bestByRegion = new Map<number, ChordVoicingCandidate>();

    chordVoicings.forEach(voicing => {
      const region = Math.floor((voicing.minFret || 0) / 4);
      const current = bestByRegion.get(region);
      if (!current || voicing.score > current.score) {
        bestByRegion.set(region, voicing);
      }
    });

    const knownShapes = chordVoicings.filter(voicing => voicing.isKnownShape);
    const regionalShapes = Array.from(bestByRegion.values());
    const byId = new Map<string, ChordVoicingCandidate>();

    [...knownShapes, ...regionalShapes].forEach(voicing => {
      byId.set(voicing.id, voicing);
    });

    return Array.from(byId.values())
      .filter(voicing => chordDifficultyFilter === 'all' || voicing.difficulty === chordDifficultyFilter)
      .sort((a, b) => {
        const rank = (voicing: ChordVoicingCandidate) => (
          voicing.isKnownShape && voicing.voicingStyle === 'open' ? 0 :
          voicing.isKnownShape ? 1 :
          voicing.voicingStyle === 'barre' ? 2 :
          voicing.voicingStyle === 'open' ? 3 :
          voicing.voicingStyle === 'movable' ? 4 :
          5
        );
        return rank(a) - rank(b) || a.minFret - b.minFret || b.score - a.score;
      });
  }, [chordDifficultyFilter, chordVoicings]);

  useEffect(() => {
    setSelectedChordVoicingIndex(0);
  }, [chordDifficultyFilter, chordFinderRoot, chordFinderSpan, chordFinderType, currentTuning, preferOpenChords, preferRootInBass]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ga_favorite_chord_voicings', JSON.stringify(favoriteChordVoicings.slice(0, 40)));
    }
  }, [favoriteChordVoicings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ga_beginner_mode', isBeginnerMode ? 'true' : 'false');
    }
  }, [isBeginnerMode]);

  const openTour = useCallback(() => {
    tourReturnStateRef.current = { isControlPanelOpen, activeControlTab, chordLibraryMode, state, editorMode };
    setShowTour(true);
  }, [activeControlTab, chordLibraryMode, editorMode, isControlPanelOpen, state]);

  useEffect(() => {
    const openActiveTour = () => {
      if (isActive) openTour();
    };
    window.addEventListener('ga-open-active-tour', openActiveTour);
    return () => window.removeEventListener('ga-open-active-tour', openActiveTour);
  }, [isActive, openTour]);

  const tourSteps = useMemo<TourStep[]>(() => {
    const isMobileTour = typeof window !== 'undefined' && window.innerWidth < 1024;

    if (isMobileTour) {
      return [
        {
          id: 'mobile-map',
          target: '[data-tour="main-fretboard"]',
          title: lang === 'pt' ? 'O braco vem primeiro' : 'Fretboard first',
          body: lang === 'pt'
            ? 'No celular, o Guitar Architect funciona como um instrumento visual: veja o braco antes dos controles.'
            : 'On mobile, Guitar Architect works as a visual instrument: see the fretboard before the controls.'
        },
        {
          id: 'mobile-scale',
          target: '[data-tour="mobile-scales"]',
          title: lang === 'pt' ? 'Aplique uma escala' : 'Apply a scale',
          body: lang === 'pt'
            ? 'Vamos mostrar Do maior com tonica destacada. A barra inferior abre as acoes musicais principais.'
            : 'Let us show C major with the tonic highlighted. The bottom bar opens the main musical actions.'
        },
        {
          id: 'mobile-sound',
          target: '[data-tour="quick-practice"]',
          title: lang === 'pt' ? 'Ouvir e praticar' : 'Listen and practice',
          body: lang === 'pt'
            ? 'Em Praticar ficam metrônomo, afinador, intervalos, exercícios e trocas de acordes.'
            : 'Practice contains metronome, tuner, intervals, exercises, and chord changes.'
        },
        {
          id: 'mobile-finish',
          target: '[data-tour="main-fretboard"]',
          title: lang === 'pt' ? 'Volte ao braco' : 'Back to the fretboard',
          body: lang === 'pt'
            ? 'Ao concluir, restauramos o estado anterior para voce continuar sem paineis presos.'
            : 'When you finish, we restore your previous state so you can continue without stuck panels.'
        }
      ];
    }

    return [
    {
      id: 'welcome',
      title: lang === 'pt' ? 'Bem-vindo' : 'Welcome',
      body: lang === 'pt'
        ? 'Vamos começar a aprender a usar o Guitar Architect? Em poucos passos voce vai entender o fluxo principal.'
        : 'Ready to learn Guitar Architect? In a few steps you will see the main workflow.'
    },
    {
      id: 'map',
      target: '[data-tour="main-fretboard"]',
      title: lang === 'pt' ? 'Primeiro mapa' : 'First map',
      body: lang === 'pt'
        ? 'Cada diagrama combina camadas, escala, harmonia e edição livre no braço.'
        : 'Each diagram combines layers, scale, harmony, and free editing on the fretboard.'
    },
    {
      id: 'new',
      target: '[data-tour="new-diagram"]',
      title: lang === 'pt' ? 'Criar diagramas' : 'Create diagrams',
      body: lang === 'pt'
        ? 'Use Novo diagrama para criar um estudo guiado ou Novo diagrama rapido para adicionar outro braço imediatamente.'
        : 'Use New diagram for a guided setup or Quick new diagram to add another fretboard immediately.'
    },
    {
      id: 'base',
      target: '[data-tour="quick-base"]',
      title: lang === 'pt' ? 'Base do diagrama' : 'Diagram base',
      body: lang === 'pt'
        ? 'Em Base ficam instrumento, afinacao, canhoto, transposicao, trastes e desfazer/refazer.'
        : 'Base contains instrument, tuning, left-handed mode, transposition, fret range, undo, and redo.'
    },
    {
      id: 'layers',
      target: '[data-tour="quick-layers"]',
      title: lang === 'pt' ? 'Comece por Camadas' : 'Start with Layers',
      body: lang === 'pt'
        ? 'Camadas controla marcações, todas as notas, escala, tônica e rótulos. É o ponto de partida visual.'
        : 'Layers controls inlays, all notes, scale, tonic, and labels. It is the visual starting point.'
    },
    {
      id: 'scale',
      target: '[data-tour="quick-scale"]',
      title: lang === 'pt' ? 'Escolha a escala' : 'Choose the scale',
      body: lang === 'pt'
        ? 'Ative Escala e depois ajuste tônica e tipo de escala na aba Escala.'
        : 'Turn Scale on, then adjust tonic and scale type in the Scale tab.'
    },
    {
      id: 'tonic',
      target: '[data-tour="quick-tonic"]',
      title: lang === 'pt' ? 'Destaque a tônica' : 'Highlight the tonic',
      body: lang === 'pt'
        ? 'A tônica ajuda o aluno a enxergar o centro tonal antes de estudar shapes e frases.'
        : 'The tonic helps the student see the tonal center before studying shapes and phrases.'
    },
    {
      id: 'harmony',
      target: '[data-tour="quick-harmony"]',
      title: lang === 'pt' ? 'Harmonia' : 'Harmony',
      body: lang === 'pt'
        ? 'Aqui entram tríades, tétrades, CAGED e voicings Close, Drop 2 e Drop 3.'
        : 'This is where triads, tetrads, CAGED, and Close, Drop 2, Drop 3 voicings live.'
    },
    {
      id: 'editor',
      target: '[data-tour="quick-editor"]',
      title: lang === 'pt' ? 'Marcadores e linhas' : 'Markers and lines',
      body: lang === 'pt'
        ? 'Use o painel rapido acima do fretboard para escolher forma, cor e espessura sem abrir outra aba.'
        : 'Use the quick panel above the fretboard to choose shape, color, and line thickness without opening another tab.'
    },
    {
      id: 'chords',
      target: '[data-tour="quick-chords"]',
      title: lang === 'pt' ? 'Biblioteca de acordes' : 'Chord library',
      body: lang === 'pt'
        ? 'Procure acordes, ouça shapes, aplique no braço e salve favoritos.'
        : 'Find chords, listen to shapes, apply them to the fretboard, and save favorites.'
    },
    {
      id: 'practice',
      target: '[data-tour="quick-practice"]',
      title: lang === 'pt' ? 'Praticar' : 'Practice',
      body: lang === 'pt'
        ? 'Use afinador, metrônomo, intervalos, exercícios e trocas de acordes.'
        : 'Use tuner, metronome, intervals, exercises, and chord-change practice.'
    }
    ];
  }, [lang]);

  const handleTourStepChange = useCallback((step: TourStep) => {
    const tabByStep: Record<string, string> = {
      base: 'base',
      layers: 'visual',
      scale: 'scale',
      tonic: 'scale',
      harmony: 'harmony',
      chords: 'chords',
      practice: 'tools',
      'mobile-scale': 'scale',
      'mobile-sound': 'tools'
    };
    const tab = tabByStep[step.id];
    if (step.id === 'mobile-map' || step.id === 'mobile-finish') {
      setIsControlPanelOpen(false);
      return;
    }
    if (tab) {
      if (step.id === 'chords') setChordLibraryMode('find');
      if (step.id === 'mobile-scale') {
        recordAction({
          ...state,
          root: 'C',
          scaleType: 'Major (Ionian)',
          labelMode: 'note',
          layers: {
            ...state.layers,
            showScale: true,
            showTonic: true
          }
        });
      }
      setActiveControlTab(tab);
      setIsControlPanelOpen(true);
    }
  }, [recordAction, state]);

  const handleTourClose = (completed: boolean) => {
    setShowTour(false);
    if (tourReturnStateRef.current) {
      setIsControlPanelOpen(tourReturnStateRef.current.isControlPanelOpen);
      setActiveControlTab(tourReturnStateRef.current.activeControlTab);
      setChordLibraryMode(tourReturnStateRef.current.chordLibraryMode);
      setEditorMode(tourReturnStateRef.current.editorMode);
      updateState(tourReturnStateRef.current.state);
      tourReturnStateRef.current = null;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('ga_tour_completed', completed ? 'true' : 'skipped');
    }
  };

  const handleWizardClose = () => {
    setShowWizard(false);
  };

  const controlTabs = [
    { id: 'learn', label: lang === 'pt' ? 'Aprender' : 'Learn' },
    { id: 'base', label: 'Base' },
    { id: 'visual', label: lang === 'pt' ? 'Camadas' : 'Layers' },
    { id: 'scale', label: lang === 'pt' ? 'Escala' : 'Scale' },
    { id: 'harmony', label: lang === 'pt' ? 'Harmonia' : 'Harmony' },
    { id: 'editor', label: lang === 'pt' ? 'Editar' : 'Edit' },
    { id: 'chords', label: lang === 'pt' ? 'Acordes' : 'Chords' },
    { id: 'tools', label: lang === 'pt' ? 'Praticar' : 'Practice' },
  ] as const;
  const visibleControlTabs = isBeginnerMode
    ? controlTabs.filter(tab => ['learn', 'scale', 'chords', 'tools', 'base'].includes(tab.id))
    : controlTabs.filter(tab => tab.id !== 'editor');

  const panelShell = isLight
    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
    : 'bg-zinc-950 border-zinc-800 text-zinc-100';
  const instrumentAccent: Record<InstrumentType, { ring: string; shadow: string; glow: string; badgeLight: string; badgeDark: string }> = {
    'guitar-6': {
      ring: 'ring-blue-500/70',
      shadow: 'shadow-blue-500/10',
      glow: 'bg-blue-500/70',
      badgeLight: 'border-blue-100 bg-blue-50 text-blue-600',
      badgeDark: 'border-blue-900/40 bg-blue-950/30 text-blue-300',
    },
    'guitar-7': {
      ring: 'ring-purple-500/70',
      shadow: 'shadow-purple-500/10',
      glow: 'bg-purple-500/70',
      badgeLight: 'border-purple-100 bg-purple-50 text-purple-600',
      badgeDark: 'border-purple-900/40 bg-purple-950/30 text-purple-300',
    },
    'guitar-8': {
      ring: 'ring-purple-500/70',
      shadow: 'shadow-purple-500/10',
      glow: 'bg-purple-500/70',
      badgeLight: 'border-purple-100 bg-purple-50 text-purple-600',
      badgeDark: 'border-purple-900/40 bg-purple-950/30 text-purple-300',
    },
    'bass-4': {
      ring: 'ring-green-500/70',
      shadow: 'shadow-green-500/10',
      glow: 'bg-green-500/70',
      badgeLight: 'border-green-100 bg-green-50 text-green-600',
      badgeDark: 'border-green-900/40 bg-green-950/30 text-green-300',
    },
    'bass-5': {
      ring: 'ring-green-500/70',
      shadow: 'shadow-green-500/10',
      glow: 'bg-green-500/70',
      badgeLight: 'border-green-100 bg-green-50 text-green-600',
      badgeDark: 'border-green-900/40 bg-green-950/30 text-green-300',
    },
  };
  const activeInstrumentAccent = instrumentAccent[state.instrumentType];

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
  const toggleLineThickness = (width: LineThickness) => {
    if (editorMode === 'line' && lineThickness === width) {
      setEditorMode('marker');
      setLineStart(null);
      return;
    }
    setEditorMode('line');
    setLineThickness(width);
  };
  const toggleQuickPanel = (tab: string) => {
    if (activeControlTab === tab && isControlPanelOpen) {
      setIsControlPanelOpen(false);
      return;
    }
    setActiveControlTab(tab);
    setIsControlPanelOpen(true);
  };
  const setLabelModeSmart = (mode: FretboardState['labelMode']) => {
    if (mode === 'none') {
      const shouldHidePoints = state.labelMode === 'none' && state.layers.showAllNotes;
      recordAction({
        ...state,
        labelMode: 'none',
        layers: {
          ...state.layers,
          showAllNotes: !shouldHidePoints
        }
      });
      return;
    }

    if (state.labelMode === mode) {
      recordAction({
        ...state,
        labelMode: 'none',
        layers: {
          ...state.layers,
          showAllNotes: true
        }
      });
      return;
    }

    recordAction({
      ...state,
      labelMode: mode,
      layers: {
        ...state.layers,
        showAllNotes: true
      }
    });
  };
  const handleScaleLayerShortcut = (layer: 'showScale' | 'showTonic') => {
    const isScalePanelOpen = activeControlTab === 'scale' && isControlPanelOpen;
    const isLayerActive = state.layers[layer];

    if (!isLayerActive) {
      recordAction({...state, layers: {...state.layers, [layer]: true}});
      setActiveControlTab('scale');
      setIsControlPanelOpen(true);
      setScaleShortcutCloseTarget(layer);
      return;
    }

    if (isScalePanelOpen && scaleShortcutCloseTarget === layer) {
      setIsControlPanelOpen(false);
      setScaleShortcutCloseTarget(layer);
      return;
    }

    if (!isScalePanelOpen && scaleShortcutCloseTarget === layer) {
      recordAction({...state, layers: {...state.layers, [layer]: false}});
      setScaleShortcutCloseTarget(null);
      return;
    }

    setActiveControlTab('scale');
    setIsControlPanelOpen(true);
    setScaleShortcutCloseTarget(layer);
  };

  const createQuickDiagram = () => {
    onAdd();
    setCreationHint(t.newDiagramCreated);
    if (creationHintTimeoutRef.current) {
      window.clearTimeout(creationHintTimeoutRef.current);
    }
    creationHintTimeoutRef.current = window.setTimeout(() => setCreationHint(null), 4000);
  };

  const handleNewDiagramClick = () => {
    setWizardMode('add');
    setShowWizard(true);
  };

  const applyChordVoicing = (voicing: ChordVoicingCandidate) => {
    const instrument = INSTRUMENT_PRESETS[state.instrumentType];
    const markers = voicing.positions.map(position => ({
      id: crypto.randomUUID(),
      string: position.string,
      fret: position.fret,
      shape: markerShape,
      color: markerColor,
      finger: position.finger && position.finger !== '0' ? position.finger : '1'
    }));
    const stringStatuses = Array(instrument.strings).fill('normal') as StringStatus[];
    voicing.mutedStrings.forEach(stringIndex => {
      if (stringIndex < stringStatuses.length) stringStatuses[stringIndex] = 'mute';
    });
    voicing.positions.forEach(position => {
      if (position.fret === 0 && position.string < stringStatuses.length) {
        stringStatuses[position.string] = 'open';
      }
    });
    const barreLines = voicing.barre ? [{
      id: crypto.randomUUID(),
      start: { string: voicing.barre.fromString, fret: voicing.barre.fret },
      end: { string: voicing.barre.toString, fret: voicing.barre.fret },
      color: isLight ? '#0f172a' : '#f8fafc',
      width: 11
    }] : [];

    recordAction({
      ...state,
      root: voicing.root,
      markers,
      lines: barreLines,
      stringStatuses,
      labelMode: state.labelMode === 'none' ? 'note' : state.labelMode
    });
  };

  const playChordVoicing = (voicing: ChordVoicingCandidate) => {
    setSoundEnabled(true);
    const frequencies = voicing.positions.map(position => (
      getFrequencyForPosition(state.instrumentType, currentTuning, position.string, position.fret)
    ));
    playChord(frequencies).catch(() => undefined);
  };

  const toggleFavoriteChordVoicing = (voicing: ChordVoicingCandidate) => {
    setFavoriteChordVoicings(current => {
      if (current.some(favorite => favorite.id === voicing.id && favorite.name === voicing.name)) {
        return current.filter(favorite => !(favorite.id === voicing.id && favorite.name === voicing.name));
      }
      return [voicing, ...current].slice(0, 40);
    });
  };

  const isFavoriteChordVoicing = (voicing: ChordVoicingCandidate) => (
    favoriteChordVoicings.some(favorite => favorite.id === voicing.id && favorite.name === voicing.name)
  );

  const applyChordVoicingAtIndex = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, browseChordVoicings.length - 1));
    const voicing = browseChordVoicings[nextIndex];
    if (!voicing) return;
    setSelectedChordVoicingIndex(nextIndex);
    applyChordVoicing(voicing);
    if (soundEnabled) playChordVoicing(voicing);
  };

  const applyBeginnerScale = () => {
    recordAction({
      ...state,
      root: 'C',
      scaleType: 'Major (Ionian)',
      labelMode: 'note',
      layers: {
        ...state.layers,
        showScale: true,
        showTonic: true
      }
    });
    setActiveControlTab('scale');
    setIsControlPanelOpen(true);
  };

  const openMobileTab = (tab: string) => {
    if (activeControlTab === tab && isControlPanelOpen) {
      setIsControlPanelOpen(false);
      return;
    }
    if (tab === 'chords') setChordLibraryMode('find');
    if (tab === 'scale' && !state.layers.showScale) {
      recordAction({
        ...state,
        layers: {
          ...state.layers,
          showScale: true,
          showTonic: true
        }
      });
    }
    setActiveControlTab(tab);
    setIsControlPanelOpen(true);
  };

  const guidedStudies = useMemo<GuidedStudy[]>(() => ([
    {
      id: 'first-scale',
      level: 'beginner',
      minutes: 5,
      title: lang === 'pt' ? 'Primeira escala' : 'First scale',
      description: lang === 'pt' ? 'Veja Do maior, ouca a subida e encontre as tonicas.' : 'See C major, hear it ascending, and find the tonics.',
      goal: lang === 'pt' ? 'Entender que uma escala e um mapa de notas, nao uma forma aleatoria.' : 'Understand that a scale is a note map, not a random shape.',
      why: lang === 'pt' ? 'A tonica e a casa para onde a musica quer voltar.' : 'The tonic is the home note the music wants to return to.',
      actionLabel: lang === 'pt' ? 'Aplicar Do maior' : 'Apply C major',
      action: { type: 'scale', root: 'C', scaleType: 'Major (Ionian)' },
      steps: lang === 'pt'
        ? ['Olhe as notas da escala.', 'Toque de grave para agudo.', 'Volte descendo.', 'Encontre todos os C visiveis.']
        : ['Look at the scale notes.', 'Play low to high.', 'Come back descending.', 'Find every visible C.']
    },
    {
      id: 'minor-pentatonic',
      level: 'beginner',
      minutes: 5,
      title: lang === 'pt' ? 'Pentatonica menor' : 'Minor pentatonic',
      description: lang === 'pt' ? 'Um primeiro mapa seguro para riffs e improvisacao.' : 'A safe first map for riffs and improvising.',
      goal: lang === 'pt' ? 'Memorizar um som menor simples e reutilizavel.' : 'Memorize a simple reusable minor sound.',
      why: lang === 'pt' ? 'A pentatonica remove notas de tensao forte e fica facil de frasear.' : 'The pentatonic removes strong tension notes and is easier to phrase.',
      actionLabel: lang === 'pt' ? 'Aplicar Am pentatonica' : 'Apply A minor pentatonic',
      action: { type: 'scale', root: 'A', scaleType: 'Pentatonic Minor' },
      steps: lang === 'pt'
        ? ['Toque devagar.', 'Repita pequenos grupos de 3 notas.', 'Pare sempre em A.', 'Experimente uma frase curta.']
        : ['Play slowly.', 'Repeat small 3-note groups.', 'Always land on A.', 'Try one short phrase.']
    },
    {
      id: 'first-chords',
      level: 'beginner',
      minutes: 10,
      title: lang === 'pt' ? 'Primeiros acordes' : 'First chords',
      description: lang === 'pt' ? 'Comece por shapes reais: C, G, Am, Em e Dm.' : 'Start with real shapes: C, G, Am, Em, and Dm.',
      goal: lang === 'pt' ? 'Reconhecer acordes abertos comuns no braco.' : 'Recognize common open chords on the fretboard.',
      why: lang === 'pt' ? 'Esses acordes aparecem em muitas musicas e treinam dedos diferentes.' : 'These chords appear in many songs and train different fingers.',
      actionLabel: lang === 'pt' ? 'Mostrar C aberto' : 'Show open C',
      action: { type: 'chord', root: 'C', symbol: 'C', chordType: 'major' },
      steps: lang === 'pt'
        ? ['Aplique o acorde.', 'Ouça o som inteiro.', 'Toque corda por corda.', 'Troque para G ou Am na aba Praticar.']
        : ['Apply the chord.', 'Hear the full sound.', 'Play string by string.', 'Move to G or Am in Practice.']
    },
    {
      id: 'note-location',
      level: 'beginner',
      minutes: 5,
      title: lang === 'pt' ? 'Notas na corda Mi' : 'Notes on the E string',
      description: lang === 'pt' ? 'Localize notas C na corda Mi grave para criar referencia.' : 'Find C notes on the low E string to build reference.',
      goal: lang === 'pt' ? 'Comecar a enxergar o braco por nomes de notas.' : 'Start seeing the fretboard by note names.',
      why: lang === 'pt' ? 'A corda Mi grave ajuda a encontrar tonicas de escalas e pestanas.' : 'The low E string helps you find scale roots and barre chords.',
      actionLabel: lang === 'pt' ? 'Encontrar C na Mi' : 'Find C on E',
      action: { type: 'notes', note: 'C', strings: [5] },
      steps: lang === 'pt'
        ? ['Diga o nome da nota em voz alta.', 'Toque a nota.', 'Procure a oitava.', 'Use como ponto de partida para a escala.']
        : ['Say the note name out loud.', 'Play the note.', 'Find the octave.', 'Use it as a scale starting point.']
    },
    {
      id: 'triads',
      level: 'intermediate',
      minutes: 10,
      title: lang === 'pt' ? 'Triades no campo' : 'Diatonic triads',
      description: lang === 'pt' ? 'Visualize acordes de tres notas dentro da escala maior.' : 'Visualize three-note chords inside the major scale.',
      goal: lang === 'pt' ? 'Conectar escala e harmonia no mesmo mapa.' : 'Connect scale and harmony on the same map.',
      why: lang === 'pt' ? 'Triades sao o esqueleto dos acordes e melhoram solos melodicos.' : 'Triads are the skeleton of chords and improve melodic soloing.',
      actionLabel: lang === 'pt' ? 'Visualizar triades' : 'Show triads',
      action: { type: 'harmony', mode: 'TRIADS', root: 'C', scaleType: 'Major (Ionian)' },
      steps: lang === 'pt'
        ? ['Escolha um grau.', 'Toque as tres notas.', 'Mude a inversao.', 'Compare com a escala completa.']
        : ['Choose one degree.', 'Play the three notes.', 'Change inversion.', 'Compare with the full scale.']
    },
    {
      id: 'connect-pentatonic',
      level: 'beginner',
      minutes: 5,
      title: lang === 'pt' ? 'Conectar pentatonicas' : 'Connect pentatonics',
      description: lang === 'pt' ? 'Veja como Am pentatonica atravessa duas regioes do braco.' : 'See how A minor pentatonic crosses two fretboard regions.',
      goal: lang === 'pt' ? 'Sair de um shape sem perder a tonica.' : 'Leave one shape without losing the tonic.',
      why: lang === 'pt' ? 'As notas-pivo conectam regioes e tornam frases menos presas.' : 'Pivot notes connect regions and make phrases less boxed in.',
      actionLabel: lang === 'pt' ? 'Conectar shapes' : 'Connect shapes',
      action: { type: 'connection', root: 'A', scaleType: 'Pentatonic Minor', from: [5, 8], to: [8, 10] },
      steps: lang === 'pt'
        ? ['Comece na regiao 5-8.', 'Ache os A em vermelho.', 'Use as notas verdes como ponte.', 'Continue para a regiao 8-10.']
        : ['Start in frets 5-8.', 'Find the red A notes.', 'Use green notes as bridges.', 'Continue into frets 8-10.']
    },
    {
      id: 'thirds-fifths',
      level: 'beginner',
      minutes: 5,
      title: lang === 'pt' ? 'Tercas e quintas' : 'Thirds and fifths',
      description: lang === 'pt' ? 'Transforme C em mapa de tonica, terca e quinta.' : 'Turn C into a root, third, and fifth map.',
      goal: lang === 'pt' ? 'Ouvir e enxergar a base dos acordes.' : 'Hear and see the base of chords.',
      why: lang === 'pt' ? 'Terca e quinta dizem se o acorde soa maior, menor ou estavel.' : 'The third and fifth reveal major/minor color and stability.',
      actionLabel: lang === 'pt' ? 'Mostrar intervalos' : 'Show intervals',
      action: { type: 'intervalTargets', root: 'C', intervals: [0, 4, 7, 12] },
      steps: lang === 'pt'
        ? ['Encontre C.', 'Compare E como terca maior.', 'Compare G como quinta.', 'Procure a oitava.']
        : ['Find C.', 'Compare E as the major third.', 'Compare G as the fifth.', 'Find the octave.']
    },
    {
      id: 'chord-scale-targets',
      level: 'intermediate',
      minutes: 10,
      title: lang === 'pt' ? 'Acorde e escala' : 'Chord and scale',
      description: lang === 'pt' ? 'Relacione Am com Am pentatonica e notas-alvo.' : 'Relate Am to A minor pentatonic and target notes.',
      goal: lang === 'pt' ? 'Improvisar mirando notas do acorde.' : 'Improvise by aiming at chord tones.',
      why: lang === 'pt' ? 'Notas do acorde soam como chegada; a escala mostra o caminho.' : 'Chord tones sound like arrival; the scale shows the path.',
      actionLabel: lang === 'pt' ? 'Mapear Am' : 'Map Am',
      action: { type: 'chordScale', root: 'A', symbol: 'Am', chordType: 'minor', scaleType: 'Pentatonic Minor' },
      steps: lang === 'pt'
        ? ['Veja a escala relacionada.', 'Mire A, C e E.', 'Toque o acorde.', 'Resolva frases em A.']
        : ['See the related scale.', 'Aim for A, C, and E.', 'Play the chord.', 'Resolve phrases to A.']
    },
    {
      id: 'region-five-eight',
      level: 'beginner',
      minutes: 5,
      title: lang === 'pt' ? 'Regiao 5-8' : 'Frets 5-8 region',
      description: lang === 'pt' ? 'Estude C maior em uma area pequena e legivel.' : 'Study C major in a small readable area.',
      goal: lang === 'pt' ? 'Reduzir o mapa para uma regiao praticavel.' : 'Reduce the map to a playable region.',
      why: lang === 'pt' ? 'Regioes pequenas ajudam memoria visual e evitam sobrecarga.' : 'Small regions support visual memory and reduce overload.',
      actionLabel: lang === 'pt' ? 'Focar regiao' : 'Focus region',
      action: { type: 'region', root: 'C', scaleType: 'Major (Ionian)', frets: [5, 8] },
      steps: lang === 'pt'
        ? ['Observe apenas a regiao.', 'Encontre C.', 'Suba e desca devagar.', 'Volte ao braco completo quando quiser.']
        : ['Observe only the region.', 'Find C.', 'Ascend and descend slowly.', 'Return to the full neck anytime.']
    }
  ]), [lang]);

  const selectedStudy = guidedStudies.find(study => study.id === activeStudyId) || guidedStudies[0];
  const recommendedStudyId = ({
    'first-scale': 'minor-pentatonic',
    'minor-pentatonic': 'connect-pentatonic',
    'connect-pentatonic': 'thirds-fifths',
    'first-chords': 'chord-scale-targets',
    'triads': 'chord-scale-targets'
  } as Record<string, string>)[selectedStudy.id];
  const recommendedStudy = guidedStudies.find(study => study.id === recommendedStudyId);
  const levelLabel = (level: LearningLevel) => (
    level === 'beginner' ? (lang === 'pt' ? 'Iniciante' : 'Beginner') :
    level === 'intermediate' ? (lang === 'pt' ? 'Intermediario' : 'Intermediate') :
    lang === 'pt' ? 'Avancado' : 'Advanced'
  );

  const getScaleDegreeFrequencies = (root: string, scaleType: string, startOctave = 3) => {
    const scale = SCALES.find(item => item.name === scaleType);
    if (!scale) return [];
    const rootIndex = CHROMATIC_SCALE.indexOf(root);
    if (rootIndex < 0) return [];

    const ascending = scale.intervals
      .concat(12)
      .map(interval => {
        const note = CHROMATIC_SCALE[(rootIndex + interval) % 12];
        const octave = startOctave + Math.floor((rootIndex + interval) / 12);
        return getFrequencyForNoteName(note, octave);
      });

    return [...ascending, ...ascending.slice(0, -1).reverse()];
  };

  const getNoteForInterval = (root: string, interval: number): Note => {
    const rootIndex = CHROMATIC_SCALE.indexOf(root);
    return CHROMATIC_SCALE[(rootIndex + interval + 120) % 12] as Note;
  };

  const getVisiblePositionsForNotes = (
    notes: string[],
    options: { startFret?: number; endFret?: number; limit?: number } = {}
  ) => {
    const start = options.startFret ?? state.startFret;
    const end = options.endFret ?? state.endFret;
    const noteSet = new Set(notes);
    const positions = currentTuning.flatMap((_, string) => (
      Array.from({ length: end - start + 1 }).flatMap((__, offset) => {
        const fret = start + offset;
        const note = getNoteAt(string, fret, currentTuning);
        return noteSet.has(note) ? [{ string, fret, note }] : [];
      })
    ));

    return positions
      .sort((a, b) => b.string - a.string || a.fret - b.fret)
      .slice(0, options.limit ?? 24);
  };

  const createMarkersFromPositions = (
    positions: Array<{ string: number; fret: number; note: string }>,
    getColor: (position: { string: number; fret: number; note: string }) => string,
    shape: MarkerShape = 'circle'
  ): Marker[] => positions.map(position => ({
    id: crypto.randomUUID(),
    string: position.string,
    fret: position.fret,
    shape,
    color: getColor(position),
    finger: position.note
  }));

  const createPathLines = (
    positions: Array<{ string: number; fret: number; note: string }>,
    color = '#2563eb',
    width: LineThickness = 4
  ): Line[] => positions.slice(0, -1).map((position, index) => ({
    id: crypto.randomUUID(),
    start: { string: position.string, fret: position.fret },
    end: { string: positions[index + 1].string, fret: positions[index + 1].fret },
    color,
    width
  }));

  const applyGuidedStudy = (study: GuidedStudy) => {
    setActiveStudyId(study.id);
    setStudyStepIndex(0);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ga_last_study', study.id);
    }

    if (study.action.type === 'scale') {
      recordAction({
        ...state,
        title: study.title,
        subtitle: `${study.action.root} - ${study.action.scaleType}`,
        root: study.action.root,
        scaleType: study.action.scaleType,
        harmonyMode: 'OFF',
        labelMode: 'note',
        layers: { ...state.layers, showScale: true, showTonic: true },
        markers: [],
        lines: []
      });
      return;
    }

    if (study.action.type === 'chord') {
      const voicing = generateChordVoicings(study.action.root, study.action.chordType, currentTuning, {
        maxFretSpan: 4,
        maxResults: 60,
        preferOpenChords: true,
        preferRootInBass: true
      })[0];
      if (voicing) {
        applyChordVoicing(voicing);
        return;
      }
    }

    if (study.action.type === 'harmony') {
      recordAction({
        ...state,
        title: study.title,
        subtitle: `${study.action.root} - ${study.action.mode}`,
        root: study.action.root,
        scaleType: study.action.scaleType,
        harmonyMode: study.action.mode,
        chordDegree: 0,
        inversion: 0,
        layers: { ...state.layers, showScale: true, showTonic: true },
        markers: [],
        lines: []
      });
      return;
    }

    if (study.action.type === 'notes') {
      const targetNote = study.action.note;
      const targetStrings = study.action.strings.filter((string: number) => string >= 0 && string < currentTuning.length);
      const markers = targetStrings.flatMap((string: number) => (
        Array.from({ length: state.endFret - state.startFret + 1 }).flatMap((_, offset) => {
          const fret = state.startFret + offset;
          return getNoteAt(string, fret, currentTuning) === targetNote
            ? [{
                id: crypto.randomUUID(),
                string,
                fret,
                shape: 'circle' as MarkerShape,
                color: '#ef4444',
                finger: targetNote
              }]
            : [];
        })
      ));
      recordAction({
        ...state,
        title: study.title,
        subtitle: study.goal,
        root: targetNote,
        markers,
        lines: [],
        labelMode: 'note',
        layers: { ...state.layers, showScale: false, showTonic: false }
      });
      return;
    }

    if (study.action.type === 'connection') {
      const action = study.action;
      const notes = getScaleNotes(action.root, action.scaleType);
      const fromPositions = getVisiblePositionsForNotes(notes, { startFret: action.from[0], endFret: action.from[1], limit: 12 });
      const toPositions = getVisiblePositionsForNotes(notes, { startFret: action.to[0], endFret: action.to[1], limit: 12 });
      const pivotNotes = new Set([action.root, getNoteForInterval(action.root, 7)]);
      const markers = createMarkersFromPositions([...fromPositions, ...toPositions], position => (
        position.note === action.root ? '#ef4444' :
        pivotNotes.has(position.note) ? '#22c55e' :
        '#2563eb'
      ));
      const pathPositions = [...fromPositions, ...toPositions]
        .filter(position => pivotNotes.has(position.note))
        .sort((a, b) => a.fret - b.fret || b.string - a.string)
        .slice(0, 8);
      recordAction({
        ...state,
        title: study.title,
        subtitle: `${action.root} - ${action.scaleType}`,
        root: action.root,
        scaleType: action.scaleType,
        startFret: Math.max(0, action.from[0] - 1),
        endFret: Math.min(15, action.to[1] + 1),
        harmonyMode: 'OFF',
        labelMode: 'note',
        markers,
        lines: createPathLines(pathPositions, '#22c55e', 4),
        layers: { ...state.layers, showScale: false, showTonic: true }
      });
      return;
    }

    if (study.action.type === 'intervalTargets') {
      const action = study.action;
      const targetNotes = Array.from(new Set(action.intervals.map(interval => getNoteForInterval(action.root, interval))));
      const markers = createMarkersFromPositions(
        getVisiblePositionsForNotes(targetNotes, { limit: 20 }),
        position => (
          position.note === action.root ? '#ef4444' :
          position.note === getNoteForInterval(action.root, 4) ? '#f59e0b' :
          position.note === getNoteForInterval(action.root, 3) ? '#a855f7' :
          position.note === getNoteForInterval(action.root, 7) ? '#22c55e' :
          '#2563eb'
        )
      );
      recordAction({
        ...state,
        title: study.title,
        subtitle: lang === 'pt' ? 'Tonica, tercas, quinta e oitava' : 'Root, thirds, fifth, octave',
        root: action.root,
        harmonyMode: 'OFF',
        labelMode: 'interval',
        markers,
        lines: [],
        layers: { ...state.layers, showScale: false, showTonic: true }
      });
      return;
    }

    if (study.action.type === 'chordScale') {
      const action = study.action;
      const formula = getChordFormula(action.chordType);
      const chordNotes = formula.intervals.map(interval => getNoteForInterval(action.root, interval));
      const markers = createMarkersFromPositions(
        getVisiblePositionsForNotes(chordNotes, { startFret: 0, endFret: 12, limit: 18 }),
        position => position.note === action.root ? '#ef4444' : '#f59e0b',
        'square'
      );
      recordAction({
        ...state,
        title: `${action.symbol} <-> ${action.root} ${action.scaleType}`,
        subtitle: lang === 'pt' ? `Notas-alvo: ${chordNotes.join(' - ')}` : `Target notes: ${chordNotes.join(' - ')}`,
        root: action.root,
        scaleType: action.scaleType,
        harmonyMode: 'OFF',
        labelMode: 'interval',
        markers,
        lines: [],
        layers: { ...state.layers, showScale: true, showTonic: true }
      });
      return;
    }

    if (study.action.type === 'region') {
      recordAction({
        ...state,
        title: study.title,
        subtitle: `${study.action.root} - ${study.action.scaleType} | ${study.action.frets[0]}-${study.action.frets[1]}`,
        root: study.action.root,
        scaleType: study.action.scaleType,
        startFret: study.action.frets[0],
        endFret: study.action.frets[1],
        harmonyMode: 'OFF',
        labelMode: 'note',
        markers: [],
        lines: [],
        layers: { ...state.layers, showScale: true, showTonic: true }
      });
    }
  };

  const clearEverything = () => {
    const label = lang === 'pt' ? 'Limpar tudo?' : 'Clear everything?';
    if (window.confirm(label)) {
      recordAction({
        ...state,
        title: '',
        subtitle: '',
        notes: '',
        markers: [],
        lines: [],
        harmonyMode: 'OFF',
        cagedShape: 'OFF',
        labelMode: 'note',
        layers: {
          ...state.layers,
          showAllNotes: false,
          showScale: false,
          showTonic: false
        }
      });
    }
  };

  const playGuidedStudy = (study: GuidedStudy) => {
    if (study.action.type === 'scale') {
      playFrequencies(
        getScaleDegreeFrequencies(study.action.root, study.action.scaleType),
        { duration: 0.34, stagger: 0.28, volume: 0.08 }
      ).catch(() => undefined);
      return;
    }

    if (study.action.type === 'chord') {
      const voicing = generateChordVoicings(study.action.root, study.action.chordType, currentTuning, {
        maxFretSpan: 4,
        maxResults: 30,
        preferOpenChords: true,
        preferRootInBass: true
      })[0];
      if (voicing) {
        playChordVoicing(voicing);
      }
    }

    if (study.action.type === 'connection' || study.action.type === 'region') {
      const action = study.action;
      playFrequencies(
        getScaleDegreeFrequencies(action.root, action.scaleType),
        { duration: 0.32, stagger: 0.25, volume: 0.08 }
      ).catch(() => undefined);
      return;
    }

    if (study.action.type === 'intervalTargets') {
      const action = study.action;
      playFrequencies(
        action.intervals.map((interval, index) => getFrequencyForNoteName(getNoteForInterval(action.root, interval), 3 + Math.floor(index / 3))),
        { duration: 0.42, stagger: 0.35, volume: 0.08 }
      ).catch(() => undefined);
      return;
    }

    if (study.action.type === 'chordScale') {
      const action = study.action;
      const formula = getChordFormula(action.chordType);
      playFrequencies(
        formula.intervals.map(interval => getFrequencyForNoteName(getNoteForInterval(action.root, interval), 3)),
        { duration: 0.5, stagger: 0.18, volume: 0.08 }
      ).catch(() => undefined);
    }
  };

  const advanceStudyStep = () => {
    setStudyStepIndex(prev => Math.min(prev + 1, selectedStudy.steps.length - 1));
  };

  const startGuidedLesson = (study: GuidedStudy) => {
    if (!lessonSnapshot) {
      setLessonSnapshot(state);
    }
    applyGuidedStudy(study);
  };

  const exitGuidedLesson = (keepMap: boolean) => {
    if (!keepMap && lessonSnapshot) {
      updateState(lessonSnapshot);
    }
    setLessonSnapshot(null);
    setStudyStepIndex(0);
  };

  const getVoicingInversionLabel = (voicing: ChordVoicingCandidate) => {
    if (voicing.inversion === 'root') return lang === 'pt' ? 'Posicao fundamental' : 'Root position';
    if (voicing.inversion === 'first') return lang === 'pt' ? '1a inversao' : '1st inversion';
    if (voicing.inversion === 'second') return lang === 'pt' ? '2a inversao' : '2nd inversion';
    if (voicing.inversion === 'third') return lang === 'pt' ? '3a inversao' : '3rd inversion';
    return lang === 'pt' ? 'Baixo alternativo' : 'Slash voicing';
  };

  const getChordTypeLabel = (type: ChordType) => {
    const labels: Partial<Record<ChordType, string>> = {
      major: lang === 'pt' ? 'Maior' : 'Major',
      minor: lang === 'pt' ? 'Menor' : 'Minor',
      diminished: lang === 'pt' ? 'Diminuto' : 'Diminished',
      augmented: lang === 'pt' ? 'Aumentado' : 'Augmented',
      sus2: 'sus2',
      sus4: 'sus4',
      '6': '6',
      m6: 'm6',
      '7': '7',
      maj7: 'maj7',
      m7: 'm7',
      m7b5: 'm7b5',
      dim7: 'dim7',
      mMaj7: 'mMaj7',
      add9: 'add9',
      madd9: 'madd9',
      '9': '9',
      maj9: 'maj9',
      m9: 'm9',
      '11': '11',
      maj11: 'maj11',
      m11: 'm11',
      '13': '13',
      maj13: 'maj13',
      m13: 'm13'
    };
    return labels[type] || type;
  };

  const getVoicingTags = (voicing: ChordVoicingCandidate) => {
    const styleLabels = {
      open: lang === 'pt' ? 'Aberto' : 'Open',
      barre: lang === 'pt' ? 'Pestana' : 'Barre',
      movable: lang === 'pt' ? 'Movel' : 'Movable',
      generated: lang === 'pt' ? 'Gerado' : 'Generated'
    };
    const difficultyLabels = {
      easy: lang === 'pt' ? 'Facil' : 'Easy',
      intermediate: lang === 'pt' ? 'Intermediario' : 'Intermediate',
      advanced: lang === 'pt' ? 'Avancado' : 'Advanced'
    };

    return [styleLabels[voicing.voicingStyle], difficultyLabels[voicing.difficulty]];
  };

  const renderQuickControls = () => {
    if (!isControlPanelOpen) return null;

    if (activeControlTab === 'visual') {
      return (
        <div className={`mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 shadow-lg ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
          {['note', 'interval', 'fingering', 'none'].map(m => (
            <button key={m} onClick={() => setLabelModeSmart(m as FretboardState['labelMode'])} className={`${controlButtonBase} px-3 ${(m === 'none' ? state.labelMode === 'none' && state.layers.showAllNotes : state.labelMode === m) ? activeButtonClass : inactiveButtonClass}`}>
              {m === 'fingering' ? t.labelFingering : m === 'note' ? t.labelNotes : m === 'interval' ? t.labelIntervals : t.labelNone}
            </button>
          ))}
        </div>
      );
    }

    if (activeControlTab === 'scale') {
      return (
        <div className={`mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 shadow-lg ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
          <select value={state.root} onChange={e => recordAction({...state, root: e.target.value})} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-900">
            {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={state.scaleType} onChange={e => recordAction({...state, scaleType: e.target.value})} className="min-w-[170px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-900">
            {SCALES.map(s => <option key={s.name} value={s.name}>{lang === 'pt' ? (t.scales as any)[s.name] || s.name : s.name}</option>)}
          </select>
        </div>
      );
    }

    if (activeControlTab === 'harmony') {
      return (
        <div className={`mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 shadow-lg ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
          {['OFF', 'TRIADS', 'TETRADS'].map(m => (
            <button key={m} onClick={() => recordAction({...state, harmonyMode: m as any})} className={`${controlButtonBase} px-3 ${state.harmonyMode === m ? activeButtonClass : inactiveButtonClass}`}>{m}</button>
          ))}
          <select value={state.chordDegree} onChange={e => recordAction({...state, chordDegree: Number(e.target.value)})} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-900">
            {DEGREE_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <select value={state.inversion} onChange={e => recordAction({...state, inversion: Number(e.target.value)})} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-900">
            <option value="0">Root</option><option value="1">1a Inv</option><option value="2">2a Inv</option><option value="3">3a Inv</option>
          </select>
          <span className="px-1 text-[9px] font-black uppercase text-zinc-400">CAGED</span>
          {(['OFF', 'C', 'A', 'G', 'E', 'D'] as CagedShape[]).map(shape => (
            <button key={shape} onClick={() => recordAction({...state, cagedShape: shape})} title={t.tooltipCaged} className={`${controlButtonBase} px-3 ${state.cagedShape === shape ? activeButtonClass : inactiveButtonClass}`}>
              {shape}
            </button>
          ))}
        </div>
      );
    }

    if (activeControlTab === 'chords' && chordLibraryMode === 'find') {
      return (
        <div className={`mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 shadow-lg ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
          <select value={chordFinderRoot} onChange={e => setChordFinderRoot(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-900">
            {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={chordFinderType} onChange={e => setChordFinderType(e.target.value as ChordType)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-900">
            {CHORD_TYPES.map(type => <option key={type} value={type}>{getChordTypeLabel(type)}</option>)}
          </select>
          <select value={chordDifficultyFilter} onChange={e => setChordDifficultyFilter(e.target.value as typeof chordDifficultyFilter)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-900">
            <option value="all">{lang === 'pt' ? 'Todos' : 'All'}</option>
            <option value="easy">{lang === 'pt' ? 'Facil' : 'Easy'}</option>
            <option value="intermediate">{lang === 'pt' ? 'Intermediario' : 'Intermediate'}</option>
            <option value="advanced">{lang === 'pt' ? 'Avancado' : 'Advanced'}</option>
          </select>
          <button onClick={() => applyChordVoicingAtIndex(selectedChordVoicingIndex - 1)} disabled={selectedChordVoicingIndex <= 0 || browseChordVoicings.length === 0} className={`${controlButtonBase} px-3 ${inactiveButtonClass} disabled:opacity-40`}>{lang === 'pt' ? 'Anterior' : 'Previous'}</button>
          <span className="px-1 text-[9px] font-black uppercase text-zinc-400">{browseChordVoicings.length > 0 ? `${selectedChordVoicingIndex + 1}/${browseChordVoicings.length}` : '0/0'}</span>
          <button onClick={() => applyChordVoicingAtIndex(selectedChordVoicingIndex + 1)} disabled={selectedChordVoicingIndex >= browseChordVoicings.length - 1 || browseChordVoicings.length === 0} className={`${controlButtonBase} px-3 ${inactiveButtonClass} disabled:opacity-40`}>{lang === 'pt' ? 'Proximo' : 'Next'}</button>
          <button onClick={() => {
            const voicing = browseChordVoicings[selectedChordVoicingIndex];
            if (voicing) playChordVoicing(voicing);
          }} disabled={browseChordVoicings.length === 0} className={`${controlButtonBase} px-3 ${activeButtonClass} disabled:opacity-40`}>
            {lang === 'pt' ? 'Tocar' : 'Play'}
          </button>
        </div>
      );
    }

    if (activeControlTab === 'editor') {
      return (
        <div className={`mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 shadow-lg ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
          <button onClick={() => setEditorMode('marker')} className={`${controlButtonBase} px-3 ${editorMode === 'marker' ? 'bg-zinc-800 border-zinc-800 text-white' : inactiveButtonClass}`}>{t.marker}</button>
          <button onClick={() => setEditorMode('line')} className={`${controlButtonBase} px-3 ${editorMode === 'line' ? 'bg-zinc-800 border-zinc-800 text-white' : inactiveButtonClass}`}>{t.line}</button>
          {PRESET_COLORS.slice(0, 5).map(c => <button key={c} onClick={() => setMarkerColor(c)} className={`h-6 w-6 rounded-full border-2 ${markerColor === c ? 'border-blue-500' : 'border-transparent'}`} style={{ background: c }} />)}
          {['circle', 'square', 'triangle'].map(s => (
            <button key={s} onClick={() => setMarkerShape(s as MarkerShape)} className={`flex h-8 w-8 items-center justify-center rounded-lg border ${markerShape === s ? 'border-blue-600 bg-blue-600 text-white' : 'border-zinc-200 bg-white text-zinc-500'}`}>
              {markerShapeIcon(s as MarkerShape)}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderChordLibraryControls = () => (
    <div className={`rounded-2xl border p-3 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
      <div className="mb-3 flex gap-2 rounded-xl border border-zinc-200 bg-white p-1">
        <button onClick={() => setChordLibraryMode('find')} className={`flex-1 rounded-lg py-2 text-[9px] font-black uppercase transition-all ${chordLibraryMode === 'find' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-blue-600'}`}>
          {lang === 'pt' ? 'Encontrar acorde' : 'Find chord'}
        </button>
        <button onClick={() => setChordLibraryMode('identify')} className={`flex-1 rounded-lg py-2 text-[9px] font-black uppercase transition-all ${chordLibraryMode === 'identify' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-blue-600'}`}>
          {lang === 'pt' ? 'Identificar acorde' : 'Identify chord'}
        </button>
      </div>

      {chordLibraryMode === 'find' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.2em]">{t.tonic}</span>
              <select value={chordFinderRoot} onChange={e => setChordFinderRoot(e.target.value)} className={controlInputClass}>
                {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.2em]">{lang === 'pt' ? 'Tipo' : 'Type'}</span>
              <select value={chordFinderType} onChange={e => setChordFinderType(e.target.value as ChordType)} className={controlInputClass}>
                {CHORD_TYPES.map(type => <option key={type} value={type}>{getChordTypeLabel(type)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.2em]">{lang === 'pt' ? 'Abertura' : 'Span'}</span>
              <select value={chordFinderSpan} onChange={e => setChordFinderSpan(Number(e.target.value) as 4 | 5 | 6)} className={controlInputClass}>
                {[4, 5, 6].map(span => <option key={span} value={span}>{span}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
              <input type="checkbox" checked={preferOpenChords} onChange={e => setPreferOpenChords(e.target.checked)} className="h-4 w-4 accent-blue-600" />
              {lang === 'pt' ? 'Preferir abertos' : 'Prefer open'}
            </label>
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
              <input type="checkbox" checked={preferRootInBass} onChange={e => setPreferRootInBass(e.target.checked)} className="h-4 w-4 accent-blue-600" />
              {lang === 'pt' ? 'Baixo na tonica' : 'Root in bass'}
            </label>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { value: 'all', label: lang === 'pt' ? 'Todos' : 'All' },
              { value: 'easy', label: lang === 'pt' ? 'Facil' : 'Easy' },
              { value: 'intermediate', label: lang === 'pt' ? 'Medio' : 'Mid' },
              { value: 'advanced', label: lang === 'pt' ? 'Avancado' : 'Adv' }
            ].map(option => (
              <button key={option.value} onClick={() => setChordDifficultyFilter(option.value as typeof chordDifficultyFilter)} className={`${controlButtonBase} ${chordDifficultyFilter === option.value ? activeButtonClass : inactiveButtonClass}`}>
                {option.label}
              </button>
            ))}
          </div>
          <div className={`rounded-xl border p-2 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                {lang === 'pt' ? 'Navegar shapes' : 'Browse shapes'}
              </span>
              <span className="text-[9px] font-black uppercase text-zinc-500">
                {browseChordVoicings.length > 0 ? `${selectedChordVoicingIndex + 1}/${browseChordVoicings.length}` : '0/0'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => applyChordVoicingAtIndex(selectedChordVoicingIndex - 1)}
                disabled={selectedChordVoicingIndex <= 0 || browseChordVoicings.length === 0}
                className={`${controlButtonBase} ${inactiveButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {lang === 'pt' ? 'Anterior' : 'Previous'}
              </button>
              <button
                onClick={() => applyChordVoicingAtIndex(selectedChordVoicingIndex)}
                disabled={browseChordVoicings.length === 0}
                className={`${controlButtonBase} ${activeButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {lang === 'pt' ? 'Aplicar atual' : 'Apply current'}
              </button>
              <button
                onClick={() => applyChordVoicingAtIndex(selectedChordVoicingIndex + 1)}
                disabled={selectedChordVoicingIndex >= browseChordVoicings.length - 1 || browseChordVoicings.length === 0}
                className={`${controlButtonBase} ${inactiveButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {lang === 'pt' ? 'Proximo' : 'Next'}
              </button>
            </div>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {browseChordVoicings.length > 0 ? browseChordVoicings.slice(0, 20).map((voicing, index) => (
              <div
                key={voicing.id}
                role="button"
                tabIndex={0}
                onClick={() => applyChordVoicingAtIndex(index)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    applyChordVoicingAtIndex(index);
                  }
                }}
                className={`cursor-pointer rounded-xl border p-3 transition-all hover:border-blue-500 ${index === selectedChordVoicingIndex ? 'border-blue-500 bg-blue-50/80' : voicing.id === recommendedChordVoicingId ? 'border-blue-300 bg-blue-50/70' : (isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800')}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black uppercase text-zinc-900 dark:text-zinc-100">{index + 1}. {voicing.name} ({getVoicingInversionLabel(voicing)})</p>
                      {voicing.id === recommendedChordVoicingId && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-white">
                          {lang === 'pt' ? 'Recomendado' : 'Recommended'}
                        </span>
                      )}
                      {index === selectedChordVoicingIndex && (
                        <span className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-blue-600">
                          {lang === 'pt' ? 'Selecionado' : 'Selected'}
                        </span>
                      )}
                      {getVoicingTags(voicing).map(tag => (
                        <span key={tag} className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                      {voicing.notes.join(' ')} | {voicing.intervals.join(' ')} | {lang === 'pt' ? 'casas' : 'frets'} {voicing.positions.map(p => `${p.string + 1}:${p.fret}`).join(' ')}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                      {lang === 'pt' ? 'Dedos' : 'Fingers'} {voicing.positions.map(p => p.finger || '-').join(' ')} | span {voicing.fretSpan} | score {voicing.score}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                      {lang === 'pt' ? 'Regiao' : 'Region'} {voicing.minFret || 0}-{voicing.maxFret || 0}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button onClick={event => { event.stopPropagation(); toggleFavoriteChordVoicing(voicing); }} className={`rounded-lg border px-3 py-2 text-[8px] font-black uppercase transition-all active:scale-95 ${isFavoriteChordVoicing(voicing) ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-zinc-200 bg-white text-zinc-500'}`}>
                      {isFavoriteChordVoicing(voicing) ? (lang === 'pt' ? 'Salvo' : 'Saved') : (lang === 'pt' ? 'Salvar' : 'Save')}
                    </button>
                    <button onClick={event => { event.stopPropagation(); playChordVoicing(voicing); }} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-[8px] font-black uppercase text-blue-600 transition-all active:scale-95">
                      {lang === 'pt' ? 'Ouvir' : 'Listen'}
                    </button>
                    <button onClick={event => { event.stopPropagation(); applyChordVoicingAtIndex(index); }} className="rounded-lg bg-blue-600 px-3 py-2 text-[8px] font-black uppercase text-white transition-all active:scale-95">
                      {lang === 'pt' ? 'Aplicar' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-[10px] font-bold uppercase leading-relaxed text-zinc-400">
                {lang === 'pt' ? 'Nenhuma posicao encontrada para estes filtros.' : 'No positions found for these filters.'}
              </p>
            )}
          </div>
          <div className={`rounded-xl border p-2 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                {lang === 'pt' ? 'Favoritos' : 'Favorites'}
              </span>
              <span className="text-[9px] font-black uppercase text-zinc-500">{favoriteChordVoicings.length}</span>
            </div>
            <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
              {favoriteChordVoicings.length > 0 ? favoriteChordVoicings.slice(0, 8).map(favorite => (
                <div key={`${favorite.name}-${favorite.id}`} className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-2 ${isLight ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-900'}`}>
                  <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300">{favorite.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => playChordVoicing(favorite)} className="rounded-md border border-blue-200 bg-white px-2 py-1 text-[8px] font-black uppercase text-blue-600">
                      {lang === 'pt' ? 'Tocar' : 'Play'}
                    </button>
                    <button onClick={() => applyChordVoicing(favorite)} className="rounded-md bg-blue-600 px-2 py-1 text-[8px] font-black uppercase text-white">
                      {lang === 'pt' ? 'Aplicar' : 'Apply'}
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-bold uppercase leading-relaxed text-zinc-400">
                  {lang === 'pt' ? 'Salve shapes para usar depois.' : 'Save shapes to reuse later.'}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">
              {lang === 'pt' ? 'Acorde identificado' : 'Identified chord'}
            </span>
            {chordIdentification.bass && (
              <span className="text-[8px] font-black uppercase text-zinc-400">
                Bass: {chordIdentification.bass}
              </span>
            )}
          </div>
          {chordIdentification.bestMatch ? (
            <div className="mt-2 space-y-2">
              <div className={`rounded-xl px-3 py-2 ${isLight ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-blue-950/40 text-blue-200 border border-blue-900/50'}`}>
                <p className="text-[12px] font-black uppercase">{chordIdentification.bestMatch.name}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] opacity-75">
                  {chordIdentification.bestMatch.quality} | {chordIdentification.bestMatch.intervalsFound.join(' ')} | {chordIdentification.bestMatch.confidence}%
                </p>
                {(chordIdentification.bestMatch.missingIntervals.length > 0 || chordIdentification.bestMatch.extraIntervals.length > 0) && (
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] opacity-75">
                    {lang === 'pt' ? 'Faltam' : 'Missing'}: {chordIdentification.bestMatch.missingIntervals.join(' ') || '-'} | {lang === 'pt' ? 'Extras' : 'Extra'}: {chordIdentification.bestMatch.extraIntervals.join(' ') || '-'}
                  </p>
                )}
              </div>
              {chordIdentification.alternatives.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {chordIdentification.alternatives.slice(0, 4).map(match => (
                    <span key={`${match.name}-${match.type}-${match.score}`} className="rounded-lg border border-zinc-200 px-2 py-1 text-[9px] font-black uppercase text-zinc-500">
                      {match.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[10px] font-bold uppercase leading-relaxed text-zinc-400">
              {lang === 'pt' ? 'Adicione marcadores ou cordas abertas para identificar um acorde.' : 'Add markers or open strings to identify a chord.'}
            </p>
          )}
        </>
      )}
    </div>
  );

  const renderControls = () => {
    if (activeControlTab === 'learn') {
      const filteredStudies = isBeginnerMode
        ? guidedStudies.filter(study => study.level === 'beginner')
        : guidedStudies;

      return (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-3 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-blue-600">
                  {lang === 'pt' ? 'Modo Aprender' : 'Learn Mode'}
                </p>
                <h4 className="mt-1 text-sm font-black uppercase tracking-tight">
                  {lang === 'pt' ? 'Estudo guiado' : 'Guided study'}
                </h4>
              </div>
              <button
                onClick={() => setIsBeginnerMode(prev => !prev)}
                className={`rounded-lg border px-3 py-2 text-[9px] font-black uppercase transition-all ${isBeginnerMode ? 'border-blue-600 bg-blue-600 text-white' : inactiveButtonClass}`}
                aria-label={lang === 'pt' ? 'Alternar modo iniciante' : 'Toggle beginner mode'}
              >
                {lang === 'pt' ? 'Iniciante' : 'Beginner'}
              </button>
            </div>
            <p className="mt-3 text-[11px] font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">
              {lang === 'pt'
                ? 'Escolha uma jornada curta. O app aplica o estudo no braco e mostra o proximo passo.'
                : 'Choose a short journey. The app applies the study to the fretboard and shows the next step.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {filteredStudies.map(study => (
              <button
                key={study.id}
                onClick={() => {
                  setActiveStudyId(study.id);
                  setStudyStepIndex(0);
                }}
                className={`rounded-2xl border p-3 text-left transition-all active:scale-[0.99] ${activeStudyId === study.id ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100' : isLight ? 'border-zinc-200 bg-white text-zinc-700' : 'border-zinc-800 bg-zinc-900 text-zinc-200'}`}
                aria-label={study.title}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase">{study.title}</span>
                  <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-1 text-[8px] font-black uppercase text-white dark:bg-white dark:text-zinc-900">
                    {levelLabel(study.level)} · {study.minutes}min
                  </span>
                </div>
                <p className="mt-2 text-[10px] font-semibold leading-relaxed opacity-75">{study.description}</p>
              </button>
            ))}
          </div>

          <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-zinc-400">
                  {lang === 'pt' ? 'Objetivo' : 'Goal'}
                </p>
                <h4 className="mt-1 text-sm font-black uppercase">{selectedStudy.goal}</h4>
              </div>
              <span className="rounded-full border border-blue-200 px-2 py-1 text-[8px] font-black uppercase text-blue-600">
                {selectedStudy.minutes} min
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">
              {selectedStudy.why}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => startGuidedLesson(selectedStudy)} className={`${controlButtonBase} ${activeButtonClass}`} aria-label={lang === 'pt' ? 'Comecar licao guiada' : 'Start guided lesson'}>
                {lessonSnapshot ? selectedStudy.actionLabel : (lang === 'pt' ? 'Comecar licao' : 'Start lesson')}
              </button>
              <button onClick={() => playGuidedStudy(selectedStudy)} className={`${controlButtonBase} ${inactiveButtonClass}`} aria-label={lang === 'pt' ? 'Ouvir estudo atual' : 'Listen to current study'}>
                {lang === 'pt' ? 'Ouvir' : 'Listen'}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => applyGuidedStudy(guidedStudies.find(study => study.id === 'connect-pentatonic') || selectedStudy)} className={`${controlButtonBase} ${inactiveButtonClass}`} title={lang === 'pt' ? 'Mostrar conexoes entre shapes' : 'Show shape connections'} aria-label={lang === 'pt' ? 'Mostrar conexoes entre shapes' : 'Show shape connections'}>
                {lang === 'pt' ? 'Conexoes' : 'Connections'}
              </button>
              <button onClick={() => applyGuidedStudy(guidedStudies.find(study => study.id === 'thirds-fifths') || selectedStudy)} className={`${controlButtonBase} ${inactiveButtonClass}`} title={lang === 'pt' ? 'Mostrar intervalos alvo' : 'Show target intervals'} aria-label={lang === 'pt' ? 'Mostrar intervalos alvo' : 'Show target intervals'}>
                {lang === 'pt' ? 'Intervalos' : 'Intervals'}
              </button>
              <button onClick={() => applyGuidedStudy(guidedStudies.find(study => study.id === 'chord-scale-targets') || selectedStudy)} className={`${controlButtonBase} ${inactiveButtonClass}`} title={lang === 'pt' ? 'Relacionar acorde e escala' : 'Relate chord and scale'} aria-label={lang === 'pt' ? 'Relacionar acorde e escala' : 'Relate chord and scale'}>
                {lang === 'pt' ? 'Acorde/escala' : 'Chord/scale'}
              </button>
              <button onClick={() => applyGuidedStudy(guidedStudies.find(study => study.id === 'region-five-eight') || selectedStudy)} className={`${controlButtonBase} ${inactiveButtonClass}`} title={lang === 'pt' ? 'Focar uma regiao do braco' : 'Focus a fretboard region'} aria-label={lang === 'pt' ? 'Focar uma regiao do braco' : 'Focus a fretboard region'}>
                {lang === 'pt' ? 'Regiao' : 'Region'}
              </button>
            </div>

            {lessonSnapshot && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => exitGuidedLesson(false)} className={`${controlButtonBase} ${inactiveButtonClass}`} aria-label={lang === 'pt' ? 'Sair da licao e restaurar mapa anterior' : 'Exit lesson and restore previous map'}>
                  {lang === 'pt' ? 'Restaurar' : 'Restore'}
                </button>
                <button onClick={() => exitGuidedLesson(true)} className={`${controlButtonBase} ${activeButtonClass}`} aria-label={lang === 'pt' ? 'Concluir licao e manter mapa atual' : 'Complete lesson and keep current map'}>
                  {lang === 'pt' ? 'Manter mapa' : 'Keep map'}
                </button>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {selectedStudy.steps.map((step, index) => (
                <div key={step} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${index === studyStepIndex ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200' : isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-500' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white">{index + 1}</span>
                  <span className="text-[10px] font-bold leading-snug">{step}</span>
                </div>
              ))}
            </div>

            <button onClick={advanceStudyStep} className={`mt-3 w-full ${controlButtonBase} ${inactiveButtonClass}`}>
              {studyStepIndex >= selectedStudy.steps.length - 1
                ? (lang === 'pt' ? 'Sessao concluida' : 'Session complete')
                : (lang === 'pt' ? 'Proximo passo' : 'Next step')}
            </button>

            {recommendedStudy && (
              <button
                onClick={() => {
                  setActiveStudyId(recommendedStudy.id);
                  setStudyStepIndex(0);
                }}
                className={`mt-2 w-full ${controlButtonBase} ${inactiveButtonClass}`}
                aria-label={lang === 'pt' ? `Proximo estudo recomendado: ${recommendedStudy.title}` : `Next recommended study: ${recommendedStudy.title}`}
              >
                {lang === 'pt' ? `Proximo: ${recommendedStudy.title}` : `Next: ${recommendedStudy.title}`}
              </button>
            )}
          </div>
        </div>
      );
    }

    if (activeControlTab === 'base') {
      return (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-3 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-blue-600">
                  {lang === 'pt' ? 'Base' : 'Base'}
                </p>
                <h4 className="mt-1 text-sm font-black uppercase tracking-tight">
                  {lang === 'pt' ? 'Acoes do diagrama' : 'Diagram actions'}
                </h4>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleNewDiagramClick} className={`${controlButtonBase} ${activeButtonClass}`} aria-label={lang === 'pt' ? 'Criar novo diagrama guiado' : 'Create guided new diagram'}>
                {lang === 'pt' ? 'Novo' : 'New'}
              </button>
              <button onClick={createQuickDiagram} className={`${controlButtonBase} ${inactiveButtonClass}`} aria-label={lang === 'pt' ? 'Criar novo diagrama rapido' : 'Create quick new diagram'}>
                {lang === 'pt' ? 'Rapido' : 'Quick'}
              </button>
              <button onClick={() => onAdd(state)} className={`${controlButtonBase} ${inactiveButtonClass}`} aria-label={lang === 'pt' ? 'Duplicar diagrama atual' : 'Duplicate current diagram'}>
                {lang === 'pt' ? 'Duplicar' : 'Duplicate'}
              </button>
              <button onClick={clearContent} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[9px] font-black uppercase text-red-600 transition-all hover:bg-red-100" aria-label={lang === 'pt' ? 'Limpar marcadores e linhas do diagrama' : 'Clear diagram markers and lines'}>
                {lang === 'pt' ? 'Limpar mapa' : 'Clear map'}
              </button>
              <button onClick={clearEverything} className="col-span-2 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-[9px] font-black uppercase text-red-600 transition-all hover:bg-red-50 dark:bg-zinc-950 dark:hover:bg-red-950/20" aria-label={lang === 'pt' ? 'Limpar todo o diagrama' : 'Clear the whole diagram'}>
                {lang === 'pt' ? 'Limpar tudo' : 'Clear all'}
              </button>
            </div>
          </div>

          {onGlobalTranspose && (
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                {lang === 'pt' ? 'Transposição' : 'Transpose'}
              </span>
              <div className={`flex items-center gap-2 rounded-xl border p-2 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-700'}`}>
                <button onClick={() => onGlobalTranspose(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600 transition-colors hover:bg-blue-100">-</button>
                <div className="flex flex-1 flex-col items-center justify-center">
                  <span className={`text-sm font-black ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                    {globalTranspose === 0 ? '0' : globalTranspose > 0 ? `+${globalTranspose}` : globalTranspose}
                  </span>
                  <button onClick={() => onGlobalTranspose(0)} className="text-[8px] font-black uppercase text-zinc-400 hover:text-red-500">
                    reset
                  </button>
                </div>
                <button onClick={() => onGlobalTranspose(1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600 transition-colors hover:bg-blue-100">+</button>
              </div>
            </div>
          )}
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
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.layers}</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => recordAction({...state, layers: {...state.layers, showInlays: !state.layers.showInlays}})} className={`${controlButtonBase} ${state.layers.showInlays ? activeButtonClass : inactiveButtonClass}`}>{t.inlays}</button>
              <button onClick={() => recordAction({...state, layers: {...state.layers, showAllNotes: !state.layers.showAllNotes}})} className={`${controlButtonBase} ${state.layers.showAllNotes ? activeButtonClass : inactiveButtonClass}`}>{t.allNotes}</button>
              <button onClick={() => recordAction({...state, layers: {...state.layers, showScale: !state.layers.showScale}})} className={`${controlButtonBase} ${state.layers.showScale ? activeButtonClass : inactiveButtonClass}`}>{t.scaleNotes}</button>
              <button onClick={() => recordAction({...state, layers: {...state.layers, showTonic: !state.layers.showTonic}})} className={`${controlButtonBase} ${state.layers.showTonic ? activeButtonClass : inactiveButtonClass}`}>{t.tonicHighlight}</button>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-[0.25em]">{t.labels}</span>
            <div className="grid grid-cols-2 gap-2">
              {['note', 'interval', 'fingering', 'none'].map(m => (
                <button key={m} onClick={() => setLabelModeSmart(m as FretboardState['labelMode'])} className={`${controlButtonBase} ${(m === 'none' ? state.labelMode === 'none' && state.layers.showAllNotes : state.labelMode === m) ? activeButtonClass : inactiveButtonClass}`}>
                  {m === 'fingering' ? t.labelFingering : m === 'note' ? t.labelNotes : m === 'interval' ? t.labelIntervals : t.labelNone}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={undo} className={`${controlButtonBase} ${inactiveButtonClass}`} title={t.undo} aria-label={t.undo}>↶ {t.undo}</button>
            <button onClick={redo} className={`${controlButtonBase} ${inactiveButtonClass}`} title={t.redo} aria-label={t.redo}>↷ {t.redo}</button>
          </div>
        </div>
      );
    }

    if (activeControlTab === 'scale') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => recordAction({...state, layers: {...state.layers, showScale: !state.layers.showScale}})} className={`${controlButtonBase} ${state.layers.showScale ? activeButtonClass : inactiveButtonClass}`}>
              {state.layers.showScale ? (lang === 'pt' ? 'Escala ON' : 'Scale ON') : (lang === 'pt' ? 'Escala OFF' : 'Scale OFF')}
            </button>
            <button data-tour="quick-tonic" onClick={() => recordAction({...state, layers: {...state.layers, showTonic: !state.layers.showTonic}})} className={`${controlButtonBase} ${state.layers.showTonic ? activeButtonClass : inactiveButtonClass}`}>
              {state.layers.showTonic ? (lang === 'pt' ? 'Tônica ON' : 'Tonic ON') : (lang === 'pt' ? 'Tônica OFF' : 'Tonic OFF')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
          </div>
        </div>
      );
    }

    if (activeControlTab === 'harmony') {
      return (
        <div className="space-y-3">
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

    if (activeControlTab === 'chords') {
      return (
        <div className="space-y-3">
          {renderChordLibraryControls()}
        </div>
      );
    }

    if (activeControlTab === 'tools') {
      return (
        <PracticeTools
          instrumentType={state.instrumentType}
          tuning={currentTuning}
          isLight={isLight}
          lang={lang}
          state={state}
          onApplyExample={recordAction}
          initialTool={preferredPracticeTool}
          onHighlightPosition={(position) => {
            setNoteClickFeedback(position);
            if (noteClickTimeoutRef.current) {
              window.clearTimeout(noteClickTimeoutRef.current);
            }
            noteClickTimeoutRef.current = window.setTimeout(() => setNoteClickFeedback(null), 520);
          }}
        />
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

    return null;
  };

  return (
    <div onClick={onActivate} className={`diagram-container relative p-3 lg:p-10 rounded-[24px] lg:rounded-[48px] border shadow-lg lg:shadow-2xl transition-all ${isActive ? `ring-2 ${activeInstrumentAccent.ring} ${activeInstrumentAccent.shadow}` : ''} ${isLight ? 'bg-white/95 border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
      {isActive && !isExporting && <div className={`pointer-events-none absolute inset-x-10 -bottom-2 h-1 rounded-full ${activeInstrumentAccent.glow} blur-[1px]`} />}
      
      {/* HEADER DIAGRAMA */}
      <div className={`hidden lg:flex lg:flex-row lg:items-center justify-between mb-5 lg:mb-10 gap-4 ${isExporting ? 'hidden-operational-btns' : ''}`}>
        <div className="min-w-0 flex-1 lg:max-w-[360px] xl:max-w-[420px] 2xl:max-w-[520px]">
          <div className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${isLight ? activeInstrumentAccent.badgeLight : activeInstrumentAccent.badgeDark}`}>
            {lang === 'pt' ? 'Diagrama' : 'Diagram'} {diagramNumber}
          </div>
          <input value={state.title} onChange={e => recordAction({...state, title: e.target.value})} className={`bg-transparent text-lg lg:text-2xl xl:text-3xl font-black italic uppercase tracking-tighter focus:outline-none w-full truncate ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`} placeholder={t.titlePlaceholder} />
          <input value={state.subtitle} onChange={e => recordAction({...state, subtitle: e.target.value})} className="bg-transparent text-[10px] lg:text-lg font-bold text-zinc-400 focus:outline-none w-full uppercase tracking-wide mt-1" placeholder={t.subtitle} />
        </div>
        <div className="flex max-w-[1040px] shrink flex-col items-end gap-3 operational-btns">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
           <button onClick={() => setIsControlPanelOpen(prev => !prev)} className={`px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl font-black text-[10px] lg:text-[11px] uppercase border transition-all active:scale-90 ${isControlPanelOpen ? 'bg-blue-600 text-white border-blue-600' : isLight ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-zinc-100 text-zinc-700 border-zinc-300'}`}>
              {lang === 'pt' ? 'CONTROLES' : 'TOOLS'}
           </button>
           <button onClick={createQuickDiagram} className="bg-blue-600 px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl text-white font-black text-[10px] lg:text-[11px] uppercase active:scale-95 shadow-lg shadow-blue-500/20">{lang === 'pt' ? 'Novo' : 'New'}</button>
           <button data-tour="new-diagram" onClick={handleNewDiagramClick} className="bg-blue-50 px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl border border-blue-200 text-blue-700 font-black text-[10px] md:text-[11px] uppercase active:scale-95">{lang === 'pt' ? 'N. guiado' : 'Guided'}</button>
           <button onClick={() => onAdd(state)} className={`${isLight ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'} px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl font-black text-[10px] lg:text-[11px] uppercase active:scale-95`}>{lang === 'pt' ? 'Duplicar este diagrama' : 'Duplicate this diagram'}</button>
           <button onClick={clearContent} className="bg-red-50 px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl border border-red-200 text-red-600 font-black text-[10px] lg:text-[11px] uppercase active:scale-95">{lang === 'pt' ? 'Limpar' : 'Clear'}</button>
           <button onClick={clearEverything} className="bg-white px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl border border-red-200 text-red-600 font-black text-[10px] lg:text-[11px] uppercase active:scale-95">{lang === 'pt' ? 'Limpar tudo' : 'Clear all'}</button>
           <div className="flex gap-1.5 items-center bg-blue-50 dark:bg-zinc-800 p-1.5 rounded-xl border border-blue-200 dark:border-zinc-700 shadow-sm [&>button]:bg-white [&>button]:text-zinc-800 [&>button]:border [&>button]:border-zinc-300 [&>button]:shadow-sm">
              <button onClick={() => onMove('up')} disabled={isFirst} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↑</button>
              <button onClick={() => onMove('down')} disabled={isLast} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↓</button>
           </div>
           <button onClick={onRemove} className="bg-red-50 text-red-600 w-11 h-11 flex items-center justify-center rounded-xl font-black text-xl transition-colors hover:bg-red-100">×</button>
        </div>
        <div className={`hidden w-full grid-cols-[0.88fr_0.88fr_1.7fr_1.45fr] gap-2 rounded-2xl border p-2 lg:grid ${isLight ? 'border-zinc-200 bg-white/70' : 'border-zinc-800 bg-zinc-950/70'}`}>
          <div className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
            <span className="mr-auto text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Transp.' : 'Transp.'}</span>
            <button onClick={() => onGlobalTranspose?.(-1)} disabled={!onGlobalTranspose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base font-black text-blue-600 disabled:opacity-40">-</button>
            <span className={`min-w-8 text-center text-sm font-black ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{globalTranspose === 0 ? '0' : globalTranspose > 0 ? `+${globalTranspose}` : globalTranspose}</span>
            <button onClick={() => onGlobalTranspose?.(1)} disabled={!onGlobalTranspose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base font-black text-blue-600 disabled:opacity-40">+</button>
            <button onClick={() => onGlobalTranspose?.(0)} disabled={!onGlobalTranspose || globalTranspose === 0} className="rounded-lg px-2 py-2 text-[8px] font-black uppercase text-zinc-400 disabled:opacity-35">reset</button>
          </div>
          <div className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
            <span className="mr-auto text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Casas' : 'Frets'}</span>
            <button onClick={() => recordAction({ ...state, endFret: Math.max(state.startFret + 1, state.endFret - 1) })} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base font-black text-blue-600">-</button>
            <span className={`min-w-8 text-center text-sm font-black ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{state.endFret}</span>
            <button onClick={() => recordAction({ ...state, endFret: Math.min(24, state.endFret + 1) })} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base font-black text-blue-600">+</button>
          </div>
          <div data-tour="quick-editor" className={`grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
            <span className="row-span-2 self-center text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Marcador' : 'Marker'}</span>
            <div className="flex gap-1">
              {(['circle', 'triangle', 'square'] as MarkerShape[]).map(shape => (
                <button key={shape} onClick={() => { setEditorMode('marker'); setMarkerShape(shape); }} className={`flex h-8 flex-1 items-center justify-center rounded-lg ${markerShape === shape ? 'bg-blue-600 text-white' : isLight ? 'bg-white text-zinc-600' : 'bg-zinc-800 text-zinc-200'}`}>{markerShapeIcon(shape)}</button>
              ))}
            </div>
            <div className="flex gap-1">
              {PRESET_COLORS.slice(0, 4).map(color => (
                <button key={color} onClick={() => { setEditorMode('marker'); setMarkerColor(color); }} className={`h-8 flex-1 rounded-full border-2 ${markerColor === color ? 'border-blue-500' : 'border-white'}`} style={{ background: color }} />
              ))}
            </div>
          </div>
          <div className={`grid gap-1 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
            <div className="flex items-center gap-1">
              <span className="mr-auto shrink-0 pr-2 text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Linha' : 'Line'}</span>
              {([[2, 'F'], [4, 'M'], [7, 'G']] as Array<[LineThickness, string]>).map(([width, label]) => (
                <button key={width} onClick={() => toggleLineThickness(width)} className={`flex h-8 flex-1 min-w-0 items-center justify-center rounded-lg border text-[9px] font-black uppercase transition-all ${editorMode === 'line' && lineThickness === width ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20' : isLight ? 'border-zinc-300 bg-white text-zinc-600 hover:border-blue-400' : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-blue-500'}`}>{label}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={undo} className={`rounded-lg px-2 py-1.5 text-sm font-black ${isLight ? 'bg-white text-zinc-600' : 'bg-zinc-800 text-zinc-200'}`} aria-label={t.undo} title={t.undo}>↶</button>
              <button onClick={redo} className={`rounded-lg px-2 py-1.5 text-sm font-black ${isLight ? 'bg-white text-zinc-600' : 'bg-zinc-800 text-zinc-200'}`} aria-label={t.redo} title={t.redo}>↷</button>
              <button onClick={clearContent} className="rounded-lg bg-red-50 px-2 py-1.5 text-[8px] font-black uppercase text-red-600">{lang === 'pt' ? 'Limpar' : 'Clear'}</button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className={`operational-btns mb-5 hidden lg:block ${isExporting ? 'hidden' : ''}`}>
        <div className={`flex flex-col gap-3 rounded-2xl border px-3 py-3 shadow-sm ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
            <button data-tour="quick-learn" onClick={() => toggleQuickPanel('learn')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'learn' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Aprender' : 'Learn'}
            </button>
            <button data-tour="quick-base" onClick={() => toggleQuickPanel('base')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'base' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              Base
            </button>
            <button data-tour="quick-layers" onClick={() => toggleQuickPanel('visual')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'visual' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Camadas' : 'Layers'}
            </button>
            <button data-tour="quick-scale" onClick={() => handleScaleLayerShortcut('showScale')} className={`${quickButtonClass} shrink-0 ${state.layers.showScale ? quickActiveButtonClass : ''}`}>
              {t.scaleNotes}
            </button>
            <button data-tour="quick-tonic" onClick={() => handleScaleLayerShortcut('showTonic')} className={`${quickButtonClass} shrink-0 ${state.layers.showTonic ? quickActiveButtonClass : ''}`}>
              {t.tonicHighlight}
            </button>
            <button data-tour="quick-harmony" onClick={() => toggleQuickPanel('harmony')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'harmony' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Harmonia' : 'Harmony'}
            </button>
            <button data-tour="quick-chords" onClick={() => { setChordLibraryMode('find'); toggleQuickPanel('chords'); }} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'chords' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Acorde' : 'Chord'}
            </button>
            <button data-tour="quick-practice" onClick={() => toggleQuickPanel('tools')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'tools' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Praticar' : 'Practice'}
            </button>
            <button onClick={() => setSoundEnabled(prev => !prev)} className={`${quickButtonClass} shrink-0 ${soundEnabled ? quickActiveButtonClass : ''}`}>
              {soundEnabled ? (lang === 'pt' ? 'Som ON' : 'Sound ON') : (lang === 'pt' ? 'Som OFF' : 'Sound OFF')}
            </button>
          </div>
          {renderQuickControls()}
        </div>
      </div>

      <div className={`operational-btns fixed inset-x-0 bottom-0 z-[75] border-t px-2 pb-1 pt-1 shadow-lg lg:hidden ${isExporting ? 'hidden' : ''} ${isLight ? 'bg-white/90 border-zinc-200' : 'bg-zinc-950/90 border-zinc-800'}`}>
        <div className="grid grid-cols-5 gap-1">
          <button data-tour="quick-learn" onClick={() => openMobileTab('learn')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'learn' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Aprender' : 'Learn'}>
            {lang === 'pt' ? 'Aprender' : 'Learn'}
          </button>
          <button data-tour="mobile-scales" onClick={() => openMobileTab('scale')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'scale' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Escalas' : 'Scales'}>
            {lang === 'pt' ? 'Escalas' : 'Scales'}
          </button>
          <button data-tour="quick-chords" onClick={() => openMobileTab('chords')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'chords' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Acordes' : 'Chords'}>
            {lang === 'pt' ? 'Acordes' : 'Chords'}
          </button>
          <button data-tour="quick-editor" onClick={() => openMobileTab('editor')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'editor' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Editar' : 'Edit'}>{lang === 'pt' ? 'Editar' : 'Edit'}</button>
          <button data-tour="quick-practice" onClick={() => openMobileTab('tools')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'tools' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Praticar' : 'Practice'}>
            {lang === 'pt' ? 'Praticar' : 'Practice'}
          </button>
        </div>
      </div>

      <div className={`operational-btns ${isExporting ? 'hidden' : ''}`}>
        <div className={`fixed inset-x-0 bottom-[52px] z-[80] max-h-[62vh] overflow-y-auto border-t p-4 shadow-2xl transition-transform lg:fixed lg:inset-x-auto lg:right-6 lg:top-28 lg:bottom-6 lg:w-[390px] lg:max-h-none lg:rounded-2xl lg:border ${panelShell} ${isControlPanelOpen ? 'translate-y-0 lg:translate-y-0' : 'translate-y-[calc(100%+72px)] lg:translate-y-0 lg:translate-x-[calc(100%+32px)]'}`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                {lang === 'pt' ? 'Painel' : 'Panel'}
              </p>
              <h3 className="text-sm font-black uppercase tracking-tight">
                {lang === 'pt' ? 'Controles do Diagrama' : 'Diagram Controls'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSoundEnabled(prev => !prev)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase border ${soundEnabled ? 'bg-blue-600 border-blue-600 text-white' : isLight ? 'bg-white border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`}>
                {soundEnabled ? (lang === 'pt' ? 'Som ON' : 'Sound ON') : (lang === 'pt' ? 'Som OFF' : 'Sound OFF')}
              </button>
              <button onClick={() => setIsControlPanelOpen(prev => !prev)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase border ${isLight ? 'bg-white border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`}>
                {isControlPanelOpen ? (lang === 'pt' ? 'Fechar' : 'Close') : (lang === 'pt' ? 'Abrir' : 'Open')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-4 sm:grid-cols-6 lg:grid-cols-3">
            {visibleControlTabs.map(tab => (
              <button
                key={tab.id}
                data-tour={tab.id === 'learn' ? 'quick-learn' : tab.id === 'base' ? 'quick-base' : tab.id === 'visual' ? 'quick-layers' : tab.id === 'tools' ? 'quick-practice' : `quick-${tab.id}`}
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
          </div>
        </div>
      </div>

      <div className="relative group diagram-svg-wrapper" data-tour="main-fretboard">
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
            {!isExporting && (
              <div className={`mb-2 space-y-2 rounded-2xl border p-2 lg:hidden ${isLight ? 'border-zinc-200 bg-white/85' : 'border-zinc-800 bg-zinc-950/80'}`}>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
                  <span className="mr-auto text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Transp.' : 'Transp.'}</span>
                  <button onClick={() => onGlobalTranspose?.(-1)} disabled={!onGlobalTranspose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600 disabled:opacity-40">-</button>
                  <span className={`min-w-7 text-center text-[10px] font-black ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{globalTranspose === 0 ? '0' : globalTranspose > 0 ? `+${globalTranspose}` : globalTranspose}</span>
                  <button onClick={() => onGlobalTranspose?.(1)} disabled={!onGlobalTranspose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600 disabled:opacity-40">+</button>
                  <button onClick={() => onGlobalTranspose?.(0)} disabled={!onGlobalTranspose || globalTranspose === 0} className="rounded-lg px-2 py-2 text-[8px] font-black uppercase text-zinc-400 disabled:opacity-35" aria-label={lang === 'pt' ? 'Resetar transposicao' : 'Reset transpose'}>reset</button>
                </div>
                <div className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
                  <span className="mr-auto text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Casas' : 'Frets'}</span>
                  <button onClick={() => recordAction({ ...state, endFret: Math.max(state.startFret + 1, state.endFret - 1) })} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600" aria-label={lang === 'pt' ? 'Diminuir casas visiveis' : 'Decrease visible frets'}>-</button>
                  <span className={`min-w-6 text-center text-[10px] font-black ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{state.endFret}</span>
                  <button onClick={() => recordAction({ ...state, endFret: Math.min(24, state.endFret + 1) })} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600" aria-label={lang === 'pt' ? 'Aumentar casas visiveis' : 'Increase visible frets'}>+</button>
                </div>
              </div>
              <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1.15fr)_auto] gap-2">
                <div className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
                  <span className="row-span-2 self-center text-[7px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Marc.' : 'Mark.'}</span>
                  <div className="flex min-w-0 items-center gap-1">
                    {([
                      ['circle', 'circle'],
                      ['triangle', 'triangle'],
                      ['square', 'square']
                    ] as Array<[MarkerShape, MarkerShape]>).map(([shape, label]) => (
                      <button key={shape} onClick={() => { setEditorMode('marker'); setMarkerShape(shape); }} className={`flex h-7 flex-1 min-w-0 items-center justify-center rounded-lg text-[8px] font-black uppercase ${markerShape === shape ? 'bg-blue-600 text-white' : isLight ? 'bg-white text-zinc-600' : 'bg-zinc-800 text-zinc-200'}`} aria-label={label}>
                        {markerShapeIcon(label)}
                      </button>
                    ))}
                  </div>
                  <div className="flex min-w-0 items-center gap-1">
                  {PRESET_COLORS.slice(0, 4).map(color => (
                    <button key={color} onClick={() => { setEditorMode('marker'); setMarkerColor(color); }} className={`h-7 flex-1 min-w-0 rounded-full border-2 ${markerColor === color ? 'border-blue-500' : 'border-white'}`} style={{ background: color }} aria-label={lang === 'pt' ? 'Selecionar cor do marcador' : 'Select marker color'} />
                  ))}
                  </div>
                </div>
                <div className={`grid gap-1 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
                  <div className="flex items-center gap-1">
                    <span className="mr-auto shrink-0 pr-2 text-[7px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Linha' : 'Line'}</span>
                    {([
                      [2, 'F'],
                      [4, 'M'],
                      [7, 'G']
                    ] as Array<[LineThickness, string]>).map(([width, label]) => (
                      <button key={width} onClick={() => toggleLineThickness(width)} className={`flex h-7 flex-1 min-w-0 items-center justify-center rounded-lg border text-[8px] font-black uppercase transition-all ${editorMode === 'line' && lineThickness === width ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20' : isLight ? 'border-zinc-300 bg-white text-zinc-600 hover:border-blue-400' : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-blue-500'}`} aria-label={`${lang === 'pt' ? 'Linha' : 'Line'} ${label}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button onClick={undo} className={`rounded-lg px-1 py-1.5 text-sm font-black ${isLight ? 'bg-white text-zinc-600' : 'bg-zinc-800 text-zinc-200'}`} aria-label={t.undo} title={t.undo}>↶</button>
                    <button onClick={redo} className={`rounded-lg px-1 py-1.5 text-sm font-black ${isLight ? 'bg-white text-zinc-600' : 'bg-zinc-800 text-zinc-200'}`} aria-label={t.redo} title={t.redo}>↷</button>
                    <button onClick={clearContent} className="rounded-lg bg-red-50 px-1 py-1.5 text-[7px] font-black uppercase text-red-600" aria-label={t.clearDiagram}>{lang === 'pt' ? 'Limp.' : 'Clear'}</button>
                  </div>
                </div>
                <div className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-1.5 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
                  <span className="text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Mover' : 'Move'}</span>
                  <button onClick={() => onMove('up')} disabled={isFirst} className="flex h-8 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-zinc-500 disabled:opacity-30" aria-label={lang === 'pt' ? 'Subir diagrama' : 'Move diagram up'}>↑</button>
                  <button onClick={() => onMove('down')} disabled={isLast} className="flex h-8 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-zinc-500 disabled:opacity-30" aria-label={lang === 'pt' ? 'Descer diagrama' : 'Move diagram down'}>↓</button>
                </div>
              </div>
              </div>
            )}
            {isFretboardVisuallyEmpty && showEmptyFretboardHint && (
              <div className="pointer-events-none absolute inset-x-0 top-[12%] mx-auto w-full text-center">
                <div className="inline-flex max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-500/40 bg-zinc-950/80 px-5 py-4 text-sm font-black uppercase tracking-[0.3em] text-zinc-300 backdrop-blur-lg">
                  {t.emptyFretboard}
                  <span className="mt-2 text-[11px] font-semibold text-zinc-400">
                    {t.emptyFretboardHint}
                  </span>
                </div>
              </div>
            )}
            <FretboardSVG state={state} onEvent={handleEvent} theme={theme} isActive={false} selectedColor={markerColor} selectedShape={markerShape} editorMode={editorMode} isExport={isExporting} feedbackNote={noteClickFeedback} />
         </div>

         {!isExporting && (
           <div className={`mt-3 grid grid-cols-4 gap-2 rounded-2xl border p-2 lg:hidden ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
             <button onClick={createQuickDiagram} className="rounded-xl bg-blue-600 px-2 py-2.5 text-[9px] font-black uppercase text-white shadow-sm" aria-label={lang === 'pt' ? 'Criar novo diagrama' : 'Create new diagram'}>
               {lang === 'pt' ? 'Novo' : 'New'}
             </button>
             <button onClick={handleNewDiagramClick} className={`rounded-xl border px-2 py-2.5 text-[9px] font-black uppercase ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`} aria-label={lang === 'pt' ? 'Criar novo diagrama guiado' : 'Create guided new diagram'}>
               {lang === 'pt' ? 'N. guiado' : 'Guided'}
             </button>
             <button onClick={() => onAdd(state)} className={`rounded-xl border px-2 py-2.5 text-[9px] font-black uppercase ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`} aria-label={lang === 'pt' ? 'Duplicar diagrama atual' : 'Duplicate current diagram'}>
               {lang === 'pt' ? 'Duplicar' : 'Duplicate'}
             </button>
             <button onClick={clearContent} className="rounded-xl border border-red-200 bg-red-50 px-2 py-2.5 text-[9px] font-black uppercase text-red-600" aria-label={lang === 'pt' ? 'Limpar marcadores e linhas' : 'Clear markers and lines'}>
               {lang === 'pt' ? 'Limpar' : 'Clear'}
             </button>
             <button onClick={undo} className={`rounded-xl border px-2 py-2.5 text-[9px] font-black uppercase ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`} aria-label={t.undo}>
               {lang === 'pt' ? 'Desfazer' : 'Undo'}
             </button>
             <button onClick={redo} className={`rounded-xl border px-2 py-2.5 text-[9px] font-black uppercase ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`} aria-label={t.redo}>
               {lang === 'pt' ? 'Refazer' : 'Redo'}
             </button>
             <button onClick={clearEverything} className="col-span-2 rounded-xl border border-red-200 bg-white px-2 py-2.5 text-[9px] font-black uppercase text-red-600 dark:bg-zinc-950" aria-label={lang === 'pt' ? 'Limpar todo o diagrama' : 'Clear the whole diagram'}>
               {lang === 'pt' ? 'Limpar tudo' : 'Clear all'}
             </button>
           </div>
         )}
         
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
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">v1.8.5 Engine • {lang === 'pt' ? 'Sistema Automático' : 'Automatic System'}</span>
               </div>
            </div>
         </div>
      </div>
      {showWizard && <NewDiagramWizard onCreate={handleNewDiagramCreate} onClose={handleWizardClose} lang={lang} />}
      {showTour && !showWizard && !isExporting && (
        <OnboardingTour
          steps={tourSteps}
          lang={lang}
          isLight={isLight}
          onClose={handleTourClose}
          onStepChange={handleTourStepChange}
        />
      )}
    </div>
  );
};

export default React.memo(FretboardInstance);
