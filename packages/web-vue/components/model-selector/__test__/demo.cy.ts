import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/model-selector/*.vue',
);

runDemoTests('model-selector', demos, (demoName) => {
  if (demoName === 'controlled') {
    cy.contains('button', '打开受控选择器').click();
  } else {
    cy.get('.sd-model-selector-trigger').click();
  }

  cy.get('body > .sd-modal-container').should('be.visible');

  if (demoName === 'custom') {
    cy.get('.sd-model-selector-item')
      .first()
      .should(($item) => {
        const nameRect = $item[0].querySelector('.sd-model-selector-name')!.getBoundingClientRect();
        const logoGroupRect = $item[0]
          .querySelector('.sd-model-selector-logo-group')!
          .getBoundingClientRect();
        const shortcutRect = $item[0]
          .querySelector('.sd-model-selector-shortcut')!
          .getBoundingClientRect();

        expect(nameRect.left).to.be.lessThan(logoGroupRect.left);
        expect(logoGroupRect.right).to.be.lessThan(shortcutRect.left);
      });

    cy.get('.sd-model-selector-item')
      .eq(1)
      .should(($item) => {
        const nameRect = $item[0].querySelector('.sd-model-selector-name')!.getBoundingClientRect();
        const logoRect = $item[0].querySelector('.sd-model-selector-logo')!.getBoundingClientRect();
        const shortcutRect = $item[0]
          .querySelector('.sd-model-selector-shortcut')!
          .getBoundingClientRect();

        expect(nameRect.left).to.be.lessThan(logoRect.left);
        expect(logoRect.right).to.be.lessThan(shortcutRect.left);
      });
  }
});
