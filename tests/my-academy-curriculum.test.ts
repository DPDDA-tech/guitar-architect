import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MyAcademyJourneyRoute from '../components/myAcademy/MyAcademyJourneyRoute';
import { MY_ACADEMY_CURRICULUM, MY_ACADEMY_CURRICULUM_VERSION } from '../data/myAcademyCurriculum';
import {
  getMyAcademyDisplayNumber,
  getMyAcademyPositionExplanation,
  getMyAcademyPositionMomentId,
  getMyAcademyPublicMapLabel,
  getMyAcademyTerritory,
  getMyAcademyWaypointPresentation,
  getMyAcademyWelcomeMode,
  MY_ACADEMY_POSITION_EXPLANATION,
  shouldShowMyAcademyTerritoryStatus,
} from '../utils/myAcademyMapPresentation';
import {
  getMyAcademyJourneyLandmarks,
  getMyAcademyModuleLandmarks,
  isConfiguredJourneyLandmarkValid,
  isMyAcademyModuleInTerritory,
} from '../utils/myAcademyJourneyLandmarks';
import {
  getDesktopModuleNodePositions,
  MY_ACADEMY_DESKTOP_SEGMENTS,
} from '../utils/myAcademyRouteGeometry';
import {
  deriveMyAcademyExplorationEvidence,
  getMyAcademyWaypointAccent,
  getMyAcademyWaypointVisualState,
  type MyAcademyExplorationEvidence,
} from '../utils/myAcademyExplorationPresentation';
import { findSafeMyAcademyCalloutPlacement } from '../utils/myAcademyCalloutPlacement';

