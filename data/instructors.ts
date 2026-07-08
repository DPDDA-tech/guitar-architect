export type InstructorCategory =
  | 'institutional'
  | 'communication'
  | 'journey'
  | 'luthiery'
  | 'gear'
  | 'maintenance'
  | 'beginner'
  | 'theory'
  | 'practice'
  | 'rhythm'
  | 'earTraining'
  | 'rock'
  | 'metal'
  | 'blues'
  | 'jazz'
  | 'bass'
  | 'advanced';

export interface InstructorImageFit {
  scale?: number;
  x?: number;
  y?: number;
}

export interface InstructorProfile {
  id: string;
  name: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  personality: string[];
  strengths: string[];
  categories: InstructorCategory[];
  relatedModules: string[];
  unlockLabel: string;
  cardImage: string;
  /** Optional hero/profile image for the individual architect page (e.g. character with instrument or in practice). Falls back to cardImage when absent. */
  heroImage?: string;
  quote: string;
  imageFit?: InstructorImageFit;
}

export const instructorCategoryLabels: Record<InstructorCategory, string> = {
  institutional: 'Institucional',
  communication: 'Comunicação',
  journey: 'Jornada',
  luthiery: 'Luthieria',
  gear: 'Equipamentos',
  maintenance: 'Manutenção',
  beginner: 'Iniciantes',
  theory: 'Teoria',
  practice: 'Prática',
  rhythm: 'Ritmo',
  earTraining: 'Percepção',
  rock: 'Rock',
  metal: 'Metal',
  blues: 'Blues',
  jazz: 'Jazz',
  bass: 'Baixo & Bases',
  advanced: 'Avançado',
};

const instructorCardPath = (id: string) => `/instructors/1000/${id}-card-instructor.webp`;
const instructorProfilePath = (id: string) => `/instructors/1400/${id}-profile.webp`;

