import { ThemeCollectionItem, ThemeCollectionState } from './themeTypes';

export const canUnlockTheme = (
  theme: ThemeCollectionItem,
  state: ThemeCollectionState,
  completedMilestones: string[] = [],
) => {
  if (theme.unlocked || state.unlockedThemeIds.includes(theme.id)) return true;
  if (!theme.unlockRequirement) return false;
  return completedMilestones.includes(theme.unlockRequirement);
};
