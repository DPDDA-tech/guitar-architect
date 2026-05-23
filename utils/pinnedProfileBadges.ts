export const PINNED_PROFILE_BADGES_STORAGE_KEY = 'ga_pinned_profile_badges'
export const MAX_PINNED_PROFILE_BADGES = 10

type PinReason = 'already_pinned' | 'limit_reached' | 'invalid_id'

function normalizeId(id: unknown): string | null {
  if (typeof id !== 'string') return null
  const normalized = id.trim()
  return normalized.length > 0 ? normalized : null
}

function sanitizePinnedBadges(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []

  const cleanIds = ids
    .map(normalizeId)
    .filter((id): id is string => Boolean(id))

  return Array.from(new Set(cleanIds)).slice(0, MAX_PINNED_PROFILE_BADGES)
}

export function getPinnedProfileBadges(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(PINNED_PROFILE_BADGES_STORAGE_KEY)
    if (!stored) return []

    return sanitizePinnedBadges(JSON.parse(stored))
  } catch (error) {
    console.warn('[PinnedProfileBadges] Invalid localStorage data.', error)
    return []
  }
}

export function setPinnedProfileBadges(ids: string[]): void {
  if (typeof window === 'undefined') return

  const cleanIds = sanitizePinnedBadges(ids)
  window.localStorage.setItem(PINNED_PROFILE_BADGES_STORAGE_KEY, JSON.stringify(cleanIds))
}

export function isProfileBadgePinned(rewardId: string): boolean {
  const normalizedId = normalizeId(rewardId)
  if (!normalizedId) return false

  return getPinnedProfileBadges().includes(normalizedId)
}

export function canPinMoreProfileBadges(): boolean {
  return getPinnedProfileBadges().length < MAX_PINNED_PROFILE_BADGES
}

export function pinProfileBadge(rewardId: string): {
  ok: boolean
  reason?: PinReason
  pinned: string[]
} {
  const normalizedId = normalizeId(rewardId)
  const current = getPinnedProfileBadges()

  if (!normalizedId) return { ok: false, reason: 'invalid_id', pinned: current }
  if (current.includes(normalizedId)) return { ok: false, reason: 'already_pinned', pinned: current }
  if (current.length >= MAX_PINNED_PROFILE_BADGES) return { ok: false, reason: 'limit_reached', pinned: current }

  const pinned = [...current, normalizedId]
  setPinnedProfileBadges(pinned)

  return { ok: true, pinned }
}

export function unpinProfileBadge(rewardId: string): {
  ok: boolean
  pinned: string[]
} {
  const normalizedId = normalizeId(rewardId)
  const current = getPinnedProfileBadges()

  if (!normalizedId) return { ok: false, pinned: current }

  const pinned = current.filter((id) => id !== normalizedId)
  setPinnedProfileBadges(pinned)

  return { ok: true, pinned }
}

export function toggleProfileBadgePin(rewardId: string): {
  ok: boolean
  action: 'pinned' | 'unpinned' | 'none'
  reason?: 'limit_reached' | 'invalid_id'
  pinned: string[]
} {
  const normalizedId = normalizeId(rewardId)
  const current = getPinnedProfileBadges()

  if (!normalizedId) return { ok: false, action: 'none', reason: 'invalid_id', pinned: current }

  if (current.includes(normalizedId)) {
    const result = unpinProfileBadge(normalizedId)
    return { ok: result.ok, action: 'unpinned', pinned: result.pinned }
  }

  const result = pinProfileBadge(normalizedId)

  if (result.ok) {
    return { ok: true, action: 'pinned', pinned: result.pinned }
  }

  return {
    ok: false,
    action: 'none',
    reason: result.reason === 'limit_reached' ? 'limit_reached' : undefined,
    pinned: result.pinned,
  }
}