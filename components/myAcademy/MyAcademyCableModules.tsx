import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MyAcademyCurriculumMoment } from '../../types/myAcademyCurriculum';
import { navigateToPath } from '../../utils/fretboardNavigation';
import { getMyAcademyJourneyLandmarks, type MyAcademyJourneyLandmark } from '../../utils/myAcademyJourneyLandmarks';
import type { ModuleNodePlacement } from '../../utils/myAcademyRouteGeometry';
import {
  findSafeMyAcademyCalloutPlacement,
  type CalloutDirection,
  type CalloutRect,
} from '../../utils/myAcademyCalloutPlacement';

interface MyAcademyCableModulesProps {
  lang: 'pt' | 'en';
  territory: MyAcademyCurriculumMoment;
  selectedModuleId: string;
  positions: ModuleNodePlacement[];
  accent: 'cyan' | 'amber';
  mobile: boolean;
  onSelectModule: (moduleId: string) => void;
}

const activateLandmark = (landmark: MyAcademyJourneyLandmark) => {
  if (landmark.destination) {
    navigateToPath(landmark.destination);
    return;
  }

  if (landmark.targetId) {
    const target = document.getElementById(landmark.targetId);
    const details = target?.querySelector('details');
    if (details) details.open = true;
    target?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    window.requestAnimationFrame(() => target?.focus({ preventScroll: true }));
  }
};

const landmarkActionLabel = (landmark: MyAcademyJourneyLandmark, lang: 'pt' | 'en') => {
  if (landmark.type === 'guide') return 'Clara';
  if (landmark.type === 'unit') return 'NMC-RIT-001';
  if (landmark.type === 'studio') return 'Studio';
  return landmark.label[lang];
};

interface PositionedCallout {
  direction: CalloutDirection;
  left: number;
  top: number;
  leaderX1: number;
  leaderY1: number;
  leaderX2: number;
  leaderY2: number;
  usedFallback: boolean;
}

const toRect = (rect: DOMRect): CalloutRect => ({
  left: rect.left,
  top: rect.top,
  right: rect.right,
  bottom: rect.bottom,
});

const isVisibleRect = (rect: DOMRect): boolean => rect.width > 0 && rect.height > 0;

const cableExclusions = (root: HTMLElement, anchor: DOMRect): CalloutRect[] => {
  const anchorX = (anchor.left + anchor.right) / 2;
  const anchorY = (anchor.top + anchor.bottom) / 2;

  return Array.from(root.querySelectorAll<SVGPathElement>('[data-cable-segment]')).flatMap(path => {
    if (typeof path.getTotalLength !== 'function' || !path.ownerSVGElement) return [];
    const matrix = path.getScreenCTM();
    if (!matrix) return [];
    const length = path.getTotalLength();
    return Array.from({ length: 25 }, (_, index) => {
      const point = path.getPointAtLength((length * index) / 24);
      const svgPoint = path.ownerSVGElement!.createSVGPoint();
      svgPoint.x = point.x;
      svgPoint.y = point.y;
      const screenPoint = svgPoint.matrixTransform(matrix);
      if (Math.hypot(screenPoint.x - anchorX, screenPoint.y - anchorY) < 34) return null;
      return {
        left: screenPoint.x - 5,
        top: screenPoint.y - 5,
        right: screenPoint.x + 5,
        bottom: screenPoint.y + 5,
      };
    }).filter((rect): rect is CalloutRect => rect !== null);
  });
};

const preferredDirections = (placement: ModuleNodePlacement, mobile: boolean): CalloutDirection[] => {
  const horizontal: 'before' | 'after' = placement.labelSide;
  const oppositeHorizontal = horizontal === 'before' ? 'after' : 'before';
  const vertical: 'above' | 'below' = mobile
    ? (placement.point.x < 50 ? 'below' : 'above')
    : (placement.point.y < 300 ? 'below' : 'above');
  const oppositeVertical = vertical === 'above' ? 'below' : 'above';

  return [
    `${vertical}-${horizontal}`,
    horizontal,
    vertical,
    `${oppositeVertical}-${horizontal}`,
    `${vertical}-${oppositeHorizontal}`,
    oppositeVertical,
    oppositeHorizontal,
    `${oppositeVertical}-${oppositeHorizontal}`,
  ];
};

