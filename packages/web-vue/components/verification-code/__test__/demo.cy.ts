import type { Component } from 'vue';

import { Message } from '@sdata/web-vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/verification-code/*.vue',
);

runDemoTests('verification-code', demos, (demoName) => {
  if (demoName === 'separator') {
    Message.clear();
    for (let index = 0; index < 9; index++) {
      cy.get('input')
        .eq(index)
        .type(String(index + 1));
    }
    cy.get('.sd-message').should('contain.text', 'Verification code: 123456789');
    return;
  }
  cy.get('[class*="sd-"]').should('exist');
});
