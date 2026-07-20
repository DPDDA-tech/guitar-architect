import React from 'react';
import { MY_ACADEMY_CURRICULUM } from '../../data/myAcademyCurriculum';
import type { MyAcademyCurriculumMoment } from '../../types/myAcademyCurriculum';
import { navigateToPath } from '../../utils/fretboardNavigation';
import type { MyAcademyMomentId } from '../../utils/myAcademyMapPresentation';
import {
  deriveMyAcademyExplorationEvidence,
  getMyAcademyWaypointAccent,
  getMyAcademyWaypointVisualState,
} from '../../utils/myAcademyExplorationPresentation';
import {
  getMyAcademyDisplayNumber,
  getMyAcademyPositionExplanation,
  getMyAcademyWaypointPresentation,
} from '../../utils/myAcademyMapPresentation';
import { getMobileRouteGeometry } from '../../utils/myAcademyRouteGeometry';
import MyAcademyCableRoute from './MyAcademyCableRoute';
import MyAcademyCableModules from './MyAcademyCableModules';
import MyAcademyWaypoint from './MyAcademyWaypoint';

interface MyAcademyJourneyRouteProps {
  lang: 'pt' | 'en';
  selectedMomentId: MyAcademyMomentId;
  selectedTerritory: MyAcademyCurriculumMoment;
  selectedModuleId: string;
  hasSelfRecord: boolean;
  animateRoute: boolean;
  onSelect: (momentId: MyAcademyMomentId) => void;
  onSelectModule: (moduleId: string) => void;
  onOpenCharacters: () => void;
}

type CharacterMarker = {
  name: string;
  image: string;
  role: 'guide' | 'choice' | 'specialist';
  profilePath?: string;
};

const BASE_CHARACTER_MARKERS: Partial<Record<MyAcademyMomentId, readonly CharacterMarker[]>> = {
  '0': [
    {
      name: 'Clara',
      image: '/instructors/1000/clara-card-instructor.webp',
      role: 'guide',
    },
  ],
  '1': [
    {
      name: 'Clara',
      image: '/instructors/1000/clara-card-instructor.webp',
      role: 'guide',
    },
    {
      name: 'Alice',
      image: '/instructors/1000/alice-card-instructor.webp',
      role: 'choice',
    },
    {
      name: 'Arthur',
      image: '/instructors/1000/arthur-card-instructor.webp',
      role: 'choice',
    },
  ],
};

const TOM_MARKER: CharacterMarker = {
  name: 'Tom',
  image: '/instructors/1000/tom-card-instructor.webp',
  role: 'specialist',
  profilePath: '/instructors/tom',
};

