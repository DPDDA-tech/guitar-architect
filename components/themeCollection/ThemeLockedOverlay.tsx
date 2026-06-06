import React from 'react';

interface ThemeLockedOverlayProps {
  label: string;
}

const ThemeLockedOverlay: React.FC<ThemeLockedOverlayProps> = ({ label }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/24 backdrop-blur-[1.2px]">
    <div className="relative flex flex-col items-center gap-1.5 rounded-full border border-white/32 bg-black/34 px-4 py-2.5 text-center">
      <span className="text-xl" role="img" aria-label={label}>🔒</span>
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white">{label}</span>
    </div>
  </div>
);

export default ThemeLockedOverlay;
