import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GearProductFeedbackModal from '../components/GearProductFeedbackModal';

const product = { id: 'picks', name: 'Palhetas' };

describe('GearProductFeedbackModal (static markup, pre-effects)', () => {
  const markup = renderToStaticMarkup(
    React.createElement(GearProductFeedbackModal, {
      product,
      lang: 'pt',
      isLight: true,
      onClose: () => undefined,
    })
  );

  it('is an accessible dialog identifying the product', () => {
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('Palhetas');
  });

  it('preserves the exact question content and order', () => {
    const questions = [
      'Qual é o seu nível de interesse neste conceito?',
      'Em que situação você usaria este produto?',
      'O que seria mais importante neste produto?',
      'O que você mudaria, acrescentaria ou evitaria neste conceito?',
      'Gostaria de acompanhar a evolução deste conceito?',
    ];
    let cursor = 0;
    for (const question of questions) {
      const index = markup.indexOf(question, cursor);
      expect(index).toBeGreaterThan(-1);
      cursor = index + question.length;
    }
  });

  it('shows the non-commitment notice', () => {
    // The email privacy notice only renders once "wantsUpdates" is set to
    // true by the user, which requires interaction beyond what a pre-effect
    // static render can exercise — verified instead by code review and by
    // Playwright checks documented in the final report.
    expect(markup).toContain('A participação não representa reserva, compra ou compromisso de lançamento.');
  });

  it('renders the security check container', () => {
    expect(markup).toContain('Verificação de segurança');
  });

  it('renders the submit button enabled and idle before any async effect runs', () => {
    expect(markup).toContain('Enviar opinião');
    expect(markup).not.toContain('disabled=""');
  });

  it('does not use commercial/e-commerce language', () => {
    const forbidden = ['Compre agora', 'Comprar', 'Adicionar ao carrinho', 'Checkout', 'Últimas unidades', 'Em estoque', 'Pré-venda'];
    forbidden.forEach(word => expect(markup).not.toContain(word));
  });
});
