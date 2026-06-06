import { ThemeCategory, ThemeCollectionItem, ThemeRarity } from './themeTypes';
import { getTierCollectionName, getTierName } from '../../utils/tierNomenclature';

type Lang = 'pt' | 'en';

interface ThemeLocalizedCopy {
  name: string;
  subtitle: string;
  description: string;
  inspiredBy?: string;
  unlockRequirement?: string;
}

const PT_UNLOCK_REQUIREMENTS: Record<string, string> = {
  'apprentice-yam': 'Faça login, explore o fretboard e aplique seu primeiro estudo.',
  'apprentice-iba': 'Use as ferramentas de prática e complete exercícios iniciais.',
  'apprentice-tag': 'Aplique acordes e salve diagramas iniciais.',
  'apprentice-tele': 'Estude posições abertas e tríades básicas.',
  'apprentice-bass-5c': 'Troque para baixo e use o metrônomo.',
  'pedreiro-foundation': 'Complete três exercícios práticos.',
  'pedreiro-12c': 'Aplique escalas e mapeie intervalos repetidamente.',
  'pedreiro-dimdar': 'Estude tríades e tétrades diminutas.',
  'pedreiro-fbh70': 'Complete seu primeiro exercício.',
  'pedreiro-flv': 'Complete a base de palhetada alternada.',
  'pedreiro-gib': 'Toque uma escala maior a 80 BPM.',
  'pedreiro-hss': 'Repita exercícios técnicos com consistência.',
  'pedreiro-prs': 'Mantenha uma sequência de prática de três dias.',
  'pedreiro-ryric': 'Crie diagramas de prática com delay.',
  'pedreiro-suh': 'Salve e revisite projetos de prática.',
  'pedreiro-zawyl': 'Aplique escalas em múltiplos contextos.',
  'contramestre-budguy': 'Complete estudos de CAGED.',
  'contramestre-jmayer': 'Complete estudos de conexão de tríades.',
  'contramestre-metall': 'Desbloqueie marcos suficientes do tier 2.',
  'contramestre-ericlap': 'Explore progressões harmônicas.',
  'contramestre-tedg': 'Explore o movimento harmônico com progressões.',
  'contramestre-svai': 'Aplique modos gregos no fretboard.',
  'contramestre-clif': 'Complete precisão rítmica de baixo.',
  'contramestre-ged': 'Conecte padrões de baixo com harmonia.',
  'contramestre-lemm': 'Complete estudos rítmicos de resistência.',
  'mestre-bbking': 'Desbloqueie marcos harmônicos do tier 3.',
  'mestre-beat': 'Salve diagramas de acordes abertos e voicings.',
  'mestre-jimhendrix': 'Una técnica, harmonia e expressão.',
  'mestre-kirhm': 'Complete desafios técnicos avançados.',
  'mestre-srv': 'Explore progressões de resolução blues.',
  'mestre-evh': 'Complete ciclos avançados de técnica e palhetada.',
  'mestre-slash': 'Complete estudos de condução de vozes e sustain.',
  'mestre-flea': 'Complete desafios de groove e ritmo.',
  'mestre-jaco': 'Complete estudos melódicos de baixo.',
  'mestre-paulm': 'Complete estudos de arranjo para baixo.',
  'engenheiro-dgil': 'Complete o currículo central Architect.',
  'engenheiro-keyric': 'Desbloqueie marcos avançados do tier 4.',
  'engenheiro-angyo': 'Complete diagramas em nível de performance.',
  'engenheiro-bmay': 'Complete estudos avançados de voicings.',
  'arquiteto-ga6-jhdrix': 'Desbloqueie a conquista Guitar Hero Architect.',
  'arquiteto-ga78-tabas': 'Desbloqueie a conquista Guitar Hero Architect.',
  'arquiteto-gab45-jpast': 'Desbloqueie a conquista Guitar Hero Architect.',
};

