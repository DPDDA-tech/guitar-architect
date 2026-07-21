import type { MyAcademyMomentId } from './myAcademyMapPresentation';

const MY_ACADEMY_RETURN_CONTEXT_KEY = 'ga_my_academy_return_context_v1';

export interface MyAcademyReturnContext {
  mapOpen: boolean;
  selectedMomentId: MyAcademyMomentId;
  selectedModuleId: string;
  itemId?: string;
  scrollY?: number;
  destination?: string;
}

const isMomentId = (value: unknown): value is MyAcademyMomentId => (
  value === '0' || value === '1' || value === '2' || value === '3' || value === '4' || value === '5' || value === '6'
);

export const loadMyAcademyReturnContext = (): MyAcademyReturnContext | null => {
  try {
    const raw = window.sessionStorage.getItem(MY_ACADEMY_RETURN_CONTEXT_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const candidate = value as Record<string, unknown>;
    if (!isMomentId(candidate.selectedMomentId) || typeof candidate.selectedModuleId !== 'string') return null;

    return {
      mapOpen: candidate.mapOpen !== false,
      selectedMomentId: candidate.selectedMomentId,
      selectedModuleId: candidate.selectedModuleId,
      itemId: typeof candidate.itemId === 'string' ? candidate.itemId : undefined,
      scrollY: typeof candidate.scrollY === 'number' && Number.isFinite(candidate.scrollY) ? candidate.scrollY : undefined,
      destination: typeof candidate.destination === 'string' ? candidate.destination : undefined,
    };
  } catch {
    return null;
  }
};

export const saveMyAcademyReturnContext = (context: MyAcademyReturnContext): void => {
  try {
    window.sessionStorage.setItem(MY_ACADEMY_RETURN_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // The map remains usable even when session storage is unavailable.
  }
};

export const updateMyAcademyReturnContext = (patch: Partial<MyAcademyReturnContext>): void => {
  const current = loadMyAcademyReturnContext();
  if (!current && (!patch.selectedMomentId || typeof patch.selectedModuleId !== 'string')) return;
  saveMyAcademyReturnContext({
    mapOpen: true,
    selectedMomentId: patch.selectedMomentId ?? current!.selectedMomentId,
    selectedModuleId: patch.selectedModuleId ?? current!.selectedModuleId,
    itemId: patch.itemId ?? current?.itemId,
    scrollY: patch.scrollY ?? current?.scrollY,
    destination: patch.destination ?? current?.destination,
  });
};

export const hasMyAcademyReturnContextForPath = (path: string): boolean => {
  const context = loadMyAcademyReturnContext();
  return Boolean(context?.destination && context.destination === path);
};
