import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/layout/*.vue',
);

runDemoTests('layout', demos, () => {
  cy.get('.sd-layout, [class*="sd-layout"]').should('exist');
  cy.get('body').then(($body) => {
    if ($body.find('.layout-fixed-demo').length) {
      cy.get('.layout-fixed-demo .header')
        .should('have.css', 'position', 'sticky')
        .and('have.css', 'height', '64px');
    }
    if ($body.find('.layout-custom-trigger-demo').length) {
      cy.get('.layout-custom-trigger-demo .header')
        .should('have.css', 'padding', '0px')
        .and('have.css', 'height', '64px');
      cy.get('.layout-custom-trigger-demo .trigger').click();
      cy.get('.layout-custom-trigger-demo .sd-layout-sider-collapsed').should('exist');
    }
  });
});
