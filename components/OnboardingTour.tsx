import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lang } from '../i18n';

export interface TourStep {
  id: string;
  target?: string;
  title: string;
  body: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  lang: Lang;
  isLight: boolean;
  onClose: (completed: boolean) => void;
  onStepChange?: (step: TourStep, index: number) => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, lang, isLight, onClose, onStepChange }) => {
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = steps[index];

  const viewport = useMemo(() => ({
    width: typeof window === 'undefined' ? 1024 : window.innerWidth,
    height: typeof window === 'undefined' ? 768 : window.innerHeight
  }), [index]);

  const updateTargetRect = useCallback(() => {
    if (!step?.target || typeof document === 'undefined') {
      setTargetRect(null);
      return;
    }
    const elements = Array.from(document.querySelectorAll<HTMLElement>(step.target));
    const element = elements.find(candidate => {
      const rect = candidate.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) || null;
    setTargetRect(element ? element.getBoundingClientRect() : null);
  }, [step]);

  useEffect(() => {
    if (!step) return;
    onStepChange?.(step, index);
    if (step.target) {
      const element = Array.from(document.querySelectorAll<HTMLElement>(step.target)).find(candidate => {
        const rect = candidate.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    const raf = window.setTimeout(updateTargetRect, 80);
    return () => window.clearTimeout(raf);
  }, [index, onStepChange, step, updateTargetRect]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  if (!step) return null;

  const cardPosition = targetRect
    ? {
        left: Math.min(Math.max(16, targetRect.left), Math.max(16, viewport.width - 380)),
        top: targetRect.bottom + 18 > viewport.height - 220 ? Math.max(16, targetRect.top - 230) : targetRect.bottom + 18
      }
    : {
        left: Math.max(16, (viewport.width - 360) / 2),
        top: Math.max(80, viewport.height * 0.2)
      };

  return (
    <div className="fixed inset-0 z-[180] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      {targetRect && (
        <div
          className="absolute rounded-2xl border-2 border-blue-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.48),0_0_30px_rgba(37,99,235,0.65)] transition-all"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
        />
      )}
      <div
        className={`absolute w-[min(360px,calc(100vw-32px))] rounded-2xl border p-5 shadow-2xl pointer-events-auto ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'}`}
        style={cardPosition}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-600">
            {index + 1}/{steps.length}
          </span>
          <button onClick={() => onClose(false)} className="text-[9px] font-black uppercase text-zinc-400 hover:text-red-500">
            {lang === 'pt' ? 'Pular' : 'Skip'}
          </button>
        </div>
        <h3 className="text-lg font-black uppercase tracking-tight">{step.title}</h3>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">{step.body}</p>
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={() => setIndex(prev => Math.max(0, prev - 1))}
            disabled={index === 0}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[9px] font-black uppercase text-zinc-500 disabled:opacity-40"
          >
            {lang === 'pt' ? 'Anterior' : 'Back'}
          </button>
          <button
            onClick={() => {
              if (index >= steps.length - 1) {
                onClose(true);
                return;
              }
              setIndex(prev => prev + 1);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-[9px] font-black uppercase text-white"
          >
            {index >= steps.length - 1 ? (lang === 'pt' ? 'Concluir' : 'Finish') : (lang === 'pt' ? 'Proximo' : 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
