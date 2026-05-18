import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AppState, Project, UserInstrument } from '../../types';
import type { AchievementProgressState } from '../../types/achievement';
import type { UserProfile } from './userProfile';
import { getLibrary, loadConfig, saveConfig, saveProjectToLibrary } from '../../utils/persistence';
import {
  getAchievementProgressState,
  getSelectedRewardBadgeId,
  getUnlockedAchievementIds,
  mergeAchievementProgressState,
  setSelectedRewardBadgeId,
  unlockAchievement,
} from '../../utils/achievementStorage';
import {
  getDefaultThemeState,
  loadThemeCollectionState,
  saveThemeCollectionState,
} from '../../features/themeCollection/themeUtils';
import { THEME_REGISTRY } from '../../features/themeCollection/themeRegistry';
import { getRewardById } from '../../utils/achievementUtils';
import { listInstruments, saveInstrument } from '../../utils/instrumentRegistry';
import { loadUserProfile, saveUserProfile } from './userProfile';
import { supabase } from './supabase';

const SNAPSHOT_TABLE = 'ga_user_snapshots';

export interface UserCloudSnapshot {
  appState: AppState | null;
  profile: UserProfile;
  projects: Project[];
  instruments: UserInstrument[];
  themeCollection: {
    activeThemeId: string;
    unlockedThemeIds: string[];
  };
  achievements: {
    unlockedAchievementIds: string[];
    progress: AchievementProgressState;
    selectedRewardBadgeId: string | null;
  };
  syncedAt: string;
}

interface RemoteSnapshotRow {
  user_id: string;
  snapshot: UserCloudSnapshot;
  updated_at?: string;
}

const unique = (ids: string[]) => Array.from(new Set(ids.filter(Boolean)));

const mergeNumberRecords = (
  current: Record<string, number> | undefined,
  incoming: Record<string, number> | undefined,
) => {
  const next = { ...(current ?? {}) };
  Object.entries(incoming ?? {}).forEach(([key, value]) => {
    if (typeof value !== 'number') return;
    next[key] = Math.max(next[key] ?? 0, value);
  });
  return next;
};

const mergeProgress = (
  local: AchievementProgressState,
  remote: AchievementProgressState,
): AchievementProgressState => ({
  ...remote,
  ...local,
  completedExerciseIds: unique([
    ...(remote.completedExerciseIds ?? []),
    ...(local.completedExerciseIds ?? []),
  ]),
  completedModuleIds: unique([
    ...(remote.completedModuleIds ?? []),
    ...(local.completedModuleIds ?? []),
  ]),
  appAnniversaryKeys: unique([
    ...(remote.appAnniversaryKeys ?? []),
    ...(local.appAnniversaryKeys ?? []),
  ]),
  exerciseCompletionCounts: mergeNumberRecords(remote.exerciseCompletionCounts, local.exerciseCompletionCounts),
  exerciseBpmTargets: mergeNumberRecords(remote.exerciseBpmTargets, local.exerciseBpmTargets),
  moduleCompletionCounts: mergeNumberRecords(remote.moduleCompletionCounts, local.moduleCompletionCounts),
  explorationCounts: mergeNumberRecords(remote.explorationCounts, local.explorationCounts),
  streakDays: Math.max(remote.streakDays ?? 0, local.streakDays ?? 0),
  loyaltyDays: Math.max(remote.loyaltyDays ?? 0, local.loyaltyDays ?? 0),
  firstSeenAt: remote.firstSeenAt ?? local.firstSeenAt,
  lastSeenAt: local.lastSeenAt ?? remote.lastSeenAt,
});

const mergeProjects = (localProjects: Project[], remoteProjects: Project[]) => {
  const byId = new Map<string, Project>();

  [...remoteProjects, ...localProjects].forEach(project => {
    const previous = byId.get(project.id);
    if (!previous) {
      byId.set(project.id, project);
      return;
    }

    const previousTime = new Date(previous.lastUpdated || 0).getTime();
    const nextTime = new Date(project.lastUpdated || 0).getTime();
    byId.set(project.id, nextTime >= previousTime ? project : previous);
  });

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );
};

const mergeInstruments = (localInstruments: UserInstrument[], remoteInstruments: UserInstrument[]) => {
  const byId = new Map<string, UserInstrument>();

  [...remoteInstruments, ...localInstruments].forEach(instrument => {
    const previous = byId.get(instrument.id);
    if (!previous) {
      byId.set(instrument.id, instrument);
      return;
    }

    const previousTime = new Date(previous.updatedAt || previous.createdAt || 0).getTime();
    const nextTime = new Date(instrument.updatedAt || instrument.createdAt || 0).getTime();
    byId.set(instrument.id, nextTime >= previousTime ? instrument : previous);
  });

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
  );
};

const mergeProfile = (local: UserProfile, remote: UserProfile): UserProfile => {
  const localTime = new Date(local.updatedAt || 0).getTime();
  const remoteTime = new Date(remote.updatedAt || 0).getTime();
  return localTime >= remoteTime ? local : remote;
};

const mergeThemeCollection = (
  local: UserCloudSnapshot['themeCollection'],
  remote: UserCloudSnapshot['themeCollection'],
) => {
  const knownIds = new Set(THEME_REGISTRY.map(item => item.id));
  const fallback = getDefaultThemeState();
  const unlockedThemeIds = unique([
    ...fallback.unlockedThemeIds,
    ...(remote.unlockedThemeIds || []),
    ...(local.unlockedThemeIds || []),
  ]).filter(id => knownIds.has(id));

  const activeThemeId = local.activeThemeId && unlockedThemeIds.includes(local.activeThemeId)
    ? local.activeThemeId
    : remote.activeThemeId && unlockedThemeIds.includes(remote.activeThemeId)
      ? remote.activeThemeId
      : fallback.activeThemeId;

  return { activeThemeId, unlockedThemeIds };
};

