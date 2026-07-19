import React, { useEffect, useRef, useState } from 'react';
import { MY_ACADEMY_CURRICULUM_VERSION } from '../../data/myAcademyCurriculum';
import {
  getMyAcademyPositionMomentId,
  getMyAcademyTerritory,
  type MyAcademyMomentId,
} from '../../utils/myAcademyMapPresentation';
import { isMyAcademyModuleInTerritory } from '../../utils/myAcademyJourneyLandmarks';
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

  return (
    <section id="mapa" className="scroll-mt-20 border-y border-slate-800 bg-slate-950 px-5 py-12 text-white sm:py-16" aria-labelledby="my-academy-map-title">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
              {isPt ? `GPS musical · mapa v${MY_ACADEMY_CURRICULUM_VERSION}` : `Musical GPS · map v${MY_ACADEMY_CURRICULUM_VERSION}`}
            </p>
            <h2 ref={headingRef} tabIndex={-1} id="my-academy-map-title" className="mt-3 text-3xl font-black tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 sm:text-4xl">
              {isPt ? 'Sete territórios em uma jornada aberta.' : 'Seven territories in an open journey.'}
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-300 sm:text-base">
              {isPt
                ? 'Você não precisa atravessar todo o mapa para encontrar algo útil. Cada território pode abrir novas formas de compreender, praticar e criar música.'
                : 'You do not need to cross the entire map to find something useful. Each territory can open new ways to understand, practise and create music.'}
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
            {open ? (isPt ? 'Recolher mapa' : 'Collapse map') : (isPt ? 'Abrir mapa' : 'Open map')}
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
            />
            <MyAcademyTerritoryPanel
              lang={lang}
              territory={selectedTerritory}
              hasSelfRecord={hasSelfRecord}
              selectedModuleId={selectedModuleId}
              onSelectModule={selectModule}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAcademyCurriculumMap;
