export type InstructorCategory =
  | 'institutional'
  | 'communication'
  | 'journey'
  | 'luthiery'
  | 'gear'
  | 'maintenance'
  | 'harmony'
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

export type AppLang = 'pt' | 'en';

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface LocalizedList {
  pt: string[];
  en: string[];
}

export interface InstructorImageFit {
  scale?: number;
  x?: number;
  y?: number;
}

export interface InstructorIntroVideo {
  src: string;
  poster?: string;
  duration?: number;
}

export interface InstructorProfile {
  id: string;
  name: string;
  title: LocalizedText;
  shortDescription: LocalizedText;
  longDescription: LocalizedText;
  personality: LocalizedList;
  strengths: LocalizedList;
  influences?: LocalizedList;
  influenceNote?: LocalizedText;
  professionalReferences?: LocalizedList;
  professionalReferenceNote?: LocalizedText;
  musicalBackground?: LocalizedText;
  listeningFavorites?: LocalizedList;
  listeningNote?: LocalizedText;
  categories: InstructorCategory[];
  relatedModules: LocalizedList;
  unlockLabel: LocalizedText;
  cardImage: string;
  /** Optional hero/profile image for the individual architect page (e.g. character with instrument or in practice). Falls back to cardImage when absent. */
  heroImage?: string;
  quote: LocalizedText;
  imageFit?: InstructorImageFit;
  /** Optional presentation video shown near the profile introduction. */
  introVideo?: InstructorIntroVideo;
}

export const instructorCategoryLabels: Record<AppLang, Record<InstructorCategory, string>> = {
  pt: {
    institutional: 'Institucional',
    communication: 'Comunicação',
    journey: 'Jornada',
    luthiery: 'Luthieria',
    gear: 'Equipamentos',
    maintenance: 'Manutenção',
    harmony: 'Harmonia',
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
  },
  en: {
    institutional: 'Institutional',
    communication: 'Communication',
    journey: 'Journey',
    luthiery: 'Luthiery',
    gear: 'Gear',
    maintenance: 'Maintenance',
    harmony: 'Harmony',
    beginner: 'Beginners',
    theory: 'Theory',
    practice: 'Practice',
    rhythm: 'Rhythm',
    earTraining: 'Ear Training',
    rock: 'Rock',
    metal: 'Metal',
    blues: 'Blues',
    jazz: 'Jazz',
    bass: 'Bass & Foundations',
    advanced: 'Advanced',
  },
};

export const getInstructorCategoryLabel = (category: InstructorCategory, lang: AppLang): string =>
  instructorCategoryLabels[lang][category];

const instructorCardPath = (id: string) => `/instructors/1000/${id}-card-instructor.webp`;
const instructorProfilePath = (id: string) => `/instructors/1400/${id}-profile.webp`;

