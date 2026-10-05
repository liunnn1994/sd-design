import { h } from 'vue';

import PanelGroup, { Panel, PanelSeparator } from '../index';

describe('PanelGroup robustness', () => {
  it('refreshes separator bounds when a numeric-size group resizes outside Vue', () => {
    cy.mount(PanelGroup, {
      attrs: { style: 'width: 800px; height: 300px' },
      slots: { default: () => [h(Panel, { size: 200 }), h(PanelSeparator), h(Panel)] },
    });
    cy.get('.sd-panel-separator-grip').should('have.attr', 'aria-valuemax', '800');
    cy.get('.sd-panel-group').invoke('css', 'width', '400px');
    cy.get('.sd-panel-fill').should('have.css', 'width', '200px');
    cy.get('.sd-panel-separator-grip').should('have.attr', 'aria-valuemax', '400');
  });
});
