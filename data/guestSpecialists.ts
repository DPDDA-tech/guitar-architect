export type LocalizedText = { pt: string; en: string };

export type GuestSpecialistStatus = 'active' | 'coming-soon';

export interface GuestSpecialist {
  id: string;
  status: GuestSpecialistStatus;
  name?: string;
  cardName?: string;
  specialty: LocalizedText;
  shortDescription: LocalizedText;
  cardImage?: string;
  profileImage?: string;
  presentationVideo?: string;
  quote?: LocalizedText;
  biography?: LocalizedText;
  philosophy?: LocalizedText;
  areas?: LocalizedText[];
  profile?: {
    fullName: LocalizedText;
    age: LocalizedText;
    birthplace: LocalizedText;
    livesIn: LocalizedText;
    occupation: LocalizedText;
    instrument: LocalizedText;
    role: LocalizedText;
  };
}

export const guestSpecialists: GuestSpecialist[] = [
  {
    id: 'dra-helena',
    status: 'active',
    name: 'Helena Valença Monteiro',
    cardName: 'Dra. Helena',
    specialty: { pt: 'Saúde do músico', en: 'Musician health' },
    shortDescription: {
      pt: 'Médica fisiatra dedicada à prevenção de lesões, ergonomia e construção de hábitos de prática mais sustentáveis.',
      en: 'A physiatrist focused on injury prevention, ergonomics and more sustainable practice habits.',
    },
    cardImage: '/guests/helena/helena-card-guest.webp',
    profileImage: '/guests/helena/helena-profile.webp',
    presentationVideo: '/guests/helena/helena-presentation.mp4',
    quote: {
      pt: 'Tocar bem também significa aprender a cuidar do corpo que torna a música possível.',
      en: 'Playing well also means learning to care for the body that makes music possible.',
    },
    biography: {
      pt: 'Helena cresceu em uma família na qual ciência e música sempre conviveram. Médica fisiatra, aprofundou sua atuação em medicina do esporte, ergonomia, dor musculoesquelética e reabilitação funcional. No Guitar Architect, ajuda estudantes e instrumentistas a compreenderem que postura, preparação, recuperação e uso eficiente da força fazem parte da própria técnica musical.',
      en: 'Helena grew up in a family where science and music always coexisted. A physiatrist, she expanded her work through sports medicine, ergonomics, musculoskeletal pain and functional rehabilitation. At Guitar Architect, she helps students and players understand that posture, preparation, recovery and efficient use of force are part of musical technique itself.',
    },
    philosophy: {
      pt: 'O corpo não é apenas um suporte para o instrumento. Ele participa da produção sonora. A melhor postura não é rígida: deve oferecer estabilidade, mobilidade e variação. Dor persistente não é requisito para evolução, e a prevenção começa na rotina.',
      en: 'The body is not merely a support for the instrument. It participates in sound production. The best posture is not rigid: it should provide stability, mobility and variation. Persistent pain is not a requirement for progress, and prevention begins in the daily routine.',
    },
    areas: [
      { pt: 'Postura e ergonomia', en: 'Posture and ergonomics' },
      { pt: 'Prevenção de lesões', en: 'Injury prevention' },
      { pt: 'Mãos, punhos e antebraços', en: 'Hands, wrists and forearms' },
      { pt: 'Ombros, pescoço e coluna', en: 'Shoulders, neck and spine' },
      { pt: 'Rotina de estudos e recuperação', en: 'Practice routine and recovery' },
      { pt: 'Saúde auditiva e sinais de alerta', en: 'Hearing health and warning signs' },
    ],
    profile: {
      fullName: { pt: 'Helena Valença Monteiro', en: 'Helena Valença Monteiro' },
      age: { pt: '43 anos', en: '43 years old' },
      birthplace: { pt: 'Belo Horizonte, Minas Gerais', en: 'Belo Horizonte, Minas Gerais, Brazil' },
      livesIn: { pt: 'Juiz de Fora, Minas Gerais', en: 'Juiz de Fora, Minas Gerais, Brazil' },
      occupation: { pt: 'Médica fisiatra', en: 'Physiatrist' },
      instrument: { pt: 'Violão — amadora dedicada', en: 'Acoustic guitar — dedicated amateur' },
      role: { pt: 'Especialista convidada em Saúde do Músico', en: 'Guest specialist in Musician Health' },
    },
  },
  {
    id: 'carreira-negocios',
    status: 'coming-soon',
    specialty: { pt: 'Carreira, projetos e negócios musicais', en: 'Music career, projects and business' },
    shortDescription: {
      pt: 'Organização profissional, projetos, receitas, posicionamento e desenvolvimento de carreira.',
      en: 'Professional organization, projects, revenue, positioning and career development.',
    },
  },
  {
    id: 'direitos-musica',
    status: 'coming-soon',
    specialty: { pt: 'Direitos e relações profissionais na música', en: 'Rights and professional relations in music' },
    shortDescription: {
      pt: 'Autoria, contratos, imagem, gravações e relações entre músicos, produtores e contratantes.',
      en: 'Authorship, contracts, image rights, recordings and relations among musicians, producers and clients.',
    },
  },
];

export const getGuestSpecialistById = (id: string) =>
  guestSpecialists.find(guest => guest.id === id);
