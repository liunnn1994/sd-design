import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tour/*.vue',
);

runDemoTests('tour', demos, (demoName) => {
  cy.get('[class*="sd-"]').should('exist');
  cy.get('.sd-btn').first().click();
  cy.get('.driver-popover').should('be.visible');
  if (demoName === 'basic') {
    cy.get('.driver-popover-title').should('have.text', '筛选条件');
    cy.get('.driver-popover-next-btn').click();
    cy.get('.driver-popover-title').should('have.text', '结果面板');
  } else if (demoName === 'buttons') {
    cy.get('.driver-popover-description strong').should('contain.text', 'Vue 组件');
    cy.contains('.driver-popover-footer .sd-btn', '下一步').should('be.disabled');
    cy.get('body').trigger('keyup', { key: 'ArrowRight' });
    cy.get('.driver-popover-title').should('contain.text', '自定义内容');
    cy.get('.driver-popover-description .sd-checkbox').click();
    cy.contains('.driver-popover-footer .sd-btn', '下一步').click();
    cy.get('.driver-popover-description .sd-alert').should('exist');
    cy.contains('.driver-popover-footer .sd-btn', '重新开始').click();
    cy.get('.driver-popover-title').should('contain.text', '自定义内容');
  } else if (demoName === 'controlled') {
    cy.get('.driver-popover-title').should('have.text', '第二个目标');
    cy.contains('#tour-api-second .sd-btn', '结束导览').click();
    cy.get('.driver-popover').should('not.exist');
    return;
  } else {
    cy.get('.driver-popover-title').should('have.text', '单元素高亮');
  }
  cy.get('.driver-popover-close-btn').click();
  cy.get('.driver-popover').should('not.exist');
});