const mergeSnapshots = (
  local: UserCloudSnapshot,
  remote: UserCloudSnapshot,
  identity: string,
): UserCloudSnapshot => {
  const unlockedAchievementIds = unique([
    ...(remote.achievements.unlockedAchievementIds || []),
    ...(local.achievements.unlockedAchievementIds || []),
  ]);
  const localBadge = local.achievements.selectedRewardBadgeId;
  const remoteBadge = remote.achievements.selectedRewardBadgeId;
  const selectedRewardBadgeId =
    localBadge && getRewardById(localBadge)?.asset.status === 'ready'
      ? localBadge
      : remoteBadge && getRewardById(remoteBadge)?.asset.status === 'ready'
        ? remoteBadge
        : null;

  return {
    appState: {
      ...(remote.appState ?? local.appState),
      ...(local.appState ?? remote.appState),
      currentUser: identity,
    } as AppState,
    profile: mergeProfile(local.profile, remote.profile),
    projects: mergeProjects(local.projects, remote.projects),
    instruments: mergeInstruments(local.instruments ?? [], remote.instruments ?? []),
    themeCollection: mergeThemeCollection(local.themeCollection, remote.themeCollection),
    achievements: {
      unlockedAchievementIds,
      progress: mergeProgress(local.achievements.progress, remote.achievements.progress),
      selectedRewardBadgeId,
    },
    syncedAt: new Date().toISOString(),
  };
};

export const mergeCloudSnapshots = mergeSnapshots;

export const buildLocalCloudSnapshot = async (identity: string): Promise<UserCloudSnapshot> => ({
  appState: loadConfig(),
  profile: loadUserProfile(),
  projects: getLibrary(identity),
  instruments: await listInstruments().catch(() => []),
  themeCollection: loadThemeCollectionState(),
  achievements: {
    unlockedAchievementIds: getUnlockedAchievementIds(),
    progress: getAchievementProgressState(),
    selectedRewardBadgeId: getSelectedRewardBadgeId(),
  },
  syncedAt: new Date().toISOString(),
});

export const applyCloudSnapshotLocally = async (snapshot: UserCloudSnapshot, identity: string) => {
  snapshot.projects.forEach(project => {
    saveProjectToLibrary({ ...project, user: identity });
  });

  await Promise.all((snapshot.instruments ?? []).map(instrument => saveInstrument(instrument)));

  if (snapshot.appState) {
    saveConfig({
      ...snapshot.appState,
      currentUser: identity,
    });
  }

  saveUserProfile(snapshot.profile);
  saveThemeCollectionState(snapshot.themeCollection);
  snapshot.achievements.unlockedAchievementIds.forEach(unlockAchievement);
  mergeAchievementProgressState(snapshot.achievements.progress);
  setSelectedRewardBadgeId(snapshot.achievements.selectedRewardBadgeId);
};

export const pushLocalSnapshotToSupabase = async (
  authUserId: SupabaseUser['id'],
  identity: string,
) => {
  const snapshot = await buildLocalCloudSnapshot(identity);
  const { error } = await supabase
    .from(SNAPSHOT_TABLE)
    .upsert({
      user_id: authUserId,
      snapshot,
      updated_at: snapshot.syncedAt,
    });

  if (error) {
    console.warn('[GA] Supabase cloud sync skipped:', error.message);
    return { ok: false, error };
  }

  return { ok: true, snapshot };
};

export const pushSnapshotToSupabase = async (
  authUserId: SupabaseUser['id'],
  snapshot: UserCloudSnapshot,
) => {
  const next = {
    ...snapshot,
    syncedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(SNAPSHOT_TABLE)
    .upsert({
      user_id: authUserId,
      snapshot: next,
      updated_at: next.syncedAt,
    });

  if (error) {
    console.warn('[GA] Supabase cloud sync skipped:', error.message);
    return { ok: false, error };
  }

  return { ok: true, snapshot: next };
};

export const migrateLocalIdentityToSupabase = async (
  authUserId: SupabaseUser['id'],
  targetIdentity: string,
  sourceIdentity: string,
) => {
  const target = await buildLocalCloudSnapshot(targetIdentity);
  const source = await buildLocalCloudSnapshot(sourceIdentity);
  const merged = mergeSnapshots(source, target, targetIdentity);

  await applyCloudSnapshotLocally(merged, targetIdentity);
  return pushSnapshotToSupabase(authUserId, merged);
};

export const syncSupabaseSnapshot = async (
  authUserId: SupabaseUser['id'],
  identity: string,
) => {
  const local = await buildLocalCloudSnapshot(identity);
  const { data, error } = await supabase
    .from(SNAPSHOT_TABLE)
    .select('user_id,snapshot,updated_at')
    .eq('user_id', authUserId)
    .maybeSingle<RemoteSnapshotRow>();

  if (error) {
    console.warn('[GA] Supabase cloud sync unavailable:', error.message);
    return { ok: false, snapshot: local, error };
  }

  if (!data?.snapshot) {
    return pushLocalSnapshotToSupabase(authUserId, identity);
  }

  const merged = mergeSnapshots(local, data.snapshot, identity);
  await applyCloudSnapshotLocally(merged, identity);

  const { error: upsertError } = await supabase
    .from(SNAPSHOT_TABLE)
    .upsert({
      user_id: authUserId,
      snapshot: merged,
      updated_at: merged.syncedAt,
    });

  if (upsertError) {
    console.warn('[GA] Supabase cloud sync merge saved locally only:', upsertError.message);
    return { ok: false, snapshot: merged, error: upsertError };
  }

  return { ok: true, snapshot: merged };
};
