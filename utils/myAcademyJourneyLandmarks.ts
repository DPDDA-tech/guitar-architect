import { MY_ACADEMY_CURRICULUM } from '../data/myAcademyCurriculum';
import type { MyAcademyLocalizedText } from '../types/myAcademyCurriculum';
import type { MyAcademyMomentId } from './myAcademyMapPresentation';

export type MyAcademyJourneyLandmarkType =
  | 'guide'
  | 'specialist'
  | 'guest'
  | 'studio'
  | 'unit'
  | 'optional-exploration';

export interface MyAcademyJourneyLandmark {
  id: string;
  type: MyAcademyJourneyLandmarkType;
  momentId: MyAcademyMomentId;
  moduleId: string;
  label: MyAcademyLocalizedText;
  description: MyAcademyLocalizedText;
  destination?: '/studio' | '/my-academy/prototype/nmc-rit-001';
  targetId?: 'my-academy-clara-welcome';
  curriculumItemId?: 'NMC-RIT-001';
}

const configuredLandmarks: MyAcademyJourneyLandmark[] = [
  {
    id: 'clara-guide',
    type: 'guide',
    momentId: '0',
    moduleId: 'M0-01',
    label: { pt: 'Clara · guia da jornada', en: 'Clara · journey guide' },
    description: { pt: 'Rever a apresentação existente do mapa.', en: 'Review the existing map introduction.' },
    targetId: 'my-academy-clara-welcome',
  },
  {
    id: 'nmc-rit-001-unit',
    type: 'unit',
    momentId: '1',
    moduleId: 'M1-01',
    label: { pt: 'Pulso e regularidade', en: 'Pulse and regularity' },
    description: { pt: 'Unidade disponível · NMC-RIT-001', en: 'Available unit · NMC-RIT-001' },
    destination: '/my-academy/prototype/nmc-rit-001',
    curriculumItemId: 'NMC-RIT-001',
  },
  {
    id: 'studio-metronome',
    type: 'studio',
    momentId: '1',
    moduleId: 'M1-01',
    label: { pt: 'Studio · metrônomo contextual', en: 'Studio · contextual metronome' },
    description: {
      pt: 'Explorar o Studio e usar o metrônomo quando fizer sentido para a experiência.',
      en: 'Explore Studio and use the metronome when it supports the experience.',
    },
    destination: '/studio',
  },
];

export const getMyAcademyModuleLandmarks = (momentId: MyAcademyMomentId) => {
  const territory = MY_ACADEMY_CURRICULUM.find(moment => moment.id === momentId);
  if (!territory) return [];

  return territory.modules.map(module => ({
    id: module.id,
    title: module.title,
  }));
};

export const getMyAcademyJourneyLandmarks = (momentId: MyAcademyMomentId): MyAcademyJourneyLandmark[] => (
  configuredLandmarks.filter(landmark => landmark.momentId === momentId)
);

export const isMyAcademyModuleInTerritory = (momentId: MyAcademyMomentId, moduleId: string): boolean => (
  MY_ACADEMY_CURRICULUM
    .find(moment => moment.id === momentId)
    ?.modules.some(module => module.id === moduleId) ?? false
);

export const isConfiguredJourneyLandmarkValid = (landmark: MyAcademyJourneyLandmark): boolean => {
  const territory = MY_ACADEMY_CURRICULUM.find(moment => moment.id === landmark.momentId);
  const module = territory?.modules.find(candidate => candidate.id === landmark.moduleId);
  if (!module) return false;
  if (!landmark.curriculumItemId) return true;

  return module.items.some(item => (
    item.id === landmark.curriculumItemId
    && item.kind === 'unit'
    && item.status === 'available'
    && item.path === landmark.destination
  ));
};
