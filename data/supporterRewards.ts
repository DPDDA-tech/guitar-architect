export type SupporterRewardTier =
  | 'candidato'
  | 'aprendiz'
  | 'pedreiro'
  | 'contramestre'
  | 'mestre_de_obras'
  | 'engenheiro'
  | 'arquiteto';

export type SupporterReward = {
  id: string;
  title: string;
  category: 'supporter';
  description: string;
  image: string;
  minValue: number;
  maxValue?: number;
  tier: SupporterRewardTier;
};

const supporterPath = (fileName: string) => `/tierothers/supporters/${fileName}`;

export const supporterRewards: SupporterReward[] = [
  {
    id: 'supporter-candidato',
    title: 'Apoiador Candidato',
    category: 'supporter',
    description: 'Primeiro apoio ao ecossistema Guitar Architect.',
    image: supporterPath('tosupcand-1-25.webp'),
    minValue: 1,
    maxValue: 25,
    tier: 'candidato',
  },
  {
    id: 'supporter-aprendiz',
    title: 'Apoiador Aprendiz',
    category: 'supporter',
    description: 'Contribua com a construção inicial do projeto.',
    image: supporterPath('tosupcand-26-50.webp'),
    minValue: 26,
    maxValue: 50,
    tier: 'aprendiz',
  },
  {
    id: 'supporter-pedreiro',
    title: 'Apoiador Pedreiro',
    category: 'supporter',
    description: 'Apoio ativo ao desenvolvimento do Guitar Architect.',
    image: supporterPath('tosupcand-51-100.webp'),
    minValue: 51,
    maxValue: 100,
    tier: 'pedreiro',
  },
  {
    id: 'supporter-contramestre',
    title: 'Apoiador Contramestre',
    category: 'supporter',
    description: 'Ajude a estruturar e expandir o universo do GA.',
    image: supporterPath('tosupcand-101-250.webp'),
    minValue: 101,
    maxValue: 250,
    tier: 'contramestre',
  },
  {
    id: 'supporter-mestre-obras',
    title: 'Apoiador Mestre de Obras',
    category: 'supporter',
    description: 'Contribuição de grande impacto para a evolução da plataforma.',
    image: supporterPath('tosupcand-251-500.webp'),
    minValue: 251,
    maxValue: 500,
    tier: 'mestre_de_obras',
  },
  {
    id: 'supporter-engenheiro',
    title: 'Apoiador Engenheiro',
    category: 'supporter',
    description: 'Apoio estratégico ao crescimento do ecossistema Guitar Architect.',
    image: supporterPath('tosupcand-501-1000.webp'),
    minValue: 501,
    maxValue: 1000,
    tier: 'engenheiro',
  },
  {
    id: 'supporter-arquiteto',
    title: 'Apoiador Arquiteto',
    category: 'supporter',
    description: 'Pilar lendário da construção do Guitar Architect.',
    image: supporterPath('tosupcand-1001+.webp'),
    minValue: 1001,
    tier: 'arquiteto',
  },
];

export const getUnlockedSupporterRewards = (total: number) => (
  supporterRewards.filter(reward => total >= reward.minValue)
);

