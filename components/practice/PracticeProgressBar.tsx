import React from 'react';

interface PracticeProgressBarProps {
  value: number;
  isLight: boolean;
}

const PracticeProgressBar: React.FC<PracticeProgressBarProps> = ({ value, isLight }) => (
  <div className={`h-2 overflow-hidden rounded-full ${isLight ? 'bg-slate-200' : 'bg-blue-950/50'}`}>
    <div
      className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#22d3ee)] shadow-[0_0_18px_rgba(37,99,235,0.34)] transition-all duration-500"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

export default PracticeProgressBar;
