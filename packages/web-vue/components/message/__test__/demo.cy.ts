import type { Component } from 'vue';

import { Message } from '@sdata/web-vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/message/*.vue',
);

runDemoTests('message', demos, () => {
  Message.clear();
  cy.get('.sd-btn').first().click();
  cy.get('.sd-message').should('exist');
});
