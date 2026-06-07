import React, { useMemo } from 'react';
import type { FretboardState, ThemeMode } from '../../types';
import FretboardSVG from '../FretboardSVG';
import type { ChordDiagramData } from '../../utils/chordDiagram';
import { createReadonlyFretboardStateFromChordDiagramData } from '../../utils/chordDiagram';

export type ChordDiagramDisplayMode = 'none' | 'note-chord' | 'note-all' | 'interval-chord' | 'interval-all';

interface ChordDiagramViewerProps {
  diagram: ChordDiagramData;
  theme: ThemeMode;
  isExport?: boolean;
  isLeftHanded?: boolean;
  displayMode?: ChordDiagramDisplayMode;
  visibleFrets?: number;
  className?: string;
}

const noop = () => undefined;

const ChordDiagramViewer: React.FC<ChordDiagramViewerProps> = ({
  diagram,
  theme,
  isExport = false,
  isLeftHanded = false,
  displayMode = 'none',
  visibleFrets = 5,
  className,
}) => {
  const state = useMemo(() => {
    const baseState = createReadonlyFretboardStateFromChordDiagramData(
      { ...diagram, visibleFrets },
      isLeftHanded
    );
    const nextState: FretboardState = {
      ...baseState,
      labelMode:
        displayMode === 'note-chord' || displayMode === 'note-all'
          ? 'note'
          : displayMode === 'interval-chord' || displayMode === 'interval-all'
            ? 'interval'
            : 'none',
      layers: {
        ...baseState.layers,
        showAllNotes: displayMode === 'note-all' || displayMode === 'interval-all',
        showTonic: false,
      },
    };
    return nextState;
  }, [diagram, displayMode, isLeftHanded, visibleFrets]);

  return (
    <div className={className}>
      <FretboardSVG
        state={state}
        editorMode="view"
        onEvent={noop}
        selectedColor="#2563eb"
        selectedShape="circle"
        theme={theme}
        isActive={false}
        isExport={isExport}
      />
    </div>
  );
};

export default ChordDiagramViewer;
