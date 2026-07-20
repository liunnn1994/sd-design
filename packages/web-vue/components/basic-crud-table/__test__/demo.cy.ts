import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';
const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/basic-crud-table/*.vue',
);
runDemoTests('basic-crud-table', demos, (demoName) => {
  cy.get('.sd-basic-crud-table').should('exist');
  if (demoName === 'full-height') {
    cy.get('.sd-basic-crud-table').should('have.class', 'sd-basic-crud-table-full-height');
    cy.get('.sd-table-container').should('have.class', 'sd-table-scroll-y');
    cy.contains('查询').should('be.visible');
    cy.contains('新建').should('be.visible');
    cy.contains('编辑').should('be.visible');
    cy.contains('删除').should('be.visible');
    cy.get('.sd-pagination').should('be.visible');
    cy.get('input[placeholder="设备名称"]').type('28');
    cy.contains('button', '查询').click();
    cy.contains('边缘节点 28').should('be.visible');
    cy.contains('边缘节点 01').should('not.exist');
    cy.contains('button', '重置').click();
    cy.get('input[placeholder="设备名称"]').should('have.value', '');
    cy.contains('边缘节点 01').should('be.visible');
  }
});