describe('My Academy curriculum map v0.1', () => {
  it('preserves the seven approved visible moments and documented module counts', () => {
    expect(MY_ACADEMY_CURRICULUM_VERSION).toBe('0.1');
    expect(MY_ACADEMY_CURRICULUM.map(moment => moment.title.pt)).toEqual([
      'Descoberta',
      'Iniciação',
      'Fundamentos',
      'Consolidação',
      'Desenvolvimento',
      'Autonomia',
      'Expressão',
    ]);
    expect(MY_ACADEMY_CURRICULUM.map(moment => moment.modules.length)).toEqual([4, 5, 8, 7, 6, 4, 5]);
    const finalMoment = MY_ACADEMY_CURRICULUM.at(-1);
    expect(finalMoment).toMatchObject({ id: '6', sourceLabel: 'Contextos avançados' });
    expect(finalMoment?.title.en).toBe('Expression');
  });

  it('uses documented modules as the second map layer', () => {
    const moduleIds = MY_ACADEMY_CURRICULUM.flatMap(moment => moment.modules.map(module => module.id));

    expect(moduleIds).toHaveLength(new Set(moduleIds).size);
    expect(moduleIds).toEqual(expect.arrayContaining(['M0-01', 'M1-01', 'M2-08', 'M3-07', 'M4-06', 'M5-04', 'M6-05']));
  });

  it('marks only NMC-RIT-001 as available', () => {
    const items = MY_ACADEMY_CURRICULUM.flatMap(moment => moment.modules.flatMap(module => module.items));
    const availableItems = items.filter(item => item.status === 'available');

    expect(availableItems).toEqual([
      expect.objectContaining({
        id: 'NMC-RIT-001',
        kind: 'unit',
        path: '/my-academy/prototype/nmc-rit-001',
      }),
    ]);
  });

  it('keeps future content descriptive and the final moment as curricular horizon', () => {
    const finalMoment = MY_ACADEMY_CURRICULUM.find(moment => moment.id === '6');

    expect(finalMoment?.status).toBe('horizon');
    expect(finalMoment?.modules.every(module => module.items.every(item => item.status === 'horizon'))).toBe(true);
    expect(MY_ACADEMY_CURRICULUM.find(moment => moment.id === '3')?.sourceLabel).toBe('Integração');
    expect(finalMoment?.sourceLabel).toBe('Contextos avançados');
  });

  it('keeps the seven macro waypoints in logical M0–M6 order', () => {
    expect(MY_ACADEMY_CURRICULUM.map(moment => `M${moment.id}`)).toEqual([
      'M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6',
    ]);
  });

  it('presents public waypoint numbers 1–7 without changing internal IDs', () => {
    expect(MY_ACADEMY_CURRICULUM.map(moment => moment.id)).toEqual(['0', '1', '2', '3', '4', '5', '6']);
    expect(MY_ACADEMY_CURRICULUM.map(moment => getMyAcademyDisplayNumber(moment.id))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(MY_ACADEMY_CURRICULUM.map(moment => getMyAcademyDisplayNumber(moment.id))).not.toContain(0);
    expect(getMyAcademyPublicMapLabel('pt')).toBe('GA · MAPA 1—7');
    expect(getMyAcademyPublicMapLabel('en')).toBe('GA · MAP 1—7');
  });

  it('returns modules only from the selected territory', () => {
    expect(getMyAcademyTerritory('1').modules.map(module => module.id)).toEqual([
      'M1-01', 'M1-02', 'M1-03', 'M1-04', 'M1-05',
    ]);
    expect(getMyAcademyTerritory('4').modules.map(module => module.id)).toEqual([
      'M4-01', 'M4-02', 'M4-03', 'M4-04', 'M4-05', 'M4-06',
    ]);
  });

  it('uses M0 as the initial position and M1 after an NMC-RIT-001 self-record', () => {
    expect(getMyAcademyPositionMomentId(false)).toBe('0');
    expect(getMyAcademyWaypointPresentation('0', false, 'pt')).toMatchObject({
      isCurrent: true,
      label: 'Você está aqui · explorando agora',
    });
    expect(getMyAcademyPositionMomentId(true)).toBe('1');
    expect(getMyAcademyWaypointPresentation('1', true, 'pt')).toMatchObject({
      isCurrent: true,
      label: 'Última experiência aqui',
    });
  });

  it('separates navigation labels from editorial availability', () => {
    expect(getMyAcademyWaypointPresentation('1', false, 'pt').label).toBe('Primeira experiência disponível');
    expect(getMyAcademyWaypointPresentation('3', false, 'pt').label).toBe('Trilhas à frente');
    expect(getMyAcademyWaypointPresentation('6', false, 'pt').label).toBe('Horizonte da jornada');
    expect(getMyAcademyTerritory('3').status).toBe('preparing');
    expect(getMyAcademyTerritory('6').status).toBe('horizon');
  });

  it('prioritizes the current-position label over the M0 editorial status in the territory header', () => {
    expect(shouldShowMyAcademyTerritoryStatus('0', true)).toBe(false);
    expect(shouldShowMyAcademyTerritoryStatus('0', false)).toBe(true);
    expect(shouldShowMyAcademyTerritoryStatus('1', true)).toBe(true);
  });

  it('explains that map position is a reference rather than an assigned level', () => {
    expect(MY_ACADEMY_POSITION_EXPLANATION.pt).toBe(
      'Sua posição é apenas um ponto de referência no mapa, não um nível atribuído.',
    );
    expect(getMyAcademyPositionExplanation(false, 'pt')).toContain('ponto de partida desta visita');
    expect(getMyAcademyPositionExplanation(true, 'pt')).toContain('território da sua última experiência');
    expect(getMyAcademyPositionExplanation(false, 'pt')).toContain('não um nível atribuído');
  });

  it('reveals module nodes only from the selected territory and validates panel selection', () => {
    expect(getMyAcademyModuleLandmarks('1').map(module => module.id)).toEqual([
      'M1-01', 'M1-02', 'M1-03', 'M1-04', 'M1-05',
    ]);
    expect(getMyAcademyModuleLandmarks('1').some(module => module.id.startsWith('M2-'))).toBe(false);
    expect(isMyAcademyModuleInTerritory('1', 'M1-03')).toBe(true);
    expect(isMyAcademyModuleInTerritory('1', 'M2-03')).toBe(false);
  });

  it('renders selected-territory modules on the matching cable segment without a local-branch block', () => {
    const territory = getMyAcademyTerritory('0');
    const html = renderToStaticMarkup(React.createElement(MyAcademyJourneyRoute, {
      lang: 'pt',
      selectedMomentId: '0',
      selectedTerritory: territory,
      selectedModuleId: 'M0-02',
      hasSelfRecord: false,
      animateRoute: false,
      onSelect: () => undefined,
      onSelectModule: () => undefined,
    }));

    expect(html).not.toContain('Derivação local');
    const renderedModuleIds = Array.from(html.matchAll(/data-module-id="([^"]+)"/g), match => match[1]);
    expect([...new Set(renderedModuleIds)]).toEqual(territory.modules.map(module => module.id));
    expect(html.match(/data-module-segment="0"/g)).toHaveLength(territory.modules.length * 2);
    expect(html).not.toContain('data-module-segment="1"');
    expect(html).toMatch(/data-module-id="M0-02"[\s\S]*?aria-pressed="true"/);
    expect(getDesktopModuleNodePositions('0', territory.modules.length)).toHaveLength(territory.modules.length);
    expect(MY_ACADEMY_DESKTOP_SEGMENTS.map(segment => segment.momentId)).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });

  it('uses only confirmed contextual landmarks without invented characters', () => {
    const discoveryLandmarks = getMyAcademyJourneyLandmarks('0');
    const initiationLandmarks = getMyAcademyJourneyLandmarks('1');
    const allLandmarks = MY_ACADEMY_CURRICULUM.flatMap(moment => getMyAcademyJourneyLandmarks(moment.id));

    expect(discoveryLandmarks).toEqual([
      expect.objectContaining({ id: 'clara-guide', type: 'guide', moduleId: 'M0-01' }),
    ]);
    expect(initiationLandmarks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'nmc-rit-001-unit', type: 'unit', curriculumItemId: 'NMC-RIT-001' }),
      expect.objectContaining({ id: 'studio-metronome', type: 'studio', destination: '/studio' }),
    ]));
    expect(allLandmarks.filter(landmark => landmark.type === 'unit')).toHaveLength(1);
    expect(allLandmarks.every(isConfiguredJourneyLandmarkValid)).toBe(true);
    expect(allLandmarks.some(landmark => landmark.type === 'specialist' || landmark.type === 'guest')).toBe(false);
    expect(allLandmarks.map(landmark => landmark.label.pt).join(' ')).not.toMatch(/desbloque|conclu|dom[ií]nio|aprova/i);
  });

  it('keeps Clara expanded only on first access and collapsible on returns', () => {
    expect(getMyAcademyWelcomeMode(true)).toBe('expanded');
    expect(getMyAcademyWelcomeMode(false)).toBe('collapsible');
  });

  it('avoids verdict language in map navigation states', () => {
    const labels = [false, true].flatMap(hasSelfRecord => (
      MY_ACADEMY_CURRICULUM.map(moment => getMyAcademyWaypointPresentation(moment.id, hasSelfRecord, 'pt').label)
    ));

    expect(labels.join(' ')).not.toMatch(/conclu[ií]|domin(?:ou|ado)|aprovad[oa]/i);
  });

  it('keeps selection independent from confirmed exploration', () => {
    const evidence = deriveMyAcademyExplorationEvidence(false);
    const selected = getMyAcademyWaypointVisualState('4', '4', 'preparing', evidence);

    expect(selected.isSelected).toBe(true);
    expect(selected.hasConfirmedExperience).toBe(false);
    expect(selected.isUnexplored).toBe(true);
  });

  it('supports non-linear confirmed territories without inferring previous moments', () => {
    const evidence: MyAcademyExplorationEvidence = {
      confirmedMomentIds: ['4'],
      confirmedModuleIds: ['M4-03'],
      latestMomentId: '4',
      startingMomentId: '0',
    };

    expect(getMyAcademyWaypointVisualState('4', '1', 'preparing', evidence)).toMatchObject({
      hasConfirmedExperience: true,
      confirmedModuleCount: 1,
      isLatestExperience: true,
      isSelected: false,
    });
    for (const momentId of ['0', '1', '2', '3'] as const) {
      expect(getMyAcademyWaypointVisualState(momentId, '1', 'preparing', evidence).hasConfirmedExperience).toBe(false);
    }
  });

  it('derives only the real NMC-RIT-001 self-record as confirmed evidence', () => {
    expect(deriveMyAcademyExplorationEvidence(false)).toMatchObject({
      confirmedMomentIds: [],
      confirmedModuleIds: [],
      latestMomentId: null,
    });
    expect(deriveMyAcademyExplorationEvidence(true)).toMatchObject({
      confirmedMomentIds: ['1'],
      confirmedModuleIds: ['M1-01'],
      latestMomentId: '1',
    });
  });

  it.each([
    ['0', 4],
    ['1', 5],
    ['2', 8],
  ] as const)('keeps %s module nodes inside the safe cable band', (momentId, count) => {
    const placements = getDesktopModuleNodePositions(momentId, count);
    expect(placements).toHaveLength(count);
    expect(placements[0].progress).toBeGreaterThanOrEqual(0.2);
    expect(placements[placements.length - 1].progress).toBeLessThanOrEqual(0.76);
    expect(placements.every((placement, index) => index === 0 || placement.progress > placements[index - 1].progress)).toBe(true);
  });

  it('renders only local discontinuous exploration marks instead of a continuously filled route', () => {
    const territory = getMyAcademyTerritory('1');
    const html = renderToStaticMarkup(React.createElement(MyAcademyJourneyRoute, {
      lang: 'pt',
      selectedMomentId: '1',
      selectedTerritory: territory,
      selectedModuleId: 'M1-01',
      hasSelfRecord: true,
      animateRoute: false,
      onSelect: () => undefined,
      onSelectModule: () => undefined,
    }));

    expect(html.match(/data-explored-mark="1"/g)).toHaveLength(2);
    expect(html).not.toContain('data-explored-mark="0"');
    expect(html).not.toContain('data-explored-mark="2"');
    expect(html).not.toContain('data-route-progress');
    expect(html).not.toContain('data-selected-module-mark');
  });

  it('uses gold only for a starting point or latest confirmed experience', () => {
    const emptyEvidence = deriveMyAcademyExplorationEvidence(false);
    const starting = getMyAcademyWaypointVisualState('0', '0', 'preparing', emptyEvidence);
    const horizon = getMyAcademyWaypointVisualState('6', '6', 'horizon', emptyEvidence);
    const recordedEvidence = deriveMyAcademyExplorationEvidence(true);
    const latest = getMyAcademyWaypointVisualState('1', '4', 'available', recordedEvidence);

    expect(getMyAcademyWaypointAccent(starting)).toBe('gold');
    expect(getMyAcademyWaypointAccent(latest)).toBe('gold');
    expect(getMyAcademyWaypointAccent(horizon)).toBe('cyan');
  });

  it('places a callout inside map bounds without crossing protected origin and destination boxes', () => {
    const origin = { left: 40, top: 100, right: 180, bottom: 250 };
    const destination = { left: 420, top: 80, right: 560, bottom: 230 };
    const result = findSafeMyAcademyCalloutPlacement({
      anchor: { left: 275, top: 155, right: 319, bottom: 199 },
      width: 170,
      height: 72,
      bounds: { left: 12, top: 12, right: 588, bottom: 388 },
      exclusions: [origin, destination],
      preferredDirections: ['above', 'below', 'before', 'after'],
    });
    const callout = { left: result.left, top: result.top, right: result.left + 170, bottom: result.top + 72 };
    const overlaps = (a: typeof callout, b: typeof origin) => !(
      a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom
    );

    expect(result.usedFallback).toBe(false);
    expect(callout.left).toBeGreaterThanOrEqual(12);
    expect(callout.right).toBeLessThanOrEqual(588);
    expect(overlaps(callout, origin)).toBe(false);
    expect(overlaps(callout, destination)).toBe(false);
  });
});
