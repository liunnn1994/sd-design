import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/cropper/*.vue',
);

runDemoTests('cropper', demos, () => {
  cy.get('.sd-cropper').should('exist');
  cy.get('cropper-canvas').should('exist');
  cy.get('cropper-image').should('exist');
  cy.get('cropper-selection').should('exist');
});
