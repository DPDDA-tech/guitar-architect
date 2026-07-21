import React, { useId } from 'react';

interface MyAcademyRouteTerminalProps {
  kind: 'start' | 'end';
}

const TERMINAL_COLORS: Record<MyAcademyRouteTerminalProps['kind'], { ring: string; glow: string }> = {
  start: { ring: '#67e8f9', glow: '#a5f3fc' },
  end: { ring: '#fcd34d', glow: '#fef3c7' },
};

/**
 * Structural marker for the start/destination of the My Academy route cable —
 * not a P10 plug, not interactive. Kept below the visual weight of the
 * current-node highlight and "Você está aqui" indicator.
 */
const MyAcademyRouteTerminal: React.FC<MyAcademyRouteTerminalProps> = ({ kind }) => {
  const gradientId = `ga-terminal-glow-${useId().replace(/:/g, '')}`;
  const { ring, glow } = TERMINAL_COLORS[kind];

  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.45" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="16" fill={`url(#${gradientId})`} />
      <circle cx="20" cy="20" r="10" fill="#0b1d35" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="20" cy="20" r="10" fill="none" stroke={ring} strokeWidth="1.4" strokeOpacity="0.55" />
      <circle cx="20" cy="20" r="3.2" fill={ring} fillOpacity="0.5" />
    </svg>
  );
};

export default MyAcademyRouteTerminal;