const MyAcademyCableModules: React.FC<MyAcademyCableModulesProps> = ({
  lang,
  territory,
  selectedModuleId,
  positions,
  accent,
  mobile,
  onSelectModule,
}) => {
  const landmarks = getMyAcademyJourneyLandmarks(territory.id);
  const usesGold = accent === 'amber';
  const overlayRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const calloutRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [calloutPositions, setCalloutPositions] = useState<Record<string, PositionedCallout>>({});
  const positionSignature = useMemo(() => positions.map(placement => (
    `${placement.point.x}:${placement.point.y}:${placement.progress}:${placement.labelSide}`
  )).join('|'), [positions]);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const root = overlay?.parentElement;
    if (!overlay || !root) return undefined;

    let frame = 0;
    const updatePositions = () => {
      const overlayRect = overlay.getBoundingClientRect();
      const bounds: CalloutRect = {
        left: overlayRect.left + 12,
        top: overlayRect.top + 12,
        right: overlayRect.right - 12,
        bottom: overlayRect.bottom - 12,
      };
      const protectedRects = Array.from(root.querySelectorAll<HTMLElement>('[data-waypoint-protected], [data-cable-connector]'))
        .map(element => element.getBoundingClientRect())
        .filter(isVisibleRect)
        .map(toRect);
      const next: Record<string, PositionedCallout> = {};

      territory.modules.forEach((module, index) => {
        const node = nodeRefs.current[module.id];
        const callout = calloutRefs.current[module.id];
        const placement = positions[index];
        if (!node || !callout || !placement) return;
        const nodeRect = node.getBoundingClientRect();
        const wrapperRect = node.parentElement?.getBoundingClientRect();
        const calloutRect = callout.getBoundingClientRect();
        if (!wrapperRect || !isVisibleRect(nodeRect) || !isVisibleRect(calloutRect)) return;
        const otherNodeRects = Object.entries(nodeRefs.current)
          .filter(([moduleId, element]) => moduleId !== module.id && element)
          .map(([, element]) => toRect(element!.getBoundingClientRect()));
        const safe = findSafeMyAcademyCalloutPlacement({
          anchor: toRect(nodeRect),
          width: calloutRect.width,
          height: calloutRect.height,
          bounds,
          exclusions: [...protectedRects, ...otherNodeRects],
          softExclusions: cableExclusions(root, nodeRect),
          preferredDirections: preferredDirections(placement, mobile),
        });
        const left = safe.left - wrapperRect.left;
        const top = safe.top - wrapperRect.top;
        const anchorX = ((nodeRect.left + nodeRect.right) / 2) - wrapperRect.left;
        const anchorY = ((nodeRect.top + nodeRect.bottom) / 2) - wrapperRect.top;
        const calloutRight = left + calloutRect.width;
        const calloutBottom = top + calloutRect.height;
        const leaderX2 = Math.min(Math.max(anchorX, left), calloutRight);
        const leaderY2 = Math.min(Math.max(anchorY, top), calloutBottom);

        next[module.id] = {
          direction: safe.direction,
          left,
          top,
          leaderX1: anchorX,
          leaderY1: anchorY,
          leaderX2,
          leaderY2,
          usedFallback: safe.usedFallback,
        };
      });

      setCalloutPositions(current => (
        JSON.stringify(current) === JSON.stringify(next) ? current : next
      ));
    };
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updatePositions);
    };
    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate);
    observer?.observe(root);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', scheduleUpdate);
      observer?.disconnect();
    };
  }, [lang, mobile, positionSignature, selectedModuleId, territory.id]);

  return (
    <div ref={overlayRef} className="absolute inset-0 z-20 pointer-events-none">
      {territory.modules.map((module, index) => {
        const placement = positions[index];
        if (!placement) return null;
        const { point: position } = placement;
        const selected = module.id === selectedModuleId;
        const moduleLandmarks = landmarks.filter(landmark => landmark.moduleId === module.id);
        const placeLabelBefore = placement.labelSide === 'before';
        const calloutPosition = calloutPositions[module.id];

        return (
          <div
            key={module.id}
            data-module-id={module.id}
            data-module-segment={territory.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: mobile ? `${position.x}%` : `${position.x / 10}%`, top: position.y }}
          >
            <button
              ref={element => { nodeRefs.current[module.id] = element; }}
              data-module-node="true"
              type="button"
              aria-pressed={selected}
              aria-label={`${module.title[lang]}. ${selected ? (lang === 'pt' ? 'Módulo aberto no painel' : 'Module open in the panel') : (lang === 'pt' ? 'Abrir módulo no painel' : 'Open module in the panel')}`}
              onClick={() => onSelectModule(module.id)}
              className={`peer pointer-events-auto relative flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-white ${selected ? 'scale-110' : ''} motion-reduce:transition-none`}
            >
              <span className={`absolute rounded-full border-[3px] bg-[#07111f] shadow-[0_5px_16px_rgba(0,0,0,0.45)] ${placement.compact && !selected ? 'h-5 w-5' : 'h-6 w-6'} ${usesGold ? 'border-amber-300' : 'border-cyan-300'}`} aria-hidden="true" />
              <span className={`absolute rounded-full ${placement.compact && !selected ? 'h-2 w-2' : 'h-2.5 w-2.5'} ${selected ? 'bg-white' : usesGold ? 'bg-amber-200' : 'bg-cyan-200'}`} aria-hidden="true" />
              {selected && <span className={`absolute h-9 w-9 rounded-full border ${usesGold ? 'border-amber-200/75' : 'border-cyan-200/75'}`} aria-hidden="true" />}
            </button>

            {calloutPosition ? (
              <svg className={`pointer-events-none absolute left-0 top-0 h-px w-px overflow-visible ${selected ? 'opacity-100' : 'opacity-0 peer-focus:opacity-100'}`} aria-hidden="true">
                <line x1={calloutPosition.leaderX1} y1={calloutPosition.leaderY1} x2={calloutPosition.leaderX2} y2={calloutPosition.leaderY2} stroke={usesGold ? '#fde68a' : '#a5f3fc'} strokeOpacity="0.72" strokeWidth="1.5" />
              </svg>
            ) : (
              <span className={`pointer-events-none absolute top-1/2 h-px w-4 -translate-y-1/2 ${usesGold ? 'bg-amber-200/70' : 'bg-cyan-200/70'} ${placeLabelBefore ? 'right-[22px]' : 'left-[22px]'} ${selected ? 'opacity-100' : 'opacity-0 peer-focus:opacity-100'}`} aria-hidden="true" />
            )}
            <div
              ref={element => { calloutRefs.current[module.id] = element; }}
              data-module-callout={module.id}
              data-callout-direction={calloutPosition?.direction}
              data-callout-fallback={calloutPosition?.usedFallback ? 'true' : 'false'}
              style={calloutPosition ? { left: calloutPosition.left, top: calloutPosition.top } : undefined}
              className={`pointer-events-none absolute z-30 w-max max-w-[190px] rounded-xl border border-slate-600 bg-slate-950/95 px-3 py-2 shadow-xl transition-opacity motion-reduce:transition-none ${calloutPosition ? '' : `top-1/2 -translate-y-1/2 ${placeLabelBefore ? 'right-full mr-4 text-right' : 'left-full ml-4 text-left'}`} ${selected ? 'pointer-events-auto opacity-100' : 'opacity-0 peer-focus:opacity-100'}`}
            >
              <p className="text-xs font-bold leading-snug text-white">{module.title[lang]}</p>
              {selected && moduleLandmarks.length > 0 && (
                <div className={`mt-2 flex flex-wrap gap-1.5 ${placeLabelBefore ? 'justify-end' : 'justify-start'}`}>
                  {moduleLandmarks.map(landmark => (
                    <button
                      key={landmark.id}
                      type="button"
                      aria-label={`${landmark.label[lang]}. ${landmark.description[lang]}`}
                      onClick={() => activateLandmark(landmark)}
                      className="min-h-9 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-2.5 text-[11px] font-bold text-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100"
                    >
                      {landmarkActionLabel(landmark, lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyAcademyCableModules;
