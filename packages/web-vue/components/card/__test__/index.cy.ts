import { h } from 'vue';

import Card from '../index';

const { Meta, Grid } = Card;

describe('Card', () => {
  it('should have the sd-card class', () => {
    cy.mount(Card);
    cy.get('.sd-card').should('exist');
  });

  it('title should render', () => {
    cy.mount(Card, { props: { title: 'Card title' } });
    cy.get('.sd-card-header-title').should('contain.text', 'Card title');
  });

  it('extra slot should render', () => {
    cy.mount(Card, { slots: { extra: `<div id="extra-content">Extra content</div>` } });
    cy.get('#extra-content').should('exist');
  });

  it('card meta should render', () => {
    cy.mount(Card, { slots: { default: () => h(Meta, { title: 'Card meta title' }) } });
    cy.get('.sd-card-meta-title').should('contain.text', 'Card meta title');
  });

  it('card grid should render', () => {
    cy.mount(Card, { slots: { default: () => [h(Grid), h(Grid), h(Grid)] } });
    cy.get('.sd-card-grid').should('have.length', 3);
  });
});