const MyAcademyJourneyRoute: React.FC<MyAcademyJourneyRouteProps> = ({
  lang,
  selectedMomentId,
  selectedTerritory,
  selectedModuleId,
  hasSelfRecord,
  animateRoute,
  onSelect,
  onSelectModule,
  onOpenCharacters,
}) => {
  const isPt = lang === 'pt';
  const moduleCount = selectedTerritory.modules.length;
  const routeGeometry = getMobileRouteGeometry(selectedMomentId, moduleCount);
  const explorationEvidence = deriveMyAcademyExplorationEvidence(hasSelfRecord);
  const selectedVisualState = getMyAcademyWaypointVisualState(
    selectedTerritory.id,
    selectedMomentId,
    selectedTerritory.status,
    explorationEvidence,
  );
  const moduleAccent = getMyAcademyWaypointAccent(selectedVisualState) === 'gold' ? 'amber' : 'cyan';
  const showTom = selectedMomentId === '0' && selectedModuleId === 'M0-03';
  const selectedModuleIndex = selectedTerritory.modules.findIndex(module => module.id === selectedModuleId);
  const selectedModulePlacement = selectedModuleIndex >= 0 ? routeGeometry.modulePositions[selectedModuleIndex] : undefined;

  const markerActionLabel = (character: CharacterMarker) => {
    if (character.role === 'guide') return isPt ? `Conversar com ${character.name}` : `Talk with ${character.name}`;
    if (character.role === 'specialist') return isPt ? `Conhecer ${character.name}, especialista convidado` : `Meet ${character.name}, guest specialist`;
    return isPt ? `Escolher ${character.name}` : `Choose ${character.name}`;
  };

  const openCharacter = (character: CharacterMarker) => {
    if (character.profilePath) {
      navigateToPath(character.profilePath);
      return;
    }
    onOpenCharacters();
  };

  const renderCharacterButton = (character: CharacterMarker, key: string, overlap = 0) => {
    const label = markerActionLabel(character);
    const specialist = character.role === 'specialist';
    return (
      <button
        key={key}
        type="button"
        onClick={() => openCharacter(character)}
        title={label}
        aria-label={label}
        className={`relative h-11 w-11 overflow-hidden rounded-full border-2 bg-slate-950 shadow-lg transition hover:z-20 hover:scale-110 focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${character.role === 'choice' ? 'border-cyan-300' : 'border-amber-300'} ${specialist ? 'ring-2 ring-amber-300/25 ring-offset-2 ring-offset-slate-950' : ''}`}
        style={{ marginInlineStart: overlap }}
      >
        <img src={character.image} alt="" className="h-full w-full object-cover object-top" />
        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border border-slate-950 ${character.role === 'choice' ? 'bg-cyan-300' : 'bg-amber-300'}`} aria-hidden="true" />
      </button>
    );
  };

  return (
    <div className="mt-8">
      <style>{`
        .ga-academy-cable-pulse {
          stroke-dasharray: 24 976;
          stroke-dashoffset: 0;
          animation: ga-academy-cable-signal 2.4s ease-in-out 1 both;
        }
        .ga-academy-cable-pulse-mobile { stroke-dasharray: 18 982; }
        @keyframes ga-academy-cable-signal {
          from { stroke-dashoffset: 0; opacity: 0; }
          12% { opacity: 0.82; }
          88% { opacity: 0.82; }
          to { stroke-dashoffset: -1000; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ga-academy-cable-pulse { display: none; animation: none; }
        }
      `}</style>

      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.25rem] border border-cyan-900/70 bg-[#07111f] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_28px_80px_rgba(0,0,0,0.28)] [background-image:linear-gradient(rgba(34,211,238,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.055)_1px,transparent_1px),radial-gradient(circle_at_12%_16%,rgba(180,128,63,0.14),transparent_34%)] [background-size:28px_28px,28px_28px,100%_100%]">
        <div className="pointer-events-none absolute left-5 top-5 z-20 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100/75" aria-hidden="true">
          {isPt ? 'Turnê My Academy' : 'My Academy Tour'}
        </div>
        <svg className="pointer-events-none absolute -right-20 -top-28 h-[360px] w-[360px] text-amber-300/10" viewBox="0 0 200 240" fill="none" aria-hidden="true">
          <path d="M100 12C154 12 187 61 175 117C161 181 118 225 100 230C82 225 39 181 25 117C13 61 46 12 100 12Z" stroke="currentColor" strokeWidth="2" />
          <path d="M100 30C137 30 160 67 151 110C141 156 113 192 100 199C87 192 59 156 49 110C40 67 63 30 100 30Z" stroke="currentColor" />
        </svg>

        <div className="relative" style={{ height: routeGeometry.height }}>
          <MyAcademyCableRoute mobile animate={animateRoute} selectedMomentId={selectedMomentId} moduleCount={moduleCount} confirmedMomentIds={explorationEvidence.confirmedMomentIds} />
          <ol>
            {MY_ACADEMY_CURRICULUM.map((moment, index) => {
              const presentation = getMyAcademyWaypointPresentation(moment.id, hasSelfRecord, lang);
              const visualState = getMyAcademyWaypointVisualState(moment.id, selectedMomentId, moment.status, explorationEvidence);
              const position = routeGeometry.waypointPositions[index];
              const characters = BASE_CHARACTER_MARKERS[moment.id] ?? [];
              const placeCharactersOnRight = position.x < 50;

              return (
                <li
                  key={`vertical-${moment.id}`}
                  className="absolute z-10 w-[210px] -translate-x-1/2"
                  style={{ left: `${position.x}%`, top: position.y - 40 }}
                >
                  <MyAcademyWaypoint
                    momentId={moment.id}
                    displayNumber={getMyAcademyDisplayNumber(moment.id)}
                    title={moment.title[lang]}
                    stateLabel={presentation.label}
                    navigationState={presentation.navigationState}
                    selected={selectedMomentId === moment.id}
                    current={presentation.isCurrent}
                    visualState={visualState}
                    mobile
                    align="center"
                    onSelect={() => onSelect(moment.id)}
                  />

                  {characters.length > 0 && (
                    <div className={`absolute top-1/2 flex -translate-y-1/2 items-center ${placeCharactersOnRight ? 'left-[calc(100%+8px)]' : 'right-[calc(100%+8px)] flex-row-reverse'}`}>
                      {characters.map((character, characterIndex) => renderCharacterButton(character, `${moment.id}-${character.name}`, characterIndex === 0 ? 0 : -10))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <MyAcademyCableModules
            lang={lang}
            territory={selectedTerritory}
            selectedModuleId={selectedModuleId}
            positions={routeGeometry.modulePositions}
            accent={moduleAccent}
            mobile
            onSelectModule={onSelectModule}
          />
          {showTom && selectedModulePlacement && (
            <div
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(${selectedModulePlacement.point.x}% ${selectedModulePlacement.point.x < 50 ? '+' : '-'} 58px)`,
                top: selectedModulePlacement.point.y,
              }}
            >
              {renderCharacterButton(TOM_MARKER, 'module-M0-03-tom')}
            </div>
          )}
          <p className="pointer-events-none absolute right-5 text-right text-xs font-bold uppercase tracking-[0.08em] text-amber-100/80" style={{ top: routeGeometry.finalPoint.y + 28 }}>
            {isPt ? 'Rota aberta · a turnê continua' : 'Open route · the tour continues'}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-slate-700 bg-[#0a182b] p-4 text-sm font-semibold leading-relaxed text-slate-100">
        <p>{getMyAcademyPositionExplanation(hasSelfRecord, lang)}</p>
      </div>
    </div>
  );
};

export default MyAcademyJourneyRoute;
