import React, { useEffect, useRef, useState } from 'react';
import {
  getMyAcademyPositionMomentId,
  getMyAcademyTerritory,
  type MyAcademyMomentId,
} from '../../utils/myAcademyMapPresentation';
import { isMyAcademyModuleInTerritory } from '../../utils/myAcademyJourneyLandmarks';
import { getMyAcademyEncounterProfiles, type MyAcademyEncounterProfile } from '../../utils/myAcademyEncounters';
import { navigateToPath } from '../../utils/fretboardNavigation';
import {
  loadMyAcademyReturnContext,
  saveMyAcademyReturnContext,
} from '../../utils/myAcademyReturnContext';
import MyAcademyCompanionIntro from './MyAcademyCompanionIntro';
import MyAcademyJourneyRoute from './MyAcademyJourneyRoute';
import MyAcademyTerritoryPanel from './MyAcademyTerritoryPanel';

const ENCOUNTER_KIND_LABEL: Record<MyAcademyEncounterProfile['kind'], { pt: string; en: string }> = {
  guidance: { pt: 'Orientação', en: 'Guidance' },
  lesson: { pt: 'Conteúdo', en: 'Lesson' },
  'specialist-intervention': { pt: 'Intervenção especializada', en: 'Specialist intervention' },
};

interface MyAcademyCurriculumMapProps {
  lang: 'pt' | 'en';
  open: boolean;
  isFirstAccess: boolean;
  hasSelfRecord: boolean;
  focusMapRequest: number;
  onOpenChange: (open: boolean) => void;
  onEngage: () => void;
}

