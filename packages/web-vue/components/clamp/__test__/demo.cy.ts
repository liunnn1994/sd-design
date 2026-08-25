import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/clamp/*.vue',
);
const demoSources = import.meta.glob<string>(
  '../../../../sd-vue-docs/src/components/generated/clamp/*.vue',
  { eager: true, import: 'default', query: '?raw' },
);

runDemoTests('clamp', demos, (demoName) => {
  const source = Object.entries(demoSources).find(([filePath]) =>
    filePath.endsWith(`/${demoName}.vue`),
  )?.[1];

  expect(source).not.to.contain('<style scoped lang="scss">');
  cy.get('[data-part="root"]').should('exist');

  if (demoName === 'line') {
    cy.get('[data-part="root"]')
      .should('have.css', 'width', '256px')
      .find('[data-part="content"]')
      .should('have.css', '-webkit-line-clamp', '2')
      .and(($content) => {
        expect($content[0].scrollHeight).to.be.greaterThan($content[0].clientHeight);
      });
  }

  if (demoName === 'inline') {
    cy.get('[data-part="root"]')
      .should('have.css', 'width', '192px')
      .find('[data-part="body"]')
      .should('contain.text', '…');
  }

  if (demoName === 'expand') {
    cy.contains('button', '展开').should('be.visible').click();
    cy.contains('button', '收起').should('be.visible');
  }

  if (demoName === 'rich-wrap') {
    cy.get('.wrap-clamp-demo [data-part="content"]')
      .should('have.css', 'gap', '8px')
      .and('have.css', 'align-items', 'center');
    cy.get('.wrap-clamp-demo')
      .contains(/^\+\d+$/)
      .should('be.visible');
  }
});
