import type { MyAcademyMomentId } from './myAcademyMapPresentation';

export interface RoutePoint {
  x: number;
  y: number;
}

export interface ModuleNodePlacement {
  point: RoutePoint;
  progress: number;
  labelSide: 'before' | 'after';
  compact: boolean;
}

export interface RouteSegment {
  momentId: MyAcademyMomentId;
  start: RoutePoint;
  control1: RoutePoint;
  control2: RoutePoint;
  end: RoutePoint;
}

export const MY_ACADEMY_DESKTOP_SEGMENTS: RouteSegment[] = [
  { momentId: '0', start: { x: 115, y: 314 }, control1: { x: 175, y: 314 }, control2: { x: 190, y: 104 }, end: { x: 255, y: 104 } },
  { momentId: '1', start: { x: 255, y: 104 }, control1: { x: 320, y: 104 }, control2: { x: 330, y: 344 }, end: { x: 395, y: 344 } },
  { momentId: '2', start: { x: 395, y: 344 }, control1: { x: 460, y: 344 }, control2: { x: 470, y: 110 }, end: { x: 535, y: 110 } },
  { momentId: '3', start: { x: 535, y: 110 }, control1: { x: 600, y: 110 }, control2: { x: 610, y: 356 }, end: { x: 675, y: 356 } },
  { momentId: '4', start: { x: 675, y: 356 }, control1: { x: 730, y: 356 }, control2: { x: 730, y: 134 }, end: { x: 795, y: 134 } },
  { momentId: '5', start: { x: 795, y: 134 }, control1: { x: 850, y: 134 }, control2: { x: 835, y: 372 }, end: { x: 885, y: 386 } },
  { momentId: '6', start: { x: 885, y: 386 }, control1: { x: 970, y: 410 }, control2: { x: 760, y: 500 }, end: { x: 928, y: 520 } },
];

export const routeSegmentPath = (segment: RouteSegment): string => (
  `M${segment.start.x} ${segment.start.y}C${segment.control1.x} ${segment.control1.y} ${segment.control2.x} ${segment.control2.y} ${segment.end.x} ${segment.end.y}`
);

const cubicPoint = (segment: RouteSegment, progress: number): RoutePoint => {
  const inverse = 1 - progress;
  const x = (inverse ** 3 * segment.start.x)
    + (3 * inverse ** 2 * progress * segment.control1.x)
    + (3 * inverse * progress ** 2 * segment.control2.x)
    + (progress ** 3 * segment.end.x);
  const y = (inverse ** 3 * segment.start.y)
    + (3 * inverse ** 2 * progress * segment.control1.y)
    + (3 * inverse * progress ** 2 * segment.control2.y)
    + (progress ** 3 * segment.end.y);
  return { x, y };
};

const ARC_SAMPLES = 160;

interface ArcSample {
  distance: number;
  parameter: number;
  point: RoutePoint;
}

const arcSamples = (segment: RouteSegment): ArcSample[] => {
  const samples: ArcSample[] = [{ distance: 0, parameter: 0, point: segment.start }];
  let distance = 0;
  let previous = segment.start;

  for (let index = 1; index <= ARC_SAMPLES; index += 1) {
    const parameter = index / ARC_SAMPLES;
    const point = cubicPoint(segment, parameter);
    distance += Math.hypot(point.x - previous.x, point.y - previous.y);
    samples.push({ distance, parameter, point });
    previous = point;
  }

  return samples;
};

const pointAtArcProgress = (segment: RouteSegment, progress: number): RoutePoint => {
  const samples = arcSamples(segment);
  const target = samples[samples.length - 1].distance * progress;
  const upperIndex = samples.findIndex(sample => sample.distance >= target);
  if (upperIndex <= 0) return samples[0].point;
  const lower = samples[upperIndex - 1];
  const upper = samples[upperIndex];
  const span = upper.distance - lower.distance;
  const ratio = span === 0 ? 0 : (target - lower.distance) / span;
  return cubicPoint(segment, lower.parameter + ((upper.parameter - lower.parameter) * ratio));
};

const safeProgress = (momentId: MyAcademyMomentId, index: number, count: number): number => {
  if (count === 1) return 0.5;
  const start = 0.22;
  const end = momentId === '6' ? 0.72 : 0.76;
  return start + (((end - start) * index) / (count - 1));
};

const modulePlacements = (segment: RouteSegment, count: number): ModuleNodePlacement[] => (
  Array.from({ length: count }, (_, index) => {
    const progress = safeProgress(segment.momentId, index, count);
    const point = pointAtArcProgress(segment, progress);
    return {
      point,
      progress,
      labelSide: point.x > (Math.max(segment.start.x, segment.end.x) > 100 ? 650 : 58) ? 'before' : 'after',
      compact: count >= 7,
    };
  })
);

export const getRoutePathSlice = (segment: RouteSegment, start: number, end: number): string => {
  const points = Array.from({ length: 13 }, (_, index) => (
    pointAtArcProgress(segment, start + (((end - start) * index) / 12))
  ));
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join('');
};

export const getDesktopModuleNodePositions = (momentId: MyAcademyMomentId, count: number): ModuleNodePlacement[] => {
  const segment = MY_ACADEMY_DESKTOP_SEGMENTS.find(candidate => candidate.momentId === momentId);
  if (!segment || count <= 0) return [];
  return modulePlacements(segment, count);
};

const MOBILE_X = [28, 72, 28, 72, 72, 28, 72];
const MOBILE_BASE_Y = [105, 270, 435, 600, 765, 930, 1095];

export interface MobileRouteGeometry {
  height: number;
  waypointPositions: RoutePoint[];
  segments: RouteSegment[];
  modulePositions: ModuleNodePlacement[];
  finalPoint: RoutePoint;
}

export const getMobileRouteGeometry = (
  selectedMomentId: MyAcademyMomentId,
  moduleCount: number,
): MobileRouteGeometry => {
  const selectedIndex = Number(selectedMomentId);
  const expansion = 80 + (moduleCount * 52);
  const waypointPositions = MOBILE_BASE_Y.map((baseY, index) => ({
    x: MOBILE_X[index],
    y: baseY + (index > selectedIndex ? expansion : 0),
  }));
  const finalPoint = {
    x: 30,
    y: waypointPositions[6].y + (selectedIndex === 6 ? expansion + 170 : 190),
  };
  const segments = waypointPositions.map((point, index): RouteSegment => {
    const end = index === 6 ? finalPoint : waypointPositions[index + 1];
    const middleY = (point.y + end.y) / 2;
    return {
      momentId: String(index) as MyAcademyMomentId,
      start: point,
      control1: { x: point.x, y: middleY },
      control2: { x: end.x, y: middleY },
      end,
    };
  });
  const selectedSegment = segments[selectedIndex];
  const modulePositions = modulePlacements(selectedSegment, moduleCount);

  return {
    height: finalPoint.y + 80,
    waypointPositions,
    segments,
    modulePositions,
    finalPoint,
  };
};
