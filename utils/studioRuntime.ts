import { suspendSharedAudioContext } from './audio';

/**
 * Fired whenever the route/module changes, so any active Studio engine
 * (metronome, tuner, scale playback, follow-cycle timers, etc.) can stop
 * itself even if its component instance is kept alive.
 */
export const STUDIO_CLEANUP_EVENT = 'ga-studio-cleanup';

const PENDING_FRETBOARD_ACTION_KEY = 'ga_pending_fretboard_action';

/**
 * Central cleanup for the Studio runtime. Stops timers/audio engines via
 * STUDIO_CLEANUP_EVENT and, when navigating away from /studio, discards any
 * stale pending fretboard intent so it doesn't leak into a later visit.
 */
export const cleanupStudioRuntime = (nextPath?: string) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(STUDIO_CLEANUP_EVENT));
  suspendSharedAudioContext();

  if (nextPath !== undefined && nextPath !== '/studio') {
    window.localStorage.removeItem(PENDING_FRETBOARD_ACTION_KEY);
  }
};

/**
 * Subscribes a Studio engine to the global cleanup signal. Returns an
 * unsubscribe function suitable for a useEffect cleanup.
 */
export const onStudioCleanup = (handler: () => void) => {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(STUDIO_CLEANUP_EVENT, handler);
  return () => window.removeEventListener(STUDIO_CLEANUP_EVENT, handler);
};
