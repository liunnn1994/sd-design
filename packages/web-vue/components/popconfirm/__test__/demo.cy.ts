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
  it('opens without a missing form model warning', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
    });

    cy.mount(AsyncDemo);
    cy.contains('button', 'Click To Show').click();

    cy.get('@consoleWarn').should((consoleWarn) => {
      expect(consoleWarn).not.to.have.been.calledWithMatch(
        Cypress.sinon.match('Missing required prop: "model"'),
      );
    });
  });
});
