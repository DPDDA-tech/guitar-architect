import type { LocalizedText } from './guestSpecialists';

export interface GuestSpecialistIdentityField {
  label: LocalizedText;
  value: LocalizedText;
}

export interface GuestSpecialistPrincipleCard {
  heading: LocalizedText;
  body: LocalizedText;
}

export interface GuestSpecialistMethodStep {
  letter: string;
  heading: LocalizedText;
  body: LocalizedText;
}

export interface GuestSpecialistReferenceItem {
  label: string;
  href: string;
}

export interface GuestSpecialistReferenceGroup {
  heading: LocalizedText;
  kindLabel?: LocalizedText;
  items: GuestSpecialistReferenceItem[];
}

export interface GuestSpecialistProfileContent {
  taglineLine: LocalizedText;
  identityTitle: LocalizedText;
  identity: GuestSpecialistIdentityField[];
  backgroundTitle: LocalizedText;
  philosophyTitle: LocalizedText;
  principles: GuestSpecialistPrincipleCard[];
  methodTitle: LocalizedText;
  methodIntro: LocalizedText;
  methodSteps: GuestSpecialistMethodStep[];
  methodColumnsClass: string;
  whenToSeekTitle: LocalizedText;
  whenToSeekItems: LocalizedText[];
  referencesTitle: LocalizedText;
  referencesIntro: LocalizedText;
  referenceGroups: GuestSpecialistReferenceGroup[];
  disclaimerParagraphs: LocalizedText[];
}

const text = (pt: string, en: string): LocalizedText => ({ pt, en });

