import React, { useEffect, useRef, useState } from 'react';
import type { AppLang, InstructorActionGallery as InstructorActionGalleryData } from '../data/instructors';
import ImageLightbox from './ImageLightbox';

interface InstructorActionGalleryProps {
  gallery: InstructorActionGalleryData;
  lang: AppLang;
  isLight: boolean;
  title: string;
}

const ArrowIcon = ({ direction }: { direction: 'previous' | 'next' }) => (
  <svg className={direction === 'previous' ? 'rotate-180' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const InstructorActionGallery: React.FC<InstructorActionGalleryProps> = ({ gallery, lang, isLight, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [gallery]);

  const selectImage = (index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const move = (direction: number) => {
    selectImage((activeIndex + direction + gallery.images.length) % gallery.images.length);
  };

  const activeImage = gallery.images[activeIndex];
  const previousLabel = lang === 'pt' ? 'Imagem anterior' : 'Previous image';
  const nextLabel = lang === 'pt' ? 'Próxima imagem' : 'Next image';

  return (
    <section className="mt-10" aria-labelledby="instructor-action-title">
      <h2 id="instructor-action-title" className="text-sm font-black uppercase tracking-tight">{title}</h2>
      <p className={`mt-1 max-w-3xl text-xs md:text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
        {gallery.subtitle[lang]}
      </p>

      <div className="relative mt-5">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[9%] py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[18%] lg:px-[25%]">
          {gallery.images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.src}
                ref={element => { itemRefs.current[index] = element; }}
                type="button"
                onClick={() => isActive ? setLightboxOpen(true) : selectImage(index)}
                aria-label={isActive
                  ? `${lang === 'pt' ? 'Ampliar' : 'Enlarge'}: ${image.alt[lang]}`
                  : `${lang === 'pt' ? 'Selecionar' : 'Select'}: ${image.alt[lang]}`}
                aria-current={isActive ? 'true' : undefined}
                className={`relative w-[82%] shrink-0 snap-center overflow-hidden rounded-xl border transition duration-300 sm:w-[64%] lg:w-[48%] ${isActive ? 'scale-100 opacity-100 shadow-xl' : 'scale-[0.94] opacity-65 hover:opacity-90'} ${isLight ? 'border-zinc-200 bg-zinc-100' : 'border-blue-950/70 bg-zinc-900'}`}
              >
                <img
                  src={image.src}
                  alt={image.alt[lang]}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video h-auto w-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {gallery.images.length > 1 && (
          <>
            <button type="button" onClick={() => move(-1)} aria-label={previousLabel} className={`absolute left-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition sm:flex ${isLight ? 'border-zinc-200 bg-white/90 text-zinc-700 hover:border-blue-400' : 'border-white/15 bg-zinc-950/85 text-white hover:border-blue-500'}`}>
              <ArrowIcon direction="previous" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label={nextLabel} className={`absolute right-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition sm:flex ${isLight ? 'border-zinc-200 bg-white/90 text-zinc-700 hover:border-blue-400' : 'border-white/15 bg-zinc-950/85 text-white hover:border-blue-500'}`}>
              <ArrowIcon direction="next" />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-1.5" aria-label={lang === 'pt' ? 'Selecionar imagem' : 'Select image'}>
        {gallery.images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => selectImage(index)}
            aria-label={`${lang === 'pt' ? 'Imagem' : 'Image'} ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-blue-500' : `w-4 ${isLight ? 'bg-zinc-300 hover:bg-zinc-400' : 'bg-zinc-700 hover:bg-zinc-600'}`}`}
          />
        ))}
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={activeImage.src}
        alt={activeImage.alt[lang]}
        closeLabel={lang === 'pt' ? 'Fechar' : 'Close'}
        onPrevious={gallery.images.length > 1 ? () => move(-1) : undefined}
        onNext={gallery.images.length > 1 ? () => move(1) : undefined}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
      />
    </section>
  );
};

export default InstructorActionGallery;