export const instructors: InstructorProfile[] = [
  {
    id: 'alice',
    name: 'Alice',
    title: 'Primeiros Passos',
    shortDescription: 'Acolhe quem está começando e transforma os primeiros contatos com a música em uma experiência leve e sem intimidação.',
    longDescription: 'Alice conduz o início da jornada musical com calma e clareza. Sua trilha é pensada para quem nunca tocou ou está retomando o instrumento, priorizando confiança antes de complexidade — cada conceito é apresentado no seu tempo certo.',
    personality: ['Acolhedora', 'Paciente', 'Didática'],
    strengths: ['Primeiros contatos com o instrumento', 'Redução da intimidação inicial', 'Explicações simples e diretas'],
    categories: ['beginner', 'practice'],
    relatedModules: ['Kids', 'Aprender'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('alice'),
    heroImage: instructorProfilePath('alice'),
    quote: 'Todo mundo começa do mesmo lugar: pelo primeiro som.',
  },
  {
    id: 'arthur',
    name: 'Arthur',
    title: 'Fundamentos e Teoria',
    shortDescription: 'Organiza a teoria musical em uma lógica clara, transformando regras soltas em uma estrutura que faz sentido.',
    longDescription: 'Arthur acredita que teoria bem explicada não trava o músico — liberta. Ele guia o estudante pelos fundamentos da música com uma abordagem estruturada, conectando cada conceito teórico a uma aplicação prática no braço do instrumento.',
    personality: ['Metódico', 'Claro', 'Lógico'],
    strengths: ['Fundamentos musicais', 'Organização de conceitos', 'Lógica por trás da teoria'],
    categories: ['beginner', 'theory'],
    relatedModules: ['Aprender', 'Ciclo Harmônico'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('arthur'),
    heroImage: instructorProfilePath('arthur'),
    quote: 'Teoria não é obstáculo. É o mapa que você usa para não se perder.',
  },
  {
    id: 'bill',
    name: 'Bill',
    title: 'Blues e Feeling',
    shortDescription: 'Ensina blues e fraseado com foco em expressão — tocar com intenção, não apenas repetir escalas.',
    longDescription: 'Bill trabalha a improvisação a partir do sentimento por trás de cada nota. Sua trilha explora o blues como linguagem: frases, bends, dinâmica e respiração musical, sempre incentivando o estudante a tocar aquilo que realmente quer dizer.',
    personality: ['Expressivo', 'Intuitivo', 'Caloroso'],
    strengths: ['Fraseado com intenção', 'Improvisação', 'Expressividade no toque'],
    categories: ['blues', 'practice'],
    relatedModules: ['Praticar', 'Acordes'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('bill'),
    heroImage: instructorProfilePath('bill'),
    quote: 'Uma nota bem sentida vale mais que dez notas apressadas.',
  },
  {
    id: 'clara',
    name: 'Clara',
    title: 'Método e Organização',
    shortDescription: 'Transforma estudo disperso em rotina — disciplina e método para quem quer evoluir de forma consistente.',
    longDescription: 'Clara ajuda o estudante a construir uma rotina de estudo real: metas pequenas, revisão constante e progresso mensurável. Sua trilha combina fundamentos, teoria leve e prática guiada em uma estrutura fácil de manter no dia a dia.',
    personality: ['Organizada', 'Disciplinada', 'Encorajadora'],
    strengths: ['Rotina de estudo', 'Organização de metas', 'Consistência ao longo do tempo'],
    categories: ['beginner', 'theory', 'practice'],
    relatedModules: ['Praticar', 'Aprender'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('clara'),
    heroImage: instructorProfilePath('clara'),
    quote: 'Progresso não é sobre intensidade. É sobre continuar.',
  },
  {
    id: 'dean',
    name: 'Dean',
    title: 'Rock e Riffs',
    shortDescription: 'Especialista em riffs e repertório de rock, focado em construir a linguagem do estilo na prática.',
    longDescription: 'Dean guia o estudante pelo vocabulário do rock: riffs marcantes, power chords, dinâmica de banda e repertório reconhecível. Sua trilha equilibra técnica com atitude, sempre trazendo música real como referência.',
    personality: ['Direto', 'Energético', 'Objetivo'],
    strengths: ['Riffs de rock', 'Repertório', 'Linguagem do estilo'],
    categories: ['rock', 'practice'],
    relatedModules: ['Praticar', 'Acordes'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('dean'),
    heroImage: instructorProfilePath('dean'),
    quote: 'Um bom riff diz tudo antes mesmo do vocal entrar.',
  },
  {
    id: 'erika',
    name: 'Erika',
    title: 'Baixo & Bases',
    shortDescription: 'Mostra como o baixo sustenta a harmonia — tônicas, condução e a base que segura toda a música.',
    longDescription: 'Erika trabalha o baixo como elemento estrutural da música: como as tônicas se conectam à harmonia, como a condução de linhas cria movimento, e como a base sustenta tudo o que acontece por cima dela.',
    personality: ['Firme', 'Estruturada', 'Precisa'],
    strengths: ['Condução harmônica', 'Fundamentos do baixo', 'Base musical sólida'],
    categories: ['bass', 'rhythm'],
    relatedModules: ['Praticar', 'Ciclo Harmônico'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('erika'),
    heroImage: instructorProfilePath('erika'),
    quote: 'A base não aparece — ela sustenta tudo o que aparece.',
  },
  {
    id: 'fred',
    name: 'Fred',
    title: 'Arquitetura do Braço',
    shortDescription: 'Visualiza harmonia e estrutura musical diretamente no braço do instrumento, como um mapa.',
    longDescription: 'Fred é o arquiteto da visualização: ele conecta teoria e harmonia a mapas visuais do braço, mostrando como acordes, escalas e intervalos se organizam espacialmente. Sua trilha é ideal para quem já entende o básico e quer enxergar o instrumento como estrutura.',
    personality: ['Analítico', 'Visual', 'Estruturado'],
    strengths: ['Visualização do braço', 'Harmonia aplicada', 'Estrutura musical'],
    categories: ['theory', 'advanced'],
    relatedModules: ['Tríades e Tétrades', 'Ciclo Harmônico'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('fred'),
    heroImage: instructorProfilePath('fred'),
    quote: 'Todo acorde tem uma planta baixa. Basta aprender a lê-la.',
  },
  {
    id: 'hiroshi',
    name: 'Hiroshi',
    title: 'Precisão e Técnica',
    shortDescription: 'Foca em técnica e estudo metódico, priorizando precisão antes de velocidade.',
    longDescription: 'Hiroshi acredita que técnica sólida vem de repetição consciente, não de pressa. Sua trilha trabalha precisão de movimento, controle e estudo metódico, preparando o estudante para desafios técnicos mais avançados.',
    personality: ['Preciso', 'Disciplinado', 'Detalhista'],
    strengths: ['Técnica apurada', 'Estudo metódico', 'Controle de movimento'],
    categories: ['theory', 'practice', 'advanced'],
    relatedModules: ['Praticar', 'CAGED'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('hiroshi'),
    heroImage: instructorProfilePath('hiroshi'),
    quote: 'Precisão primeiro. Velocidade é consequência.',
  },
  {
    id: 'jax',
    name: 'Jax',
    title: 'Rock Moderno',
    shortDescription: 'Explora performance, timbre e riffs modernos com uma abordagem contemporânea do rock.',
    longDescription: 'Jax conecta técnica a performance: como um riff soa em contexto de banda, como o timbre molda a intenção musical e como o rock moderno reinterpreta a tradição do estilo. Sua trilha é voltada a quem já toca e quer refinar presença e som.',
    personality: ['Moderno', 'Confiante', 'Criativo'],
    strengths: ['Performance', 'Timbre e sonoridade', 'Riffs contemporâneos'],
    categories: ['rock', 'practice'],
    relatedModules: ['Praticar', 'Acordes'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('jax'),
    heroImage: instructorProfilePath('jax'),
    quote: 'O riff certo não é só tocado — é sentido no peito.',
  },
  {
    id: 'juan',
    name: 'Juan',
    title: 'Baixo e Ritmo',
    shortDescription: 'Trabalha groove, pulso e fundamentos rítmicos a partir do baixo.',
    longDescription: 'Juan une baixo e ritmo em uma só trilha: pulso constante, groove que sustenta a banda e fundamentos rítmicos que se aplicam a qualquer estilo. Ideal para quem quer tocar com mais consistência e menos esforço.',
    personality: ['Rítmico', 'Constante', 'Groovy'],
    strengths: ['Groove', 'Pulso rítmico', 'Fundamentos do baixo'],
    categories: ['bass', 'rhythm'],
    relatedModules: ['Praticar', 'Radar de Intervalos'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('juan'),
    heroImage: instructorProfilePath('juan'),
    quote: 'Groove não se força. Se sente e se repete.',
  },
  {
    id: 'kael',
    name: 'Kael',
    title: 'Metal e Técnica Pesada',
    shortDescription: 'Especialista em metal, palhetada e riffs pesados, com foco em intensidade e precisão.',
    longDescription: 'Kael conduz o estudante pelo universo do metal: palhetada alternada, riffs pesados, dinâmica de intensidade e técnica de alta exigência. Sua trilha é voltada a quem busca desafio técnico real.',
    personality: ['Intenso', 'Exigente', 'Focado'],
    strengths: ['Palhetada e técnica pesada', 'Riffs de metal', 'Intensidade controlada'],
    categories: ['metal', 'advanced'],
    relatedModules: ['Praticar', 'CAGED'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('kael'),
    heroImage: instructorProfilePath('kael'),
    quote: 'Intensidade sem controle é ruído. Com técnica, é impacto.',
  },
  {
    id: 'leo',
    name: 'Leo',
    title: 'Repertório e Fundamentos',
    shortDescription: 'Constrói repertório e acompanhamento com uma trilha tranquila e sem pressão.',
    longDescription: 'Leo foca em repertório real: músicas completas, acompanhamento e fundamentos aplicados na prática. Sua trilha é ideal para quem quer tocar músicas inteiras desde cedo, sem depender apenas de exercícios isolados.',
    personality: ['Tranquilo', 'Prático', 'Acessível'],
    strengths: ['Repertório aplicado', 'Acompanhamento', 'Fundamentos na prática'],
    categories: ['beginner', 'practice'],
    relatedModules: ['Aprender', 'Praticar'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('leo'),
    heroImage: instructorProfilePath('leo'),
    quote: 'Aprender uma música inteira ensina mais do que dez exercícios soltos.',
  },
  {
    id: 'mel',
    name: 'Mel',
    title: 'Percepção e Escuta',
    shortDescription: 'Desenvolve ouvido, percepção de intervalos e escuta ativa como base do aprendizado musical.',
    longDescription: 'Mel trabalha a música pelo ouvido: reconhecimento de intervalos, percepção rítmica e escuta ativa. Sua trilha ajuda o estudante a identificar o que ouve antes mesmo de tocar, fortalecendo a conexão entre percepção e execução.',
    personality: ['Perceptiva', 'Atenta', 'Curiosa'],
    strengths: ['Percepção de intervalos', 'Escuta ativa', 'Reconhecimento auditivo'],
    categories: ['earTraining', 'rhythm'],
    relatedModules: ['Radar de Intervalos', 'Praticar'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('mel'),
    heroImage: instructorProfilePath('mel'),
    quote: 'Antes de tocar a nota certa, é preciso ouvi-la de verdade.',
  },
  {
    id: 'monique',
    name: 'Monique',
    title: 'Embaixadora do GA',
    shortDescription: 'Porta-voz virtual do GA, apresenta a jornada, comunica novidades e conecta o usuário aos ambientes do ecossistema.',
    longDescription: 'Monique é a Embaixadora do GA. Ela apresenta o ecossistema, conecta Kids, Teens, Studio e os Arquitetos Musicais, comunica novidades e ajuda o usuário a entender como teoria, prática e percepção se transformam em uma construção musical estruturada. Sua presença representa a visão institucional do GA: aprender música com direção, identidade e progressão.',
    personality: ['Acolhedora', 'Motivadora', 'Estratégica'],
    strengths: ['Apresentação da jornada', 'Comunicação institucional', 'Conexão entre ambientes do ecossistema'],
    categories: ['institutional', 'communication', 'journey'],
    relatedModules: ['Ecossistema', 'Kids', 'Teens', 'Studio'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('monique'),
    heroImage: instructorProfilePath('monique'),
    quote: 'Uma boa jornada musical não começa no improviso. Ela começa com direção.',
  },
  {
    id: 'morena',
    name: 'Morena',
    title: 'Acordes e Expressividade',
    shortDescription: 'Trabalha acordes, acompanhamento e expressividade com foco em repertório.',
    longDescription: 'Morena mostra como acordes vão muito além de shapes fixos: dinâmica, articulação e expressividade transformam o mesmo acorde em algo único. Sua trilha conecta harmonia a musicalidade real.',
    personality: ['Expressiva', 'Sensível', 'Musical'],
    strengths: ['Acordes e acompanhamento', 'Expressividade', 'Repertório musical'],
    categories: ['blues', 'practice'],
    relatedModules: ['Acordes', 'Praticar'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('morena'),
    heroImage: instructorProfilePath('morena'),
    quote: 'O mesmo acorde pode dizer coisas diferentes, dependendo de como você o toca.',
  },
  {
    id: 'nina',
    name: 'Nina',
    title: 'Groove & Ritmo',
    shortDescription: 'Explora levadas, síncope e groove com influência de funk, soul e ritmos brasileiros.',
    longDescription: 'Nina traz groove para o centro da prática: levadas sincopadas, funk, soul e ritmos brasileiros aplicados ao instrumento. Sua trilha ajuda o estudante a sair da rigidez métrica e tocar com balanço real.',
    personality: ['Rítmica', 'Envolvente', 'Vibrante'],
    strengths: ['Groove e levadas', 'Síncope', 'Ritmos brasileiros'],
    categories: ['rhythm', 'practice'],
    relatedModules: ['Praticar', 'Radar de Intervalos'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('nina'),
    heroImage: instructorProfilePath('nina'),
    quote: 'Ritmo bom é aquele que faz o corpo responder antes da mente.',
  },
  {
    id: 'rick',
    name: 'Rick',
    title: 'Pegada e Ritmo',
    shortDescription: 'Foca em ritmo corporal, pegada e prática diária consistente.',
    longDescription: 'Rick trabalha o ritmo como algo que se sente no corpo, não apenas se conta. Sua trilha incentiva prática diária, pegada firme e consistência rítmica, formando uma base sólida para qualquer estilo musical.',
    personality: ['Consistente', 'Firme', 'Disciplinado'],
    strengths: ['Pegada rítmica', 'Prática diária', 'Consistência'],
    categories: ['rhythm', 'practice'],
    relatedModules: ['Praticar', 'Aprender'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('rick'),
    heroImage: instructorProfilePath('rick'),
    quote: 'Ritmo se treina todo dia, um pouco de cada vez.',
  },
  {
    id: 'roxie',
    name: 'Roxie',
    title: 'Rock Alternativo',
    shortDescription: 'Traz atitude e criatividade do rock alternativo, com foco em riffs autorais e presença de palco.',
    longDescription: 'Roxie estimula o estudante a criar sua própria voz musical: riffs alternativos, atitude de palco e criatividade aplicada. Sua trilha é voltada especialmente ao público Teens, unindo técnica e expressão pessoal.',
    personality: ['Criativa', 'Autêntica', 'Ousada'],
    strengths: ['Atitude e presença', 'Criatividade musical', 'Riffs alternativos'],
    categories: ['rock', 'practice'],
    relatedModules: ['Teens', 'Praticar'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('roxie'),
    heroImage: instructorProfilePath('roxie'),
    quote: 'Seu jeito de tocar também é sua assinatura.',
  },
  {
    id: 'tom',
    name: 'Tom',
    title: 'Luthieria e Setup',
    shortDescription: 'Especialista em regulagem, conservação, manutenção e ajustes práticos para manter o instrumento confortável, estável e pronto para tocar.',
    longDescription: 'Tom cuida da parte física da jornada musical: instrumentos, regulagens, conservação, pequenos reparos, timbres e escolhas de equipamento. Sua função é ajudar o usuário a entender que tocar melhor também depende de um instrumento confortável, estável e bem cuidado.',
    personality: ['Descontraído', 'Direto', 'Acolhedor'],
    strengths: [
      'Regulagem básica e conforto do instrumento',
      'Conservação, limpeza e troca de cordas',
      'Timbres, captadores e equipamentos',
      'Customização e cultura de instrumentos',
    ],
    categories: ['luthiery', 'gear', 'maintenance'],
    relatedModules: ['Custom Shop', 'Manutenção do Instrumento', 'Equipamentos e Timbres', 'EVH / Frankenstrat'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('tom'),
    heroImage: instructorProfilePath('tom'),
    quote: 'Instrumento bem cuidado responde melhor, afina melhor e inspira mais.',
  },
  {
    id: 'victor',
    name: 'Victor',
    title: 'Jazz e Harmonia',
    shortDescription: 'Explora acordes sofisticados, condução harmônica e a linguagem do jazz.',
    longDescription: 'Victor conduz o estudante por harmonias mais sofisticadas: acordes estendidos, substituições e condução musical típicas do jazz. Sua trilha é voltada a quem já domina o básico e quer aprofundar a compreensão harmônica.',
    personality: ['Sofisticado', 'Reflexivo', 'Refinado'],
    strengths: ['Harmonia avançada', 'Acordes sofisticados', 'Condução musical'],
    categories: ['jazz', 'theory', 'advanced'],
    relatedModules: ['Ciclo Harmônico', 'Tríades e Tétrades'],
    unlockLabel: 'Mentoria em breve',
    cardImage: instructorCardPath('victor'),
    heroImage: instructorProfilePath('victor'),
    quote: 'Harmonia sofisticada não é sobre complicar — é sobre enxergar mais opções.',
  },
];

export const getInstructorById = (id: string): InstructorProfile | undefined =>
  instructors.find(instructor => instructor.id === id);

export const instructorSpotlightGroups: string[][] = [
  ['monique', 'nina', 'victor', 'bill'],
  ['alice', 'rick', 'hiroshi', 'roxie'],
  ['erika', 'kael', 'mel', 'arthur'],
  ['morena', 'juan', 'fred', 'dean'],
  ['clara', 'jax', 'leo', 'tom'],
];

export const getDailyInstructorSpotlightGroup = (date: Date = new Date()): InstructorProfile[] => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const group = instructorSpotlightGroups[dayOfYear % instructorSpotlightGroups.length];
  return group
    .map(id => getInstructorById(id))
    .filter((instructor): instructor is InstructorProfile => Boolean(instructor));
};
