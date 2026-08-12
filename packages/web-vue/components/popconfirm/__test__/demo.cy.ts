import type { Component } from 'vue';

import AsyncDemo from '../../../../sd-vue-docs/src/components/generated/popconfirm/async.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/popconfirm/*.vue',
);

runDemoTests('popconfirm', demos, () => {
  cy.get('.sd-btn, button, [class*="sd-"]').should('exist');
});

describe('<popconfirm> async demo', () => {
  it('closes asynchronously without console errors', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
      cy.spy(win.console, 'error').as('consoleError');
      cy.clock();
    });

    cy.mount(AsyncDemo);
    cy.contains('button', 'Click To Show').click();
    cy.get('.sd-popconfirm-popup-content').should('be.visible');
    cy.get('.sd-popconfirm-popup-content button').last().click();
    cy.get('.sd-popconfirm-popup-content .sd-btn-loading').should('exist');
    cy.tick(3000);
    cy.get('.sd-popconfirm-popup-content').should('not.be.visible');

    cy.get('@consoleWarn').should((consoleWarn) => {
      expect(consoleWarn).not.to.have.been.calledWithMatch(
        Cypress.sinon.match('Missing required prop: "model"'),
      );
    });
    cy.get('@consoleError').should('not.have.been.called');
  });
});
