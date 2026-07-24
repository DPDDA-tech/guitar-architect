export type LocalizedText = { pt: string; en: string };

export type GuestSpecialistStatus = 'active' | 'coming-soon';

export interface GuestSpecialist {
  id: string;
  status: GuestSpecialistStatus;
  name?: string;
  cardName?: string;
  specialty: LocalizedText;
  shortDescription: LocalizedText;
  heroDescription?: LocalizedText;
  guestBadgeLabel?: LocalizedText;
  characterTagline?: LocalizedText;
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
    name: 'Helena Mascarenhas de Mello Villaça',
    cardName: 'Dra. Helena Villaça',
    specialty: { pt: 'Saúde do músico', en: 'Musician health' },
    shortDescription: {
      pt: 'Médica fisiatra dedicada à prevenção de lesões, ergonomia e construção de hábitos de prática mais sustentáveis.',
      en: 'A physiatrist focused on injury prevention, ergonomics and more sustainable practice habits.',
    },
    guestBadgeLabel: { pt: 'Especialista convidada', en: 'Guest specialist' },
    characterTagline: { pt: 'Personagem fictícia · IA', en: 'Fictional character · AI' },
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
      fullName: { pt: 'Helena Mascarenhas de Mello Villaça', en: 'Helena Mascarenhas de Mello Villaça' },
      age: { pt: '43 anos', en: '43 years old' },
      birthplace: { pt: 'Belo Horizonte, Minas Gerais', en: 'Belo Horizonte, Minas Gerais, Brazil' },
      livesIn: { pt: 'Juiz de Fora, Minas Gerais', en: 'Juiz de Fora, Minas Gerais, Brazil' },
      occupation: { pt: 'Médica fisiatra', en: 'Physiatrist' },
      instrument: { pt: 'Violão — amadora dedicada', en: 'Acoustic guitar — dedicated amateur' },
      role: { pt: 'Especialista convidada em Saúde do Músico', en: 'Guest specialist in Musician Health' },
    },
  },
  {
    id: 'bernardo-alencar',
    status: 'active',
    name: 'Bernardo Ribeiro de Matos Alencar',
    cardName: 'Bernardo Alencar',
    specialty: { pt: 'Carreira e negócios da música', en: 'Music career and business' },
    shortDescription: {
      pt: 'Empresário musical dedicado à organização de projetos, planejamento de carreira, receitas, posicionamento e relações profissionais.',
      en: 'A music business manager focused on organizing projects, career planning, revenue, positioning and professional relationships.',
    },
    heroDescription: {
      pt: 'Empresário musical dedicado à organização de projetos, planejamento de carreira e desenvolvimento de relações profissionais mais conscientes e sustentáveis.',
      en: 'A music business manager focused on organizing projects, career planning and developing more conscious and sustainable professional relationships.',
    },
    guestBadgeLabel: { pt: 'Especialista convidado', en: 'Guest specialist' },
    characterTagline: { pt: 'Personagem fictício · IA', en: 'Fictional character · AI' },
    cardImage: '/guests/bernardo/bernardo-card-guest.webp',
    profileImage: '/guests/bernardo/bernardo-profile.webp',
    presentationVideo: '/guests/bernardo/bernardo-presentation.mp4',
    quote: {
      pt: 'Uma carreira não se constrói apenas com boas oportunidades, mas com critérios para reconhecer quais delas realmente fazem sentido.',
      en: 'A career is not built on good opportunities alone, but on having criteria to recognize which of them truly make sense.',
    },
    biography: {
      pt: 'Bernardo cresceu em um ambiente no qual música, cultura e organização profissional sempre estiveram próximas. Teve contato com instrumentos desde jovem e encontrou no saxofone uma forma pessoal de manter sua ligação com a prática musical, embora sua principal vocação profissional tenha se desenvolvido nos bastidores: estruturar projetos, organizar equipes e transformar iniciativas artísticas em atividades profissionalmente sustentáveis.\n\nAo acompanhar músicos e bandas em diferentes estágios, percebeu que muitos projetos consistentes encontravam dificuldades não por ausência de qualidade artística, mas por falta de planejamento, desconhecimento de custos, conflitos internos, escolhas precipitadas e pouca clareza sobre objetivos.\n\nSua atuação passou então a concentrar-se na gestão de carreira, no planejamento de lançamentos e apresentações, na análise de oportunidades e na construção de relações profissionais mais transparentes. No Guitar Architect, Bernardo ajuda o músico a compreender quando sua atividade começa a exigir organização, estratégia e apoio especializado.',
      en: 'Bernardo grew up in an environment where music, culture and professional organization were always close together. He was exposed to instruments from a young age and found in the saxophone a personal way to stay connected to musical practice, although his main professional calling developed behind the scenes: structuring projects, organizing teams and turning artistic initiatives into professionally sustainable activities.\n\nWhile following musicians and bands through different stages, he noticed that many solid projects ran into trouble not for lack of artistic quality, but because of poor planning, unclear costs, internal conflicts, rushed choices and a lack of clarity about goals.\n\nHis work then came to focus on career management, planning releases and performances, analyzing opportunities and building more transparent professional relationships. At Guitar Architect, Bernardo helps musicians understand when their activity starts to require organization, strategy and specialized support.',
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