const PT_THEME_COPY: Record<string, ThemeLocalizedCopy> = {
  'institutional-blue': {
    name: 'Azul Institucional',
    subtitle: 'Coleção do Candidato',
    description: 'A identidade visual original do Guitar Architect para o fluxo padrão de guitarra de seis cordas.',
  },
  'bass-green': {
    name: 'Verde Bass',
    subtitle: 'Coleção do Candidato',
    description: 'Tema voltado ao grave, com energia verde profunda e clareza de estúdio.',
  },
  'extended-purple': {
    name: 'Roxo Extended',
    subtitle: 'Coleção do Candidato',
    description: 'Tema para guitarras estendidas, voicings amplos e harmonia moderna.',
  },
  'reverse-psychedelic': {
    name: 'Reverse Psychedelic',
    subtitle: 'Coleção Clássica',
    description: 'Theme expressivo para blues-rock, bends largos, vibrato e linguagem psicodélica.',
    inspiredBy: 'Linguagem reverse headstock do fim dos anos 60',
    unlockRequirement: 'Complete 25 estudos de bends expressivos',
  },
  'arena-burst': {
    name: 'Arena Burst',
    subtitle: 'Coleção Clássica',
    description: 'Tema de alta energia para tapping, harmônicos, ataque e fraseado de arena.',
    inspiredBy: 'Arquitetura high gain de palco',
    unlockRequirement: 'Complete 50 exercicios de tecnica',
  },
  'echo-giant': {
    name: 'Echo Giant',
    subtitle: 'Coleção Clássica',
    description: 'Theme espacial para delays pontuados, acordes suspensos e texturas rítmicas ambientais.',
    inspiredBy: 'Texturas de delay em estadio',
    unlockRequirement: 'Crie 20 diagramas de prática com delays',
  },
  'velvet-top': {
    name: 'Velvet Top',
    subtitle: 'Coleção Clássica',
    description: 'Tema quente e vocal para leads melódicos, pentatônicas menores, sustain e bends.',
    inspiredBy: 'Sustain aveludado e atitude carved-top',
    unlockRequirement: 'Complete 40 estudos de sustain e vibrato',
  },
  'british-chime': {
    name: 'British Chime',
    subtitle: 'Coleção Clássica',
    description: 'Tema brilhante para acordes abertos, inversões e ritmos melódicos ressonantes.',
    inspiredBy: 'Linguagem jangle-pop e doze cordas',
    unlockRequirement: 'Salve 30 diagramas de acordes abertos',
  },
  'boutique-session': {
    name: 'Boutique Session',
    subtitle: 'Coleção Clássica',
    description: 'Tema polido para tríades, double-stops e harmonia melódica de estúdio.',
    inspiredBy: 'Linguagem boutique/session player',
    unlockRequirement: 'Complete 75 estudos de conexão de tríades',
  },
  'cosmic-virtuoso': {
    name: 'Cosmic Virtuoso',
    subtitle: 'Coleção Clássica',
    description: 'Tema de alto contraste para intervalos largos, legato, alavancadas e fraseado modal avançado.',
    inspiredBy: 'Virtuosismo instrumental cósmico',
    unlockRequirement: 'Complete 100 exercicios modais',
  },
  'midnight-starchild': {
    name: 'Midnight Starchild',
    subtitle: 'Coleção Clássica',
    description: 'Tema noturno para acordes de palco, shapes marcantes e confiança melódica.',
    inspiredBy: 'Linguagem teatral de palco',
    unlockRequirement: 'Complete 50 diagramas de performance',
  },
  'progressive-fusion': {
    name: 'Progressive Fusion',
    subtitle: 'Coleção Moderna',
    description: 'Tema moderno para frases assimétricas, extensões, hybrid picking e improviso fusion.',
    unlockRequirement: 'Complete 60 estudos fusion',
  },
  'djent-architect': {
    name: 'Djent Architect',
    subtitle: 'Coleção Moderna',
    description: 'Tema de precisão para guitarra estendida, clusters, síncope e riffs arquitetônicos.',
    unlockRequirement: 'Complete 80 estudos ritmicos de alcance estendido',
  },
  'neo-clássical': {
    name: 'Neo Clássical',
    subtitle: 'Coleção Moderna',
    description: 'Tema refinado para menor harmônica, sequências, palhetada precisa e tensão clássica.',
    unlockRequirement: 'Complete 40 estudos de menor harmônica',
  },
  'ambient-architect': {
    name: 'Ambient Architect',
    subtitle: 'Coleção Moderna',
    description: 'Tema cinematográfico para voicings sustentados, drones e cor harmônica em evolução.',
    unlockRequirement: 'Crie 25 mapas de progressões ambientais',
  },
  'studio-modern': {
    name: 'Studio Modern',
    subtitle: 'Coleção Moderna',
    description: 'Tema limpo para prática diária, leitura de mapas e referência neutra.',
    unlockRequirement: 'Salve 10 projetos',
  },
  'architect-infinity': {
    name: 'Architect Infinity',
    subtitle: 'Coleção Lendária',
    description: 'Tema definitivo do Guitar Architect para fluência completa no braço.',
    unlockRequirement: 'Complete o curriculo Architect',
  },
  'quantum-series': {
    name: 'Quantum Series',
    subtitle: 'Coleção Lendária',
    description: 'Tema futurista para modulação, acordes pivô e mapeamento harmônico avançado.',
    unlockRequirement: 'Complete 50 estudos de modulação',
  },
  'celestial-12': {
    name: 'Celestial 12',
    subtitle: 'Coleção Lendária',
    description: 'Tema luminoso para harmonia expandida e ressonância inspirada em doze cordas.',
    unlockRequirement: 'Complete 120 estudos de voicings',
  },
  'black-neon-eclipse': {
    name: 'Black Neon Eclipse',
    subtitle: 'Coleção Lendária',
    description: 'Tema premium escuro para domínio completo, contraste e navegação de alto nível.',
    unlockRequirement: 'Desbloqueie todos os marcos da coleção',
  },
};

