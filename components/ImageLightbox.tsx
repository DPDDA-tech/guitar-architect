import React, { useEffect, useRef, useState } from 'react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  closeLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, onClose, src, alt, closeLabel = 'Close', onPrevious, onNext, previousLabel = 'Previous image', nextLabel = 'Next image' }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const onPreviousRef = useRef(onPrevious);
  const onNextRef = useRef(onNext);

  onCloseRef.current = onClose;
  onPreviousRef.current = onPrevious;
  onNextRef.current = onNext;

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }
    const timeout = window.setTimeout(() => setShouldRender(false), 200);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'ArrowLeft') onPreviousRef.current?.();
      if (event.key === 'ArrowRight') onNextRef.current?.();
      if (event.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onTouchStart={event => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={event => {
        if (touchStartX.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        if (Math.abs(distance) > 50) distance > 0 ? onPrevious?.() : onNext?.();
        touchStartX.current = null;
      }}
    >
      <div
        ref={dialogRef}
        className={`relative max-h-[90vh] max-w-[90vw] transition-all duration-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={event => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-zinc-900 text-white shadow-lg transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <CloseIcon />
        </button>
        {onPrevious && (
          <button type="button" onClick={onPrevious} aria-label={previousLabel} className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-zinc-950/75 text-xl text-white transition hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">‹</button>
        )}
        <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
        {onNext && (
          <button type="button" onClick={onNext} aria-label={nextLabel} className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-zinc-950/75 text-xl text-white transition hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">›</button>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
