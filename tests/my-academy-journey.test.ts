import { describe, expect, it } from 'vitest';
import type { MyAcademyNextPreference, MyAcademySelfRecord } from '../types/myAcademyJourney';
import {
  getMyAcademySuggestion,
  loadMyAcademyIntroSeen,
  loadMyAcademySelfRecord,
  markMyAcademyIntroSeen,
  MY_ACADEMY_INTRO_SEEN_KEY,
  NMC_RIT_001_SELF_RECORD_KEY,
} from '../utils/myAcademyJourney';

const validRecord: MyAcademySelfRecord = {
  unitId: 'NMC-RIT-001',
  unitVersion: '0.1.4',
  recordedAt: '2026-07-18T12:00:00.000Z',
  declaredByUser: true,
  interaction: 'observed',
  perception: 'sometimes',
  nextPreference: 'review',
};

const storageWith = (value: string | null): Pick<Storage, 'getItem'> => ({
  getItem: key => key === NMC_RIT_001_SELF_RECORD_KEY ? value : null,
});

describe('My Academy journey self-record', () => {
  it('returns no record when local storage has no self-record', () => {
    expect(loadMyAcademySelfRecord(storageWith(null))).toBeNull();
  });

  it('reads a valid self-record safely', () => {
    expect(loadMyAcademySelfRecord(storageWith(JSON.stringify(validRecord)))).toEqual(validRecord);
  });

  it('tolerates invalid JSON without exposing an error', () => {
    expect(loadMyAcademySelfRecord(storageWith('{invalid-json'))).toBeNull();
  });

  it.each<[MyAcademyNextPreference, string, string]>([
    ['repeat', 'Repetir a experiência', '/my-academy/prototype/nmc-rit-001'],
    ['review', 'Revisar Pulso e regularidade', '/my-academy/prototype/nmc-rit-001'],
    ['studio', 'Explorar o Studio livremente', '/studio'],
    ['continue', 'A próxima unidade está em preparação', '#mapa'],
  ])('provides an explained suggestion for the %s preference', (preference, title, destination) => {
    const suggestion = getMyAcademySuggestion(preference, 'pt');

    expect(suggestion).toMatchObject({ preference, title, destination });
    expect(suggestion.explanation).toContain('você declarou');
  });
});

describe('My Academy first-access preference', () => {
  it('treats a missing or unexpected value as a first access', () => {
    expect(loadMyAcademyIntroSeen({ getItem: () => null })).toBe(false);
    expect(loadMyAcademyIntroSeen({ getItem: () => 'true' })).toBe(false);
  });

  it('recognizes the versioned return marker', () => {
    expect(loadMyAcademyIntroSeen({
      getItem: key => key === MY_ACADEMY_INTRO_SEEN_KEY ? '1' : null,
    })).toBe(true);
  });

  it('stores only a minimal boolean marker after deliberate engagement', () => {
    const stored: Array<[string, string]> = [];

    markMyAcademyIntroSeen({ setItem: (key, value) => stored.push([key, value]) });

    expect(stored).toEqual([[MY_ACADEMY_INTRO_SEEN_KEY, '1']]);
  });
});
