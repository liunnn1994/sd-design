import { moveMouseAway, moveMouseTo } from '../../../web-core/tests/browser/hover-intent';

describe('React PerformantEllipsis', () => {
  it('opens on the first hover and closes when the pointer leaves', () => {
    cy.visit('/clamp');
    cy.get('[data-testid="lazy-hover"] [data-ellipsis-measure]').should('not.exist');
    moveMouseTo('[data-testid="lazy-hover"]');
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '延迟激活的省略提示包含完整文本内容');
    moveMouseAway();
    cy.get('[role="tooltip"]').should('not.exist');
  });
});
