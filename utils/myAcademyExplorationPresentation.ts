import type { MyAcademyMapStatus } from '../types/myAcademyCurriculum';
import type { MyAcademyMomentId } from './myAcademyMapPresentation';

export interface MyAcademyExplorationEvidence {
  confirmedMomentIds: readonly MyAcademyMomentId[];
  confirmedModuleIds: readonly string[];
  latestMomentId: MyAcademyMomentId | null;
  startingMomentId: MyAcademyMomentId;
}

export interface MyAcademyWaypointVisualState {
  isUnexplored: boolean;
  hasConfirmedExperience: boolean;
  confirmedModuleCount: number;
  isLatestExperience: boolean;
  isSelected: boolean;
  hasAvailableExperience: boolean;
  isStartingPoint: boolean;
  isCurricularHorizon: boolean;
}

export type MyAcademyWaypointAccent = 'cyan' | 'gold';

export const getMyAcademyWaypointAccent = (
  state: MyAcademyWaypointVisualState,
): MyAcademyWaypointAccent => (
  state.isStartingPoint || state.isLatestExperience ? 'gold' : 'cyan'
);

export const deriveMyAcademyExplorationEvidence = (
  hasNmcRit001SelfRecord: boolean,
): MyAcademyExplorationEvidence => ({
  confirmedMomentIds: hasNmcRit001SelfRecord ? ['1'] : [],
  confirmedModuleIds: hasNmcRit001SelfRecord ? ['M1-01'] : [],
  latestMomentId: hasNmcRit001SelfRecord ? '1' : null,
  startingMomentId: '0',
});

export const getMyAcademyWaypointVisualState = (
  momentId: MyAcademyMomentId,
  selectedMomentId: MyAcademyMomentId,
  curriculumStatus: MyAcademyMapStatus,
  evidence: MyAcademyExplorationEvidence,
): MyAcademyWaypointVisualState => {
  const hasConfirmedExperience = evidence.confirmedMomentIds.includes(momentId);
  const confirmedModuleCount = evidence.confirmedModuleIds.filter(moduleId => (
    moduleId.startsWith(`M${momentId}-`)
  )).length;

  return {
    isUnexplored: !hasConfirmedExperience,
    hasConfirmedExperience,
    confirmedModuleCount,
    isLatestExperience: evidence.latestMomentId === momentId,
    isSelected: selectedMomentId === momentId,
    hasAvailableExperience: curriculumStatus === 'available',
    isStartingPoint: evidence.startingMomentId === momentId,
    isCurricularHorizon: curriculumStatus === 'horizon',
  };
};
