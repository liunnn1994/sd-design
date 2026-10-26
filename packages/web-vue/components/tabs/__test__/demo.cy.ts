import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tabs/*.vue',
);

runDemoTests('tabs', demos, (demoName) => {
  cy.get('.sd-tabs').should('exist');
  if (demoName === 'scroll') {
    cy.get('.sd-tabs-tab-active').should('have.length', 1).and('contain.text', '标签页 1');
    cy.get('.sd-tabs-content-item-active').should('have.text', '标签页面板内容 1');
    cy.contains('.sd-tabs-tab', /^标签页 2$/).click();
    cy.get('.sd-tabs-content-item-active').should('have.text', '标签页面板内容 2');
    cy.contains('.sd-btn', '切换：').click();
    cy.get('.sd-tabs-tab-active').should('have.length', 1);
    cy.get('.sd-tabs-content-item-active').should('be.visible');
  }
});
