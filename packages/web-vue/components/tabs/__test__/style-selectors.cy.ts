import { defineComponent, h } from 'vue';

import ConfigProvider from '../../config-provider';
import Tabs, { TabPane, type TabsProps } from '../index';

function mountTabs(props: TabsProps = {}, rtl = false) {
  cy.mount(
    defineComponent({
      setup: () => () =>
        h(ConfigProvider, { rtl }, () =>
          h(Tabs, props, () =>
            [1, 2, 3].map((key) => h(TabPane, { key, title: `Tab ${key}` }, () => `Panel ${key}`)),
          ),
        ),
    }),
  );
}

describe('Tabs style selectors', () => {
  it('applies the first line tab margin token', () => {
    mountTabs();
    cy.get('.sd-tabs').invoke('css', '--component-tabs-line-margin-title-horizontal-first', '23px');
    cy.get('.sd-tabs-tab').first().should('have.css', 'margin-left', '23px');
  });

  for (const type of ['line', 'text'] as const) {
    it(`removes the first ${type} tab margin when headerPadding is false`, () => {
      mountTabs({ type, headerPadding: false });
      cy.get('.sd-tabs-tab').first().should('have.css', 'margin-left', '0px');
    });

    it(`removes the first RTL ${type} tab margin when headerPadding is false`, () => {
      mountTabs({ type, headerPadding: false }, true);
      cy.get('.sd-tabs-tab').first().should('have.css', 'margin-right', '0px');
    });
  }

  it('places RTL close button spacing before the button', () => {
    mountTabs({ editable: true }, true);
    cy.get('.sd-tabs-tab-close-btn')
      .first()
      .should('have.css', 'margin-right', '8px')
      .and('have.css', 'margin-left', '0px');
  });

  it('mirrors the outer RTL card borders and corners', () => {
    mountTabs({ type: 'card' }, true);
    cy.get('.sd-tabs').invoke('css', '--component-tabs-card-border-radius', '13px');
    cy.get('.sd-tabs-tab')
      .first()
      .should('have.css', 'border-left-width', '0px')
      .and('have.css', 'border-right-width', '1px')
      .and('have.css', 'border-top-left-radius', '0px')
      .and('have.css', 'border-top-right-radius', '13px');
    cy.get('.sd-tabs-tab')
      .last()
      .should('have.css', 'border-left-width', '1px')
      .and('have.css', 'border-top-left-radius', '13px')
      .and('have.css', 'border-top-right-radius', '0px');
  });

  it('mirrors RTL editable card padding', () => {
    mountTabs({ type: 'card', editable: true }, true);
    cy.get('.sd-tabs-tab')
      .first()
      .should('have.css', 'padding-left', '12px')
      .and('have.css', 'padding-right', '16px');
  });

  it('places RTL card gutter spacing between tabs', () => {
    mountTabs({ type: 'card-gutter' }, true);
    cy.get('.sd-tabs-tab').first().should('have.css', 'margin-right', '0px');
    cy.get('.sd-tabs-tab')
      .eq(1)
      .should('have.css', 'margin-right', '4px')
      .and('have.css', 'margin-left', '0px');
  });

  for (const type of ['text', 'capsule'] as const) {
    it(`places the RTL ${type} separator before its tab`, () => {
      mountTabs({ type }, true);
      cy.get('.sd-tabs-tab')
        .eq(1)
        .should(($tab) => {
          const style = getComputedStyle($tab[0], '::before');
          expect(parseFloat(style.left)).to.be.greaterThan(0);
          expect(parseFloat(style.right)).to.be.lessThan(0);
        });
    });
  }

  it('places RTL capsule spacing between tabs', () => {
    mountTabs({ type: 'capsule' }, true);
    cy.get('.sd-tabs-tab')
      .eq(1)
      .should('have.css', 'margin-right', '3px')
      .and('have.css', 'margin-left', '0px');
  });
});
