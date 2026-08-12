import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tag-group/*.vue',
);

runDemoTests('tag-group', demos, () => {
  cy.get('.sd-tag-group, [class*="sd-tag"]').should('exist');
});

describe('<tag-group> responsive demo', () => {
  it('resizes continuously while dragging the right trigger', () => {
    cy.wrap(
      demos['../../../../sd-vue-docs/src/components/generated/tag-group/responsive.vue'](),
    ).then((mod) => cy.mount(mod.default));

    cy.viewport(500, 500);
    cy.get('.sd-resizebox').should('have.css', 'width', '300px');
    cy.get('.sd-resizebox').should('have.css', 'max-width', 'none');
    cy.get('.sd-resizebox-direction-right').trigger('mousedown', {
      pageX: 300,
      pageY: 0,
      force: true,
    });
    cy.window().trigger('mousemove', { pageX: 400, pageY: 0 });
    cy.get('.sd-resizebox').should('have.css', 'width', '394px');
    cy.window().trigger('mousemove', { pageX: 600, pageY: 0 });
    cy.get('.sd-resizebox').should('have.css', 'width', '594px');
    cy.window().trigger('mouseup', { pageX: 600, pageY: 0 });
  });
});
