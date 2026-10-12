import type { Component } from 'vue';

import { Message } from '@sdata/web-vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/message/*.vue',
);

runDemoTests('message', demos, (demoName) => {
  Message.clear();
  if (demoName === 'type') {
    const types = ['info', 'success', 'warning', 'error', 'normal', 'normal', 'loading'];
    types.forEach((type, index) => {
      cy.get('.sd-btn').eq(index).click();
      cy.get('.sd-message')
        .last()
        .should(
          'contain.text',
          `This is ${type === 'info' || type === 'error' ? 'an' : 'a'} ${type} message!`,
        );
    });
    return;
  }
  cy.get('.sd-btn').first().click();
  cy.get('.sd-message').should('exist');
});
