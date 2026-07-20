import { MY_ACADEMY_CURRICULUM } from '../data/myAcademyCurriculum';
import type { MyAcademyCurriculumMoment } from '../types/myAcademyCurriculum';

export type MyAcademyMomentId = MyAcademyCurriculumMoment['id'];
export type MyAcademyNavigationState = 'current' | 'first-available' | 'ahead' | 'horizon' | 'explorable';

export interface MyAcademyWaypointPresentation {
  navigationState: MyAcademyNavigationState;
  label: string;
  isCurrent: boolean;
}

export const MY_ACADEMY_POSITION_EXPLANATION = {
  pt: 'Sua posição é apenas um ponto de referência no mapa, não um nível atribuído.',
  en: 'Your position is only a reference point on the map, not an assigned level.',
} as const;

export const getMyAcademyPositionExplanation = (
  hasSelfRecord: boolean,
  lang: 'pt' | 'en',
): string => {
  if (hasSelfRecord) {
    return lang === 'pt'
      ? 'Sua posição indica o território da sua última experiência, não um nível atribuído.'
      : 'Your position indicates the territory of your latest experience, not an assigned level.';
  }

  return lang === 'pt'
    ? 'Sua posição indica o ponto de partida desta visita, não um nível atribuído.'
    : 'Your position indicates the starting point of this visit, not an assigned level.';
};

export const getMyAcademyPositionMomentId = (hasSelfRecord: boolean): MyAcademyMomentId => (
  hasSelfRecord ? '1' : '0'
);

export const getMyAcademyDisplayNumber = (momentId: MyAcademyMomentId): number => (
  Number(momentId) + 1
);

export const getMyAcademyPublicMapLabel = (lang: 'pt' | 'en'): string => (
  lang === 'pt' ? 'GA · MAPA 1—7' : 'GA · MAP 1—7'
);

export const shouldShowMyAcademyTerritoryStatus = (
  momentId: MyAcademyMomentId,
  isCurrent: boolean,
): boolean => !(momentId === '0' && isCurrent);

export const getMyAcademyWaypointPresentation = (
  momentId: MyAcademyMomentId,
  hasSelfRecord: boolean,
  lang: 'pt' | 'en',
): MyAcademyWaypointPresentation => {
  const isPt = lang === 'pt';
  const currentMomentId = getMyAcademyPositionMomentId(hasSelfRecord);

  if (momentId === currentMomentId) {
    return {
      navigationState: 'current',
      label: hasSelfRecord
        ? (isPt ? 'Última experiência aqui' : 'Latest experience here')
        : (isPt ? 'Você está aqui · explorando agora' : 'You are here · exploring now'),
      isCurrent: true,
    };
  }

  if (!hasSelfRecord && momentId === '1') {
    return {
      navigationState: 'first-available',
      label: isPt ? 'Primeira experiência disponível' : 'First experience available',
      isCurrent: false,
    };
  }

  if (momentId === '5' || momentId === '6') {
    return {
      navigationState: 'horizon',
      label: isPt ? 'Horizonte da jornada' : 'Journey horizon',
      isCurrent: false,
    };
  }

  if (momentId === '2' || momentId === '3' || momentId === '4') {
    return {
      navigationState: 'ahead',
      label: isPt ? 'Trilhas à frente' : 'Paths ahead',
      isCurrent: false,
    };
  }

  return {
    navigationState: 'explorable',
    label: isPt ? 'Território explorável' : 'Explorable territory',
    isCurrent: false,
  };
};

export const getMyAcademyTerritory = (momentId: MyAcademyMomentId): MyAcademyCurriculumMoment => {
  const territory = MY_ACADEMY_CURRICULUM.find(moment => moment.id === momentId);
  if (!territory) throw new Error(`Unknown My Academy territory: ${momentId}`);
  return territory;
};

export const getMyAcademyWelcomeMode = (isFirstAccess: boolean): 'expanded' | 'collapsible' => (
  isFirstAccess ? 'expanded' : 'collapsible'
);