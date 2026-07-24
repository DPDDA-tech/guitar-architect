import React from 'react';
import type { GuestSpecialist } from '../data/guestSpecialists';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

interface GuestSpecialistCardProps {
  guest: GuestSpecialist;
  isLight: boolean;
  lang: 'pt' | 'en';
}

const GuestSpecialistCard: React.FC<GuestSpecialistCardProps> = ({ guest, isLight, lang }) => {
  const isActive = guest.status === 'active';
  const panelClass = isLight
    ? 'border-zinc-200 bg-white shadow-lg'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';

  if (!isActive) {
    return (
      <article className={`flex h-full min-h-[430px] flex-col overflow-hidden rounded-3xl border border-dashed opacity-75 ${panelClass}`}>
        <div className={`flex aspect-[4/5] items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-zinc-900'}`}>
          <div className={`flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed ${isLight ? 'border-zinc-300 text-zinc-400' : 'border-zinc-700 text-zinc-500'}`}>
            <span className="text-4xl font-light">+</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <span className="w-fit rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">
            {lang === 'pt' ? 'Em breve' : 'Coming soon'}
          </span>
          <h3 className={`mt-3 text-sm font-black uppercase tracking-tight ${isLight ? 'text-zinc-800' : 'text-white'}`}>{guest.specialty[lang]}</h3>
          <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{guest.shortDescription[lang]}</p>
        </div>
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigateTo(`/especialistas/${guest.id}`)}
      aria-label={lang === 'pt' ? `Ver perfil de ${guest.cardName}` : `View ${guest.cardName}'s profile`}
      className={`flex h-full min-h-[430px] flex-col overflow-hidden rounded-3xl border text-left transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${panelClass}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100">
        {guest.cardImage && <img src={guest.cardImage} alt={guest.cardName} className="absolute inset-0 h-full w-full object-cover object-center" />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">{guest.guestBadgeLabel?.[lang] ?? (lang === 'pt' ? 'Especialista convidada' : 'Guest specialist')}</span>
        <h3 className={`mt-3 text-sm font-black uppercase tracking-tight ${isLight ? 'text-zinc-800' : 'text-white'}`}>{guest.cardName}</h3>
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500">{guest.specialty[lang]}</p>
        <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{guest.shortDescription[lang]}</p>
        <p className={`mt-2 text-[9px] italic opacity-60 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{guest.characterTagline?.[lang] ?? (lang === 'pt' ? 'Personagem fictícia · IA' : 'Fictional character · AI')}</p>
        <span className="mt-auto pt-4 text-[10px] font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Ver perfil →' : 'View profile →'}</span>
      </div>
    </button>
  );
};

export default GuestSpecialistCard;
