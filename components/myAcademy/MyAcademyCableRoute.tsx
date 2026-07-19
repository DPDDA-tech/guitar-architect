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

      <g data-cable-connector="start" transform="translate(0 306) scale(.72)">
        <path d="M0 9H13V15H0Z" fill="#e2e8f0" />
        <path d="M13 7H34V17H13Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="2" />
        <path d="M34 5H52V19H34Z" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
        <rect x="50" y="2" width="18" height="20" rx="5" fill="#111827" stroke="#64748b" strokeWidth="2" />
        <path d="M22 7V17" stroke="#b4823f" strokeWidth="2" />
      </g>

      <g data-cable-connector="end" transform="translate(928 508)">
        <rect x="0" y="2" width="18" height="20" rx="5" fill="#111827" stroke="#64748b" strokeWidth="2" />
        <path d="M16 5H34V19H16Z" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
        <path d="M34 7H55V17H34Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="2" />
        <path d="M55 9H70V15H55Z" fill="#e2e8f0" />
        <path d="M45 7V17" stroke="#b4823f" strokeWidth="2" />
      </g>

      <g stroke="#67e8f9" strokeOpacity="0.12" strokeWidth="1">
        <path d="M80 40V560M220 40V560M360 40V560M500 40V560M640 40V560M780 40V560M920 40V560" />
        <path d="M40 90H960M40 225H960M40 360H960M40 495H960" />
      </g>
    </svg>
  );
};

const MobileCable: React.FC<Omit<MyAcademyCableRouteProps, 'mobile'>> = ({ animate, selectedMomentId, moduleCount, confirmedMomentIds }) => {
  const geometry = getMobileRouteGeometry(selectedMomentId, moduleCount);
  const leadPath = `M32 38C31 55 29 77 ${geometry.waypointPositions[0].x} ${geometry.waypointPositions[0].y}`;
  const fullPath = `${leadPath}${geometry.segments.map(segment => curveCommand(routeSegmentPath(segment))).join('')}`;

  return (
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

      <g data-cable-connector="start">
        <path d="M2 36H8V40H2Z" fill="#e2e8f0" />
        <path d="M8 34H18V42H8Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="0.8" />
        <path d="M18 33H27V43H18Z" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
        <rect x="26" y="34" width="6" height="8" rx="1.5" fill="#111827" stroke="#64748b" strokeWidth="0.8" />
        <path d="M13 34V42" stroke="#b4823f" strokeWidth="1" />
      </g>

      <g data-cable-connector="end" transform={`translate(${geometry.finalPoint.x} ${geometry.finalPoint.y - 9}) scale(.9)`}>
        <rect x="0" y="0" width="18" height="14" rx="3" fill="#111827" stroke="#64748b" strokeWidth="1" />
        <path d="M17 1H33V13H17Z" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
        <path d="M33 2H51V12H33Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1" />
        <path d="M51 4H64V10H51Z" fill="#e2e8f0" />
        <path d="M42 2V12" stroke="#b4823f" strokeWidth="1.5" />
      </g>
    </svg>
  );
};

const MyAcademyCableRoute: React.FC<MyAcademyCableRouteProps> = props => (
  props.mobile ? <MobileCable {...props} /> : <DesktopCable {...props} />
);

export default MyAcademyCableRoute;
