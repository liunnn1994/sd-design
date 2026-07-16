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

  it('fullHeight should add the full-height class', () => {
    cy.mount(Card, { props: { fullHeight: true } });
    cy.get('.sd-card').should('have.class', 'sd-card-full-height');
  });

  it('fullHeight should wrap the body in Scrollbar by default', () => {
    cy.mount(Card, {
      props: { fullHeight: true },
      slots: { default: '<div id="card-content">content</div>' },
    });
    cy.get('.sd-card-body').should('have.class', 'sd-card-body-scroll');
    cy.get('.sd-card-body-scrollbar').should('exist');
    cy.get('#card-content').should('exist');
  });

  it('fullHeight with scrollbar=false should use native overflow', () => {
    cy.mount(Card, {
      props: { fullHeight: true, scrollbar: false },
      slots: { default: '<div id="card-content">content</div>' },
    });
    cy.get('.sd-card-body').should('have.class', 'sd-card-body-native');
    cy.get('.sd-card-body-scrollbar').should('not.exist');
  });

  it('fullHeight native scroll should make the body scrollable', () => {
    cy.mount({
      setup() {
        return () =>
          h('div', { style: 'height: 200px' }, [
            h(Card, { fullHeight: true, scrollbar: false }, () =>
              h('div', { style: 'height: 600px' }),
            ),
          ]);
      },
    });
    cy.get('.sd-card-body').should(($el) => {
      const el = $el[0];
      expect(el.scrollHeight).to.greaterThan(el.clientHeight);
    });
  });
});
