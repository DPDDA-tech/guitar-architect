
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import FretboardSVG from './FretboardSVG';
import PracticeTools from './PracticeTools';
import OnboardingTour, { TourStep } from './OnboardingTour';
import { CHROMATIC_SCALE, INSTRUMENT_PRESETS, getNoteAt, TUNINGS_PRESETS, getFretForNote } from '../music/musicTheory';
import { SCALES } from '../music/scales';
import { DEGREE_NAMES, CHORD_QUALITIES } from '../music/harmony';
import { translations, Lang } from '../i18n';
import { FretboardState, EditorMode, MarkerShape, ThemeMode, StringStatus, InstrumentType, LineThickness, TuningKey, CagedShape, Note } from '../types';
import NewDiagramWizard from './NewDiagramWizard';
import { getMusicTip, MusicTip } from '../utils/musicTips';
import { getFrequencyForPosition, playChord, playSingleNote } from '../utils/audio';
import {
  CHORD_TYPES,
  ChordType,
  ChordVoicingCandidate,
  generateChordVoicings,
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


const FretboardInstance: React.FC<FretboardInstanceProps> = ({ 
  state, updateState, onRemove, onMove, onAdd, isFirst, isLast, diagramNumber, theme, lang, isExporting = false, globalTranspose = 0, onGlobalTranspose, showTips = true, onToggleTips
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
  const noteClickTimeoutRef = useRef<number | null>(null);
  const creationHintTimeoutRef = useRef<number | null>(null);
  
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
    };
  }, []);

  useEffect(() => {
    const closePanels = () => setIsControlPanelOpen(false);
    const openPanel = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: string; chordMode?: 'find' | 'identify'; tool?: 'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes' }>).detail;
      if (!detail?.tab) return;
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
  }, []);

  const isLight = isExporting ? true : (theme === 'light');
  const isFretboardEmpty = state.markers.length === 0 && state.lines.length === 0;
  const PRESET_COLORS = ['#ef4444', '#2563eb', '#22c55e', '#eab308', '#000000', '#6366f1', '#ec4899'];
  const OBS_LIMIT = 1500;
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [activeControlTab, setActiveControlTab] = useState<string>('base');
  const [preferredPracticeTool, setPreferredPracticeTool] = useState<'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes' | undefined>(undefined);
  const [showWizard, setShowWizard] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const tourReturnStateRef = useRef<{ isControlPanelOpen: boolean; activeControlTab: string; chordLibraryMode: 'find' | 'identify'; state: FretboardState; editorMode: EditorMode } | null>(null);
  const tourAutoScheduledRef = useRef(false);
  const [scaleShortcutCloseTarget, setScaleShortcutCloseTarget] = useState<'showScale' | 'showTonic' | null>(null);
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

  const openTour = useCallback(() => {
    tourReturnStateRef.current = { isControlPanelOpen, activeControlTab, chordLibraryMode, state, editorMode };
    setShowTour(true);
  }, [activeControlTab, chordLibraryMode, editorMode, isControlPanelOpen, state]);

  useEffect(() => {
    if (isFirst && typeof window !== 'undefined' && window.localStorage) {
      if (!window.localStorage.getItem('ga_onboarding_completed')) {
        setWizardMode('initial');
        setShowWizard(true);
      } else if (!window.localStorage.getItem('ga_tour_completed') && !tourAutoScheduledRef.current) {
        tourAutoScheduledRef.current = true;
        window.setTimeout(openTour, 900);
      }
    }
  }, [isFirst, openTour]);

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
            ? 'Em Pratica ficam metronomo, afinador, intervalos, exercicios e trocas de acordes.'
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
      title: lang === 'pt' ? 'Editor' : 'Editor',
      body: lang === 'pt'
        ? 'Personalize o fretboard com marcadores, linhas, cores, dedos e observacoes.'
        : 'Customize the fretboard with markers, lines, colors, fingers, and notes.'
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
      title: lang === 'pt' ? 'Prática' : 'Practice',
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
      editor: 'editor',
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
    if (typeof window !== 'undefined' && window.localStorage && !window.localStorage.getItem('ga_tour_completed')) {
      window.setTimeout(openTour, 500);
    }
  };

  const controlTabs = [
    { id: 'base', label: 'Base' },
    { id: 'visual', label: lang === 'pt' ? 'Camadas' : 'Layers' },
    { id: 'scale', label: lang === 'pt' ? 'Escala' : 'Scale' },
    { id: 'harmony', label: lang === 'pt' ? 'Harmonia' : 'Harmony' },
    { id: 'editor', label: lang === 'pt' ? 'Editor' : 'Editor' },
    { id: 'chords', label: lang === 'pt' ? 'Acordes' : 'Chords' },
    { id: 'tools', label: lang === 'pt' ? 'Prática' : 'Practice' },
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
  const handleScaleLayerShortcut = (layer: 'showScale' | 'showTonic') => {
    const isScalePanelOpen = activeControlTab === 'scale' && isControlPanelOpen;
    const isLayerActive = state.layers[layer];

    if (isScalePanelOpen && !isLayerActive && scaleShortcutCloseTarget === layer) {
      setIsControlPanelOpen(false);
      setScaleShortcutCloseTarget(null);
      return;
    }

    if (!isScalePanelOpen || !isLayerActive) {
      recordAction({...state, layers: {...state.layers, [layer]: true}});
      setActiveControlTab('scale');
      setIsControlPanelOpen(true);
      setScaleShortcutCloseTarget(null);
      return;
    }

    recordAction({...state, layers: {...state.layers, [layer]: false}});
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
            <button key={m} onClick={() => recordAction({...state, labelMode: m as any})} className={`${controlButtonBase} px-3 ${state.labelMode === m ? activeButtonClass : inactiveButtonClass}`}>
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
    if (activeControlTab === 'base') {
      return (
        <div className="space-y-4">
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
                <button key={m} onClick={() => recordAction({...state, labelMode: m as any})} className={`${controlButtonBase} ${state.labelMode === m ? activeButtonClass : inactiveButtonClass}`}>
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
    <div className={`diagram-container p-4 lg:p-10 rounded-[28px] lg:rounded-[48px] border shadow-2xl transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
      
      {/* HEADER DIAGRAMA */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between mb-5 lg:mb-10 gap-4 ${isExporting ? 'hidden-operational-btns' : ''}`}>
        <div className="flex-1">
          <div className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${isLight ? 'border-blue-100 bg-blue-50 text-blue-600' : 'border-blue-900/40 bg-blue-950/30 text-blue-300'}`}>
            {lang === 'pt' ? 'Diagrama' : 'Diagram'} {diagramNumber}
          </div>
          <input value={state.title} onChange={e => recordAction({...state, title: e.target.value})} className={`bg-transparent text-lg lg:text-3xl font-black italic uppercase tracking-tighter focus:outline-none w-full ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`} placeholder={t.titlePlaceholder} />
          <input value={state.subtitle} onChange={e => recordAction({...state, subtitle: e.target.value})} className="bg-transparent text-[10px] lg:text-lg font-bold text-zinc-400 focus:outline-none w-full uppercase tracking-wide mt-1" placeholder={t.subtitle} />
        </div>
        <div className="grid grid-cols-2 gap-2 shrink-0 operational-btns sm:flex sm:flex-wrap">
           <button onClick={() => setIsControlPanelOpen(prev => !prev)} className={`px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl font-black text-[10px] lg:text-[11px] uppercase border transition-all active:scale-90 ${isControlPanelOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
              {lang === 'pt' ? 'CONTROLES' : 'TOOLS'}
           </button>
           <button onClick={openTour} className={`px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl font-black text-[10px] lg:text-[11px] uppercase border transition-all active:scale-95 ${isLight ? 'bg-white text-zinc-500 border-zinc-200 hover:text-blue-600' : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:text-blue-300'}`}>
              {lang === 'pt' ? 'Tutorial' : 'Tutorial'}
           </button>
           <button data-tour="new-diagram" onClick={handleNewDiagramClick} className="bg-blue-600 px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl text-white font-black text-[10px] lg:text-[11px] uppercase active:scale-95 shadow-lg shadow-blue-500/20">{lang === 'pt' ? 'Novo diagrama' : 'New diagram'}</button>
           <button onClick={createQuickDiagram} className="bg-blue-50 px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl border border-blue-200 text-blue-700 font-black text-[10px] md:text-[11px] uppercase active:scale-95">{lang === 'pt' ? 'Novo diagrama rápido' : 'Quick new diagram'}</button>
           <button onClick={() => onAdd(state)} className="bg-zinc-800 px-3 py-2.5 lg:px-5 lg:py-3.5 rounded-xl text-white font-black text-[10px] lg:text-[11px] uppercase active:scale-95">{lang === 'pt' ? 'Duplicar este diagrama' : 'Duplicate this diagram'}</button>
           <div className="flex gap-1.5 items-center bg-blue-50 dark:bg-zinc-800 p-1.5 rounded-xl border border-blue-200 dark:border-zinc-700 shadow-sm [&>button]:bg-white [&>button]:text-zinc-800 [&>button]:border [&>button]:border-zinc-300 [&>button]:shadow-sm">
              <button onClick={() => onMove('up')} disabled={isFirst} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↑</button>
              <button onClick={() => onMove('down')} disabled={isLast} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 disabled:opacity-20 hover:bg-white transition-colors">↓</button>
           </div>
           <button onClick={onRemove} className="bg-red-50 text-red-600 w-11 h-11 flex items-center justify-center rounded-xl font-black text-xl transition-colors hover:bg-red-100">×</button>
        </div>
      </div>

      {isFretboardEmpty && !isExporting && (
        <div className={`mb-4 grid grid-cols-2 gap-2 rounded-2xl border p-3 lg:hidden ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
          <button onClick={applyBeginnerScale} className="rounded-xl bg-blue-600 px-3 py-3 text-[10px] font-black uppercase text-white shadow-sm" aria-label={lang === 'pt' ? 'Explorar escala de Do maior' : 'Explore C major scale'}>
            {lang === 'pt' ? 'Explorar escalas' : 'Explore scales'}
          </button>
          <button onClick={() => openMobileTab('chords')} className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`} aria-label={lang === 'pt' ? 'Abrir biblioteca de acordes' : 'Open chord library'}>
            {lang === 'pt' ? 'Aprender acordes' : 'Learn chords'}
          </button>
          <button onClick={() => openMobileTab('tools')} className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`} aria-label={lang === 'pt' ? 'Iniciar pratica' : 'Start practice'}>
            {lang === 'pt' ? 'Iniciar pratica' : 'Start practice'}
          </button>
          <button onClick={openTour} className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`} aria-label={lang === 'pt' ? 'Abrir tutorial guiado' : 'Open guided tutorial'}>
            Tutorial
          </button>
        </div>
      )}

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

      <div className={`operational-btns mb-5 hidden lg:block ${isExporting ? 'hidden' : ''}`}>
        <div className={`flex flex-col gap-3 rounded-2xl border px-3 py-3 shadow-sm ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
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
            <button data-tour="quick-editor" onClick={() => toggleQuickPanel('editor')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'editor' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Editor' : 'Editor'}
            </button>
            <button data-tour="quick-chords" onClick={() => { setChordLibraryMode('find'); toggleQuickPanel('chords'); }} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'chords' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Acorde' : 'Chord'}
            </button>
            <button data-tour="quick-practice" onClick={() => toggleQuickPanel('tools')} className={`${quickButtonClass} shrink-0 ${activeControlTab === 'tools' && isControlPanelOpen ? quickActiveButtonClass : ''}`}>
              {lang === 'pt' ? 'Prática' : 'Practice'}
            </button>
            <button onClick={() => setSoundEnabled(prev => !prev)} className={`${quickButtonClass} shrink-0 ${soundEnabled ? quickActiveButtonClass : ''}`}>
              {soundEnabled ? (lang === 'pt' ? 'Som ON' : 'Sound ON') : (lang === 'pt' ? 'Som OFF' : 'Sound OFF')}
            </button>
          </div>
          {renderQuickControls()}
        </div>
      </div>

      <div className={`operational-btns fixed inset-x-0 bottom-0 z-[75] border-t px-2 pb-2 pt-1 shadow-2xl lg:hidden ${isExporting ? 'hidden' : ''} ${isLight ? 'bg-white/95 border-zinc-200' : 'bg-zinc-950/95 border-zinc-800'}`}>
        <div className="grid grid-cols-5 gap-1">
          <button data-tour="mobile-scales" onClick={() => openMobileTab('scale')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'scale' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Escalas' : 'Scales'}>
            {lang === 'pt' ? 'Escalas' : 'Scales'}
          </button>
          <button data-tour="quick-chords" onClick={() => openMobileTab('chords')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'chords' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Acordes' : 'Chords'}>
            {lang === 'pt' ? 'Acordes' : 'Chords'}
          </button>
          <button data-tour="quick-harmony" onClick={() => openMobileTab('harmony')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'harmony' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Harmonia' : 'Harmony'}>
            Harm.
          </button>
          <button data-tour="quick-practice" onClick={() => openMobileTab('tools')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'tools' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Pratica' : 'Practice'}>
            {lang === 'pt' ? 'Pratica' : 'Practice'}
          </button>
          <button data-tour="quick-base" onClick={() => openMobileTab('base')} className={`rounded-xl px-1 py-2 text-[9px] font-black uppercase ${activeControlTab === 'base' && isControlPanelOpen ? 'bg-blue-600 text-white' : isLight ? 'text-zinc-600' : 'text-zinc-300'}`} aria-label={lang === 'pt' ? 'Mais opcoes' : 'More options'}>
            {lang === 'pt' ? 'Mais' : 'More'}
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

          <div className="grid grid-cols-4 gap-1 mb-4">
            {controlTabs.map(tab => (
              <button
                key={tab.id}
                data-tour={tab.id === 'base' ? 'quick-base' : tab.id === 'visual' ? 'quick-layers' : tab.id === 'tools' ? 'quick-practice' : `quick-${tab.id}`}
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
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">v1.8.4 Engine • {lang === 'pt' ? 'Sistema Automático' : 'Automatic System'}</span>
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
