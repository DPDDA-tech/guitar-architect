import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MyAcademyTerritoryPanel from '../components/myAcademy/MyAcademyTerritoryPanel';
import { getMyAcademyTerritory } from '../utils/myAcademyMapPresentation';
import {
  MY_ACADEMY_INTRO_TOPIC_IDS,
  isMyAcademyIntroTopicPublished,
} from '../components/myAcademy/MyAcademyIntroTopicContent';

describe('My Academy published introduction topics', () => {
  it('publishes the three approved introduction items', () => {
    expect(MY_ACADEMY_INTRO_TOPIC_IDS).toEqual(['M0-01-01', 'M0-01-02', 'M0-01-03']);
    expect(MY_ACADEMY_INTRO_TOPIC_IDS.every(isMyAcademyIntroTopicPublished)).toBe(true);
    expect(isMyAcademyIntroTopicPublished('M0-02-01')).toBe(false);
  });

  it('renders the introduction as available expandable content inside the map', () => {
    const territory = getMyAcademyTerritory('0');
    const markup = renderToStaticMarkup(React.createElement(MyAcademyTerritoryPanel, {
      lang: 'pt',
      territory,
      hasSelfRecord: false,
      selectedModuleId: 'M0-01',
      onSelectModule: () => undefined,
    }));

    expect(markup).toContain('Conheça o My Academy');
    expect(markup.match(/Disponível agora/g)?.length).toBeGreaterThanOrEqual(4);
    expect(markup.match(/Abrir conteúdo/g)).toHaveLength(3);
    expect(markup).toContain('Um mapa que conecta todo o ecossistema');
    expect(markup).toContain('Direção sem transformar experiência em julgamento');
    expect(markup).toContain('Uma jornada orientada, mas nunca obrigatória');
    expect(markup).not.toMatch(/aprovação|reprovação|nível pessoal atribuído/i);
  });
});
