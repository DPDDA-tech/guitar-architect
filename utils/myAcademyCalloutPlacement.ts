export interface CalloutRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type CalloutDirection =
  | 'above'
  | 'below'
  | 'before'
  | 'after'
  | 'above-before'
  | 'above-after'
  | 'below-before'
  | 'below-after';

export interface SafeCalloutPlacement {
  direction: CalloutDirection;
  left: number;
  top: number;
  usedFallback: boolean;
}

interface FindSafeCalloutPlacementInput {
  anchor: CalloutRect;
  width: number;
  height: number;
  bounds: CalloutRect;
  exclusions: readonly CalloutRect[];
  softExclusions?: readonly CalloutRect[];
  preferredDirections: readonly CalloutDirection[];
}

const intersects = (a: CalloutRect, b: CalloutRect, padding = 0): boolean => !(
  a.right + padding <= b.left
  || a.left - padding >= b.right
  || a.bottom + padding <= b.top
  || a.top - padding >= b.bottom
);

const candidateRect = (
  anchor: CalloutRect,
  width: number,
  height: number,
  direction: CalloutDirection,
  gap: number,
): CalloutRect => {
  const centerX = (anchor.left + anchor.right) / 2;
  const centerY = (anchor.top + anchor.bottom) / 2;
  const isBefore = direction.includes('before');
  const isAfter = direction.includes('after');
  const isAbove = direction.includes('above');
  const isBelow = direction.includes('below');
  const left = isBefore
    ? anchor.left - width - gap
    : isAfter
      ? anchor.right + gap
      : centerX - (width / 2);
  const top = isAbove
    ? anchor.top - height - gap
    : isBelow
      ? anchor.bottom + gap
      : centerY - (height / 2);

  return { left, top, right: left + width, bottom: top + height };
};

const isInside = (rect: CalloutRect, bounds: CalloutRect): boolean => (
  rect.left >= bounds.left
  && rect.right <= bounds.right
  && rect.top >= bounds.top
  && rect.bottom <= bounds.bottom
);

const overlapArea = (a: CalloutRect, b: CalloutRect): number => {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
};

const clampToBounds = (rect: CalloutRect, bounds: CalloutRect): CalloutRect => {
  const left = Math.min(Math.max(rect.left, bounds.left), bounds.right - (rect.right - rect.left));
  const top = Math.min(Math.max(rect.top, bounds.top), bounds.bottom - (rect.bottom - rect.top));
  return { left, top, right: left + (rect.right - rect.left), bottom: top + (rect.bottom - rect.top) };
};

export const findSafeMyAcademyCalloutPlacement = ({
  anchor,
  width,
  height,
  bounds,
  exclusions,
  softExclusions = [],
  preferredDirections,
}: FindSafeCalloutPlacementInput): SafeCalloutPlacement => {
  const candidates = preferredDirections.flatMap(direction => (
    [16, 32, 48].map(gap => ({ direction, rect: candidateRect(anchor, width, height, direction, gap) }))
  ));
  const allExclusions = [...exclusions, ...softExclusions];
  const safe = candidates.find(candidate => (
    isInside(candidate.rect, bounds)
    && allExclusions.every(exclusion => !intersects(candidate.rect, exclusion, 6))
  ));

  if (safe) return { direction: safe.direction, left: safe.rect.left, top: safe.rect.top, usedFallback: false };

  const anchorCenterX = (anchor.left + anchor.right) / 2;
  const anchorCenterY = (anchor.top + anchor.bottom) / 2;
  const gridCandidates: CalloutRect[] = [];
  const maxLeft = bounds.right - width;
  const maxTop = bounds.bottom - height;
  for (let top = bounds.top; top <= maxTop; top += 12) {
    for (let left = bounds.left; left <= maxLeft; left += 12) {
      gridCandidates.push({ left, top, right: left + width, bottom: top + height });
    }
  }
  gridCandidates.push({ left: maxLeft, top: maxTop, right: bounds.right, bottom: bounds.bottom });
  const safestGridCandidate = gridCandidates
    .filter(rect => allExclusions.every(exclusion => !intersects(rect, exclusion, 6)))
    .map(rect => ({
      rect,
      distance: Math.hypot(
        ((rect.left + rect.right) / 2) - anchorCenterX,
        ((rect.top + rect.bottom) / 2) - anchorCenterY,
      ),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (safestGridCandidate) {
    const centerX = (safestGridCandidate.rect.left + safestGridCandidate.rect.right) / 2;
    const centerY = (safestGridCandidate.rect.top + safestGridCandidate.rect.bottom) / 2;
    const horizontal = centerX < anchorCenterX ? 'before' : 'after';
    const vertical = centerY < anchorCenterY ? 'above' : 'below';
    const direction: CalloutDirection = Math.abs(centerX - anchorCenterX) > Math.abs(centerY - anchorCenterY) * 1.5
      ? horizontal
      : Math.abs(centerY - anchorCenterY) > Math.abs(centerX - anchorCenterX) * 1.5
        ? vertical
        : `${vertical}-${horizontal}`;
    return {
      direction,
      left: safestGridCandidate.rect.left,
      top: safestGridCandidate.rect.top,
      usedFallback: true,
    };
  }

  const fallback = candidates
    .map(candidate => {
      const rect = clampToBounds(candidate.rect, bounds);
      const collisionArea = exclusions.reduce((total, exclusion) => total + overlapArea(rect, exclusion), 0);
      return { ...candidate, rect, collisionArea };
    })
    .sort((a, b) => a.collisionArea - b.collisionArea)[0];

  return {
    direction: fallback.direction,
    left: fallback.rect.left,
    top: fallback.rect.top,
    usedFallback: true,
  };
};
