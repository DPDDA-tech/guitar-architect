import React from 'react';
import type { MyAcademyMomentId } from '../../utils/myAcademyMapPresentation';
import {
  getMobileRouteGeometry,
  getRoutePathSlice,
  MY_ACADEMY_DESKTOP_SEGMENTS,
  routeSegmentPath,
} from '../../utils/myAcademyRouteGeometry';

interface MyAcademyCableRouteProps {
  mobile: boolean;
  animate: boolean;
  selectedMomentId: MyAcademyMomentId;
  moduleCount: number;
  confirmedMomentIds: readonly MyAcademyMomentId[];
}

const curveCommand = (path: string) => path.slice(path.indexOf('C'));

const StartConnector: React.FC = () => (
  <svg viewBox="0 0 68 24" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path d="M0 9H13V15H0Z" fill="#e2e8f0" />
    <path d="M13 7H34V17H13Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="2" />
    <path d="M34 5H52V19H34Z" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
    <rect x="50" y="2" width="18" height="20" rx="5" fill="#111827" stroke="#64748b" strokeWidth="2" />
    <path d="M22 7V17" stroke="#b4823f" strokeWidth="2" />
  </svg>
);

const EndConnector: React.FC = () => (
  <svg viewBox="0 0 70 24" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <rect x="0" y="2" width="18" height="20" rx="5" fill="#111827" stroke="#64748b" strokeWidth="2" />
    <path d="M16 5H34V19H16Z" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
    <path d="M34 7H55V17H34Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="2" />
    <path d="M55 9H70V15H55Z" fill="#e2e8f0" />
    <path d="M45 7V17" stroke="#b4823f" strokeWidth="2" />
  </svg>
);

const DesktopCable: React.FC<Omit<MyAcademyCableRouteProps, 'mobile' | 'moduleCount'>> = ({ animate, confirmedMomentIds }) => {
  const leadPath = 'M49 314C72 314 94 314 115 314';
  const fullPath = `${leadPath}${MY_ACADEMY_DESKTOP_SEGMENTS.map(segment => curveCommand(routeSegmentPath(segment))).join('')}`;

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <path d={leadPath} fill="none" stroke="#020617" strokeWidth="10" strokeLinecap="round" />
      <path d={leadPath} fill="none" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
      {MY_ACADEMY_DESKTOP_SEGMENTS.map(segment => {
        const path = routeSegmentPath(segment);
        return (
          <g key={segment.momentId}>
            <path d={path} fill="none" stroke="#020617" strokeWidth="10" strokeLinecap="round" />
            <path data-cable-segment={segment.momentId} d={path} fill="none" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
            <path d={path} fill="none" stroke="#67e8f9" strokeOpacity="0.3" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );
      })}
      {MY_ACADEMY_DESKTOP_SEGMENTS.filter(segment => confirmedMomentIds.includes(segment.momentId)).map(segment => (
        <path key={`confirmed-${segment.momentId}`} data-explored-mark={segment.momentId} d={getRoutePathSlice(segment, 0.06, 0.16)} fill="none" stroke="#fcd34d" strokeOpacity="0.78" strokeWidth="5" strokeDasharray="8 7" strokeLinecap="round" />
      ))}
      {animate && <path pathLength="1000" d={fullPath} className="ga-academy-cable-pulse" fill="none" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
};

const MobileCable: React.FC<Omit<MyAcademyCableRouteProps, 'mobile'>> = ({ animate, selectedMomentId, moduleCount, confirmedMomentIds }) => {
  const geometry = getMobileRouteGeometry(selectedMomentId, moduleCount);
  const leadPath = `M32 38C32 56 30 78 ${geometry.waypointPositions[0].x} ${geometry.waypointPositions[0].y}`;
  const fullPath = `${leadPath}${geometry.segments.map(segment => curveCommand(routeSegmentPath(segment))).join('')}`;

  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 100 ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={leadPath} fill="none" stroke="#020617" strokeWidth="2.8" strokeLinecap="round" />
        <path d={leadPath} fill="none" stroke="#334155" strokeWidth="1.9" strokeLinecap="round" />
        {geometry.segments.map(segment => {
          const path = routeSegmentPath(segment);
          return (
            <g key={segment.momentId}>
              <path d={path} fill="none" stroke="#020617" strokeWidth="2.8" strokeLinecap="round" />
              <path data-cable-segment={segment.momentId} d={path} fill="none" stroke="#334155" strokeWidth="1.9" strokeLinecap="round" />
              <path d={path} fill="none" stroke="#67e8f9" strokeOpacity="0.3" strokeWidth="0.65" strokeLinecap="round" />
            </g>
          );
        })}
        {geometry.segments.filter(segment => confirmedMomentIds.includes(segment.momentId)).map(segment => (
          <path key={`confirmed-${segment.momentId}`} data-explored-mark={segment.momentId} d={getRoutePathSlice(segment, 0.06, 0.16)} fill="none" stroke="#fcd34d" strokeOpacity="0.78" strokeWidth="1.55" strokeDasharray="2.4 2" strokeLinecap="round" />
        ))}
        {animate && <path pathLength="1000" d={fullPath} className="ga-academy-cable-pulse ga-academy-cable-pulse-mobile" fill="none" stroke="#fef3c7" strokeWidth="1" strokeLinecap="round" />}
      </svg>

      <div
        data-cable-connector="start"
        className="pointer-events-none absolute z-[2] h-7 w-[76px] origin-center"
        style={{
          left: '32%',
          top: 38,
          transform: 'translate(-50%, -92%) rotate(90deg)',
        }}
        aria-hidden="true"
      >
        <StartConnector />
      </div>

      <div
        data-cable-connector="end"
        className="pointer-events-none absolute z-[2] h-7 w-[78px] origin-center"
        style={{
          left: `${geometry.finalPoint.x}%`,
          top: geometry.finalPoint.y,
          transform: 'translate(-50%, -8%) rotate(90deg)',
        }}
        aria-hidden="true"
      >
        <EndConnector />
      </div>
    </>
  );
};

const MyAcademyCableRoute: React.FC<MyAcademyCableRouteProps> = props => (
  props.mobile ? <MobileCable {...props} /> : <DesktopCable {...props} />
);

export default MyAcademyCableRoute;
