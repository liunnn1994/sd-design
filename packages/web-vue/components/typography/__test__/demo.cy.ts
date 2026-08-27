import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/typography/*.vue',
);
const demoSources = import.meta.glob<string>(
  '../../../../sd-vue-docs/src/components/generated/typography/*.vue',
  { eager: true, import: 'default', query: '?raw' },
);

runDemoTests('typography', demos, (demoName) => {
  cy.document().its('body.children.length').should('be.greaterThan', 0);

  if (demoName === 'ellipsis') {
    const source = Object.entries(demoSources).find(([filePath]) =>
      filePath.endsWith('/ellipsis.vue'),
    )?.[1];

    expect(source).not.to.contain('css: true');
    expect(source).not.to.contain('lang="scss"');
    expect(source).not.to.contain("expanded ? ''");
    cy.contains('strong', '单行省略').should('be.visible');
    cy.contains('strong', '多行省略与提示').should('be.visible');
    cy.contains('strong', '后缀与自定义展开').should('be.visible');
    cy.contains('strong', '默认展开操作').should('be.visible');
    cy.get('.sd-typography[data-part="root"]')
      .should('have.length', 4)
      .first()
      .should('have.css', 'width', '448px');

    cy.get('.sd-typography[data-part="root"] [data-part="body"]').should(($bodies) => {
      $bodies.each((_, body) => {
        expect(body.textContent).to.contain('...');
      });
    });
    cy.contains('.sd-typography-operation-expand', '展开').eq(0).click();
    cy.contains('.sd-typography-operation-expand', '收起').should('be.visible').click();
    cy.get('.sd-typography[data-part="root"]')
      .eq(2)
      .find('[data-part="body"]')
      .should('contain.text', '...');
  }
});
