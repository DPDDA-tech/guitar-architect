import type { LearningInteraction } from '../types/learningUnit';
import type {
  MyAcademyNextPreference,
  MyAcademyPerception,
  MyAcademySelfRecord,
  MyAcademySuggestion,
} from '../types/myAcademyJourney';

export const NMC_RIT_001_SELF_RECORD_KEY = 'ga_my_academy_nmc_rit_001_self_record';
export const MY_ACADEMY_INTRO_SEEN_KEY = 'ga_my_academy_intro_seen_v1';

const INTERACTIONS: LearningInteraction[] = ['observed', 'moved', 'played', 'explored-tool'];
const PERCEPTIONS: MyAcademyPerception[] = ['clear', 'sometimes', 'unclear', 'no-answer'];
const NEXT_PREFERENCES: MyAcademyNextPreference[] = ['repeat', 'review', 'studio', 'continue'];

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const isNullableChoice = <T extends string>(value: unknown, choices: T[]): value is T | null => (
  value === null || (typeof value === 'string' && choices.includes(value as T))
);

export const parseMyAcademySelfRecord = (rawValue: string | null): MyAcademySelfRecord | null => {
  if (!rawValue) return null;

  try {
    const value: unknown = JSON.parse(rawValue);
    if (!isObject(value)) return null;

    if (
      value.unitId !== 'NMC-RIT-001' ||
      typeof value.unitVersion !== 'string' ||
      value.unitVersion.length === 0 ||
      typeof value.recordedAt !== 'string' ||
      !Number.isFinite(Date.parse(value.recordedAt)) ||
      value.declaredByUser !== true ||
      !isNullableChoice(value.interaction, INTERACTIONS) ||
      !isNullableChoice(value.perception, PERCEPTIONS) ||
      !isNullableChoice(value.nextPreference, NEXT_PREFERENCES)
    ) {
      return null;
    }

    return {
      unitId: value.unitId,
      unitVersion: value.unitVersion,
      recordedAt: value.recordedAt,
      declaredByUser: value.declaredByUser,
      interaction: value.interaction,
      perception: value.perception,
      nextPreference: value.nextPreference,
    };
  } catch {
    return null;
  }
};

export const loadMyAcademySelfRecord = (
  storage: Pick<Storage, 'getItem'> = window.localStorage,
): MyAcademySelfRecord | null => {
  try {
    return parseMyAcademySelfRecord(storage.getItem(NMC_RIT_001_SELF_RECORD_KEY));
  } catch {
    return null;
  }
};

export const createNmcRit001SelfRecord = ({
  unitVersion,
  interaction,
  perception,
  nextPreference,
  recordedAt = new Date().toISOString(),
}: {
  unitVersion: string;
  interaction: LearningInteraction | null;
  perception: MyAcademyPerception | null;
  nextPreference: MyAcademyNextPreference | null;
  recordedAt?: string;
}): MyAcademySelfRecord => ({
  unitId: 'NMC-RIT-001',
  unitVersion,
  recordedAt,
  declaredByUser: true,
  interaction,
  perception,
  nextPreference,
});

export const saveMyAcademySelfRecord = (
  record: MyAcademySelfRecord,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void => {
  storage.setItem(NMC_RIT_001_SELF_RECORD_KEY, JSON.stringify(record));
};

export const loadMyAcademyIntroSeen = (
  storage: Pick<Storage, 'getItem'> = window.localStorage,
): boolean => {
  try {
    return storage.getItem(MY_ACADEMY_INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

export const markMyAcademyIntroSeen = (
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void => {
  try {
    storage.setItem(MY_ACADEMY_INTRO_SEEN_KEY, '1');
  } catch {
    // The experience remains usable when local storage is unavailable.
  }
};

export const getMyAcademySuggestion = (
  preference: MyAcademyNextPreference | null,
  lang: 'pt' | 'en',
): MyAcademySuggestion => {
  const suggestions: Record<MyAcademyNextPreference, Omit<MyAcademySuggestion, 'preference'>> = lang === 'pt'
    ? {
        repeat: {
          title: 'Repetir a experiência',
          explanation: 'Sugerimos repetir porque você declarou que prefere reencontrar esta experiência agora.',
          actionLabel: 'Repetir experiência',
          destination: '/my-academy/prototype/nmc-rit-001',
        },
        review: {
          title: 'Revisar Pulso e regularidade',
          explanation: 'Sugerimos revisar porque você declarou que prefere retomar a explicação desta unidade.',
          actionLabel: 'Revisar unidade',
          destination: '/my-academy/prototype/nmc-rit-001',
        },
        studio: {
          title: 'Explorar o Studio livremente',
          explanation: 'Sugerimos o Studio porque você declarou que prefere explorar livremente as ferramentas.',
          actionLabel: 'Explorar o Studio',
          destination: '/studio',
        },
        continue: {
          title: 'A próxima unidade está em preparação',
          explanation: 'Como você declarou que prefere continuar a jornada, sugerimos explorar o mapa enquanto a próxima unidade é preparada.',
          actionLabel: 'Explorar o mapa',
          destination: '#mapa',
        },
      }
    : {
        repeat: {
          title: 'Repeat the experience',
          explanation: 'We suggest repeating it because you said you would prefer to revisit this experience now.',
          actionLabel: 'Repeat experience',
          destination: '/my-academy/prototype/nmc-rit-001',
        },
        review: {
          title: 'Review Pulse and regularity',
          explanation: 'We suggest reviewing it because you said you would prefer to revisit this unit’s explanation.',
          actionLabel: 'Review unit',
          destination: '/my-academy/prototype/nmc-rit-001',
        },
        studio: {
          title: 'Explore Studio freely',
          explanation: 'We suggest Studio because you said you would prefer to explore the tools freely.',
          actionLabel: 'Explore Studio',
          destination: '/studio',
        },
        continue: {
          title: 'The next unit is being prepared',
          explanation: 'Because you said you would prefer to continue the journey, we suggest exploring the map while the next unit is prepared.',
          actionLabel: 'Explore the map',
          destination: '#mapa',
        },
      };

  if (preference) return { preference, ...suggestions[preference] };

  return lang === 'pt'
    ? {
        preference: null,
        title: 'Explore o mapa livremente',
        explanation: 'Nenhuma preferência de próximo passo foi declarada; o mapa permanece disponível para exploração livre.',
        actionLabel: 'Explorar o mapa',
        destination: '#mapa',
      }
    : {
        preference: null,
        title: 'Explore the map freely',
        explanation: 'No next-step preference was declared, so the map remains available for free exploration.',
        actionLabel: 'Explore the map',
        destination: '#mapa',
      };
};
