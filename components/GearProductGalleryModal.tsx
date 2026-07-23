import React, { useEffect, useMemo, useRef, useState } from 'react';

type AppLang = 'pt' | 'en';

interface GearModalVariant {
  id: string;
  label: string;
  image: string;
}

interface GearModalProduct {
  id: string;
  name: string;
  image: string;
  gallery?: string[];
  variants?: GearModalVariant[];
}

interface GearModalImage {
  id: string;
  label: string;
  image: string;
  group: 'main' | 'variant' | 'gallery';
}

const GEAR_PLACEHOLDER_IMAGE = '/gear/shared/product-placeholder.webp';

const handleModalImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (!image.dataset.fallbackApplied) {
    image.dataset.fallbackApplied = 'true';
    image.src = GEAR_PLACEHOLDER_IMAGE;
  }
};

interface GearProductGalleryModalProps {
  product: GearModalProduct;
  lang: AppLang;
  isLight: boolean;
  onClose: () => void;
}

const GearProductGalleryModal: React.FC<GearProductGalleryModalProps> = ({ product, lang, isLight, onClose }) => {
  const isPt = lang === 'pt';
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const images = useMemo<GearModalImage[]>(() => {
    const list: GearModalImage[] = [{ id: 'main', label: product.name, image: product.image, group: 'main' }];
    (product.variants ?? []).forEach(variant => {
      list.push({ id: `variant-${variant.id}`, label: variant.label, image: variant.image, group: 'variant' });
    });
    (product.gallery ?? []).forEach((image, index) => {
      list.push({ id: `gallery-${index}`, label: isPt ? `Vista ${index + 1}` : `View ${index + 1}`, image, group: 'gallery' });
    });
    return list;
  }, [product, isPt]);

  const [activeId, setActiveId] = useState(images[0]?.id ?? 'main');
  const activeImage = images.find(item => item.id === activeId) ?? images[0];

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('[data-modal-initial-focus]')?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
        const first = list[0];
        const last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  const variantImages = images.filter(item => item.group === 'variant');
  const galleryImages = images.filter(item => item.group === 'gallery');

  const panelClass = isLight ? 'border-zinc-200 bg-white' : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.97)]';
  const thumbBase = isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-700 bg-zinc-900/60';
  const thumbActive = isLight ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-400 ring-2 ring-blue-500/50';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isPt ? `Imagens de ${product.name}` : `Images of ${product.name}`}
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 ${panelClass}`}
      >
        <button
          type="button"
          data-modal-initial-focus
          onClick={onClose}
          aria-label={isPt ? 'Fechar' : 'Close'}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${isLight ? 'border-zinc-300 bg-white text-zinc-600 hover:border-blue-400' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-blue-500'}`}
        >
          ✕
        </button>

        <h3 className="pr-10 text-sm font-black uppercase tracking-tight">{product.name}</h3>

        <div className={`mt-4 overflow-hidden rounded-2xl border ${thumbBase}`}>
          <img
            src={activeImage.image}
            alt={activeImage.label}
            loading="lazy"
            onError={handleModalImageError}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        {variantImages.length > 0 && (
          <div className="mt-5">
            <p className={`mb-2 text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {isPt ? 'Variações em estudo' : 'Variations under study'}
            </p>
            <div className="flex flex-wrap gap-2">
              {variantImages.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  aria-pressed={activeId === item.id}
                  aria-label={item.label}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${activeId === item.id ? thumbActive : thumbBase}`}
                >
                  <img src={item.image} alt={item.label} loading="lazy" onError={handleModalImageError} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {galleryImages.length > 0 && (
          <div className="mt-5">
            <p className={`mb-2 text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {isPt ? 'Outras vistas' : 'Other views'}
            </p>
            <div className="flex flex-wrap gap-2">
              {galleryImages.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  aria-pressed={activeId === item.id}
                  aria-label={item.label}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${activeId === item.id ? thumbActive : thumbBase}`}
                >
                  <img src={item.image} alt={item.label} loading="lazy" onError={handleModalImageError} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GearProductGalleryModal;
