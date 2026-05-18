import React from 'react';

interface ThemeLockedOverlayProps {
  label: string;
}

const ThemeLockedOverlay: React.FC<ThemeLockedOverlayProps> = ({ label }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-[1.5px]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(148,163,184,0.20),transparent_34%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:100%_7px] opacity-50" />
    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(125,211,252,0.14)_45%,transparent_58%)] opacity-60 transition duration-700 group-hover:translate-x-3" />
    <span className="absolute left-8 top-7 h-1 w-1 rounded-full bg-cyan-100/40" />
    <span className="absolute bottom-8 right-10 h-1 w-1 rounded-full bg-cyan-100/35" />
    <div className="relative rounded-full border border-cyan-100/18 bg-slate-950/76 px-4 py-2.5 text-center shadow-[0_0_32px_rgba(56,189,248,0.12),inset_0_1px_0_rgba(255,255,255,0.10)]">
      <span className="block text-[8px] font-black uppercase tracking-[0.28em] text-cyan-100/50">Undiscovered</span>
      <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.18em] text-white/82">{label}</span>
    </div>
  </div>
);

export default ThemeLockedOverlay;
