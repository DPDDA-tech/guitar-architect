import type {
  MyAcademyCurriculumItem,
  MyAcademyCurriculumMoment,
  MyAcademyLocalizedText,
} from '../types/myAcademyCurriculum';

// Próximo conteúdo planejado:
// "Subdivisão: dividindo o pulso sem perder a estabilidade".
//
// Papel na jornada:
// - não substitui o trabalho de pulso e regularidade (NMC-RIT-001);
// - integra a competência anterior em um contexto rítmico mais complexo;
// - o conteúdo anterior deixa de ser apenas exercício isolado e passa a
//   funcionar como fundamento aplicado;
// - avaliar, em implementação futura, se "Pulso e regularidade" deve aparecer
//   como competência em consolidação durante esta unidade, em vez de
//   permanecer apenas como pré-requisito concluído.

const text = (pt: string, en: string): MyAcademyLocalizedText => ({ pt, en });

const topic = (id: string, pt: string, en: string, status: 'preparing' | 'horizon' = 'preparing'): MyAcademyCurriculumItem => ({
  id,
  kind: 'topic',
  title: text(pt, en),
  status,
});

export const MY_ACADEMY_CURRICULUM_VERSION = '0.1';

export const MY_ACADEMY_CURRICULUM: MyAcademyCurriculumMoment[] = [
  {
    id: '0',
    title: text('Descoberta', 'Discovery'),
    description: text(
      'Conhecer o ambiente, explorar livremente e futuramente conversar com Diana sobre instrumento, experiência, objetivos e tempo disponível.',
      'Meet the environment, explore freely and, in the future, talk with Diana about your instrument, experience, goals and available time.',
    ),
    status: 'preparing',
    modules: [
      {
        id: 'M0-01',
        title: text('Conheça o My Academy', 'Meet My Academy'),
        items: [
          topic('M0-01-01', 'O que é o programa e como ele se relaciona com Kids, Teens e Studio.', 'What the program is and how it relates to Kids, Teens and Studio.'),
          topic('M0-01-02', 'Direção sem julgamento: o que o GA oferece e o que não avalia.', 'Direction without judgement: what GA offers and what it does not assess.'),
          topic('M0-01-03', 'Como seguir sugestões, explorar livremente, revisar ou pular conteúdos.', 'How to follow suggestions, explore freely, review or skip content.'),
        ],
      },
      {
        id: 'M0-02',
        title: text('Primeiro mapa musical', 'First musical map'),
        items: [
          topic('M0-02-01', 'Som e silêncio.', 'Sound and silence.'),
          topic('M0-02-02', 'Altura, duração, intensidade e timbre como dimensões iniciais do som.', 'Pitch, duration, intensity and timbre as initial dimensions of sound.'),
          topic('M0-02-03', 'Corpo, escuta e movimento como portas de entrada equivalentes.', 'Body, listening and movement as equivalent entry points.'),
        ],
      },
      {
        id: 'M0-03',
        title: text('Instrumento e segurança', 'Instrument and safety'),
        items: [
          topic('M0-03-01', 'Reconhecimento geral de guitarra e baixo.', 'General recognition of guitar and bass.'),
          topic('M0-03-02', 'Cordas, braço, captação e caminho básico do som.', 'Strings, fretboard, pickups and the basic signal path.'),
          topic('M0-03-03', 'Afinação como referência, volume confortável, pausas e cuidado com dor.', 'Tuning as a reference, comfortable volume, breaks and attention to pain.'),
        ],
      },
      {
        id: 'M0-04',
        title: text('Primeira exploração', 'First exploration'),
        items: [
          topic('M0-04-01', 'Demonstração simples do braço interativo.', 'Simple demonstration of the interactive fretboard.'),
          topic('M0-04-02', 'Primeira escuta ou manipulação sem objetivo avaliativo.', 'First listening or interaction without an assessment goal.'),
          topic('M0-04-03', 'Escolha consciente do próximo ponto: sugestão, mapa completo ou exploração livre.', 'A deliberate choice of the next point: suggestion, complete map or free exploration.'),
        ],
      },
    ],
  },
  {
    id: '1',
    title: text('Iniciação', 'Initiation'),
    description: text(
      'Pulso, produção sonora, orientação no instrumento e primeiras conexões entre o que você percebe, compreende e experimenta.',
      'Pulse, sound production, instrument orientation and the first links between what you perceive, understand and try.',
    ),
    status: 'available',
    modules: [
      {
        id: 'M1-01',
        title: text('Pulso, tempo e duração', 'Pulse, tempo and duration'),
        items: [
          {
            id: 'NMC-RIT-001',
            kind: 'unit',
            title: text('Pulso e regularidade', 'Pulse and regularity'),
            status: 'available',
            path: '/my-academy/prototype/nmc-rit-001',
          },
          topic('M1-01-02', 'Tempo e velocidade.', 'Tempo and speed.'),
          topic('M1-01-03', 'Pulso e ritmo como ideias relacionadas, mas diferentes.', 'Pulse and rhythm as related but distinct ideas.'),
          topic('M1-01-04', 'Sons longos, curtos e pausas.', 'Long sounds, short sounds and rests.'),
        ],
      },
      {
        id: 'M1-02',
        title: text('Primeiros agrupamentos rítmicos', 'First rhythmic groupings'),
        items: [
          topic('M1-02-01', 'Subdivisão binária.', 'Binary subdivision.'),
          topic('M1-02-02', 'Acento e agrupamento.', 'Accent and grouping.'),
          topic('M1-02-03', 'Introdução ao compasso sem formalismo excessivo.', 'Introduction to meter without excessive formalism.'),
        ],
      },
      {
        id: 'M1-03',
        title: text('Notas e orientação', 'Notes and orientation'),
        items: [
          topic('M1-03-01', 'Nomes das notas.', 'Note names.'),
          topic('M1-03-02', 'Ordem das cordas, cordas soltas e casas.', 'String order, open strings and frets.'),
          topic('M1-03-03', 'Afinação como mapa de referência.', 'Tuning as a reference map.'),
          topic('M1-03-04', 'Semitom, tom e movimento pelo braço.', 'Semitone, whole tone and movement across the fretboard.'),
        ],
      },
      {
        id: 'M1-04',
        title: text('Primeiras relações musicais', 'First musical relationships'),
        items: [
          topic('M1-04-01', 'Oitava.', 'Octave.'),
          topic('M1-04-02', 'Intervalo como distância.', 'Interval as distance.'),
          topic('M1-04-03', 'Melodia, harmonia e ritmo.', 'Melody, harmony and rhythm.'),
          topic('M1-04-04', 'Escala e acorde como organizações de notas.', 'Scales and chords as organizations of notes.'),
        ],
      },
      {
        id: 'M1-05',
        title: text('Representação funcional', 'Functional representation'),
        items: [
          topic('M1-05-01', 'Introdução à tablatura e aos diagramas de braço e acordes, incluindo a transferência da indicação visual para o instrumento real.', 'Introduction to tablature, fretboard diagrams and chord diagrams, including transferring visual indications to the physical instrument.'),
        ],
      },
    ],
  },
  {
    id: '2',
    title: text('Fundamentos', 'Fundamentals'),
    description: text(
      'Ritmo, intervalos, notas, escalas, acordes, percepção, leitura aplicada e recursos técnicos essenciais.',
      'Rhythm, intervals, notes, scales, chords, ear training, applied reading and essential technical resources.',
    ),
    status: 'preparing',
    modules: [
      {
        id: 'M2-01',
        title: text('Ritmo fundamental', 'Fundamental rhythm'),
        items: [
          topic('M2-01-01', 'Figuras rítmicas e pausas.', 'Rhythmic values and rests.'),
          topic('M2-01-02', 'Semínima, mínima e semibreve.', 'Quarter, half and whole notes.'),
          topic('M2-01-03', 'Colcheias e semicolcheias.', 'Eighth and sixteenth notes.'),
          topic('M2-01-04', 'Contagem e subdivisão em duas e quatro partes.', 'Counting and subdivision into two and four parts.'),
          topic('M2-01-05', 'Ligaduras e pontos de aumento.', 'Ties and augmentation dots.'),
        ],
      },
      {
        id: 'M2-02',
        title: text('Compasso e fluência rítmica', 'Meter and rhythmic fluency'),
        items: [
          topic('M2-02-01', 'Compassos 2/4, 3/4 e 4/4.', '2/4, 3/4 and 4/4 meters.'),
          topic('M2-02-02', 'Compasso 6/8 e subdivisão composta.', '6/8 meter and compound subdivision.'),
          topic('M2-02-03', 'Síncope introdutória.', 'Introductory syncopation.'),
          topic('M2-02-04', 'Swing e shuffle.', 'Swing and shuffle.'),
          topic('M2-02-05', 'Uso consciente do metrônomo.', 'Intentional use of the metronome.'),
        ],
      },
      {
        id: 'M2-03',
        title: text('Sistema de notas e braço', 'Note system and fretboard'),
        items: [
          topic('M2-03-01', 'Escala cromática.', 'Chromatic scale.'),
          topic('M2-03-02', 'Sustenidos, bemóis e enarmonia.', 'Sharps, flats and enharmonic equivalence.'),
          topic('M2-03-03', 'Localização de notas naturais.', 'Locating natural notes.'),
          topic('M2-03-04', 'Padrões de oitavas.', 'Octave patterns.'),
          topic('M2-03-05', 'Transposição básica no braço.', 'Basic transposition on the fretboard.'),
        ],
      },
      {
        id: 'M2-04',
        title: text('Intervalos', 'Intervals'),
        items: [
          topic('M2-04-01', 'Numeração e qualidade dos intervalos simples.', 'Number and quality of simple intervals.'),
          topic('M2-04-02', 'Intervalos melódicos e harmônicos.', 'Melodic and harmonic intervals.'),
          topic('M2-04-03', 'Consonância, tensão e contexto sem classificação absoluta.', 'Consonance, tension and context without absolute classification.'),
          topic('M2-04-04', 'Visualização de intervalos em diferentes grupos de cordas.', 'Visualizing intervals across different string groups.'),
        ],
      },
      {
        id: 'M2-05',
        title: text('Escalas e tonalidade', 'Scales and tonality'),
        items: [
          topic('M2-05-01', 'Estrutura da escala maior.', 'Structure of the major scale.'),
          topic('M2-05-02', 'Graus da escala.', 'Scale degrees.'),
          topic('M2-05-03', 'Tom, tonalidade e tônica.', 'Key, tonality and tonic.'),
          topic('M2-05-04', 'Escala menor natural.', 'Natural minor scale.'),
          topic('M2-05-05', 'Relação maior–menor.', 'Major–minor relationship.'),
          topic('M2-05-06', 'Pentatônicas maior e menor.', 'Major and minor pentatonic scales.'),
          topic('M2-05-07', 'Escala blues como expansão estilística inicial.', 'The blues scale as an initial stylistic expansion.'),
        ],
      },
      {
        id: 'M2-06',
        title: text('Tríades e cifras', 'Triads and chord symbols'),
        items: [
          topic('M2-06-01', 'Empilhamento de terças.', 'Stacking thirds.'),
          topic('M2-06-02', 'Tríades maiores, menores, diminutas e aumentadas.', 'Major, minor, diminished and augmented triads.'),
          topic('M2-06-03', 'Cifras e símbolos de acordes.', 'Chord names and symbols.'),
          topic('M2-06-04', 'Estado fundamental e inversões.', 'Root position and inversions.'),
          topic('M2-06-05', 'Tríades no braço e em grupos de cordas.', 'Triads on the fretboard and across string groups.'),
        ],
      },
      {
        id: 'M2-07',
        title: text('Harmonia tonal inicial', 'Initial tonal harmony'),
        items: [
          topic('M2-07-01', 'Tríades diatônicas da escala maior.', 'Diatonic triads of the major scale.'),
          topic('M2-07-02', 'Funções de tônica, preparação e dominante.', 'Tonic, predominant and dominant functions.'),
          topic('M2-07-03', 'Progressões essenciais.', 'Essential progressions.'),
          topic('M2-07-04', 'Cadências introdutórias e sensação de resolução.', 'Introductory cadences and the sense of resolution.'),
        ],
      },
      {
        id: 'M2-08',
        title: text('Leitura e percepção funcional', 'Functional reading and perception'),
        items: [
          topic('M2-08-01', 'Tablatura com ritmo.', 'Rhythmic tablature.'),
          topic('M2-08-02', 'Diagramas, cifras e barras de compasso.', 'Diagrams, chord symbols and barlines.'),
          topic('M2-08-03', 'Introdução opcional à pauta.', 'Optional introduction to standard notation.'),
          topic('M2-08-04', 'Reconhecimento auditivo de direção, repetição, intervalos e qualidades básicas.', 'Aural recognition of direction, repetition, intervals and basic qualities.'),
        ],
      },
    ],
  },
  {
    id: '3',
    title: text('Consolidação', 'Consolidation'),
    description: text(
      'Conectar fundamentos, ampliar repertório de aplicações e reconhecer relações no braço do instrumento.',
      'Connect fundamentals, expand practical applications and recognize relationships across the fretboard.',
    ),
    status: 'preparing',
    sourceLabel: 'Integração',
    modules: [
      {
        id: 'M3-01',
        title: text('Tonalidades conectadas', 'Connected keys'),
        items: [
          topic('M3-01-01', 'Tonalidades relativas e paralelas.', 'Relative and parallel keys.'),
          topic('M3-01-02', 'Ciclo das quintas.', 'Circle of fifths.'),
          topic('M3-01-03', 'Armaduras de clave como mapa, não como requisito de navegação.', 'Key signatures as a map, not a navigation requirement.'),
          topic('M3-01-04', 'Transposição de progressões.', 'Transposing progressions.'),
        ],
      },
      {
        id: 'M3-02',
        title: text('Tétrades e campo harmônico', 'Seventh chords and the harmonic field'),
        items: [
          topic('M3-02-01', 'Acordes com sétima.', 'Seventh chords.'),
          topic('M3-02-02', 'Campo harmônico com tétrades.', 'Diatonic harmony with seventh chords.'),
          topic('M3-02-03', 'Qualidades diatônicas e símbolos correspondentes.', 'Diatonic qualities and their corresponding symbols.'),
          topic('M3-02-04', 'Aplicação em progressões e no braço.', 'Application in progressions and on the fretboard.'),
        ],
      },
      {
        id: 'M3-03',
        title: text('Inversões e condução', 'Inversions and voice leading'),
        items: [
          topic('M3-03-01', 'Inversões de tríades e tétrades.', 'Inversions of triads and seventh chords.'),
          topic('M3-03-02', 'Notas comuns e movimento mínimo.', 'Common tones and minimal movement.'),
          topic('M3-03-03', 'Condução de vozes em acompanhamentos.', 'Voice leading in accompaniment.'),
          topic('M3-03-04', 'Distribuição de vozes entre guitarra e baixo.', 'Distributing voices between guitar and bass.'),
        ],
      },
      {
        id: 'M3-04',
        title: text('Acorde, arpejo e escala', 'Chord, arpeggio and scale'),
        items: [
          topic('M3-04-01', 'Notas do acorde e notas não estruturais.', 'Chord tones and non-chord tones.'),
          topic('M3-04-02', 'Arpejos como acordes distribuídos.', 'Arpeggios as distributed chords.'),
          topic('M3-04-03', 'Relação acorde–arpejo–escala.', 'The chord–arpeggio–scale relationship.'),
          topic('M3-04-04', 'Notas de passagem, aproximação e resolução.', 'Passing, approach and resolution notes.'),
        ],
      },
      {
        id: 'M3-05',
        title: text('Modos e cor', 'Modes and color'),
        items: [
          topic('M3-05-01', 'Modos da escala maior.', 'Modes of the major scale.'),
          topic('M3-05-02', 'Centro tonal e centro modal.', 'Tonal center and modal center.'),
          topic('M3-05-03', 'Notas características.', 'Characteristic notes.'),
          topic('M3-05-04', 'Comparação auditiva e visual de modos.', 'Aural and visual comparison of modes.'),
        ],
      },
      {
        id: 'M3-06',
        title: text('Groove e forma', 'Groove and form'),
        items: [
          topic('M3-06-01', 'Células rítmicas, síncopes e deslocamentos.', 'Rhythmic cells, syncopations and displacements.'),
          topic('M3-06-02', 'Groove, levada e acompanhamento.', 'Groove, rhythmic feel and accompaniment.'),
          topic('M3-06-03', 'Verso, refrão, ponte e outras seções.', 'Verse, chorus, bridge and other sections.'),
          topic('M3-06-04', 'Formas binária, ternária e blues de 12 compassos.', 'Binary, ternary and 12-bar blues forms.'),
        ],
      },
      {
        id: 'M3-07',
        title: text('Análise, transcrição e criação', 'Analysis, transcription and creation'),
        items: [
          topic('M3-07-01', 'Análise harmônica guiada.', 'Guided harmonic analysis.'),
          topic('M3-07-02', 'Transcrição de pequenos trechos.', 'Transcription of short excerpts.'),
          topic('M3-07-03', 'Harmonização de melodias.', 'Harmonizing melodies.'),
          topic('M3-07-04', 'Criação de progressões e motivos.', 'Creating progressions and motifs.'),
          topic('M3-07-05', 'Primeiro projeto integrador no Studio.', 'First integrative Studio project.'),
        ],
      },
    ],
  },
  {
    id: '4',
    title: text('Desenvolvimento', 'Development'),
    description: text(
      'Aprofundar linguagem, harmonia, técnica, percepção e criação conforme os objetivos escolhidos.',
      'Deepen language, harmony, technique, perception and creation according to your chosen goals.',
    ),
    status: 'preparing',
    modules: [
      {
        id: 'M4-01',
        title: text('Sistemas menores e modos', 'Minor systems and modes'),
        items: [
          topic('M4-01-01', 'Escala menor harmônica.', 'Harmonic minor scale.'),
          topic('M4-01-02', 'Escala menor melódica.', 'Melodic minor scale.'),
          topic('M4-01-03', 'Modos derivados e notas características.', 'Derived modes and characteristic notes.'),
          topic('M4-01-04', 'Harmonia modal em maior profundidade.', 'Modal harmony in greater depth.'),
        ],
      },
      {
        id: 'M4-02',
        title: text('Expansões de acordes', 'Chord extensions'),
        items: [
          topic('M4-02-01', 'Acordes suspensos e adicionados.', 'Suspended and added-tone chords.'),
          topic('M4-02-02', 'Nona, décima primeira e décima terceira.', 'Ninth, eleventh and thirteenth chords.'),
          topic('M4-02-03', 'Omissões, duplicações e distribuição de registro.', 'Omissions, doublings and register distribution.'),
          topic('M4-02-04', 'Slash chords e baixos invertidos.', 'Slash chords and inverted bass notes.'),
          topic('M4-02-05', 'Harmonia quartal.', 'Quartal harmony.'),
        ],
      },
      {
        id: 'M4-03',
        title: text('Movimento harmônico', 'Harmonic movement'),
        items: [
          topic('M4-03-01', 'Dominantes secundários.', 'Secondary dominants.'),
          topic('M4-03-02', 'Empréstimo modal.', 'Modal interchange.'),
          topic('M4-03-03', 'Acordes diminutos de passagem.', 'Passing diminished chords.'),
          topic('M4-03-04', 'Tonicização e modulação.', 'Tonicization and modulation.'),
          topic('M4-03-05', 'Substituição por trítono e dominantes alterados como expansões opcionais.', 'Tritone substitution and altered dominants as optional expansions.'),
        ],
      },
      {
        id: 'M4-04',
        title: text('Ritmo ampliado', 'Expanded rhythm'),
        items: [
          topic('M4-04-01', 'Quiálteras.', 'Tuplets.'),
          topic('M4-04-02', 'Compassos ímpares.', 'Odd meters.'),
          topic('M4-04-03', 'Sobreposições e polirritmia introdutória.', 'Overlays and introductory polyrhythm.'),
          topic('M4-04-04', 'Mudanças de subdivisão e deslocamentos de acento.', 'Subdivision changes and accent displacement.'),
        ],
      },
      {
        id: 'M4-05',
        title: text('Improvisação e fraseado', 'Improvisation and phrasing'),
        items: [
          topic('M4-05-01', 'Motivo, repetição, variação e contraste.', 'Motif, repetition, variation and contrast.'),
          topic('M4-05-02', 'Notas-alvo e resolução.', 'Target notes and resolution.'),
          topic('M4-05-03', 'Construção de tensão e repouso.', 'Building tension and release.'),
          topic('M4-05-04', 'Desenvolvimento de fraseado por contexto harmônico.', 'Developing phrasing through harmonic context.'),
        ],
      },
      {
        id: 'M4-06',
        title: text('Arranjo e composição', 'Arrangement and composition'),
        items: [
          topic('M4-06-01', 'Re-harmonização.', 'Reharmonization.'),
          topic('M4-06-02', 'Distribuição de funções entre instrumentos.', 'Distributing roles among instruments.'),
          topic('M4-06-03', 'Arranjo para guitarra e baixo.', 'Arrangement for guitar and bass.'),
          topic('M4-06-04', 'Composição orientada por restrições criativas.', 'Composition guided by creative constraints.'),
          topic('M4-06-05', 'Projetos estilísticos e comparação de soluções.', 'Stylistic projects and comparison of solutions.'),
        ],
      },
    ],
  },
  {
    id: '5',
    title: text('Autonomia', 'Autonomy'),
    description: text(
      'Usar o conhecimento para estudar, analisar, criar, praticar e tomar decisões musicais com independência crescente.',
      'Use knowledge to study, analyze, create, practise and make musical decisions with increasing independence.',
    ),
    status: 'preparing',
    modules: [
      {
        id: 'M5-01',
        title: text('Investigar música', 'Investigate music'),
        items: [
          topic('M5-01-01', 'Como reconhecer tonalidade e centro.', 'How to recognize key and center.'),
          topic('M5-01-02', 'Como analisar forma, ritmo e harmonia.', 'How to analyze form, rhythm and harmony.'),
          topic('M5-01-03', 'Como retirar pequenos trechos de ouvido.', 'How to work out short excerpts by ear.'),
          topic('M5-01-04', 'Como escolher fontes e comparar explicações.', 'How to choose sources and compare explanations.'),
        ],
      },
      {
        id: 'M5-02',
        title: text('Construir o próprio estudo', 'Build your own study plan'),
        items: [
          topic('M5-02-01', 'Definir objetivo e recorte de prática.', 'Define a goal and practice scope.'),
          topic('M5-02-02', 'Registrar dificuldade sem convertê-la em julgamento pessoal.', 'Record difficulty without turning it into personal judgement.'),
          topic('M5-02-03', 'Escolher revisão, variação ou redução de complexidade.', 'Choose review, variation or reduced complexity.'),
          topic('M5-02-04', 'Montar e editar cronogramas realistas.', 'Build and edit realistic schedules.'),
        ],
      },
      {
        id: 'M5-03',
        title: text('Criar no Studio', 'Create in Studio'),
        items: [
          topic('M5-03-01', 'Construir diagramas e mapas próprios.', 'Build your own diagrams and maps.'),
          topic('M5-03-02', 'Transpor e transformar progressões.', 'Transpose and transform progressions.'),
          topic('M5-03-03', 'Criar prática contextualizada.', 'Create contextualized practice.'),
          topic('M5-03-04', 'Organizar anotações, versões e projetos.', 'Organize notes, versions and projects.'),
        ],
      },
      {
        id: 'M5-04',
        title: text('Projetos de autonomia', 'Autonomy projects'),
        items: [
          topic('M5-04-01', 'Projeto de composição.', 'Composition project.'),
          topic('M5-04-02', 'Projeto de improvisação.', 'Improvisation project.'),
          topic('M5-04-03', 'Projeto de arranjo.', 'Arrangement project.'),
          topic('M5-04-04', 'Diário e portfólio musical escolhidos pelo usuário.', 'A musical journal and portfolio chosen by the user.'),
        ],
      },
    ],
  },
  {
    id: '6',
    title: text('Expressão', 'Expression'),
    description: text(
      'Reunir repertório, performance, gravação, colaboração, arranjo e projetos musicais completos como formas de expressão.',
      'Bring together repertoire, performance, recording, collaboration, arranging and complete musical projects as forms of expression.',
    ),
    status: 'horizon',
    sourceLabel: 'Contextos avançados',
    modules: [
      {
        id: 'M6-01',
        title: text('Ensaio e comunicação', 'Rehearsal and communication'),
        items: [
          topic('M6-01-01', 'Contagens, entradas, cortes e sinais.', 'Count-ins, entrances, cutoffs and cues.', 'horizon'),
          topic('M6-01-02', 'Linguagem de ensaio e marcações.', 'Rehearsal language and markings.', 'horizon'),
          topic('M6-01-03', 'Leitura de lead sheets.', 'Reading lead sheets.', 'horizon'),
          topic('M6-01-04', 'Sistema numérico e transposição em grupo.', 'Number systems and group transposition.', 'horizon'),
        ],
      },
      {
        id: 'M6-02',
        title: text('Repertório e performance', 'Repertoire and performance'),
        items: [
          topic('M6-02-01', 'Preparação de repertório.', 'Repertoire preparation.', 'horizon'),
          topic('M6-02-02', 'Construção de setlist.', 'Setlist construction.', 'horizon'),
          topic('M6-02-03', 'Mapas de forma e pontos de atenção.', 'Form maps and points of attention.', 'horizon'),
          topic('M6-02-04', 'Preparação geral para apresentação sem certificação de prontidão.', 'General preparation for performance without certifying readiness.', 'horizon'),
        ],
      },
      {
        id: 'M6-03',
        title: text('Arranjo coletivo', 'Collective arrangement'),
        items: [
          topic('M6-03-01', 'Função do baixo no arranjo.', 'The role of bass in an arrangement.', 'horizon'),
          topic('M6-03-02', 'Distribuição de registros.', 'Register distribution.', 'horizon'),
          topic('M6-03-03', 'Textura, densidade e espaço.', 'Texture, density and space.', 'horizon'),
          topic('M6-03-04', 'Adaptação para diferentes formações.', 'Adaptation for different ensembles.', 'horizon'),
        ],
      },
      {
        id: 'M6-04',
        title: text('Gravação e colaboração', 'Recording and collaboration'),
        items: [
          topic('M6-04-01', 'Gravação doméstica básica.', 'Basic home recording.', 'horizon'),
          topic('M6-04-02', 'Clique, mapa de tempo e overdubs.', 'Click tracks, tempo maps and overdubs.', 'horizon'),
          topic('M6-04-03', 'Organização e troca de projetos.', 'Project organization and exchange.', 'horizon'),
          topic('M6-04-04', 'Revisão de versões e decisões de arranjo.', 'Reviewing versions and arrangement decisions.', 'horizon'),
        ],
      },
      {
        id: 'M6-05',
        title: text('Expansões e projetos completos', 'Expansions and complete projects'),
        items: [
          topic('M6-05-01', 'Afinações alternativas.', 'Alternate tunings.', 'horizon'),
          topic('M6-05-02', 'Guitarras de extensão grave e baixo de cinco cordas.', 'Extended-range guitars and five-string bass.', 'horizon'),
          topic('M6-05-03', 'Módulos estilísticos avançados.', 'Advanced stylistic modules.', 'horizon'),
          topic('M6-05-04', 'Projeto autoral completo.', 'Complete original project.', 'horizon'),
        ],
      },
    ],
  },
];
