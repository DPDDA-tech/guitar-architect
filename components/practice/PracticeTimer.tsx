import React from 'react';

interface PracticeTimerProps {
  minutes: number;
  isLight: boolean;
}

const PracticeTimer: React.FC<PracticeTimerProps> = ({ minutes, isLight }) => (
  <div className={`rounded-xl border px-3 py-2 text-center ${isLight ? 'border-blue-100 bg-white text-blue-700' : 'border-blue-900/65 bg-[#0b1424] text-blue-200 shadow-[inset_0_1px_0_rgba(96,165,250,0.05)]'}`}>
    <p className="text-[8px] font-black uppercase tracking-[0.18em] opacity-70">Timer</p>
    <p className="mt-1 text-lg font-black tabular-nums">{String(minutes).padStart(2, '0')}:00</p>
  </div>
);

export default PracticeTimer;
