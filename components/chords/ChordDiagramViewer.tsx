import React, { useMemo } from 'react';
import type { ThemeMode } from '../../types';
import FretboardSVG from '../FretboardSVG';
import type { ChordDiagramData } from '../../utils/chordDiagram';
import { createReadonlyFretboardStateFromChordDiagramData } from '../../utils/chordDiagram';

interface ChordDiagramViewerProps {
  diagram: ChordDiagramData;
  theme: ThemeMode;
  isExport?: boolean;
  className?: string;
}

const noop = () => undefined;

const ChordDiagramViewer: React.FC<ChordDiagramViewerProps> = ({
  diagram,
  theme,
  isExport = false,
  className,
}) => {
  const state = useMemo(() => createReadonlyFretboardStateFromChordDiagramData(diagram), [diagram]);

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
