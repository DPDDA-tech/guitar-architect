export type SupporterFirstTier =
  | 'candidato'
  | 'aprendiz'
  | 'pedreiro'
  | 'contramestre'
  | 'mestre_de_obras'
  | 'engenheiro'
  | 'arquiteto';

export type SupporterFirstReward = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  supporterTier: SupporterFirstTier;
  manualOnly: boolean;
  allowedEmails?: string[];
};

const firstSupporterPath = (fileName: string) => `/tierothers/supporters/first/${fileName}`;

export const supporterFirstRewards: SupporterFirstReward[] = [
  {
    id: 'first_supporter_candidato',
    title: 'Primeiro Apoiador Candidato',
    category: 'SUPPORTER | PRIMEIROS APOIADORES',
    description: 'Reconhecimento histórico ao primeiro apoiador candidato da Season 1.',
    image: firstSupporterPath('togafirst1cand.webp'),
    supporterTier: 'candidato',
    manualOnly: true,
  },
  {
    id: 'first_supporter_aprendiz',
    title: 'Primeiro Apoiador Aprendiz',
    category: 'SUPPORTER | PRIMEIROS APOIADORES',
    description: 'Reconhecimento histórico ao primeiro apoiador aprendiz da Season 1.',
    image: firstSupporterPath('togafirst2ap.webp'),
    supporterTier: 'aprendiz',
    manualOnly: true,
  },
  {
    id: 'first_supporter_pedreiro',
    title: 'Primeiro Apoiador Pedreiro',
    category: 'SUPPORTER | PRIMEIROS APOIADORES',
    description: 'Reconhecimento histórico ao primeiro apoiador pedreiro da Season 1.',
    image: firstSupporterPath('togafirst3ped.webp'),
    supporterTier: 'pedreiro',
    manualOnly: true,
  },
  {
    id: 'first_supporter_contramestre',
    title: 'Primeiro Apoiador Contramestre',
    category: 'SUPPORTER | PRIMEIROS APOIADORES',
    description: 'Reconhecimento histórico ao primeiro apoiador contramestre da Season 1.',
    image: firstSupporterPath('togafirst4cm.webp'),
    supporterTier: 'contramestre',
    manualOnly: true,
  },
  {
    id: 'first_supporter_mestre_de_obras',
    title: 'Primeiro Apoiador Mestre de Obras',
    category: 'SUPPORTER | PRIMEIROS APOIADORES',
    description: 'Reconhecimento histórico ao primeiro apoiador mestre de obras da Season 1.',
    image: firstSupporterPath('togafirst5mob.webp'),
    supporterTier: 'mestre_de_obras',
    manualOnly: true,
  },
  {
    id: 'first_supporter_engenheiro',
    title: 'Primeiro Apoiador Engenheiro',
    category: 'SUPPORTER | PRIMEIROS APOIADORES',
    description: 'Reconhecimento histórico ao primeiro apoiador engenheiro da Season 1.',
    image: firstSupporterPath('togafirst6eng.webp'),
    supporterTier: 'engenheiro',
    manualOnly: true,
  },
  {
    id: 'first_supporter_arquiteto',
    title: 'Primeiro Apoiador Arquiteto',
    category: 'SUPPORTER | PRIMEIROS APOIADORES',
    description: 'Reconhecimento histórico ao primeiro apoiador arquiteto da Season 1.',
    image: firstSupporterPath('togafirst7arq.webp'),
    supporterTier: 'arquiteto',
    manualOnly: true,
    allowedEmails: ['dilioalvarega@gmail.com'],
  },
];