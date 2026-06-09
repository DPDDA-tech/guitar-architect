// Guitar Architect — Design System Tokens (Fase L)
// Fonte única de verdade para todas as cores do ecossistema Teens.
// Uso: importe `T` e componha classes com os tokens abaixo.

export const T = {
  // ─── Teens: identidade primária (Violet) ────────────────────────────────────
  teens: {
    // Background de página
    pageDark:  'bg-zinc-950',
    pageLight: 'bg-slate-50',

    // Seções / containers principais
    sectionDark:  'border-violet-800/60 bg-zinc-950/80',
    sectionLight: 'border-slate-200 bg-white/90',

    // Painéis internos (cards de info)
    panelDark:  'border-violet-800/50 bg-zinc-900/60',
    panelLight: 'border-slate-200 bg-slate-50',

    // Label de panel (substituindo text-cyan-400)
    label: 'text-violet-400',

    // Estado ativo de botão/toggle
    activeDark:  'border-violet-400 bg-violet-500/15 text-violet-50',
    activeLight: 'border-violet-500 bg-violet-100 text-violet-900',

    // Hover de botão inativo
    hoverDark:  'hover:border-violet-500',
    hoverLight: 'hover:border-violet-400',

    // Card de instrução / info principal
    infoDark:  'border-violet-500/30 bg-violet-500/8 text-violet-200',
    infoLight: 'border-violet-300 bg-violet-50 text-violet-800',

    // Grid line (pauta de caderno) — inline style, não classes
    gridLineDark:  'rgba(139,92,246,0.18)',
    gridLineLight: 'rgba(148,163,184,0.35)',

    // Gradiente de identidade (CTA principal)
    ctaGradient: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
    ctaGradientHover: 'hover:from-violet-500 hover:to-fuchsia-500',
    ctaShadow: 'shadow-[0_10px_30px_rgba(139,92,246,0.3)]',
  },

  // ─── Teens: acento técnico secundário (Cyan) ────────────────────────────────
  // Usar APENAS para: botão "Ir para Studio", zona de acerto no RhythmLab,
  // marcadores musicais técnicos no fretboard, e o CTA secundário cyan.
  secondary: {
    ctaGradient: 'bg-gradient-to-r from-cyan-600 to-sky-500',
    ctaGradientHover: 'hover:from-cyan-500 hover:to-sky-400',
    ctaShadow: 'shadow-[0_10px_30px_rgba(8,145,178,0.3)]',
  },

  // ─── Botão inativo (neutro) ──────────────────────────────────────────────────
  inactive: {
    dark:  'border-zinc-700 bg-zinc-950 text-zinc-200',
    light: 'border-slate-300 bg-white text-slate-700',
  },

  // ─── Progress bar ────────────────────────────────────────────────────────────
  progressBar: 'bg-gradient-to-r from-violet-500 via-violet-400 to-fuchsia-500',
  progressTrackDark:  'bg-zinc-800',
  progressTrackLight: 'bg-slate-200',
} as const;
