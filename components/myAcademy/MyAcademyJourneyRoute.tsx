import React from 'react';
import { MY_ACADEMY_CURRICULUM } from '../../data/myAcademyCurriculum';
import type { MyAcademyCurriculumMoment } from '../../types/myAcademyCurriculum';
import type { MyAcademyMomentId } from '../../utils/myAcademyMapPresentation';
import {
  deriveMyAcademyExplorationEvidence,
  getMyAcademyWaypointAccent,
  getMyAcademyWaypointVisualState,
} from '../../utils/myAcademyExplorationPresentation';
import {
  getMyAcademyDisplayNumber,
  getMyAcademyPositionExplanation,
  getMyAcademyPublicMapLabel,
  getMyAcademyWaypointPresentation,
} from '../../utils/myAcademyMapPresentation';
import {
  getDesktopModuleNodePositions,
  getMobileRouteGeometry,
} from '../../utils/myAcademyRouteGeometry';
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
}

const desktopPositions = [
  'left-[1%] top-[43%]',
  'left-[15%] top-[8%]',
  'left-[29%] top-[48%]',
  'left-[43%] top-[9%]',
  'left-[57%] top-[50%]',
  'left-[69%] top-[13%]',
  'left-[78%] top-[55%]',
];

const mobileAlignment = ['start', 'end', 'start', 'end', 'end', 'start', 'end'] as const;

const MyAcademyJourneyRoute: React.FC<MyAcademyJourneyRouteProps> = ({
  lang,
  selectedMomentId,
  selectedTerritory,
  selectedModuleId,
  hasSelfRecord,
  animateRoute,
  onSelect,
  onSelectModule,
}) => {
  const isPt = lang === 'pt';
  const moduleCount = selectedTerritory.modules.length;
  const desktopModulePositions = getDesktopModuleNodePositions(selectedMomentId, moduleCount);
  const mobileGeometry = getMobileRouteGeometry(selectedMomentId, moduleCount);
  const explorationEvidence = deriveMyAcademyExplorationEvidence(hasSelfRecord);
  const selectedVisualState = getMyAcademyWaypointVisualState(
    selectedTerritory.id,
    selectedMomentId,
    selectedTerritory.status,
    explorationEvidence,
  );
  const moduleAccent = getMyAcademyWaypointAccent(selectedVisualState) === 'gold' ? 'amber' : 'cyan';

  const waypoint = (moment: (typeof MY_ACADEMY_CURRICULUM)[number], index: number, mobile: boolean) => {
    const presentation = getMyAcademyWaypointPresentation(moment.id, hasSelfRecord, lang);
    const visualState = getMyAcademyWaypointVisualState(moment.id, selectedMomentId, moment.status, explorationEvidence);
    const mobileIsStart = mobileAlignment[index] === 'start';

    return (
      <li
        key={`${mobile ? 'mobile' : 'desktop'}-${moment.id}`}
        className={mobile
          ? `relative z-10 flex w-[82%] ${mobileIsStart ? 'mr-auto justify-start' : 'ml-auto justify-end'}`
          : `absolute z-10 w-[210px] ${desktopPositions[index]}`}
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
          mobile={mobile}
          align={mobile ? (mobileIsStart ? 'start' : 'end') : 'center'}
          onSelect={() => onSelect(moment.id)}
        />
      </li>
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

      <div className="relative overflow-hidden rounded-[2.25rem] border border-cyan-900/70 bg-[#07111f] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_28px_80px_rgba(0,0,0,0.28)] [background-image:linear-gradient(rgba(34,211,238,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.055)_1px,transparent_1px),radial-gradient(circle_at_12%_16%,rgba(180,128,63,0.14),transparent_34%)] [background-size:28px_28px,28px_28px,100%_100%]">
        <div className="pointer-events-none absolute left-5 top-5 z-20 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100/75" aria-hidden="true">
          {getMyAcademyPublicMapLabel(lang)}
        </div>
        <svg className="pointer-events-none absolute -right-20 -top-28 h-[360px] w-[360px] text-amber-300/10" viewBox="0 0 200 240" fill="none" aria-hidden="true">
          <path d="M100 12C154 12 187 61 175 117C161 181 118 225 100 230C82 225 39 181 25 117C13 61 46 12 100 12Z" stroke="currentColor" strokeWidth="2" />
          <path d="M100 30C137 30 160 67 151 110C141 156 113 192 100 199C87 192 59 156 49 110C40 67 63 30 100 30Z" stroke="currentColor" />
        </svg>

        <div className="relative hidden h-[600px] lg:block">
          <MyAcademyCableRoute mobile={false} animate={animateRoute} selectedMomentId={selectedMomentId} moduleCount={moduleCount} confirmedMomentIds={explorationEvidence.confirmedMomentIds} />
          <ol>{MY_ACADEMY_CURRICULUM.map((moment, index) => waypoint(moment, index, false))}</ol>
          <MyAcademyCableModules
            lang={lang}
            territory={selectedTerritory}
            selectedModuleId={selectedModuleId}
            positions={desktopModulePositions}
            accent={moduleAccent}
            mobile={false}
            onSelectModule={onSelectModule}
          />
          <p className="pointer-events-none absolute bottom-5 right-6 text-xs font-bold uppercase tracking-[0.1em] text-amber-100/80">
            {isPt ? 'Rota aberta · a jornada continua' : 'Open route · the journey continues'}
          </p>
        </div>

        <div className="relative lg:hidden" style={{ height: mobileGeometry.height }}>
          <MyAcademyCableRoute mobile animate={animateRoute} selectedMomentId={selectedMomentId} moduleCount={moduleCount} confirmedMomentIds={explorationEvidence.confirmedMomentIds} />
          <ol>
            {MY_ACADEMY_CURRICULUM.map((moment, index) => {
              const presentation = getMyAcademyWaypointPresentation(moment.id, hasSelfRecord, lang);
              const visualState = getMyAcademyWaypointVisualState(moment.id, selectedMomentId, moment.status, explorationEvidence);
              const position = mobileGeometry.waypointPositions[index];
              return (
                <li
                  key={`mobile-${moment.id}`}
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
                </li>
              );
            })}
          </ol>
          <MyAcademyCableModules
            lang={lang}
            territory={selectedTerritory}
            selectedModuleId={selectedModuleId}
            positions={mobileGeometry.modulePositions}
            accent={moduleAccent}
            mobile
            onSelectModule={onSelectModule}
          />
          <p className="pointer-events-none absolute right-5 text-right text-xs font-bold uppercase tracking-[0.08em] text-amber-100/80" style={{ top: mobileGeometry.finalPoint.y + 28 }}>
            {isPt ? 'Rota aberta · a jornada continua' : 'Open route · the journey continues'}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700 bg-[#0a182b] p-4 text-sm font-semibold leading-relaxed text-slate-100">
        <p>{getMyAcademyPositionExplanation(hasSelfRecord, lang)}</p>
      </div>
    </div>
  );
};

export default MyAcademyJourneyRoute;
