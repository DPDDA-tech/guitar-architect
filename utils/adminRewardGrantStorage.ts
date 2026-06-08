/**
 * Camada de persistência local para concessões de recompensas via Admin/DEV.
 */

export type AdminRewardGrant = {
  email: string;
  rewardId: string;
  reason?: string;
  grantedAt: string;
  source: 'admin-local';
};

export const ADMIN_GRANTS_STORAGE_KEY = 'ga_admin_reward_grants_v1';

function normalizeEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function getStoredAdminRewardGrants(): AdminRewardGrant[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(ADMIN_GRANTS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((grant: unknown): grant is AdminRewardGrant => {
      if (!grant || typeof grant !== 'object') {
        return false;
      }

      const candidate = grant as Partial<AdminRewardGrant>;

      return (
        typeof candidate.email === 'string' &&
        typeof candidate.rewardId === 'string' &&
        typeof candidate.grantedAt === 'string' &&
        candidate.source === 'admin-local'
      );
    });
  } catch {
    return [];
  }
}

export function saveStoredAdminRewardGrants(
  grants: AdminRewardGrant[]
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    ADMIN_GRANTS_STORAGE_KEY,
    JSON.stringify(grants)
  );
}

export function addStoredAdminRewardGrant(
  grant: Omit<AdminRewardGrant, 'source'>
): void {
  const grants = getStoredAdminRewardGrants();

  const normalizedEmail = normalizeEmail(grant.email);

  if (!normalizedEmail || !grant.rewardId) {
    return;
  }

  const alreadyExists = grants.some(
    (storedGrant: AdminRewardGrant) =>
      normalizeEmail(storedGrant.email) === normalizedEmail &&
      storedGrant.rewardId === grant.rewardId
  );

  if (alreadyExists) {
    return;
  }

  saveStoredAdminRewardGrants([
    ...grants,
    {
      ...grant,
      email: normalizedEmail,
      source: 'admin-local',
    },
  ]);
}

export function removeStoredAdminRewardGrant(
  email: string,
  rewardId: string
): void {
  const normalizedEmail = normalizeEmail(email);

  const filtered = getStoredAdminRewardGrants().filter(
    (grant: AdminRewardGrant) =>
      normalizeEmail(grant.email) !== normalizedEmail ||
      grant.rewardId !== rewardId
  );

  saveStoredAdminRewardGrants(filtered);
}

export function hasStoredAdminRewardGrant(
  email: string | null | undefined,
  rewardId: string
): boolean {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !rewardId) {
    return false;
  }

  return getStoredAdminRewardGrants().some(
    (grant: AdminRewardGrant) =>
      normalizeEmail(grant.email) === normalizedEmail &&
      grant.rewardId === rewardId
  );
}

export function listStoredAdminRewardGrantIdsByEmail(
  email: string | null | undefined
): string[] {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return [];
  }

  return Array.from(new Set(
    getStoredAdminRewardGrants()
      .filter((grant: AdminRewardGrant) => normalizeEmail(grant.email) === normalizedEmail)
      .map((grant: AdminRewardGrant) => grant.rewardId)
      .filter(Boolean)
  ));
}
