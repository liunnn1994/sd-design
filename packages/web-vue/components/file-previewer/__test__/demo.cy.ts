import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/file-previewer/*.vue',
);

runDemoTests('file-previewer', demos, () => {
  cy.get('[class*="sd-file-previewer"], button, [class*="sd-"]').should('exist');
});
