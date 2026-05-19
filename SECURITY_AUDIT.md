# Security Audit Report - Guitar Architect

**Date:** May 19, 2026  
**Severity:** CRITICAL

---

## Summary

Two critical security issues were identified:

1. **DEV UNLOCK buttons without admin authorization checks** - Any user can unlock any achievement
2. **Multi-account data leakage** - Instruments and achievements from previous accounts can leak into new accounts

---

## Issue 1: DEV UNLOCK Buttons Without Admin Checks

### Location
[components/AchievementsPanel.tsx](components/AchievementsPanel.tsx#L222)

### Vulnerability Details

**The Problem:**
Any user can click "Desbloquear dev" button to unlock any achievement without any authorization checks.

**Code Analysis:**

```tsx
// Line 60 - toggleAchievement() function
const toggleAchievement = (id: string) => {
  const achievement = getAchievementById(id);
  if (achievement?.asset.status !== 'ready') return;
  // ❌ NO ADMIN CHECK HERE
  const next = isAchievementUnlocked(id, unlockedIds) 
    ? lockAchievement(id) 
    : unlockAchievement(id);
  setUnlockedIds(next);
};

// Line 222 - Button that calls it with NO permission check
<button onClick={() => toggleAchievement(achievement.id)}>
  {unlocked ? 'Bloquear dev' : 'Desbloquear dev'}
</button>
```

**Impact:**
- Any user can unlock all achievements and rewards
- Bypasses game progression system
- Gains access to all reward badges without earning them

### Admin Infrastructure Exists But Is Not Used

**Location:** [src/lib/userIdentity.ts](src/lib/userIdentity.ts#L22-L30)

```typescript
const getAdminEmails = () => (
  String(import.meta.env.VITE_GA_ADMIN_EMAILS || '')
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean)
);

export const isAdminEmail = (email?: string | null) => (
  Boolean(email && getAdminEmails().includes(email.toLowerCase()))
);
```

**The Function Exists:** `isAdminEmail()` is defined but **NEVER CALLED** in AchievementsPanel.tsx

### Fix Required

The component needs access to:
1. Current authenticated user's email
2. Admin check before allowing achievement toggle
3. Restrict DEV buttons to admin users only

---

## Issue 2: Multi-Account Data Leakage

### Vulnerability Chain

Three storage systems are used without proper user isolation:

#### 2a. **Instruments - IndexedDB (Global Database)**

**Location:** [utils/instrumentRegistry.ts](utils/instrumentRegistry.ts#L1-L10)

```typescript
const DB_NAME = 'guitar-architect-instruments';  // ❌ Global database, not per-user
const DB_VERSION = 1;
const STORE_NAME = 'instruments';
```

**Problem:** All users share the same IndexedDB database.

#### 2b. **Achievements - localStorage (Global Keys)**

**Location:** [utils/achievementStorage.ts](utils/achievementStorage.ts#L1-L5)

```typescript
export const UNLOCKED_ACHIEVEMENTS_KEY = 'ga_unlocked_achievements';        // ❌ No user prefix
export const ACHIEVEMENT_PROGRESS_KEY = 'ga_achievement_progress';          // ❌ No user prefix
export const SELECTED_REWARD_BADGE_KEY = 'ga_selected_reward_badge';        // ❌ No user prefix
```

**Problem:** These keys don't include user identity, so all users read/write to the same keys.

**Comparison with Projects (CORRECT PATTERN):** [utils/persistence.ts](utils/persistence.ts#L23)

```typescript
const key = `${CONFIG_KEY}_${state.currentUser || 'guest'}`;  // ✅ User-prefixed key
localStorage.setItem(key, JSON.stringify(state));
```

#### 2c. **CloudSync Loading Without Validation**

**Location:** [src/lib/cloudSync.ts](src/lib/cloudSync.ts#L242-L249)

```typescript
export const buildLocalCloudSnapshot = async (identity: string): Promise<UserCloudSnapshot> => ({
  appState: loadConfig(),
  profile: loadUserProfile(),
  projects: getLibrary(identity),           // ✅ User-filtered
  instruments: await listInstruments().catch(() => []),  // ❌ ALL instruments loaded
  themeCollection: loadThemeCollectionState(),
  achievements: {
    unlockedAchievementIds: getUnlockedAchievementIds(),  // ❌ ALL achievements
    progress: getAchievementProgressState(),               // ❌ Global progress
    selectedRewardBadgeId: getSelectedRewardBadgeId(),     // ❌ Global badge
  },
  syncedAt: new Date().toISOString(),
});
```

### Attack Scenario 1: Instrument Leakage (LocalStorage Only)

**Setup:**
1. User Alice (no Supabase account) creates custom instrument "Alice's Les Paul"
2. User Bob creates account locally and signs up to Supabase

**Attack:**
```
Timeline:
├─ Alice: Creates instrument → IndexedDB 'guitar-architect-instruments'
├─ Alice: Signs up to Supabase
│  └─ syncSupabaseSnapshot() reads ALL instruments from IndexedDB
│  └─ Instruments pushed to Alice's Supabase snapshot
│
├─ Bob: Creates account locally (different identity)
│  └─ Sees ALL instruments in IndexedDB (shared global database)
│
└─ Bob: Signs up to Supabase
   └─ syncSupabaseSnapshot() reads ALL instruments including Alice's
   └─ Alice's instruments merged into Bob's Supabase snapshot
   └─ Bob now owns Alice's instruments
```

**Result:** Alice's instruments appear in Bob's account.

### Attack Scenario 2: Achievement Leakage

**Setup:**
1. Alice unlocks several achievements (stored in global `ga_unlocked_achievements`)
2. Bob signs up and immediately signs in

**Attack:**
```
IndexedDB & localStorage (global):
├─ Alice creates and unlocks: ["music_101", "music_102", "music_201"]
│  → localStorage['ga_unlocked_achievements'] = ["music_101", "music_102", "music_201"]
│
├─ Bob signs in (or creates new account)
│  → readJson<string[]>('ga_unlocked_achievements', [])
│  → Returns ["music_101", "music_102", "music_201"]  ← Alice's data!
│
└─ When Bob signs up to Supabase:
   → syncSupabaseSnapshot() calls getUnlockedAchievementIds()
   → Gets Alice's achievements
   → Merges into Bob's Supabase snapshot
```

**Result:** Bob has Alice's achievement progress.

---

## Signup Flow Where Issue Manifests

**Location:** [components/FretboardPanel.tsx](components/FretboardPanel.tsx#L304-L328)

```typescript
const result = authMode === 'signup'
  ? await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: user.trim() || email.split('@')[0],
        },
      },
    })
  : await supabase.auth.signInWithPassword({ email, password });

if (result.data.user) {
  const identity = getSupabaseDisplayName(result.data.user);
  setAuthUser(result.data.user);
  setUser(identity);
  authSessionBooted.current = true;
  switchUserSession(identity);  // ← Clears workspace but not IndexedDB/achievements
  void syncSupabaseSnapshot(result.data.user.id, identity);  // ← Syncs contaminated data
}
```

The `switchUserSession()` function clears the local projects/workspace but does NOT clear:
- Global IndexedDB (`guitar-architect-instruments`)
- Global localStorage keys (`ga_unlocked_achievements`, `ga_achievement_progress`, etc.)

---

## Root Cause Analysis

### Why Projects Are Safe
Projects use user-prefixed localStorage keys:
```
ga_library_alice    ← Alice's projects
ga_library_bob      ← Bob's projects
```

### Why Instruments Aren't Safe
IndexedDB uses a global database name:
```
IDBDatabase: 'guitar-architect-instruments'  ← Shared by all users
```

### Why Achievements Aren't Safe
localStorage uses non-prefixed global keys:
```
'ga_unlocked_achievements'       ← All users read/write same key
'ga_achievement_progress'        ← All users read/write same key
'ga_selected_reward_badge'       ← All users read/write same key
```

---

## Recommendation Matrix

| Issue | Severity | Effort | Priority |
|-------|----------|--------|----------|
| DEV UNLOCK authorization | CRITICAL | LOW | P0 |
| Achievement data isolation | CRITICAL | MEDIUM | P0 |
| Instrument data isolation | CRITICAL | MEDIUM | P0 |

### Immediate Fixes

1. **Add admin check to DEV UNLOCK buttons**
   - Import `authUser` and `isAdminEmail` into AchievementsPanel
   - Only render buttons if `isAdminEmail(authUser?.email)`

2. **Prefix achievement storage keys with user identity**
   - Modify achievementStorage.ts to accept/use user parameter
   - Update all callers to pass current user identity
   - Clear achievements on user switch

3. **Use per-user IndexedDB for instruments**
   - Modify database name to include user identity
   - Or use localStorage with user-prefixed keys instead of IndexedDB
   - Clear instruments on user switch

4. **Add data cleanup in `switchUserSession()`**
   - Clear localStorage achievement keys
   - Clear IndexedDB instruments store
   - Ensure clean slate for new user

---

## Affected Code Files

1. [components/AchievementsPanel.tsx](components/AchievementsPanel.tsx) - DEV UNLOCK buttons
2. [src/lib/cloudSync.ts](src/lib/cloudSync.ts) - Snapshot building and merging
3. [utils/instrumentRegistry.ts](utils/instrumentRegistry.ts) - Instruments storage
4. [utils/achievementStorage.ts](utils/achievementStorage.ts) - Achievements storage
5. [components/FretboardPanel.tsx](components/FretboardPanel.tsx) - Account switching flow
6. [src/lib/userIdentity.ts](src/lib/userIdentity.ts) - Admin checks (unused)
