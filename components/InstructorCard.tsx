import React from 'react';
import type { InstructorProfile } from '../data/instructors';
import { getInstructorCategoryLabel } from '../data/instructors';

const GALLERY_SCROLL_KEY = 'ga_instructors_gallery_scroll';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const navigateToInstructor = (path: string) => {
  try {
    sessionStorage.setItem(GALLERY_SCROLL_KEY, String(window.scrollY));
  } catch {
    // sessionStorage indisponível (ex.: modo privado) — segue sem restaurar posição.
  }
  navigateTo(path);
};

interface InstructorCardProps {
  instructor: InstructorProfile;
  isLight: boolean;
  lang: 'pt' | 'en';
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor, isLight, lang }) => {
  const isAmbassador = instructor.id === 'diana';
  const panelClass = isLight
    ? 'border-zinc-200 bg-white shadow-lg'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';

  const imageFit = instructor.imageFit ?? {};
  const scale = imageFit.scale ?? 1;
  const x = imageFit.x ?? 0;
  const y = imageFit.y ?? 0;

  return (
    <button
      type="button"
      onClick={() => navigateToInstructor(`/instructors/${instructor.id}`)}
      aria-label={lang === 'pt' ? `Ver perfil de ${instructor.name}` : `View ${instructor.name}'s profile`}
      title={instructor.title[lang]}
      className={`flex flex-col overflow-hidden rounded-3xl border text-left transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${panelClass}`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-zinc-100 md:h-56">
        <img
          src={instructor.cardImage}
          alt={instructor.name}
          className="absolute inset-0 h-full w-full object-contain object-bottom"
          style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className={`text-sm font-black uppercase tracking-tight ${isLight ? 'text-zinc-800' : 'text-white'}`}>
          {instructor.name}
        </h3>
        <p className={`text-[11px] font-bold uppercase tracking-widest text-blue-500`}>
          {instructor.title[lang]}
        </p>
        <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {instructor.shortDescription[lang]}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {instructor.categories.map(category => (
            <span
              key={category}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {getInstructorCategoryLabel(category, lang)}
            </span>
          ))}
        </div>

        <p className={`mt-2 text-[9px] italic opacity-60 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {lang === 'pt' ? 'Personagem fictício · IA' : 'Fictional character · AI'}
        </p>

        <div className="mt-4 flex flex-1 items-end justify-between gap-2">
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
              {lang === 'pt' ? 'Perfil disponível' : 'Profile available'}
            </p>
            <p className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {isAmbassador
                ? (lang === 'pt' ? 'Guia da jornada' : 'Journey guide')
                : instructor.unlockLabel[lang]}
            </p>
          </div>
          <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-blue-500">
            {lang === 'pt' ? 'Ver perfil →' : 'View profile →'}
          </span>
        </div>
      </div>
    </button>
  );
};

export default InstructorCard;