const MyAcademyCurriculumMap: React.FC<MyAcademyCurriculumMapProps> = ({ lang, open, isFirstAccess, hasSelfRecord, focusMapRequest, onOpenChange, onEngage }) => {
  const isPt = lang === 'pt';
  const headingRef = useRef<HTMLHeadingElement>(null);
  const savedContext = loadMyAcademyReturnContext();
  const returningToMap = Boolean(savedContext?.itemId || savedContext?.destination);
  const effectiveOpen = open || returningToMap;
  const defaultMomentId = savedContext?.selectedMomentId ?? getMyAcademyPositionMomentId(hasSelfRecord);
  const [selectedMomentId, setSelectedMomentId] = useState<MyAcademyMomentId>(defaultMomentId);
  const [selectedModuleId, setSelectedModuleId] = useState(() => {
    const savedModule = savedContext?.selectedModuleId;
    return savedModule && isMyAcademyModuleInTerritory(defaultMomentId, savedModule)
      ? savedModule
      : getMyAcademyTerritory(defaultMomentId).modules[0]?.id ?? '';
  });
  const selectedTerritory = getMyAcademyTerritory(selectedMomentId);

  useEffect(() => {
    if (savedContext) return;
    const positionMomentId = getMyAcademyPositionMomentId(hasSelfRecord);
    setSelectedMomentId(positionMomentId);
    setSelectedModuleId(getMyAcademyTerritory(positionMomentId).modules[0]?.id ?? '');
  }, [hasSelfRecord]);

  useEffect(() => {
    if (!effectiveOpen || !savedContext?.itemId) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(`my-academy-item-${savedContext.itemId}`);
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'center' });
      else if (typeof savedContext.scrollY === 'number') window.scrollTo(0, savedContext.scrollY);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [effectiveOpen, selectedMomentId, selectedModuleId]);

  useEffect(() => {
    const current = loadMyAcademyReturnContext();
    saveMyAcademyReturnContext({
      mapOpen: effectiveOpen,
      selectedMomentId,
      selectedModuleId,
      itemId: current?.itemId,
      scrollY: current?.scrollY,
      destination: current?.destination,
    });
  }, [effectiveOpen, selectedMomentId, selectedModuleId]);

  useEffect(() => {
    if (focusMapRequest === 0 || !effectiveOpen) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [focusMapRequest, effectiveOpen]);

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

  const toggleMap = () => {
    onEngage();
    const nextOpen = !effectiveOpen;
    saveMyAcademyReturnContext({ mapOpen: nextOpen, selectedMomentId, selectedModuleId });
    onOpenChange(nextOpen);
  };

  const goToEncounter = (encounter: MyAcademyEncounterProfile) => {
    onEngage();
    setSelectedMomentId(encounter.momentId);
    setSelectedModuleId(encounter.moduleId);
    onOpenChange(true);
    saveMyAcademyReturnContext({
      mapOpen: true,
      selectedMomentId: encounter.momentId,
      selectedModuleId: encounter.moduleId,
      itemId: encounter.topicId,
      destination: '/my-academy',
    });
    window.requestAnimationFrame(() => {
      const container = encounter.topicId
        ? document.getElementById(`my-academy-item-${encounter.topicId}`)
        : document.getElementById('selected-module-content');
      if (!container) return;
      const details = container.querySelector('details');
      if (details) details.open = true;
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const encounters = getMyAcademyEncounterProfiles();
  const encountersSummary = encounters.map(entry => entry.name).join(', ');

  return (
    <section id="mapa" className="scroll-mt-20 border-y border-slate-800 bg-slate-950 px-5 py-12 text-white sm:py-16" aria-labelledby="my-academy-map-title">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">{isPt ? 'Sua turnê musical' : 'Your musical tour'}</p>
            <h2 ref={headingRef} tabIndex={-1} id="my-academy-map-title" className="mt-3 text-3xl font-black tracking-tight outline-none sm:text-4xl">{isPt ? 'Sete territórios em uma jornada aberta.' : 'Seven territories in an open journey.'}</h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-300 sm:text-base">{isPt ? 'Você não precisa atravessar toda a turnê para encontrar algo útil. Cada território pode abrir novas formas de compreender, praticar e criar música.' : 'You do not need to cross the entire tour to find something useful. Each territory can open new ways to understand, practise and create music.'}</p>
            <p className="mt-3 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-amber-100">{isPt ? 'Direção sem julgamento · exploração sem bloqueio' : 'Direction without judgement · exploration without locks'}</p>
          </div>
          <button type="button" aria-expanded={effectiveOpen} aria-controls="my-academy-map-content" onClick={toggleMap} className="min-h-11 rounded-full border border-cyan-400/45 bg-cyan-400/10 px-5 text-xs font-bold uppercase tracking-[0.1em] text-cyan-100 transition hover:border-cyan-300">{effectiveOpen ? (isPt ? 'Recolher mapa' : 'Collapse map') : (isPt ? 'Abrir mapa' : 'Open map')}</button>
        </div>
        {effectiveOpen && <div id="my-academy-map-content">
          <MyAcademyJourneyRoute lang={lang} selectedMomentId={selectedMomentId} selectedTerritory={selectedTerritory} selectedModuleId={selectedModuleId} hasSelfRecord={hasSelfRecord} animateRoute={isFirstAccess} onSelect={selectTerritory} onSelectModule={selectModule} onSelectEncounter={goToEncounter} />
          <MyAcademyTerritoryPanel lang={lang} territory={selectedTerritory} hasSelfRecord={hasSelfRecord} selectedModuleId={selectedModuleId} onSelectModule={selectModule} />

          <details className="group mt-6 rounded-3xl border border-cyan-900/70 bg-[#07111f]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">{isPt ? 'Encontros da turnê' : 'Tour encounters'}</p>
                <p className="mt-1 text-sm font-black text-white">{encountersSummary}</p>
              </div>
              <span aria-hidden="true" className="text-xl font-black text-cyan-300 transition group-open:rotate-45">+</span>
            </summary>
            <div className="border-t border-cyan-900/60 p-4 sm:p-5">
              <p className="text-sm font-semibold leading-relaxed text-slate-300">
                {isPt ? 'Reveja os encontros e orientações que já fizeram parte da sua jornada.' : 'Revisit the encounters and guidance that have been part of your journey.'}
              </p>
              <div className="mt-4 space-y-3">
                {encounters.map(entry => (
                  <div key={entry.id} className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 sm:flex-row sm:items-start">
                    <img src={entry.image} alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-amber-300 object-cover object-top" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-white">{entry.name}</p>
                        <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-100">{ENCOUNTER_KIND_LABEL[entry.kind][lang]}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-cyan-100">{entry.title[lang]}</p>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">{entry.summary[lang]}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => goToEncounter(entry)} className="min-h-9 rounded-xl bg-cyan-700 px-3 text-xs font-black text-white transition hover:bg-cyan-600">
                          {isPt ? 'Rever encontro' : 'Revisit encounter'}
                        </button>
                        {entry.profilePath && (
                          <button type="button" onClick={() => navigateToPath(entry.profilePath!)} className="text-xs font-bold text-cyan-300 hover:text-cyan-200">
                            {isPt ? 'Conhecer personagem' : 'Meet character'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>

          <MyAcademyCompanionIntro lang={lang} />
        </div>}
      </div>
    </section>
  );
};

export default MyAcademyCurriculumMap;
