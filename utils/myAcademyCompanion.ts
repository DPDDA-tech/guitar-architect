import type {
  MyAcademyCompanionChoice,
  MyAcademyCompanionId,
  MyAcademyCompanionProfile,
} from '../types/myAcademyCompanion';

export const MY_ACADEMY_COMPANION_KEY = 'ga_my_academy_companion_v1';

export const MY_ACADEMY_COMPANIONS: readonly MyAcademyCompanionProfile[] = [
  {
    id: 'alice',
    name: 'Alice',
    image: '/instructors/1000/alice-card-instructor.webp',
    title: {
      pt: 'Acolhimento e primeiros passos',
      en: 'Welcoming guidance and first steps',
    },
    invitation: {
      pt: 'Posso acompanhar você com calma, clareza e atenção aos detalhes que tornam o começo mais seguro.',
      en: 'I can accompany you with calm, clarity and attention to the details that make the beginning feel safer.',
    },
    emphasis: {
      pt: 'Para quem prefere avançar com explicações acolhedoras e pausas para compreender cada etapa.',
      en: 'For those who prefer welcoming explanations and space to understand each step.',
    },
  },
  {
    id: 'arthur',
    name: 'Arthur',
    image: '/instructors/1000/arthur-card-instructor.webp',
    title: {
      pt: 'Incentivo e evolução',
      en: 'Encouragement and development',
    },
    invitation: {
      pt: 'Posso acompanhar você com incentivo, objetivos claros e pequenos desafios para manter a jornada em movimento.',
      en: 'I can accompany you with encouragement, clear goals and small challenges that keep the journey moving.',
    },
    emphasis: {
      pt: 'Para quem prefere transformar cada etapa em impulso para experimentar e seguir adiante.',
      en: 'For those who prefer turning each step into momentum to experiment and move forward.',
    },
  },
] as const;

const isCompanionId = (value: unknown): value is MyAcademyCompanionId => (
  value === 'alice' || value === 'arthur'
);

export const parseMyAcademyCompanionChoice = (rawValue: string | null): MyAcademyCompanionChoice | null => {
  if (!rawValue) return null;

  try {
    const value: unknown = JSON.parse(rawValue);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const candidate = value as Record<string, unknown>;

    if (
      !isCompanionId(candidate.companionId)
      || typeof candidate.chosenAt !== 'string'
      || !Number.isFinite(Date.parse(candidate.chosenAt))
      || candidate.declaredByUser !== true
      || candidate.reversible !== true
    ) {
      return null;
    }

    return {
      companionId: candidate.companionId,
      chosenAt: candidate.chosenAt,
      declaredByUser: true,
      reversible: true,
    };
  } catch {
    return null;
  }
};

export const createMyAcademyCompanionChoice = (
  companionId: MyAcademyCompanionId,
  chosenAt = new Date().toISOString(),
): MyAcademyCompanionChoice => ({
  companionId,
  chosenAt,
  declaredByUser: true,
  reversible: true,
});

export const loadMyAcademyCompanionChoice = (
  storage: Pick<Storage, 'getItem'> = window.localStorage,
): MyAcademyCompanionChoice | null => {
  try {
    return parseMyAcademyCompanionChoice(storage.getItem(MY_ACADEMY_COMPANION_KEY));
  } catch {
    return null;
  }
};

export const saveMyAcademyCompanionChoice = (
  choice: MyAcademyCompanionChoice,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void => {
  storage.setItem(MY_ACADEMY_COMPANION_KEY, JSON.stringify(choice));
};

export const clearMyAcademyCompanionChoice = (
  storage: Pick<Storage, 'removeItem'> = window.localStorage,
): void => {
  storage.removeItem(MY_ACADEMY_COMPANION_KEY);
};

export const getMyAcademyCompanionProfile = (
  companionId: MyAcademyCompanionId,
): MyAcademyCompanionProfile => (
  MY_ACADEMY_COMPANIONS.find(companion => companion.id === companionId)!
);
