import type { AchievementTier } from '../types/achievement';
import { getTierCollectionName, getTierDisplay } from '../utils/tierNomenclature';

export interface AchievementTierDefinition {
  tier: AchievementTier;
  title: string;
  description: string;
}

export const ACHIEVEMENT_TIERS: AchievementTierDefinition[] = [
  {
    tier: 0,
    title: `${getTierDisplay(0)} · ${getTierCollectionName(0)}`,
    description: 'Degrau inicial liberado pelo login, com as tres logos oficiais base do sistema.',
  },
  {
    tier: 1,
    title: `${getTierDisplay(1)} · ${getTierCollectionName(1)}`,
    description: 'Primeiros usos reais: abrir ferramentas, aplicar escalas e navegar pelo fretboard.',
  },
  {
    tier: 2,
    title: `${getTierDisplay(2)} · ${getTierCollectionName(2)}`,
    description: 'Exercicios basicos, alvos iniciais de BPM e primeiros sinais de consistencia.',
  },
  {
    tier: 3,
    title: `${getTierDisplay(3)} · ${getTierCollectionName(3)}`,
    description: 'CAGED, triades, tetrades, ciclo harmonico, acordes e progressoes aplicadas.',
  },
  {
    tier: 4,
    title: `${getTierDisplay(4)} · ${getTierCollectionName(4)}`,
    description: 'Pratica consistente e dominio tecnico/harmonico intermediario-avancado.',
  },
  {
    tier: 5,
    title: `${getTierDisplay(5)} · ${getTierCollectionName(5)}`,
    description: 'Dominio amplo do ecossistema, colecoes completas e desafios combinados.',
  },
  {
    tier: 6,
    title: `${getTierDisplay(6)} · ${getTierCollectionName(6)}`,
    description: 'Endgame plausivel do app: musicalidade, consistencia, exploracao e tecnica integradas.',
  },
];
