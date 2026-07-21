import React, { useId } from 'react';
import type { MyAcademyNavigationState, MyAcademyMomentId } from '../../utils/myAcademyMapPresentation';
import {
  getMyAcademyWaypointAccent,
  type MyAcademyWaypointVisualState,
} from '../../utils/myAcademyExplorationPresentation';

interface MyAcademyWaypointProps {
  momentId: MyAcademyMomentId;
  displayNumber: number;
  title: string;
  stateLabel: string;
  navigationState: MyAcademyNavigationState;
  selected: boolean;
  current: boolean;
  visualState: MyAcademyWaypointVisualState;
  mobile: boolean;
  align: 'start' | 'center' | 'end';
  onSelect: () => void;
}

const PICK_PATH = 'M50 5C76 5 93 20 92 43C91 67 69 91 50 115C31 91 9 67 8 43C7 20 24 5 50 5Z';

const navigationLabelClasses: Record<MyAcademyNavigationState, string> = {
  current: 'border-amber-300/50 bg-amber-300/15 text-amber-50',
  'first-available': 'border-cyan-300/50 bg-cyan-300/15 text-cyan-50',
  ahead: 'border-slate-500/80 bg-slate-950/90 text-slate-100',
  horizon: 'border-amber-400/45 bg-amber-300/10 text-amber-50',
  explorable: 'border-slate-500/80 bg-slate-950/90 text-slate-100',
};

const alignmentClasses = {
  start: 'items-start text-left',
  center: 'items-center text-center',
  end: 'items-end text-right',
} as const;

const MyAcademyWaypoint: React.FC<MyAcademyWaypointProps> = ({
  momentId,
  displayNumber,
  title,
  stateLabel,
  navigationState,
  selected,
  current,
  visualState,
  mobile,
  align,
  onSelect,
}) => {
  const clipId = `ga-pick-${useId().replace(/:/g, '')}`;
  const usesGold = getMyAcademyWaypointAccent(visualState) === 'gold';
  const outlineClass = usesGold ? 'stroke-amber-300' : 'stroke-cyan-300';
  const litNodes = Math.min(visualState.confirmedModuleCount, 4);

  return (
    <button
      type="button"
      data-moment-id={momentId}
      data-waypoint-protected="true"
      aria-pressed={selected}
      aria-current={current ? 'location' : undefined}
      aria-label={`${displayNumber} — ${title}. ${stateLabel}`}
      onClick={onSelect}
      className={`group flex min-h-24 w-full flex-col rounded-2xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-cyan-100 ${alignmentClasses[align]}`}
    >
      <span className={`relative shrink-0 ${mobile ? 'h-[80px] w-16' : 'h-28 w-[92px]'}`}>
        <svg
          viewBox="0 0 100 120"
          className={`absolute inset-0 h-full w-full overflow-visible fill-[#0b1d35] text-cyan-100 drop-shadow-[0_14px_24px_rgba(0,0,0,0.32)] ${outlineClass}`}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}><path d={PICK_PATH} /></clipPath>
          </defs>
          {visualState.isLatestExperience && <path d={PICK_PATH} fill="none" stroke={usesGold ? '#fcd34d' : '#67e8f9'} strokeWidth="11" strokeLinejoin="round" opacity="0.2" />}
          {selected && <path d={PICK_PATH} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinejoin="round" opacity="0.76" />}
          <path d={PICK_PATH} strokeWidth="4" strokeLinejoin="round" />
          <g clipPath={`url(#${clipId})`} fill="none" stroke="currentColor" opacity={visualState.hasConfirmedExperience ? 0.34 : 0.16}>
            <path d="M10 30H90M10 52H90M14 74H86M22 96H78" />
            <path d="M28 8V96M50 5V112M72 8V96" />
            <path d="M17 64L50 18L82 69L39 101Z" strokeWidth="1.2" />
            {[
              [28, 30], [72, 52], [39, 76], [65, 91],
            ].map(([cx, cy], index) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index < litNodes ? 4 : 2.2} fill={index < litNodes ? (usesGold ? '#fde68a' : '#a5f3fc') : 'currentColor'} opacity={index < litNodes ? 1 : 0.7} />
            ))}
            <path d="M62 73L82 82L65 94Z" fill="currentColor" stroke="none" opacity="0.48" />
            <path d="M21 47L34 38L36 55Z" fill="currentColor" stroke="none" opacity="0.48" />
          </g>
          {visualState.hasAvailableExperience && !visualState.hasConfirmedExperience && <circle cx="82" cy="22" r="5" fill="#67e8f9" stroke="#ecfeff" strokeWidth="2" />}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center pb-2 text-[30px] font-black leading-none [font-weight:900] lg:text-4xl">{displayNumber}</span>
      </span>
      <span className={`mt-2 block max-w-[210px] font-black leading-tight text-white ${mobile ? 'text-lg' : 'text-xl'}`}>{title}</span>
      <span className={`mt-2 inline-flex max-w-[210px] rounded-full border px-2.5 py-1 text-xs font-bold uppercase leading-snug tracking-[0.07em] ${navigationLabelClasses[navigationState]}`}>
        {stateLabel}
      </span>
    </button>
  );
};

export default MyAcademyWaypoint;
