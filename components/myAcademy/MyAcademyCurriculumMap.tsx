import React, { useEffect, useRef, useState } from 'react';
import {
  getMyAcademyPositionMomentId,
  getMyAcademyTerritory,
  type MyAcademyMomentId,
} from '../../utils/myAcademyMapPresentation';
import { isMyAcademyModuleInTerritory } from '../../utils/myAcademyJourneyLandmarks';
import MyAcademyCompanionChooser from './MyAcademyCompanionChooser';
import MyAcademyJourneyRoute from './MyAcademyJourneyRoute';
import MyAcademyTerritoryPanel from './MyAcademyTerritoryPanel';

interface MyAcademyCurriculumMapProps {
  lang: 'pt' | 'en';
  open: boolean;
  isFirstAccess: boolean;
  hasSelfRecord: boolean;
  focusMapRequest: number;
  onOpenChange: (open: boolean) => void;
  onEngage: () => void;
}

const MyAcademyCurriculumMap: React.FC<MyAcademyCurriculumMapProps> = ({
  lang,
  open,
  isFirstAccess,
  hasSelfRecord,
  focusMapRequest,
  onOpenChange,
  onEngage,
}) => {
  const isPt = lang === 'pt';
  const headingRef = useRef<HTMLHeadingElement>(null);
  const companionDetailsRef = useRef<HTMLDetailsElement>(null);
  const [selectedMomentId, setSelectedMomentId] = useState<MyAcademyMomentId>(() => getMyAcademyPositionMomentId(hasSelfRecord));
  const [selectedModuleId, setSelectedModuleId] = useState(() => (
    getMyAcademyTerritory(getMyAcademyPositionMomentId(hasSelfRecord)).modules[0]?.id ?? ''
  ));
  const selectedTerritory = getMyAcademyTerritory(selectedMomentId);

  useEffect(() => {
    const positionMomentId = getMyAcademyPositionMomentId(hasSelfRecord);
    setSelectedMomentId(positionMomentId);
    setSelectedModuleId(getMyAcademyTerritory(positionMomentId).modules[0]?.id ?? '');
  }, [hasSelfRecord]);

  useEffect(() => {
    if (focusMapRequest === 0 || !open) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [focusMapRequest, open]);

  const selectTerritory = (momentId: MyAcademyMomentId) => {
    onEngage();
    setSelectedMomentId(momentId);
    setSelectedModuleId(getMyAcademyTerritory(momentId).modules[0]?.id ?? '');
  };

  const selectModule = (moduleId: string) => {
    if (!isMyAcademyModuleInTerritory(selectedMomentId, moduleId)) return;
    onEngage();
    setSelectedModuleId(moduleId);
  };

  const openCharacterInteraction = () => {
    onEngage();
    const details = companionDetailsRef.current;
    if (!details) return;
    details.open = true;
    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      details.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  };

  return (
    <section id="mapa" className="scroll-mt-20 border-y border-slate-800 bg-slate-950 px-5 py-12 text-white sm:py-16" aria-labelledby="my-academy-map-title">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
              {isPt ? 'Sua turnê musical' : 'Your musical tour'}
            </p>
            <h2 ref={headingRef} tabIndex={-1} id="my-academy-map-title" className="mt-3 text-3xl font-black tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 sm:text-4xl">
              {isPt ? 'Sete territórios em uma jornada aberta.' : 'Seven territories in an open journey.'}
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-300 sm:text-base">
              {isPt
                ? 'Você não precisa atravessar toda a turnê para encontrar algo útil. Cada território pode abrir novas formas de compreender, praticar e criar música.'
                : 'You do not need to cross the entire tour to find something useful. Each territory can open new ways to understand, practise and create music.'}
            </p>
            <p className="mt-3 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-amber-100">
              {isPt ? 'Direção sem julgamento · exploração sem bloqueio' : 'Direction without judgement · exploration without locks'}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="my-academy-map-content"
            onClick={() => {
              onEngage();
              onOpenChange(!open);
            }}
            className="min-h-11 rounded-full border border-cyan-400/45 bg-cyan-400/10 px-5 text-xs font-bold uppercase tracking-[0.1em] text-cyan-100 transition hover:border-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            {open ? (isPt ? 'Recolher turnê' : 'Collapse tour') : (isPt ? 'Abrir turnê' : 'Open tour')}
          </button>
        </div>

        {open && (
          <div id="my-academy-map-content">
            <MyAcademyJourneyRoute
              lang={lang}
              selectedMomentId={selectedMomentId}
              selectedTerritory={selectedTerritory}
              selectedModuleId={selectedModuleId}
              hasSelfRecord={hasSelfRecord}
              animateRoute={isFirstAccess}
              onSelect={selectTerritory}
              onSelectModule={selectModule}
              onOpenCharacters={openCharacterInteraction}
            />
            <MyAcademyTerritoryPanel
              lang={lang}
              territory={selectedTerritory}
              hasSelfRecord={hasSelfRecord}
              selectedModuleId={selectedModuleId}
              onSelectModule={selectModule}
            />
            <details ref={companionDetailsRef} className="group mt-6 rounded-3xl border border-cyan-900/70 bg-[#07111f]">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                    {isPt ? 'Encontros da turnê' : 'Tour encounters'}
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {isPt ? 'Conversar com Clara e escolher Alice ou Arthur' : 'Talk with Clara and choose Alice or Arthur'}
                  </p>
                </div>
                <span aria-hidden="true" className="text-xl font-black text-cyan-300 transition group-open:rotate-45">+</span>
              </summary>
              <div className="border-t border-cyan-900/60 p-4 sm:p-5">
                <MyAcademyCompanionChooser lang={lang} compact />
              </div>
            </details>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAcademyCurriculumMap;