export const instructors: InstructorProfile[] = [
  {
    id: 'alice',
    name: 'Alice',
    title: { pt: 'Primeiros Passos', en: 'First Steps' },
    shortDescription: {
      pt: 'Acolhe os primeiros passos na guitarra, no canto e na descoberta musical, reduzindo a intimidação sem infantilizar.',
      en: 'Welcomes first steps in guitar, singing and musical discovery, reducing intimidation without talking down to anyone.',
    },
    longDescription: {
      pt: 'Alice conduz o início da jornada musical com calma e clareza. Seja para crianças, adultos iniciantes, famílias ou quem está retomando o instrumento, ela transforma guitarra, canto e conceitos básicos em descobertas acessíveis, priorizando confiança antes de complexidade.',
      en: 'Alice guides the start of the musical journey with calm and clarity. Whether for children, adult beginners, families or those returning to an instrument, she turns guitar, singing and basic concepts into accessible discoveries, prioritizing confidence before complexity.',
    },
    personality: { pt: ['Acolhedora', 'Paciente', 'Didática'], en: ['Welcoming', 'Patient', 'Didactic'] },
    strengths: {
      pt: ['Primeiros contatos com guitarra e canto', 'Redução da intimidação sem infantilização', 'Explicações simples e diretas'],
      en: ['First contact with guitar and singing', 'Reducing intimidation without talking down', 'Simple, direct explanations'],
    },
    influences: { pt: ['Cássia Eller', 'The Cranberries', 'Norah Jones'], en: ['Cássia Eller', 'The Cranberries', 'Norah Jones'] },
    influenceNote: {
      pt: 'Leva dessas referências a união entre guitarra e canto, o acolhimento das canções diretas e uma sensibilidade alternativa sem intimidação.',
      en: 'Draws from these references the connection between guitar and singing, the warmth of direct songs and an alternative sensibility without intimidation.',
    },
    categories: ['beginner', 'practice'],
    relatedModules: { pt: ['Kids', 'Aprender'], en: ['Kids', 'Learn'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('alice'),
    heroImage: instructorProfilePath('alice'),
    introVideo: { src: '/instructors/intro/alice-intro.mp4' },
    quote: {
      pt: 'Todo mundo começa do mesmo lugar: pelo primeiro som.',
      en: 'Everyone starts in the same place: with the first sound.',
    },
  },
  {
    id: 'arthur',
    name: 'Arthur',
    title: { pt: 'Fundamentos e Evolução', en: 'Foundations and Growth' },
    shortDescription: {
      pt: 'Acompanha o estudante entre compreender, tentar, errar, persistir e conquistar novos desafios musicais.',
      en: 'Supports students as they understand, try, make mistakes, persist and overcome new musical challenges.',
    },
    longDescription: {
      pt: 'Arthur acompanha o estudante enquanto fundamentos se transformam em conquistas reais. Ele propõe desafios, observa cada tentativa e oferece orientação para atravessar erros, repetições e descobertas com confiança, respeitando o ritmo de cada jornada.',
      en: 'Arthur supports students as foundations become real achievements. He proposes challenges, observes each attempt and offers guidance through mistakes, repetitions and discoveries with confidence, respecting the pace of each journey.',
    },
    personality: { pt: ['Encorajador', 'Atento', 'Desafiador'], en: ['Encouraging', 'Attentive', 'Challenging'] },
    strengths: {
      pt: ['Fundamentos em atividade', 'Desafios e evolução', 'Orientação durante tentativas e dificuldades'],
      en: ['Foundations in action', 'Challenges and growth', 'Guidance through attempts and difficulties'],
    },
    influences: { pt: ['Queen', 'Dire Straits', 'Journey'], en: ['Queen', 'Dire Straits', 'Journey'] },
    influenceNote: {
      pt: 'Leva dessas referências perseverança, fundamentos amadurecidos e a satisfação de atravessar desafios até conquistar fluidez.',
      en: 'Draws from these references perseverance, mature foundations and the satisfaction of working through challenges until fluency is achieved.',
    },
    categories: ['beginner', 'practice'],
    relatedModules: { pt: ['Teens', 'Aprender', 'Praticar'], en: ['Teens', 'Learn', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('arthur'),
    heroImage: instructorProfilePath('arthur'),
    introVideo: { src: '/instructors/intro/arthur-intro.mp4' },
    quote: {
      pt: 'Cada tentativa faz parte do caminho entre entender e conquistar.',
      en: 'Every attempt is part of the path from understanding to achievement.',
    },
  },
  {
    id: 'bill',
    name: 'Bill',
    title: { pt: 'Blues e Feeling', en: 'Blues and Feeling' },
    shortDescription: {
      pt: 'Ensina blues e fraseado com foco em expressão — tocar com intenção, não apenas repetir escalas.',
      en: 'Teaches blues and phrasing with a focus on expression — playing with intention, not just repeating scales.',
    },
    longDescription: {
      pt: 'Bill trabalha a improvisação a partir do sentimento por trás de cada nota. Sua trilha explora o blues como linguagem: frases, bends, dinâmica e respiração musical, sempre incentivando o estudante a tocar aquilo que realmente quer dizer.',
      en: 'Bill works on improvisation from the feeling behind each note. His track explores the blues as a language: phrasing, bends, dynamics and musical breathing, always encouraging students to play what they truly want to say.',
    },
    personality: { pt: ['Expressivo', 'Intuitivo', 'Caloroso'], en: ['Expressive', 'Intuitive', 'Warm'] },
    strengths: {
      pt: ['Fraseado com intenção', 'Improvisação', 'Expressividade no toque'],
      en: ['Phrasing with intention', 'Improvisation', 'Expressiveness in playing'],
    },
    influences: { pt: ['B.B. King', 'Albert King', 'David Gilmour'], en: ['B.B. King', 'Albert King', 'David Gilmour'] },
    influenceNote: {
      pt: 'Leva dessas referências o espaço, os bends expressivos e a convicção de que intenção vale mais do que quantidade de notas.',
      en: 'Draws from these references space, expressive bends and the belief that intention matters more than the number of notes.',
    },
    categories: ['blues', 'practice'],
    relatedModules: { pt: ['Praticar', 'Acordes'], en: ['Practice', 'Chords'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('bill'),
    heroImage: instructorProfilePath('bill'),
    introVideo: { src: '/instructors/intro/bill-intro.mp4' },
    quote: {
      pt: 'Uma nota bem sentida vale mais que dez notas apressadas.',
      en: 'One deeply felt note is worth more than ten rushed ones.',
    },
  },
  {
    id: 'clara',
    name: 'Clara',
    title: { pt: 'Teoria e Organização', en: 'Theory and Organization' },
    shortDescription: {
      pt: 'Organiza conhecimentos dispersos, identifica lacunas e transforma teoria fragmentada em um caminho claro de estudo.',
      en: 'Organizes scattered knowledge, identifies gaps and turns fragmented theory into a clear path of study.',
    },
    longDescription: {
      pt: 'Clara ajuda o estudante a entender o que já sabe, o que ainda falta e qual é o próximo passo lógico. Ela conecta fundamentos, teoria e aplicação em uma estrutura coerente, adaptando o percurso de quem está começando a quem já ensina ou toca profissionalmente.',
      en: 'Clara helps students understand what they already know, what is still missing and what the next logical step should be. She connects foundations, theory and application into a coherent structure, adapting the path from beginners to teachers and professional musicians.',
    },
    personality: { pt: ['Organizada', 'Analítica', 'Encorajadora'], en: ['Organized', 'Analytical', 'Encouraging'] },
    strengths: {
      pt: ['Diagnóstico de conhecimentos e lacunas', 'Organização de conceitos', 'Definição do próximo passo lógico'],
      en: ['Diagnosing knowledge and gaps', 'Organizing concepts', 'Defining the next logical step'],
    },
    influences: { pt: ['Herbie Hancock', 'Quincy Jones', 'Leonard Bernstein'], en: ['Herbie Hancock', 'Quincy Jones', 'Leonard Bernstein'] },
    influenceNote: {
      pt: 'Leva dessas referências visão de conjunto, organização e clareza para conectar ideias musicais e transformar complexidade em caminhos compreensíveis.',
      en: 'Draws from these references broad perspective, organization and clarity to connect musical ideas and turn complexity into understandable paths.',
    },
    categories: ['beginner', 'theory', 'practice'],
    relatedModules: { pt: ['Praticar', 'Aprender'], en: ['Practice', 'Learn'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('clara'),
    heroImage: instructorProfilePath('clara'),
    introVideo: { src: '/instructors/intro/clara-intro.mp4' },
    quote: {
      pt: 'Quando o conhecimento encontra uma estrutura, o próximo passo fica claro.',
      en: 'When knowledge finds a structure, the next step becomes clear.',
    },
  },
  {
    id: 'dean',
    name: 'Dean',
    title: { pt: 'Rock e Riffs', en: 'Rock and Riffs' },
    shortDescription: {
      pt: 'Especialista em riffs e repertório de rock, focado em construir a linguagem do estilo na prática.',
      en: "A riffs and rock repertoire specialist, focused on building the style's language through practice.",
    },
    longDescription: {
      pt: 'Dean guia o estudante pelo vocabulário do rock: riffs marcantes, power chords, dinâmica de banda e repertório reconhecível. Sua trilha equilibra técnica com atitude, sempre trazendo música real como referência.',
      en: "Dean guides students through the vocabulary of rock: memorable riffs, power chords, band dynamics and recognizable repertoire. His track balances technique with attitude, always bringing real music in as a reference.",
    },
    personality: { pt: ['Direto', 'Energético', 'Objetivo'], en: ['Direct', 'Energetic', 'Objective'] },
    strengths: {
      pt: ['Riffs de rock', 'Repertório', 'Linguagem do estilo'],
      en: ['Rock riffs', 'Repertoire', 'The language of the style'],
    },
    influences: { pt: ['Led Zeppelin', 'Deep Purple', "Guns N' Roses"], en: ['Led Zeppelin', 'Deep Purple', "Guns N' Roses"] },
    influenceNote: {
      pt: 'Leva dessas referências riffs memoráveis, energia de banda e respeito pela linguagem construída pelo classic rock.',
      en: 'Draws from these references memorable riffs, band energy and respect for the language built by classic rock.',
    },
    categories: ['rock', 'practice'],
    relatedModules: { pt: ['Praticar', 'Acordes'], en: ['Practice', 'Chords'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('dean'),
    heroImage: instructorProfilePath('dean'),
    introVideo: { src: '/instructors/intro/dean-intro.mp4' },
    quote: {
      pt: 'Um bom riff diz tudo antes mesmo do vocal entrar.',
      en: "A good riff says it all before the vocals even come in.",
    },
  },
  {
    id: 'diana',
    name: 'Diana',
    title: { pt: 'Embaixadora do GA', en: 'GA Ambassador' },
    shortDescription: {
      pt: 'Recebe quem chega ao GA, apresenta a jornada e ajuda cada pessoa a encontrar os ambientes e Arquitetos mais adequados.',
      en: 'Welcomes newcomers to GA, introduces the journey and helps each person find the most suitable environments and Music Architects.',
    },
    longDescription: {
      pt: 'Diana é a Embaixadora do GA e Guia da Jornada. Ela recebe quem chega, apresenta Kids, Teens e Studio, ajuda o usuário a compreender suas possibilidades e indica caminhos entre áreas e Arquitetos Musicais. Sua orientação atende desde iniciantes até professores e profissionais descobrindo o ecossistema.',
      en: 'Diana is the GA Ambassador and Journey Guide. She welcomes newcomers, introduces Kids, Teens and Studio, helps users understand their possibilities and points them toward the right areas and Music Architects. Her guidance serves everyone from beginners to teachers and professionals discovering the ecosystem.',
    },
    personality: { pt: ['Acolhedora', 'Motivadora', 'Estratégica'], en: ['Welcoming', 'Motivating', 'Strategic'] },
    strengths: {
      pt: ['Recepção e orientação na jornada', 'Conexão com áreas e Arquitetos', 'Visão geral do ecossistema'],
      en: ['Welcoming and journey guidance', 'Connecting users with areas and Architects', 'A broad view of the ecosystem'],
    },
    musicalBackground: {
      pt: 'A relação de Diana com a música começou pelo canto, pela interpretação e pela experiência de se expressar diante de outras pessoas. Essa vivência desenvolveu sua presença, sua escuta e sua forma acolhedora de se comunicar. Com o tempo, seu olhar se ampliou do palco para a jornada musical como um todo — e hoje ela usa essa experiência para receber, orientar e conectar cada pessoa aos caminhos e Arquitetos mais adequados.',
      en: 'Diana’s relationship with music began through singing, interpretation and the experience of expressing herself in front of others. That experience shaped her presence, her listening and her welcoming way of communicating. Over time, her perspective expanded from the stage to the musical journey as a whole — and today she uses that experience to welcome, guide and connect each person with the most suitable paths and Music Architects.',
    },
    listeningFavorites: { pt: ['A-ha', 'U2', 'Roxette', 'Seal', 'Annie Lennox'], en: ['A-ha', 'U2', 'Roxette', 'Seal', 'Annie Lennox'] },
    listeningNote: {
      pt: 'Diana se conecta com grandes melodias, vozes marcantes e canções que unem interpretação, identidade e produção refinada.',
      en: 'Diana connects with memorable melodies, distinctive voices and songs that bring together interpretation, identity and refined production.',
    },
    categories: ['institutional', 'communication', 'journey'],
    relatedModules: { pt: ['Ecossistema', 'Kids', 'Teens', 'Studio'], en: ['Ecosystem', 'Kids', 'Teens', 'Studio'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('diana'),
    heroImage: instructorProfilePath('diana'),
    introVideo: { src: '/instructors/intro/diana-intro.mp4' },
    quote: {
      pt: 'Toda jornada fica mais clara quando você sabe onde está e quem pode caminhar com você.',
      en: 'Every journey becomes clearer when you know where you are and who can walk it with you.',
    },
  },
  {
    id: 'erika',
    name: 'Erika',
    title: { pt: 'Voz e Performance', en: 'Voice and Performance' },
    shortDescription: {
      pt: 'Desenvolve presença, interpretação e confiança para transformar intenção musical em comunicação.',
      en: 'Develops presence, interpretation and confidence to turn musical intention into communication.',
    },
    longDescription: {
      pt: 'Erika trabalha a performance como encontro entre voz, corpo e intenção. Sua trilha desenvolve preparação, segurança, presença e interpretação, ajudando o músico a comunicar cada escolha com confiança diante do público.',
      en: 'Erika treats performance as the meeting point of voice, body and intention. Her track develops preparation, confidence, presence and interpretation, helping musicians communicate every choice with assurance in front of an audience.',
    },
    personality: { pt: ['Confiante', 'Expressiva', 'Encorajadora'], en: ['Confident', 'Expressive', 'Encouraging'] },
    strengths: {
      pt: ['Presença e comunicação', 'Interpretação vocal', 'Confiança e expressão corporal'],
      en: ['Presence and communication', 'Vocal interpretation', 'Confidence and body expression'],
    },
    influences: { pt: ['Annie Lennox', 'Tina Turner', 'Sade'], en: ['Annie Lennox', 'Tina Turner', 'Sade'] },
    influenceNote: {
      pt: 'Leva dessas referências presença, elegância interpretativa e confiança para transformar voz, corpo e intenção em comunicação musical.',
      en: 'Draws from these references presence, interpretive elegance and confidence to turn voice, body and intention into musical communication.',
    },
    categories: ['communication', 'practice'],
    relatedModules: { pt: ['Praticar', 'Studio'], en: ['Practice', 'Studio'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('erika'),
    heroImage: instructorProfilePath('erika'),
    introVideo: { src: '/instructors/intro/erika-intro.mp4' },
    quote: {
      pt: 'Performance é fazer o público compreender o que a música quer dizer.',
      en: 'Performance is making the audience understand what the music wants to say.',
    },
  },
  {
    id: 'fred',
    name: 'Fred',
    title: { pt: 'Arquitetura do Braço', en: 'Fretboard Architecture' },
    shortDescription: {
      pt: 'Visualiza como acordes, escalas e funções se conectam no braço para revelar a estrutura da música.',
      en: 'Visualizes how chords, scales and functions connect across the fretboard to reveal musical structure.',
    },
    longDescription: {
      pt: 'Fred mostra como a música está construída por meio de mapas claros do braço. Ele conecta acordes, escalas e funções harmônicas em uma estrutura visual, ajudando o estudante a enxergar no instrumento relações que antes pareciam conceitos isolados.',
      en: 'Fred shows how music is built through clear fretboard maps. He connects chords, scales and harmonic functions into a visual structure, helping students see relationships on the instrument that once seemed like isolated concepts.',
    },
    personality: { pt: ['Analítico', 'Visual', 'Estruturado'], en: ['Analytical', 'Visual', 'Structured'] },
    strengths: {
      pt: ['Visualização do braço', 'Conexão entre acordes, escalas e funções', 'Leitura da estrutura musical'],
      en: ['Fretboard visualization', 'Connecting chords, scales and functions', 'Reading musical structure'],
    },
    influences: { pt: ['Ted Greene', 'Joe Satriani', 'Toninho Horta'], en: ['Ted Greene', 'Joe Satriani', 'Toninho Horta'] },
    influenceNote: {
      pt: 'Leva dessas referências a visão do braço como um mapa conectado de acordes, escalas, funções e possibilidades.',
      en: 'Draws from these references a view of the fretboard as a connected map of chords, scales, functions and possibilities.',
    },
    categories: ['harmony', 'theory', 'advanced'],
    relatedModules: { pt: ['Tríades e Tétrades', 'Ciclo Harmônico', 'CAGED'], en: ['Triads and Tetrads', 'Harmonic Cycle', 'CAGED'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('fred'),
    heroImage: instructorProfilePath('fred'),
    introVideo: { src: '/instructors/intro/fred-intro.mp4' },
    quote: {
      pt: 'Quando você enxerga as conexões, o braço deixa de ser um conjunto de formas isoladas.',
      en: 'When you see the connections, the fretboard stops being a collection of isolated shapes.',
    },
  },
  {
    id: 'hiroshi',
    name: 'Hiroshi',
    title: { pt: 'Precisão e Técnica', en: 'Precision and Technique' },
    shortDescription: {
      pt: 'Aprofunda técnica, intervalos e análise com precisão, ajustando o nível da conversa sem evitar questões exigentes.',
      en: 'Deepens technique, intervals and analysis with precision, adjusting the level of the conversation without avoiding demanding questions.',
    },
    longDescription: {
      pt: 'Hiroshi combina precisão técnica com investigação analítica. Ele examina movimentos, intervalos e escolhas musicais em detalhe, identifica pontos de correção e desafia cada interlocutor na profundidade adequada — inclusive professores e músicos experientes.',
      en: 'Hiroshi combines technical precision with analytical investigation. He examines movement, intervals and musical choices in detail, identifies points for correction and challenges each person at the appropriate depth — including teachers and experienced musicians.',
    },
    personality: { pt: ['Preciso', 'Investigativo', 'Exigente'], en: ['Precise', 'Investigative', 'Demanding'] },
    strengths: {
      pt: ['Precisão técnica e correção', 'Análise de intervalos', 'Aprofundamento técnico e intelectual'],
      en: ['Technical precision and correction', 'Interval analysis', 'Technical and intellectual depth'],
    },
    influences: { pt: ['John Petrucci', 'Guthrie Govan', 'Eric Johnson'], en: ['John Petrucci', 'Guthrie Govan', 'Eric Johnson'] },
    influenceNote: {
      pt: 'Leva dessas referências precisão, domínio consciente da técnica e atenção aos detalhes que permitem aprofundar cada escolha musical.',
      en: 'Draws from these references precision, conscious technical command and attention to detail that make deeper musical choices possible.',
    },
    categories: ['theory', 'practice', 'advanced'],
    relatedModules: { pt: ['Radar de Intervalos', 'CAGED', 'Praticar'], en: ['Interval Radar', 'CAGED', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('hiroshi'),
    heroImage: instructorProfilePath('hiroshi'),
    introVideo: { src: '/instructors/intro/hiroshi-intro.mp4' },
    quote: {
      pt: 'Precisão não é o fim da análise. É o que permite enxergar mais fundo.',
      en: 'Precision is not the end of analysis. It is what allows us to see deeper.',
    },
  },
  {
    id: 'jax',
    name: 'Jax',
    title: { pt: 'Concisão e Ruptura', en: 'Concision and Disruption' },
    shortDescription: {
      pt: 'Questiona excessos e convenções para encontrar a forma mais direta e necessária de expressão.',
      en: 'Questions excess and convention to find the most direct and necessary form of expression.',
    },
    longDescription: {
      pt: 'Jax desafia a ideia de que música importante precisa ser complicada. Ele usa teoria e técnica quando elas servem à expressão, mas também sabe romper padrões, eliminar excessos e preservar a força de uma ideia simples — sem deixar o perfeccionismo silenciar o que precisa ser dito.',
      en: 'Jax challenges the idea that meaningful music has to be complicated. He uses theory and technique when they serve expression, but also knows when to break patterns, remove excess and preserve the strength of a simple idea — without letting perfectionism silence what needs to be said.',
    },
    personality: { pt: ['Direto', 'Conciso', 'Questionador'], en: ['Direct', 'Concise', 'Questioning'] },
    strengths: {
      pt: ['Simplificação consciente', 'Ruptura de padrões', 'Expressão direta sem perfeccionismo'],
      en: ['Conscious simplification', 'Breaking patterns', 'Direct expression without perfectionism'],
    },
    influences: { pt: ['Kurt Cobain', 'Pixies', 'Neil Young'], en: ['Kurt Cobain', 'Pixies', 'Neil Young'] },
    influenceNote: {
      pt: 'Leva dessas referências concisão, contraste e coragem para preservar a força de uma ideia sem complicá-la por obrigação.',
      en: 'Draws from these references concision, contrast and the courage to preserve the strength of an idea without complicating it out of obligation.',
    },
    categories: ['rock', 'practice'],
    relatedModules: { pt: ['Teens', 'Praticar'], en: ['Teens', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('jax'),
    heroImage: instructorProfilePath('jax'),
    introVideo: { src: '/instructors/intro/jax-intro.mp4' },
    quote: {
      pt: 'A música não precisa ser complicada para dizer algo importante.',
      en: "Music doesn't have to be complicated to say something important.",
    },
  },
  {
    id: 'juan',
    name: 'Juan',
    title: { pt: 'Baixo, Groove e Movimento', en: 'Bass, Groove and Motion' },
    shortDescription: {
      pt: 'Explora o baixo pelo groove e pelo movimento melódico, propondo caminhos que vão além de apenas sustentar a base.',
      en: 'Explores bass through groove and melodic movement, offering paths that go beyond simply holding down the foundation.',
    },
    longDescription: {
      pt: 'Juan apresenta uma perspectiva inventiva sobre o baixo: pulso firme, linhas melódicas, variações rítmicas e soluções que criam movimento sem abandonar o groove. Sua trilha mostra como o instrumento pode sustentar, dialogar e transformar a música.',
      en: 'Juan offers an inventive perspective on bass: a steady pulse, melodic lines, rhythmic variations and solutions that create movement without abandoning the groove. His track shows how the instrument can support, converse and transform the music.',
    },
    personality: { pt: ['Rítmico', 'Inventivo', 'Curioso'], en: ['Rhythmic', 'Inventive', 'Curious'] },
    strengths: {
      pt: ['Groove e variação rítmica', 'Linhas melódicas de baixo', 'Soluções alternativas para arranjos'],
      en: ['Groove and rhythmic variation', 'Melodic bass lines', 'Alternative arrangement solutions'],
    },
    influences: { pt: ['Jaco Pastorius', 'Flea', 'Thundercat'], en: ['Jaco Pastorius', 'Flea', 'Thundercat'] },
    influenceNote: {
      pt: 'Leva dessas referências liberdade melódica, groove móvel e disposição para propor ao baixo funções menos previsíveis.',
      en: 'Draws from these references melodic freedom, moving groove and a willingness to give the bass less predictable roles.',
    },
    categories: ['bass', 'rhythm'],
    relatedModules: { pt: ['Praticar', 'Ciclo Harmônico'], en: ['Practice', 'Harmonic Cycle'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('juan'),
    heroImage: instructorProfilePath('juan'),
    introVideo: { src: '/instructors/intro/juan-intro.mp4' },
    quote: {
      pt: 'O baixo sustenta a música — mas também pode mostrar novos caminhos.',
      en: 'Bass supports the music — but it can also reveal new paths.',
    },
  },
  {
    id: 'kael',
    name: 'Kael',
    title: { pt: 'Metal e Técnica Pesada', en: 'Metal and Heavy Technique' },
    shortDescription: {
      pt: 'Especialista em metal, palhetada e riffs pesados, com foco em intensidade e precisão.',
      en: 'A metal specialist in picking and heavy riffs, focused on intensity and precision.',
    },
    longDescription: {
      pt: 'Kael conduz o estudante pelo universo do metal: palhetada alternada, riffs pesados, dinâmica de intensidade e técnica de alta exigência. Sua trilha é voltada a quem busca desafio técnico real.',
      en: 'Kael guides students through the world of metal: alternate picking, heavy riffs, intensity dynamics and highly demanding technique. His track is aimed at those seeking a real technical challenge.',
    },
    personality: { pt: ['Intenso', 'Exigente', 'Focado'], en: ['Intense', 'Demanding', 'Focused'] },
    strengths: {
      pt: ['Palhetada e técnica pesada', 'Riffs de metal', 'Intensidade controlada'],
      en: ['Picking and heavy technique', 'Metal riffs', 'Controlled intensity'],
    },
    influences: { pt: ['Tony Iommi', 'James Hetfield', 'Zakk Wylde'], en: ['Tony Iommi', 'James Hetfield', 'Zakk Wylde'] },
    influenceNote: {
      pt: 'Leva dessas referências riffs pesados, palhetada firme e intensidade sustentada por controle técnico.',
      en: 'Draws from these references heavy riffs, firm picking and intensity sustained by technical control.',
    },
    categories: ['metal', 'advanced'],
    relatedModules: { pt: ['Praticar', 'CAGED'], en: ['Practice', 'CAGED'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('kael'),
    heroImage: instructorProfilePath('kael'),
    introVideo: { src: '/instructors/intro/kael-intro.mp4' },
    quote: {
      pt: 'Intensidade sem controle é ruído. Com técnica, é impacto.',
      en: "Intensity without control is noise. With technique, it's impact.",
    },
  },
  {
    id: 'leo',
    name: 'Leo',
    title: { pt: 'Prática e Evolução', en: 'Practice and Progress' },
    shortDescription: {
      pt: 'Transforma escalas, ritmos e conceitos em habilidade por meio de sessões práticas, progressivas e motivadoras.',
      en: 'Turns scales, rhythms and concepts into skill through practical, progressive and motivating sessions.',
    },
    longDescription: {
      pt: 'Leo conduz sessões de prática com objetivos claros, combinando escalas, ritmos, BPM e repetição inteligente. Ele ajuda o estudante a ganhar fluidez e confiança, até que aquilo que parecia difícil comece a acontecer com naturalidade.',
      en: 'Leo leads practice sessions with clear goals, combining scales, rhythms, BPM and intelligent repetition. He helps students build fluency and confidence until what once felt difficult begins to happen naturally.',
    },
    personality: { pt: ['Motivador', 'Prático', 'Energético'], en: ['Motivating', 'Practical', 'Energetic'] },
    strengths: {
      pt: ['Sessões de prática guiada', 'Escalas, ritmos e BPM', 'Fluidez por repetição inteligente'],
      en: ['Guided practice sessions', 'Scales, rhythms and BPM', 'Fluency through intelligent repetition'],
    },
    influences: { pt: ['Mark Knopfler', 'Eric Clapton', 'Peter Frampton'], en: ['Mark Knopfler', 'Eric Clapton', 'Peter Frampton'] },
    influenceNote: {
      pt: 'Leva dessas referências fluidez, confiança e a prática amadurecida até que a execução passe a soar natural.',
      en: 'Draws from these references fluency, confidence and practice matured until playing begins to feel natural.',
    },
    categories: ['practice', 'rhythm'],
    relatedModules: { pt: ['Teens', 'Praticar'], en: ['Teens', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('leo'),
    heroImage: instructorProfilePath('leo'),
    introVideo: { src: '/instructors/intro/leo-intro.mp4' },
    quote: {
      pt: 'O melhor sinal de evolução é quando o difícil começa a soar natural.',
      en: 'The best sign of progress is when the difficult begins to feel natural.',
    },
  },
  {
    id: 'mel',
    name: 'Mel',
    title: { pt: 'Melodia e Fraseado', en: 'Melody and Phrasing' },
    shortDescription: {
      pt: 'Transforma notas em ideias musicais, desenvolvendo frases com respiração, contraste, intenção e direção.',
      en: 'Turns notes into musical ideas, developing phrases with breath, contrast, intention and direction.',
    },
    longDescription: {
      pt: 'Mel ajuda o estudante a construir melodias que dizem algo. Sua trilha explora direção, repetição, contraste e espaço, mostrando como uma frase nasce, respira, se desenvolve e encontra seu destino musical.',
      en: 'Mel helps students build melodies that say something. Her track explores direction, repetition, contrast and space, showing how a phrase begins, breathes, develops and finds its musical destination.',
    },
    personality: { pt: ['Criativa', 'Atenta', 'Expressiva'], en: ['Creative', 'Attentive', 'Expressive'] },
    strengths: {
      pt: ['Construção de melodias', 'Fraseado com direção', 'Repetição, contraste e respiração'],
      en: ['Melody building', 'Phrasing with direction', 'Repetition, contrast and breathing'],
    },
    influences: { pt: ['Radiohead', 'David Gilmour', 'Marisa Monte'], en: ['Radiohead', 'David Gilmour', 'Marisa Monte'] },
    influenceNote: {
      pt: 'Leva dessas referências direção melódica, espaço, contraste e sensibilidade para desenvolver ideias com intenção e identidade.',
      en: 'Draws from these references melodic direction, space, contrast and the sensitivity to develop ideas with intention and identity.',
    },
    categories: ['theory', 'practice'],
    relatedModules: { pt: ['Praticar'], en: ['Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('mel'),
    heroImage: instructorProfilePath('mel'),
    introVideo: { src: '/instructors/intro/mel-intro.mp4' },
    quote: {
      pt: 'Uma frase ganha sentido quando sabemos de onde ela vem e para onde quer ir.',
      en: 'A phrase gains meaning when we know where it comes from and where it wants to go.',
    },
  },
  {
    id: 'nina',
    name: 'Nina',
    title: { pt: 'Voz, Ouvido e Musicalidade', en: 'Voice, Ear and Musicality' },
    shortDescription: {
      pt: 'Conecta voz, ouvido e instrumento para desenvolver afinação, percepção, fraseado e imaginação musical.',
      en: 'Connects voice, ear and instrument to develop pitch, perception, phrasing and musical imagination.',
    },
    longDescription: {
      pt: 'Nina usa a voz como ponte entre aquilo que o músico ouve, imagina e toca. Sua trilha trabalha afinação, intervalos e fraseado, ajudando o estudante a cantar ideias, reconhecê-las pelo ouvido e levá-las ao instrumento com naturalidade.',
      en: 'Nina uses the voice as a bridge between what musicians hear, imagine and play. Her track works on pitch, intervals and phrasing, helping students sing ideas, recognize them by ear and bring them naturally to the instrument.',
    },
    personality: { pt: ['Atenta', 'Expressiva', 'Estimulante'], en: ['Attentive', 'Expressive', 'Encouraging'] },
    strengths: {
      pt: ['Conexão entre cantar e tocar', 'Afinação e percepção de intervalos', 'Imaginação e fraseado musical'],
      en: ['Connecting singing and playing', 'Pitch and interval perception', 'Musical imagination and phrasing'],
    },
    influences: { pt: ['Tom Jobim', 'Elis Regina', 'Milton Nascimento'], en: ['Tom Jobim', 'Elis Regina', 'Milton Nascimento'] },
    influenceNote: {
      pt: 'Leva dessas referências escuta sensível, precisão vocal e a capacidade de transformar melodias imaginadas em ideias que podem ser cantadas e tocadas.',
      en: 'Draws from these references sensitive listening, vocal precision and the ability to turn imagined melodies into ideas that can be sung and played.',
    },
    categories: ['earTraining', 'practice'],
    relatedModules: { pt: ['Radar de Intervalos', 'Praticar'], en: ['Interval Radar', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('nina'),
    heroImage: instructorProfilePath('nina'),
    introVideo: { src: '/instructors/intro/nina-intro.mp4' },
    quote: {
      pt: 'Quando você consegue cantar uma ideia, o instrumento deixa de ser uma barreira.',
      en: 'When you can sing an idea, the instrument stops being a barrier.',
    },
  },
  {
    id: 'rick',
    name: 'Rick',
    title: { pt: 'Baixo e Fundamento', en: 'Bass and Foundation' },
    shortDescription: {
      pt: 'Constrói linhas de baixo que conectam harmonia, bateria e groove com clareza, espaço e função.',
      en: 'Builds bass lines that connect harmony, drums and groove with clarity, space and purpose.',
    },
    longDescription: {
      pt: 'Rick pensa a música a partir da função do baixo. Ele trabalha a relação com a bateria, a condução harmônica, o espaço e a articulação, mostrando como linhas simples e bem construídas podem fundamentar toda a banda.',
      en: 'Rick approaches music through the role of the bass. He works on the relationship with the drums, harmonic movement, space and articulation, showing how simple, well-built lines can ground an entire band.',
    },
    personality: { pt: ['Firme', 'Atento', 'Essencial'], en: ['Steady', 'Attentive', 'Grounded'] },
    strengths: {
      pt: ['Construção de linhas de baixo', 'Relação entre baixo e bateria', 'Função harmônica, espaço e articulação'],
      en: ['Building bass lines', 'The relationship between bass and drums', 'Harmonic function, space and articulation'],
    },
    influences: { pt: ['James Jamerson', 'Duck Dunn', 'Pino Palladino'], en: ['James Jamerson', 'Duck Dunn', 'Pino Palladino'] },
    influenceNote: {
      pt: 'Leva dessas referências fundamento, espaço e linhas que conectam bateria e harmonia sem competir com a canção.',
      en: 'Draws from these references foundation, space and lines that connect drums and harmony without competing with the song.',
    },
    categories: ['bass', 'rhythm'],
    relatedModules: { pt: ['Praticar', 'Ciclo Harmônico'], en: ['Practice', 'Harmonic Cycle'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('rick'),
    heroImage: instructorProfilePath('rick'),
    introVideo: { src: '/instructors/intro/rick-intro.mp4' },
    quote: {
      pt: 'Uma boa linha de baixo dá chão à banda sem ocupar todo o espaço.',
      en: 'A good bass line grounds the band without taking up all the space.',
    },
  },
  {
    id: 'roxie',
    name: 'Roxie',
    title: { pt: 'Rock Alternativo', en: 'Alternative Rock' },
    shortDescription: {
      pt: 'Inspira identidade e expressão autoral no rock alternativo, encorajando cada músico a encontrar uma voz própria.',
      en: 'Inspires identity and original expression in alternative rock, encouraging every musician to find a voice of their own.',
    },
    longDescription: {
      pt: 'Roxie estimula o estudante a reconhecer e desenvolver sua própria identidade musical. Entre riffs alternativos, escolhas autorais e experimentação, sua trilha une técnica e expressão pessoal em torno de uma pergunta: isso realmente soa como você?',
      en: 'Roxie encourages students to recognize and develop their own musical identity. Through alternative riffs, original choices and experimentation, her track brings technique and personal expression together around one question: does this truly sound like you?',
    },
    personality: { pt: ['Criativa', 'Autêntica', 'Ousada'], en: ['Creative', 'Authentic', 'Bold'] },
    strengths: {
      pt: ['Identidade musical', 'Expressão autoral', 'Criatividade no rock alternativo'],
      en: ['Musical identity', 'Original expression', 'Creativity in alternative rock'],
    },
    influences: { pt: ['Joan Jett', 'Garbage', 'Rita Lee'], en: ['Joan Jett', 'Garbage', 'Rita Lee'] },
    influenceNote: {
      pt: 'Leva dessas referências atitude, liberdade para experimentar e coragem para construir uma identidade inequivocamente própria.',
      en: 'Draws from these references attitude, freedom to experiment and the courage to build an unmistakably individual identity.',
    },
    categories: ['rock', 'practice'],
    relatedModules: { pt: ['Teens', 'Studio', 'Praticar'], en: ['Teens', 'Studio', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('roxie'),
    heroImage: instructorProfilePath('roxie'),
    introVideo: { src: '/instructors/intro/roxie-intro.mp4' },
    quote: {
      pt: 'Antes de soar como qualquer outra pessoa, precisa soar como você.',
      en: 'Before it sounds like anyone else, it needs to sound like you.',
    },
  },
  {
    id: 'sofia',
    name: 'Sofia',
    title: { pt: 'Acordes e Expressividade', en: 'Chords and Expressiveness' },
    shortDescription: {
      pt: 'Trabalha harmonia aplicada, acompanhamento e expressividade com foco em repertório.',
      en: 'Works on applied harmony, accompaniment and expressiveness with a focus on repertoire.',
    },
    longDescription: {
      pt: 'Sofia mostra como acordes vão muito além de shapes fixos: harmonia aplicada, condução harmônica, acompanhamento e articulação transformam o mesmo acorde em algo único. Sua trilha conecta a teoria a uma aplicação prática real no repertório.',
      en: 'Sofia shows how chords go far beyond fixed shapes: applied harmony, voice leading, accompaniment and articulation turn the same chord into something unique. Her track connects theory to a real practical application in repertoire.',
    },
    personality: { pt: ['Acolhedora', 'Clara', 'Expressiva'], en: ['Welcoming', 'Clear', 'Expressive'] },
    strengths: {
      pt: ['Harmonia aplicada ao repertório', 'Acordes e acompanhamento', 'Condução harmônica', 'Expressividade musical'],
      en: ['Harmony applied to repertoire', 'Chords and accompaniment', 'Harmonic voice leading', 'Musical expressiveness'],
    },
    influences: { pt: ['João Gilberto', 'The Beatles', 'Djavan'], en: ['João Gilberto', 'The Beatles', 'Djavan'] },
    influenceNote: {
      pt: 'Leva dessas referências acordes com movimento, voicings expressivos e acompanhamento que participa ativamente da música.',
      en: 'Draws from these references moving chords, expressive voicings and accompaniment that actively participates in the music.',
    },
    categories: ['harmony', 'practice'],
    relatedModules: {
      pt: ['Acordes', 'Tríades e Tétrades', 'Studio', 'Praticar'],
      en: ['Chords', 'Triads and Tetrads', 'Studio', 'Practice'],
    },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('sofia'),
    heroImage: instructorProfilePath('sofia'),
    introVideo: { src: '/instructors/intro/sofia-intro.mp4' },
    quote: {
      pt: 'Um bom acorde não é apenas uma forma no braço: é uma escolha de cor, movimento e expressão.',
      en: "A good chord isn't just a shape on the fretboard: it's a choice of color, movement and expression.",
    },
  },
  {
    id: 'tom',
    name: 'Tom',
    title: { pt: 'Luthieria e Setup', en: 'Luthiery and Setup' },
    shortDescription: {
      pt: 'Especialista em regulagem, conservação, manutenção e ajustes práticos para manter o instrumento confortável, estável e pronto para tocar.',
      en: 'A specialist in setup, upkeep, maintenance and practical adjustments to keep the instrument comfortable, stable and ready to play.',
    },
    longDescription: {
      pt: 'Tom cuida da parte física da jornada musical: instrumentos, regulagens, conservação, pequenos reparos, timbres e escolhas de equipamento. Sua função é ajudar o usuário a entender que tocar melhor também depende de um instrumento confortável, estável e bem cuidado.',
      en: 'Tom takes care of the physical side of the musical journey: instruments, setups, upkeep, minor repairs, tones and gear choices. His role is to help users understand that playing better also depends on a comfortable, stable and well cared-for instrument.',
    },
    personality: { pt: ['Descontraído', 'Direto', 'Acolhedor'], en: ['Laid-back', 'Direct', 'Welcoming'] },
    strengths: {
      pt: [
        'Regulagem básica e conforto do instrumento',
        'Conservação, limpeza e troca de cordas',
        'Timbres, captadores e equipamentos',
        'Customização e cultura de instrumentos',
      ],
      en: [
        'Basic setup and instrument comfort',
        'Upkeep, cleaning and string changes',
        'Tones, pickups and gear',
        'Instrument customization and culture',
      ],
    },
    professionalReferences: { pt: ['Leo Fender', 'Les Paul', 'Eddie Van Halen'], en: ['Leo Fender', 'Les Paul', 'Eddie Van Halen'] },
    professionalReferenceNote: {
      pt: 'Leva dessas referências curiosidade técnica, experimentação e a ideia de que instrumento, regulagem e equipamento fazem parte da criação musical.',
      en: 'Draws from these references technical curiosity, experimentation and the idea that instrument, setup and gear are part of musical creation.',
    },
    categories: ['luthiery', 'gear', 'maintenance'],
    relatedModules: {
      pt: ['Custom Shop', 'Manutenção do Instrumento', 'Equipamentos e Timbres', 'EVH / Frankenstrat'],
      en: ['Custom Shop', 'Instrument Maintenance', 'Gear and Tones', 'EVH / Frankenstrat'],
    },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('tom'),
    heroImage: instructorProfilePath('tom'),
    introVideo: { src: '/instructors/intro/tom-intro.mp4' },
    quote: {
      pt: 'Instrumento bem cuidado responde melhor, afina melhor e inspira mais.',
      en: 'A well cared-for instrument responds better, tunes better and inspires more.',
    },
  },
  {
    id: 'victor',
    name: 'Victor',
    title: { pt: 'Jazz e Harmonia', en: 'Jazz and Harmony' },
    shortDescription: {
      pt: 'Explora acordes sofisticados, condução harmônica e a linguagem do jazz.',
      en: 'Explores sophisticated chords, voice leading and the language of jazz.',
    },
    longDescription: {
      pt: 'Victor conduz o estudante por harmonias mais sofisticadas: acordes estendidos, substituições e condução musical típicas do jazz. Sua trilha é voltada a quem já domina o básico e quer aprofundar a compreensão harmônica.',
      en: 'Victor guides students through more sophisticated harmony: extended chords, substitutions and musical voice leading typical of jazz. His track is aimed at those who already master the basics and want to deepen their harmonic understanding.',
    },
    personality: { pt: ['Sofisticado', 'Reflexivo', 'Refinado'], en: ['Sophisticated', 'Reflective', 'Refined'] },
    strengths: {
      pt: ['Harmonia avançada', 'Acordes sofisticados', 'Condução musical'],
      en: ['Advanced harmony', 'Sophisticated chords', 'Musical voice leading'],
    },
    influences: { pt: ['Wes Montgomery', 'Herbie Hancock', 'Pat Metheny'], en: ['Wes Montgomery', 'Herbie Hancock', 'Pat Metheny'] },
    influenceNote: {
      pt: 'Leva dessas referências abertura para tensões, voicings e substituições que ampliam a linguagem sem transformar sofisticação em excesso.',
      en: 'Draws from these references an openness to tensions, voicings and substitutions that expand the language without turning sophistication into excess.',
    },
    categories: ['jazz', 'harmony', 'theory', 'advanced'],
    relatedModules: { pt: ['Ciclo Harmônico', 'Tríades e Tétrades'], en: ['Harmonic Cycle', 'Triads and Tetrads'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('victor'),
    heroImage: instructorProfilePath('victor'),
    introVideo: { src: '/instructors/intro/victor-intro.mp4' },
    quote: {
      pt: 'Harmonia sofisticada não é sobre complicar — é sobre enxergar mais opções.',
      en: "Sophisticated harmony isn't about complicating things — it's about seeing more options.",
    },
  },
];

export const getInstructorById = (id: string): InstructorProfile | undefined =>
  instructors.find(instructor => instructor.id === id);

export const instructorSpotlightGroups: string[][] = [
  ['diana', 'nina', 'victor', 'bill'],
  ['alice', 'rick', 'hiroshi', 'roxie'],
  ['erika', 'kael', 'mel', 'arthur'],
  ['sofia', 'juan', 'fred', 'dean'],
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
