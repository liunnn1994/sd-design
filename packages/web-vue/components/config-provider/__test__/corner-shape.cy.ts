import { defineComponent, h } from 'vue';

import Avatar from '../../avatar';
import Button from '../../button';
import Card from '../../card';
import Tabs, { TabPane } from '../../tabs';

describe('shared corner shape', () => {
  beforeEach(() => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', { class: 'corner-fixture' }, [
            h(Button, null, () => 'Default'),
            h(Button, { shape: 'circle' }, () => '+'),
            h(Button, { shape: 'round' }, () => 'Round'),
            h(Avatar, { shape: 'circle' }, () => 'A'),
            h(Card, { title: 'Card' }, () => 'Content'),
            h(Tabs, { type: 'card' }, () =>
              [1, 2].map((key) => h(TabPane, { key, title: `Tab ${key}` }, () => 'Panel')),
            ),
          ]),
      }),
    );
    cy.window().then((win) => {
      expect(win.CSS.supports('corner-shape', 'superellipse(2)')).to.equal(true);
    });
  });

  it('smooths all four ordinary corners and preserves circular controls', () => {
    cy.get('.sd-btn')
      .first()
      .should(($el) => {
        const style = getComputedStyle($el[0]);
        for (const corner of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
          expect(style.getPropertyValue(`corner-${corner}-shape`)).to.equal('superellipse(2)');
          expect(style.getPropertyValue(`border-${corner}-radius`)).not.to.equal('0px');
        }
      });
    cy.get('.sd-btn-shape-circle, .sd-btn-shape-round, .sd-avatar-circle').each(($el) => {
      expect(getComputedStyle($el[0]).getPropertyValue('corner-shape')).to.equal('superellipse(1)');
    });
    cy.get('.sd-tabs-tab')
      .first()
      .should('have.css', 'border-bottom-left-radius', '0px')
      .and('have.css', 'border-bottom-right-radius', '0px')
      .and('have.css', 'corner-top-left-shape', 'superellipse(2)');
    cy.get('.corner-fixture').screenshot('corner-shape');
  });

  it('shares one overridable token between components', () => {
    cy.get('.corner-fixture').invoke('css', '--sd-corner-shape', 'superellipse(1.5)');
    cy.get('.sd-btn').first().should('have.css', 'corner-shape', 'superellipse(1.5)');
    cy.get('.sd-card').should('have.css', 'corner-shape', 'superellipse(1.5)');
    cy.get('.sd-btn-shape-circle').should('have.css', 'corner-shape', 'superellipse(1)');
  });
});
