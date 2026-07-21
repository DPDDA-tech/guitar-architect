import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MyAcademyCompanionChooser from '../components/myAcademy/MyAcademyCompanionChooser';
import MyAcademyCurriculumMap from '../components/myAcademy/MyAcademyCurriculumMap';
import {
  MY_ACADEMY_COMPANION_KEY,
  MY_ACADEMY_COMPANIONS,
  clearMyAcademyCompanionChoice,
  createMyAcademyCompanionChoice,
  getMyAcademyCompanionProfile,
  loadMyAcademyCompanionChoice,
  parseMyAcademyCompanionChoice,
  saveMyAcademyCompanionChoice,
} from '../utils/myAcademyCompanion';

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
    removeItem: (key: string) => values.delete(key),
  };
};

describe('My Academy journey companion', () => {
  it('offers Alice and Arthur as distinct public companion profiles', () => {
    expect(MY_ACADEMY_COMPANIONS.map(companion => companion.id)).toEqual(['alice', 'arthur']);
    expect(getMyAcademyCompanionProfile('alice').image).toBe('/instructors/1000/alice-card-instructor.webp');
    expect(getMyAcademyCompanionProfile('arthur').image).toBe('/instructors/1000/arthur-card-instructor.webp');
    expect(getMyAcademyCompanionProfile('alice').emphasis.pt).not.toBe(getMyAcademyCompanionProfile('arthur').emphasis.pt);
  });

  it('creates only user-declared reversible choices', () => {
    expect(createMyAcademyCompanionChoice('alice', '2026-07-19T12:00:00.000Z')).toEqual({
      companionId: 'alice',
      chosenAt: '2026-07-19T12:00:00.000Z',
      declaredByUser: true,
      reversible: true,
    });
  });

  it('rejects malformed, inferred or irreversible records', () => {
    expect(parseMyAcademyCompanionChoice(null)).toBeNull();
    expect(parseMyAcademyCompanionChoice('{"companionId":"clara"}')).toBeNull();
    expect(parseMyAcademyCompanionChoice(JSON.stringify({
      companionId: 'alice',
      chosenAt: '2026-07-19T12:00:00.000Z',
      declaredByUser: false,
      reversible: true,
    }))).toBeNull();
    expect(parseMyAcademyCompanionChoice(JSON.stringify({
      companionId: 'arthur',
      chosenAt: '2026-07-19T12:00:00.000Z',
      declaredByUser: true,
      reversible: false,
    }))).toBeNull();
  });

  it('saves, replaces and clears the choice without touching curriculum records', () => {
    const storage = createMemoryStorage();
    saveMyAcademyCompanionChoice(createMyAcademyCompanionChoice('alice', '2026-07-19T12:00:00.000Z'), storage);
    expect(loadMyAcademyCompanionChoice(storage)?.companionId).toBe('alice');

    saveMyAcademyCompanionChoice(createMyAcademyCompanionChoice('arthur', '2026-07-19T13:00:00.000Z'), storage);
    expect(loadMyAcademyCompanionChoice(storage)?.companionId).toBe('arthur');

    clearMyAcademyCompanionChoice(storage);
    expect(storage.getItem(MY_ACADEMY_COMPANION_KEY)).toBeNull();
    expect(loadMyAcademyCompanionChoice(storage)).toBeNull();
  });

  it('renders both companions and preserves the option to continue without one', () => {
    const markup = renderToStaticMarkup(React.createElement(MyAcademyCompanionChooser, { lang: 'pt' }));

    expect(markup).toContain('Um convite de Clara');
    expect(markup).toContain('Alice');
    expect(markup).toContain('Arthur');
    expect(markup).toContain('Nenhum acompanhante por enquanto');
    expect(markup).toContain('não muda o currículo nem bloqueia caminhos');
  });

  it('keeps a permanent reversible companion control inside the open journey map', () => {
    const markup = renderToStaticMarkup(React.createElement(MyAcademyCurriculumMap, {
      lang: 'pt',
      open: true,
      isFirstAccess: false,
      hasSelfRecord: false,
      focusMapRequest: 0,
      onOpenChange: () => undefined,
      onEngage: () => undefined,
    }));

    // Dedicated companion panel — separate from "Encontros da turnê".
    expect(markup).toContain('Escolha seu Arquiteto para esta etapa');
    expect(markup).toContain('Alice ou Arthur podem acompanhar seus próximos passos');
    expect(markup).toContain('Alice');
    expect(markup).toContain('Arthur');
    expect(markup).toContain('my-academy-companion-choice');
    // Choice remains optional and reversible — never forced.
    expect(markup).toContain('Nenhum acompanhante por enquanto');
  });
});
