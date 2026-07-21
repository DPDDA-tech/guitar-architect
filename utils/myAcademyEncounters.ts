import { getInstructorById } from '../data/instructors';
import { getGuestSpecialistById } from '../data/guestSpecialists';
import type { MyAcademyLocalizedText } from '../types/myAcademyCurriculum';
import type { MyAcademyMomentId } from './myAcademyMapPresentation';

export type MyAcademyEncounterKind = 'guidance' | 'lesson' | 'specialist-intervention';

interface MyAcademyEncounterEntry {
  id: string;
  characterId: string;
  momentId: MyAcademyMomentId;
  moduleId: string;
  topicId?: string;
  kind: MyAcademyEncounterKind;
  title: MyAcademyLocalizedText;
  summary: MyAcademyLocalizedText;
  order: number;
}

export interface MyAcademyEncounterProfile extends MyAcademyEncounterEntry {
  name: string;
  image: string;
  profilePath?: string;
}

/**
 * Cada entrada representa uma participação real de um personagem em um
 * módulo/tópico do currículo (não apenas "presença" num território). O botão
 * "Rever encontro" navega para moduleId (ou topicId, quando houver, para
 * granularidade maior) — ver goToEncounter em MyAcademyCurriculumMap.tsx.
 *
 * Tom cobre 3 tópicos (M0-03-01/-02/-03) hoje agrupados numa única entrada de
 * nível de módulo, em vez de 3 cards quase idênticos; fácil de desmembrar
 * depois caso faça sentido.
 *
 * Alice e Arthur não entram aqui: são uma escolha de acompanhamento (ver
 * utils/myAcademyCompanion.ts e MyAcademyCompanionIntro.tsx), não uma
 * participação curricular registrada — só passam a virar um encontro quando
 * houver uma intervenção real vinculada a um conteúdo.
 *
 * Nome, imagem e rota são sempre resolvidos a partir dos cadastros canônicos
 * (data/instructors.ts, data/guestSpecialists.ts), nunca duplicados aqui.
 */
const MY_ACADEMY_ENCOUNTERS: readonly MyAcademyEncounterEntry[] = [
  {
    id: 'clara-boas-vindas',
    characterId: 'clara',
    momentId: '0',
    moduleId: 'M0-01',
    topicId: 'M0-01-01',
    kind: 'guidance',
    title: { pt: 'Boas-vindas ao My Academy', en: 'Welcome to My Academy' },
    summary: {
      pt: 'Clara apresenta como o mapa conecta o ecossistema e organiza a jornada.',
      en: 'Clara explains how the map connects the ecosystem and organizes the journey.',
    },
    order: 0,
  },
  {
    id: 'tom-instrumento-seguranca',
    characterId: 'tom',
    momentId: '0',
    moduleId: 'M0-03',
    kind: 'lesson',
    title: { pt: 'Instrumento e segurança', en: 'Instrument and safety' },
    summary: {
      pt: 'Tom conduz o reconhecimento do instrumento, o caminho do som e a afinação como cuidado.',
      en: 'Tom guides recognizing the instrument, the sound path and tuning as care.',
    },
    order: 1,
  },
  {
    id: 'helena-ajuste-corpo',
    characterId: 'dra-helena',
    momentId: '0',
    moduleId: 'M0-03',
    topicId: 'M0-03-04',
    kind: 'specialist-intervention',
    title: { pt: 'Ajuste do instrumento ao corpo', en: 'Fitting the instrument to your body' },
    summary: {
      pt: 'Dra. Helena Villaça orienta sobre postura, apoio do instrumento e sinais de desconforto.',
      en: 'Dr. Helena Villaça guides on posture, instrument support and signs of discomfort.',
    },
    order: 2,
  },
];

const resolveCharacterProfile = (characterId: string): { name: string; image: string; profilePath?: string } | null => {
  if (characterId === 'dra-helena') {
    const specialist = getGuestSpecialistById('dra-helena');
    if (!specialist?.cardImage || !specialist.cardName) return null;
    return { name: specialist.cardName, image: specialist.cardImage, profilePath: '/especialistas/dra-helena' };
  }

  const instructor = getInstructorById(characterId);
  if (!instructor) return null;
  const hasStandaloneProfile = characterId === 'clara' || characterId === 'tom';
  return {
    name: instructor.name,
    image: instructor.cardImage,
    profilePath: hasStandaloneProfile ? `/instructors/${characterId}` : undefined,
  };
};

export const getMyAcademyEncounterProfiles = (): readonly MyAcademyEncounterProfile[] => (
  MY_ACADEMY_ENCOUNTERS
    .map(entry => {
      const profile = resolveCharacterProfile(entry.characterId);
      return profile ? { ...entry, ...profile } : null;
    })
    .filter((entry): entry is MyAcademyEncounterProfile => entry !== null)
    .sort((a, b) => a.order - b.order)
);

export const getMyAcademyEncountersForModule = (moduleId: string): readonly MyAcademyEncounterProfile[] => (
  getMyAcademyEncounterProfiles().filter(entry => entry.moduleId === moduleId)
);