export const getThemeCopy = (theme: ThemeCollectionItem, lang: Lang): ThemeLocalizedCopy => {
  const categoryTitle = getThemeCategoryTitle(theme.category, lang);
  if (lang === 'en') {
    return {
      name: theme.name,
      subtitle: categoryTitle,
      description: theme.description,
      inspiredBy: theme.inspiredBy,
      unlockRequirement: theme.unlockRequirement,
    };
  }
  return PT_THEME_COPY[theme.id] ?? {
    name: theme.name,
    subtitle: categoryTitle,
    description: `Identidade visual da ${categoryTitle.toLowerCase()} para progresso, estudo e desbloqueios no Guitar Architect.`,
    inspiredBy: theme.inspiredBy,
    unlockRequirement: PT_UNLOCK_REQUIREMENTS[theme.id] ?? theme.unlockRequirement,
  };
};

export const getThemeCategoryTitle = (category: ThemeCategory, lang: Lang) => {
  const labels: Record<ThemeCategory, Record<Lang, string>> = {
    tier0: { pt: getTierCollectionName(0, 'pt'), en: getTierCollectionName(0, 'en') },
    tier1: { pt: getTierCollectionName(1, 'pt'), en: getTierCollectionName(1, 'en') },
    tier2: { pt: getTierCollectionName(2, 'pt'), en: getTierCollectionName(2, 'en') },
    tier3: { pt: getTierCollectionName(3, 'pt'), en: getTierCollectionName(3, 'en') },
    tier4: { pt: getTierCollectionName(4, 'pt'), en: getTierCollectionName(4, 'en') },
    tier5: { pt: getTierCollectionName(5, 'pt'), en: getTierCollectionName(5, 'en') },
    tier6: { pt: getTierCollectionName(6, 'pt'), en: getTierCollectionName(6, 'en') },
  };
  return labels[category][lang];
};

export const getThemeRarityLabel = (rarity: ThemeRarity, lang: Lang) => {
  const labels: Record<ThemeRarity, Record<Lang, string>> = {
    common: { pt: 'aprendiz', en: 'common' },
    rare: { pt: 'pedreiro', en: 'rare' },
    epic: { pt: 'contramestre', en: 'epic' },
    legendary: { pt: 'mestre de obras', en: 'legendary' },
  };
  return labels[rarity][lang];
};

export const getThemeLevelLabel = (theme: ThemeCollectionItem, lang: Lang) => {
  const tierByCategory: Record<ThemeCategory, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
    tier0: 0,
    tier1: 1,
    tier2: 2,
    tier3: 3,
    tier4: 4,
    tier5: 5,
    tier6: 6,
  };
  return getTierName(tierByCategory[theme.category], lang).toLowerCase();
};
