import type {
  MyAcademyCompanionChoice,
  MyAcademyCompanionId,
  MyAcademyCompanionProfile,
} from '../types/myAcademyCompanion';

export const MY_ACADEMY_COMPANION_KEY = 'ga_my_academy_companion_v1';

// Domínio editorial implícito na escolha (não é um campo de dado — apenas orienta a copy
// e uma futura entrada contextual ao longo do percurso; a escolha continua reversível,
// não exclusiva, e não altera o currículo disponível):
// - Alice → percepção, expressão, aplicação musical, escuta, fraseado.
// - Arthur → estrutura, organização, relações, fundamentação técnica.
export const MY_ACADEMY_COMPANIONS: readonly MyAcademyCompanionProfile[] = [
  {
    id: 'alice',
    name: 'Alice',
    image: '/instructors/1000/alice-card-instructor.webp',
    title: {
      pt: 'Percepção e expressão',
      en: 'Perception and expression',
    },
    invitation: {
      pt: 'Vamos descobrir como esse conteúdo começa a aparecer no som que você produz.',
      en: 'Let’s discover how this content starts to show up in the sound you produce.',
    },
    emphasis: {
      pt: 'Para quem prefere avançar com atenção à escuta, ao fraseado e à aplicação musical do que está aprendendo.',
      en: 'For those who prefer to move forward paying attention to listening, phrasing and the musical application of what they are learning.',
    },
  },
  {
    id: 'arthur',
    name: 'Arthur',
    image: '/instructors/1000/arthur-card-instructor.webp',
    title: {
      pt: 'Estrutura e compreensão técnica',
      en: 'Structure and technical understanding',
    },
    invitation: {
      pt: 'Vamos entender como este fundamento se conecta ao que você já estudou e ao que virá depois.',
      en: 'Let’s understand how this fundamental connects to what you have already studied and what comes next.',
    },
    emphasis: {
      pt: 'Para quem prefere avançar entendendo a organização, as relações e a estrutura técnica de cada conteúdo.',
      en: 'For those who prefer to move forward by understanding the organization, relationships and technical structure of each topic.',
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
