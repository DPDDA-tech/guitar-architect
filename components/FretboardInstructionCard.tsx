import React from 'react';

export type FretboardInstruction = {
  title?: string;
  description: string;
  hint?: string;
  focusArea?: string;
  source?: 'learn' | 'practice' | 'exercise';
  durationMs?: number;
  persistent?: boolean;
};

interface FretboardInstructionCardProps {
  instruction: FretboardInstruction;
  isLight: boolean;
  lang: 'pt' | 'en';
  onClose: () => void;
}

export const FretboardInstructionCard: React.FC<FretboardInstructionCardProps> = ({
  instruction,
  isLight,
  lang,
  onClose,
}) => {
  return (
    <div 
      className={`
        fixed z-[90] pointer-events-auto
        bottom-20 right-3 md:bottom-10 md:right-10
        w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px]
        rounded-[24px] md:rounded-[32px] border p-4 md:p-6
        animate-in fade-in slide-in-from-bottom-6 duration-700
        shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        backdrop-blur-xl
        ${isLight 
          ? 'bg-white/92 border-blue-100 text-zinc-900 shadow-blue-900/10' 
          : 'bg-[#0a0f1d]/90 border-blue-500/30 text-white shadow-blue-950/50'}
      `}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 pointer-events-none rounded-[24px] md:rounded-[32px] ${isLight ? 'bg-gradient-to-br from-blue-500/5 to-transparent' : 'bg-gradient-to-br from-blue-500/10 to-transparent'}`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">
            {instruction.source === 'practice' ? (lang === 'pt' ? 'Treino Contextual' : 'Contextual Practice') : (lang === 'pt' ? 'Orientação de Estudo' : 'Study Guidance')}
          </p>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-red-500 transition-colors text-lg leading-none p-1"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {instruction.title && (
          <h3 className="text-base md:text-lg font-black italic uppercase tracking-tighter mb-1.5 md:mb-2">
            {instruction.title}
          </h3>
        )}

        <p className={`text-xs md:text-sm font-bold leading-relaxed mb-3 md:mb-4 ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
          {instruction.description}
        </p>

        {instruction.hint && (
          <div className={`rounded-xl md:rounded-2xl p-2.5 md:p-3 border border-dashed flex items-start gap-2.5 md:gap-3 ${isLight ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-950/20 border-blue-800/50'}`}>
            <span className="text-sm md:text-base">💡</span>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-tight leading-tight text-blue-400">
              <span className="opacity-60 block mb-0.5">{lang === 'pt' ? 'Dica:' : 'Hint:'}</span>
              {instruction.hint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};