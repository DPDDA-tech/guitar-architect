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
    image: supporterPath('tosupgaand-1-25-S1.webp'),
    minValue: 1,
    maxValue: 25,
    tier: 'candidato',
  },
  {
    id: 'supporter-aprendiz',
    title: 'Apoiador Aprendiz',
    category: 'supporter',
    description: 'Contribua com a construção inicial do projeto.',
    image: supporterPath('tosupgaapr-26-50-S1.webp'),
    minValue: 26,
    maxValue: 50,
    tier: 'aprendiz',
  },
  {
    id: 'supporter-pedreiro',
    title: 'Apoiador Pedreiro',
    category: 'supporter',
    description: 'Apoio ativo ao desenvolvimento do Guitar Architect.',
    image: supporterPath('tosupgaped-51-100-S1.webp'),
    minValue: 51,
    maxValue: 100,
    tier: 'pedreiro',
  },
  {
    id: 'supporter-contramestre',
    title: 'Apoiador Contramestre',
    category: 'supporter',
    description: 'Ajude a estruturar e expandir o universo do GA.',
    image: supporterPath('tosupgaconmst-101-250-S1.webp'),
    minValue: 101,
    maxValue: 250,
    tier: 'contramestre',
  },
  {
    id: 'supporter-mestre-obras',
    title: 'Apoiador Mestre de Obras',
    category: 'supporter',
    description: 'Contribuição de grande impacto para a evolução da plataforma.',
    image: supporterPath('tosupgamest-251-500-S1.webp'),
    minValue: 251,
    maxValue: 500,
    tier: 'mestre_de_obras',
  },
  {
    id: 'supporter-engenheiro',
    title: 'Apoiador Engenheiro',
    category: 'supporter',
    description: 'Apoio estratégico ao crescimento do ecossistema Guitar Architect.',
    image: supporterPath('tosupgaeng-501-1000-S1.webp'),
    minValue: 501,
    maxValue: 1000,
    tier: 'engenheiro',
  },
  {
    id: 'supporter-arquiteto',
    title: 'Apoiador Arquiteto',
    category: 'supporter',
    description: 'Pilar lendário da construção do Guitar Architect.',
    image: supporterPath('tosupgaarq-1001+-S1.webp'),
    minValue: 1001,
    tier: 'arquiteto',
  },
];

export const getUnlockedSupporterRewards = (total: number) => (
  supporterRewards.filter(reward => total >= reward.minValue)
);

/**
 * Obtém o tier atual do apoiador baseado no total acumulado
 * @param total - Valor total acumulado de contribuições
 * @returns O reward do tier atual ou null se nenhum tier foi atingido
 *
 * TODO: Admin Panel /admin/supporters
 * - Usar para validar tier antes de liberar badge
 * - Registrar histórico de mudanças de tier
 */
export const getCurrentSupporterTier = (total: number) => {
  const validRewards = supporterRewards.filter(reward => total >= reward.minValue);
  return validRewards.length > 0 ? validRewards[validRewards.length - 1] : null;
};

/**
 * Obtém o próximo tier a ser desbloqueado
 * @param total - Valor total acumulado de contribuições
 * @returns O reward do próximo tier ou null se o tier máximo foi atingido
 *
 * TODO: Admin Panel /admin/supporters
 * - Usar para notificar usuário do próximo milestone
 * - Calcular tempo estimado até o próximo tier
 */
export const getNextSupporterTier = (total: number) => {
  const nextReward = supporterRewards.find(reward => total < reward.minValue);
  return nextReward || null;
};

/**
 * Calcula quanto falta para atingir o próximo tier
 * @param total - Valor total acumulado de contribuições
 * @returns Valor restante necessário ou 0 se o tier máximo foi atingido
 *
 * TODO: Admin Panel /admin/supporters
 * - Usar para gamification e motivação
 * - Enviar notificações quando próximo de milestone
 */
export const getRemainingForNextTier = (total: number) => {
  const nextTier = getNextSupporterTier(total);
  if (!nextTier) return 0;
  const remaining = nextTier.minValue - total;
  return Math.max(0, remaining);
};

