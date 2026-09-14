import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tag-group/*.vue',
);

runDemoTests('tag-group', demos, () => {
  cy.get('.sd-tag-group, [class*="sd-tag"]').should('exist');
});

describe('<tag-group> responsive demo', () => {
  it('resizes continuously while dragging the panel separator', () => {
    cy.wrap(
      demos['../../../../sd-vue-docs/src/components/generated/tag-group/responsive.vue'](),
    ).then((mod) => cy.mount(mod.default));

    cy.viewport(500, 500);
    // 等待初始同步与动画稳定后再断言
    cy.wait(450);
    cy.get('.sd-panel').should('have.css', 'width', '300px');
    // 引擎只消费指针位移的增量，坐标本身不需要对准 grip
    cy.get('.sd-panel-separator-grip')
      .trigger('pointerdown', { clientX: 320, clientY: 40, pointerId: 1 })
      .trigger('pointermove', { clientX: 220, clientY: 40, pointerId: 1 })
      .trigger('pointerup', { clientX: 220, clientY: 40, pointerId: 1 });
    cy.get('.sd-panel').should('have.css', 'width', '200px');
  });
});
