import { moveMouseTo } from '../../../web-core/tests/browser/hover-intent';

describe('React Select option tooltip lifecycle', () => {
  for (const ellipsis of ['default', 'performant']) {
    for (const virtual of [false, true]) {
      it(`hides the ${ellipsis} tooltip before the dropdown leaves, virtual=${virtual}`, () => {
        cy.visit(`/select-option-tooltip.html?tooltip=${ellipsis}${virtual ? '&virtual' : ''}`);
        const trigger = '[data-testid="select-option-tooltip"]';
        const option = '.sd-select-option';
        cy.get(trigger).click();
        moveMouseTo(`${option} :is(.sd-ellipsis, .sd-performant-ellipsis)`);
        cy.get('[role="tooltip"]').should('be.visible');
        cy.get(option)
          .first()
          .then(([$option]) => {
            const dropdown = $option.closest('.sd-select-dropdown')!;
            const { ownerDocument } = dropdown;
            const win = ownerDocument.defaultView!;
            $option.click();
            return new Cypress.Promise<void>((resolve, reject) => {
              win.requestAnimationFrame(() => {
                try {
                  expect(dropdown.getClientRects().length).to.be.greaterThan(0);
                  const hasVisibleTooltip = [
                    ...ownerDocument.querySelectorAll('[role="tooltip"]'),
                  ].some((tooltip) =>
                    tooltip.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }),
                  );
                  expect(hasVisibleTooltip, 'tooltip during dropdown leave').to.equal(false);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              });
            });
          });
        cy.get('.sd-select-dropdown').should('not.be.visible');
        cy.get(trigger).click();
        cy.get('.sd-select-dropdown').should('be.visible');
        cy.get('[role="tooltip"]:visible').should('not.exist');
      });
    }
  }
});
