import type { Component } from 'vue';

import { Notification } from '@sdata/web-vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/notification/*.vue',
);

runDemoTests('notification', demos, (demoName) => {
  if (demoName === 'basic') {
    Notification.clear();
    cy.get('.sd-btn').first().click();
    cy.get('.sd-notification').should('contain.text', '这是一条通知！');
    return;
  }
  cy.get('.sd-btn, button, [class*="sd-"]').should('exist');
});
