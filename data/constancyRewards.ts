export type ConstancyReward = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  requiredDays: number;
};

const constancyPath = (fileName: string) => `/tierothers/constancy/${fileName}`;

export const constancyRewards: ConstancyReward[] = [
  {
    id: 'constancy_003',
    title: 'Constância — 3 dias',
    category: 'CONSTÂNCIA',
    description: 'Primeiro passo na construção do hábito.',
    image: constancyPath('toconst003.webp'),
    requiredDays: 3,
  },
  {
    id: 'constancy_007',
    title: 'Constância — 7 dias',
    category: 'CONSTÂNCIA',
    description: 'Primeira semana de presença contínua.',
    image: constancyPath('toconst007.webp'),
    requiredDays: 7,
  },
  {
    id: 'constancy_015',
    title: 'Constância — 15 dias',
    category: 'CONSTÂNCIA',
    description: 'Compromisso inicial com a jornada.',
    image: constancyPath('toconst015.webp'),
    requiredDays: 15,
  },
  {
    id: 'constancy_030',
    title: 'Constância — 30 dias',
    category: 'CONSTÂNCIA',
    description: 'Um mês de disciplina musical.',
    image: constancyPath('toconst030.webp'),
    requiredDays: 30,
  },
  {
    id: 'constancy_060',
    title: 'Constância — 60 dias',
    category: 'CONSTÂNCIA',
    description: 'Disciplina que começa a construir estrutura.',
    image: constancyPath('toconst060.webp'),
    requiredDays: 60,
  },
  {
    id: 'constancy_090',
    title: 'Constância — 90 dias',
    category: 'CONSTÂNCIA',
    description: 'Hábito consolidado na rotina musical.',
    image: constancyPath('toconst090.webp'),
    requiredDays: 90,
  },
  {
    id: 'constancy_120',
    title: 'Constância — 120 dias',
    category: 'CONSTÂNCIA',
    description: 'Presença consistente na obra.',
    image: constancyPath('toconst120.webp'),
    requiredDays: 120,
  },
  {
    id: 'constancy_180',
    title: 'Constância — 180 dias',
    category: 'CONSTÂNCIA',
    description: 'Meia jornada anual de constância.',
    image: constancyPath('toconst180.webp'),
    requiredDays: 180,
  },
  {
    id: 'constancy_240',
    title: 'Constância — 240 dias',
    category: 'CONSTÂNCIA',
    description: 'Veterano da rotina musical.',
    image: constancyPath('toconst240.webp'),
    requiredDays: 240,
  },
  {
    id: 'constancy_300',
    title: 'Constância — 300 dias',
    category: 'CONSTÂNCIA',
    description: 'Constância de elite na construção musical.',
    image: constancyPath('toconst300.webp'),
    requiredDays: 300,
  },
  {
    id: 'constancy_365',
    title: 'Constância — 365 dias',
    category: 'CONSTÂNCIA',
    description: 'Um ano completo de presença no Guitar Architect.',
    image: constancyPath('toconst365.webp'),
    requiredDays: 365,
  },
];