export const guestSpecialistProfileContent: Record<string, GuestSpecialistProfileContent> = {
  'dra-helena': {
    taglineLine: text(
      'Saúde do músico · Prevenção de lesões · Ergonomia · Consciência corporal · Hábitos de estudo saudáveis',
      'Musician health · Injury prevention · Ergonomics · Body awareness · Healthy practice habits',
    ),
    identityTitle: text('Identidade da personagem', 'Character identity'),
    identity: [
      { label: text('Nome completo', 'Full name'), value: text('Helena Mascarenhas de Mello Villaça', 'Helena Mascarenhas de Mello Villaça') },
      { label: text('Nome de exibição', 'Display name'), value: text('Dra. Helena Villaça', 'Dr. Helena Villaça') },
      { label: text('Idade', 'Age'), value: text('43 anos', '43 years old') },
      { label: text('Data de nascimento', 'Date of birth'), value: text('18 de setembro', 'September 18') },
      { label: text('Local de nascimento', 'Place of birth'), value: text('Belo Horizonte, Minas Gerais', 'Belo Horizonte, Minas Gerais, Brazil') },
      { label: text('Onde vive', 'Lives in'), value: text('Juiz de Fora, Minas Gerais', 'Juiz de Fora, Minas Gerais, Brazil') },
      { label: text('Nacionalidade', 'Nationality'), value: text('Brasileira', 'Brazilian') },
      { label: text('Profissão', 'Profession'), value: text('Médica fisiatra', 'Physiatrist') },
      { label: text('Área de atuação', 'Field'), value: text('Saúde musculoesquelética e funcional de músicos', 'Musculoskeletal and functional health for musicians') },
      { label: text('Formação complementar', 'Additional training'), value: text('Medicina do esporte, ergonomia, dor musculoesquelética e reabilitação funcional', 'Sports medicine, ergonomics, musculoskeletal pain and functional rehabilitation') },
      { label: text('Instrumento', 'Instrument'), value: text('Violão', 'Acoustic guitar') },
      { label: text('Nível musical', 'Musical level'), value: text('Amadora dedicada', 'Dedicated amateur') },
      { label: text('Papel no Guitar Architect', 'Role at Guitar Architect'), value: text('Especialista em Saúde do Músico', 'Musician Health Specialist') },
      { label: text('Vínculo institucional', 'Institutional link'), value: text('Consultora do Guitar Architect My Academy e integrante da rede de apoio à jornada musical', 'Consultant to Guitar Architect My Academy and member of the musical journey support network') },
      { label: text('Personagem', 'Character'), value: text('Fictícia, criada com auxílio de inteligência artificial', 'Fictional, created with the aid of artificial intelligence') },
    ],
    backgroundTitle: text('Trajetória', 'Background'),
    philosophyTitle: text('Filosofia profissional', 'Professional philosophy'),
    principles: [
      { heading: text('O corpo não é apenas um suporte para o instrumento', 'The body is not merely an instrument support'), body: text('Respiração, estabilidade, mobilidade, coordenação e controle de força participam diretamente da produção sonora e da execução.', 'Breathing, stability, mobility, coordination and force control directly participate in sound production and performance.') },
      { heading: text('Dor não é requisito para evolução', 'Pain is not a requirement for progress'), body: text('Esforço e fadiga podem ocorrer, mas desconfortos persistentes ou progressivos não devem ser normalizados como prova de dedicação.', 'Effort and fatigue may occur, but persistent or progressive discomfort should not be normalized as proof of dedication.') },
      { heading: text('A melhor postura não é uma posição rígida', 'The best posture is not rigid'), body: text('Uma postura saudável combina estabilidade, mobilidade e variação, evitando sobrecarga prolongada e tensão desnecessária.', 'Healthy posture combines stability, mobility and variation while avoiding prolonged overload and unnecessary tension.') },
      { heading: text('A prevenção começa na rotina', 'Prevention begins in the routine'), body: text('Pequenos ajustes diários na prática, no ambiente e no uso do instrumento podem ser mais eficazes do que agir apenas depois do aparecimento de uma lesão.', 'Small daily adjustments to practice, environment and instrument use may be more effective than acting only after an injury appears.') },
    ],
    methodTitle: text('Método P.A.U.S.A.', 'P.A.U.S.A. method'),
    methodIntro: text(
      'Ferramenta educacional criada para o GA, destinada à construção de hábitos mais conscientes. Não constitui protocolo médico.',
      'An educational tool created for GA to support more conscious habits. It is not a medical protocol.',
    ),
    methodSteps: [
      { letter: 'P', heading: text('Perceba', 'Perceive'), body: text('Reconheça as sensações presentes antes, durante e depois da prática.', 'Notice sensations before, during and after practice.') },
      { letter: 'A', heading: text('Ajuste', 'Adjust'), body: text('Observe instrumento, cadeira, apoio, correia, tela, partitura e ambiente.', 'Review the instrument, chair, support, strap, screen, score and environment.') },
      { letter: 'U', heading: text('Use menos tensão', 'Use less tension'), body: text('Identifique força excessiva e movimentos desnecessários.', 'Identify excessive force and unnecessary movements.') },
      { letter: 'S', heading: text('Segmente o estudo', 'Segment practice'), body: text('Divida a prática em blocos compatíveis com seu condicionamento e com a dificuldade do conteúdo.', 'Divide practice into blocks suited to your conditioning and the difficulty of the material.') },
      { letter: 'A', heading: text('Avalie os sinais', 'Assess the signs'), body: text('Diferencie fadiga transitória de sintomas persistentes ou progressivos que exigem atenção profissional.', 'Distinguish temporary fatigue from persistent or progressive symptoms that require professional attention.') },
    ],
    methodColumnsClass: 'sm:grid-cols-2 lg:grid-cols-5',
    whenToSeekTitle: text('Quando procurar avaliação profissional', 'When to seek professional assessment'),
    whenToSeekItems: [
      text('Dor persistente ou progressiva', 'Persistent or progressive pain'),
      text('Formigamento ou alteração de sensibilidade', 'Tingling or altered sensation'),
      text('Perda de força', 'Loss of strength'),
      text('Limitação de movimento', 'Restricted movement'),
      text('Trauma', 'Trauma'),
      text('Zumbido', 'Tinnitus'),
      text('Audição abafada ou redução auditiva', 'Muffled hearing or hearing reduction'),
      text('Outro sintoma que interfira na prática ou nas atividades diárias', 'Any symptom that interferes with practice or daily activities'),
    ],
    referencesTitle: text('Fontes e referências', 'Sources and references'),
    referencesIntro: text(
      'As orientações desta página se apoiam em fontes de naturezas diferentes — revisões científicas, artigos, instituições de referência e materiais educativos oficiais — cobrindo fisiatria, saúde musculoesquelética, ergonomia, medicina das artes performáticas e saúde auditiva. A natureza de cada fonte está identificada abaixo; elas não têm o mesmo peso probatório entre si.',
      'The guidance on this page draws on sources of different natures — scientific reviews, articles, reference institutions and official educational materials — covering physiatry, musculoskeletal health, ergonomics, performing arts medicine and hearing health. Each source’s nature is identified below; they do not carry the same evidentiary weight.',
    ),
    referenceGroups: [
      {
        heading: text('Medicina Física e Reabilitação', 'Physical Medicine and Rehabilitation'),
        kindLabel: text('Instituição de referência', 'Reference institution'),
        items: [
          { label: 'American Academy of Physical Medicine and Rehabilitation (AAPM&R) — About Physiatry', href: 'https://www.aapmr.org/about-physiatry' },
        ],
      },
      {
        heading: text('Saúde musculoesquelética do músico', 'Musculoskeletal health of musicians'),
        kindLabel: text('Revisão científica', 'Systematic review'),
        items: [
          { label: 'Rotter et al. — Musculoskeletal disorders and complaints in professional musicians: a systematic review (2020)', href: 'https://pubmed.ncbi.nlm.nih.gov/31482285/' },
          { label: 'Kok et al. — The occurrence of musculoskeletal complaints among professional musicians: a systematic review (2016)', href: 'https://pubmed.ncbi.nlm.nih.gov/26563718/' },
        ],
      },
      {
        heading: text('Ergonomia e prevenção aplicada ao músico', 'Ergonomics and prevention applied to musicians'),
        kindLabel: text('Artigo científico', 'Scientific article'),
        items: [
          { label: 'Foxman & Burgel — Musician health and safety: Preventing playing-related musculoskeletal disorders (2006)', href: 'https://pubmed.ncbi.nlm.nih.gov/16862878/' },
        ],
      },
      {
        heading: text('Medicina das artes performáticas', 'Performing arts medicine'),
        kindLabel: text('Instituição de referência', 'Reference institution'),
        items: [
          { label: 'Performing Arts Medicine Association', href: 'https://artsmed.org/' },
        ],
      },
      {
        heading: text('Saúde auditiva', 'Hearing health'),
        kindLabel: text('Materiais educativos oficiais', 'Official educational materials'),
        items: [
          { label: 'Organização Mundial da Saúde — Making Listening Safe', href: 'https://www.who.int/activities/making-listening-safe/' },
          { label: 'Organização Mundial da Saúde — Safe listening', href: 'https://www.who.int/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening' },
          { label: 'CDC/NIOSH — Reducing the Risk of Hearing Disorders among Musicians', href: 'https://www.cdc.gov/niosh/docs/wp-solutions/2015-184/' },
        ],
      },
    ],
    disclaimerParagraphs: [
      text(
        'Conteúdo educacional: as orientações apresentadas são gerais e não substituem consulta, exame físico, diagnóstico ou tratamento por profissional habilitado. Em caso de sintomas persistentes, progressivos ou relevantes, interrompa a atividade e procure avaliação profissional.',
        'Educational content: the guidance presented is general and does not replace consultation, physical examination, diagnosis or treatment by a qualified professional. In case of persistent, progressive or relevant symptoms, stop the activity and seek professional assessment.',
      ),
      text(
        'As participações da Dra. Helena Villaça têm caráter exclusivamente educativo e são elaboradas com base em artigos, diretrizes e referências indicadas nas respectivas intervenções (veja "Fontes e referências" acima). Elas não constituem consulta, diagnóstico, prescrição ou tratamento médico individual e não substituem a avaliação de um profissional de saúde quando necessária.',
        'Dra. Helena Villaça’s participations are exclusively educational and are prepared based on articles, guidelines and references indicated in each intervention (see "Sources and references" above). They do not constitute consultation, diagnosis, prescription or individual medical treatment, and do not replace assessment by a health professional when needed.',
      ),
      text(
        'Dra. Helena Villaça é uma personagem fictícia criada para fins educacionais e narrativos. Sua imagem e seu vídeo foram gerados por inteligência artificial.',
        'Dr. Helena Villaça is a fictional character created for educational and narrative purposes. Her image and video were generated with artificial intelligence.',
      ),
    ],
  },
  'bernardo-alencar': {
    taglineLine: text(
      'Gestão de carreira · Projetos musicais · Receitas · Negociação · Posicionamento profissional',
      'Career management · Music projects · Revenue · Negotiation · Professional positioning',
    ),
    identityTitle: text('Identidade do personagem', 'Character identity'),
    identity: [
      { label: text('Nome completo', 'Full name'), value: text('Bernardo Ribeiro de Matos Alencar', 'Bernardo Ribeiro de Matos Alencar') },
      { label: text('Nome de exibição', 'Display name'), value: text('Bernardo Alencar', 'Bernardo Alencar') },
      { label: text('Idade', 'Age'), value: text('48 anos', '48 years old') },
      { label: text('Local de nascimento', 'Place of birth'), value: text('São Paulo, São Paulo', 'São Paulo, São Paulo, Brazil') },
      { label: text('Onde vive', 'Lives in'), value: text('São Paulo, São Paulo', 'São Paulo, São Paulo, Brazil') },
      { label: text('Nacionalidade', 'Nationality'), value: text('Brasileiro', 'Brazilian') },
      { label: text('Profissão', 'Profession'), value: text('Empresário musical', 'Music business manager') },
      { label: text('Área de atuação', 'Field'), value: text('Gestão de carreira e negócios da música', 'Career management and music business') },
      { label: text('Formação complementar', 'Additional training'), value: text('Gestão de negócios, indústria criativa e produção cultural', 'Business management, creative industries and cultural production') },
      { label: text('Instrumento', 'Instrument'), value: text('Saxofone', 'Saxophone') },
      { label: text('Nível musical', 'Musical level'), value: text('Músico amador experiente', 'Experienced amateur musician') },
      { label: text('Papel no Guitar Architect', 'Role at Guitar Architect'), value: text('Especialista em Carreira e Negócios da Música', 'Career and Music Business Specialist') },
      { label: text('Vínculo institucional', 'Institutional link'), value: text('Consultor do Guitar Architect My Academy e integrante da rede de apoio à jornada musical', 'Consultant to Guitar Architect My Academy and member of the musical journey support network') },
      { label: text('Personagem', 'Character'), value: text('Fictício, criado com auxílio de inteligência artificial', 'Fictional, created with the aid of artificial intelligence') },
    ],
    backgroundTitle: text('Trajetória', 'Background'),
    philosophyTitle: text('Filosofia profissional', 'Professional philosophy'),
    principles: [
      { heading: text('A arte precisa de estrutura para continuar livre', 'Art needs structure to remain free'), body: text('Organização não reduz a autenticidade do músico. Ela cria condições para que decisões financeiras, operacionais e profissionais não comprometam o desenvolvimento artístico.', 'Organization does not reduce a musician’s authenticity. It creates the conditions so that financial, operational and professional decisions do not compromise artistic development.') },
      { heading: text('Nem toda oportunidade representa avanço', 'Not every opportunity means progress'), body: text('Exposição, convite ou proposta não são benefícios automáticos. Toda oportunidade precisa ser analisada à luz dos objetivos, custos, riscos e contrapartidas.', 'Exposure, an invitation or a proposal are not automatic benefits. Every opportunity needs to be analyzed in light of goals, costs, risks and trade-offs.') },
      { heading: text('Delegar não significa perder o controle', 'Delegating does not mean losing control'), body: text('Uma equipe profissional deve ampliar a capacidade do artista, respeitando limites, responsabilidades, transparência e autonomia decisória.', 'A professional team should expand the artist’s capacity while respecting limits, responsibilities, transparency and decision-making autonomy.') },
      { heading: text('Carreira sustentável não depende de improvisação', 'A sustainable career does not rely on improvisation'), body: text('Receitas, despesas, agenda, contratos, comunicação e responsabilidades precisam ser compreendidos antes que o crescimento transforme pequenos problemas em conflitos maiores.', 'Revenue, expenses, schedule, contracts, communication and responsibilities need to be understood before growth turns small problems into larger conflicts.') },
    ],
    methodTitle: text('Método R.O.T.A.', 'R.O.T.A. method'),
    methodIntro: text(
      'Ferramenta educacional criada para o GA, destinada à análise de projetos e decisões profissionais na música. Não constitui consultoria empresarial, jurídica, contábil ou financeira individual.',
      'An educational tool created for GA to support the analysis of music projects and professional decisions. It does not constitute individual business, legal, accounting or financial consulting.',
    ),
    methodSteps: [
      { letter: 'R', heading: text('Reconheça o estágio', 'Recognize the stage'), body: text('Identifique o que já existe: repertório, público, apresentações, equipe, receitas, custos, materiais e objetivos.', 'Identify what already exists: repertoire, audience, performances, team, revenue, costs, materials and goals.') },
      { letter: 'O', heading: text('Organize a operação', 'Organize the operation'), body: text('Registre agenda, despesas, responsabilidades, acessos, documentos, repertório e processos essenciais do projeto.', 'Record the project’s schedule, expenses, responsibilities, access credentials, documents, repertoire and essential processes.') },
      { letter: 'T', heading: text('Teste a oportunidade', 'Test the opportunity'), body: text('Analise benefícios, custos, riscos, obrigações, prazos, exclusividades e compatibilidade com os objetivos da carreira.', 'Analyze the benefits, costs, risks, obligations, deadlines, exclusivity terms and compatibility with career goals.') },
      { letter: 'A', heading: text('Avance com critérios', 'Advance with criteria'), body: text('Defina o próximo passo, quem deve participar da decisão e quais profissionais precisam ser consultados antes do compromisso.', 'Define the next step, who should take part in the decision and which professionals need to be consulted before making a commitment.') },
    ],
    methodColumnsClass: 'sm:grid-cols-2 lg:grid-cols-4',
    whenToSeekTitle: text('Quando buscar apoio profissional', 'When to seek professional support'),
    whenToSeekItems: [
      text('Recebimento de proposta de exclusividade', 'Receiving an exclusivity proposal'),
      text('Convite para contrato de gestão ou agenciamento', 'An invitation to sign a management or agency contract'),
      text('Necessidade de organizar turnê ou sequência de apresentações', 'The need to organize a tour or a sequence of performances'),
      text('Crescimento das receitas e despesas do projeto', 'Growth in the project’s revenue and expenses'),
      text('Dificuldade de conciliar criação, comunicação e operação', 'Difficulty balancing creative work, communication and operations'),
      text('Formação ou reorganização de equipe', 'Building or reorganizing a team'),
      text('Conflitos sobre divisão de receitas ou responsabilidades', 'Conflicts over revenue sharing or responsibilities'),
      text('Negociação com gravadora, editora, distribuidora ou marca', 'Negotiating with a label, publisher, distributor or brand'),
      text('Necessidade de formalizar relações entre integrantes', 'The need to formalize relationships among project members'),
      text('Decisão sobre contratação de empresário, booker ou produtor executivo', 'Deciding whether to hire a manager, booker or executive producer'),
    ],
    referencesTitle: text('Fontes e referências', 'Sources and references'),
    referencesIntro: text(
      'As orientações desta página se apoiam em fontes de naturezas diferentes, organizadas por categoria: gestão de carreira e indústria da música, direitos autorais e gestão coletiva, empreendedorismo e gestão financeira, distribuição digital e receitas, e contratos e relações profissionais. As referências específicas de cada categoria ainda estão em processo de validação e serão publicadas assim que confirmadas.',
      'The guidance on this page draws on sources of different natures, organized by category: music career and industry management, copyright and collective rights management, entrepreneurship and financial management, digital distribution and revenue, and contracts and professional relationships. The specific references for each category are still being validated and will be published once confirmed.',
    ),
    referenceGroups: [
      { heading: text('Gestão de carreira e indústria da música', 'Music career and industry management'), items: [] },
      { heading: text('Direitos autorais e gestão coletiva', 'Copyright and collective rights management'), items: [] },
      { heading: text('Empreendedorismo e gestão financeira', 'Entrepreneurship and financial management'), items: [] },
      { heading: text('Distribuição digital e receitas', 'Digital distribution and revenue'), items: [] },
      { heading: text('Contratos e relações profissionais', 'Contracts and professional relationships'), items: [] },
    ],
    disclaimerParagraphs: [
      text(
        'Conteúdo educacional: as orientações apresentadas são gerais e não substituem consultoria empresarial, jurídica, contábil, tributária ou financeira realizada por profissional habilitado e com conhecimento das circunstâncias concretas do projeto.',
        'Educational content: the guidance presented is general and does not replace business, legal, accounting, tax or financial consulting provided by a qualified professional familiar with the concrete circumstances of the project.',
      ),
      text(
        'As participações de Bernardo Alencar têm caráter exclusivamente educativo. Elas não constituem proposta de representação artística, empresariamento, agenciamento, investimento, intermediação, contratação ou promessa de resultados.',
        'Bernardo Alencar’s participations are exclusively educational. They do not constitute a proposal for artistic representation, management, agency services, investment, intermediation, hiring or a promise of results.',
      ),
      text(
        'Antes de assumir obrigações, assinar contratos, ceder direitos, aceitar exclusividade ou realizar investimentos relevantes, procure os profissionais adequados para avaliar o caso concreto.',
        'Before taking on obligations, signing contracts, assigning rights, accepting exclusivity or making significant investments, seek the appropriate professionals to assess the specific case.',
      ),
      text(
        'Bernardo Alencar é um personagem fictício criado para fins educacionais e narrativos. Sua imagem e seu vídeo foram gerados por inteligência artificial.',
        'Bernardo Alencar is a fictional character created for educational and narrative purposes. His image and video were generated with artificial intelligence.',
      ),
    ],
  },
};

export const getGuestSpecialistProfileContent = (id: string): GuestSpecialistProfileContent | undefined =>
  guestSpecialistProfileContent[id];
