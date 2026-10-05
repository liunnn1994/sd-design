import { PerformantEllipsis } from '../index';

describe('PerformantEllipsis line limit fallback', () => {
  for (const lineClamp of [0, 'invalid']) {
    it(`keeps the one-line fallback before and after activation for ${lineClamp}`, () => {
      cy.mount(PerformantEllipsis, {
        props: { lineClamp, tooltip: false },
        attrs: { style: 'width: 120px' },
        slots: { default: 'Long content '.repeat(30) },
      });
      cy.get('.sd-ellipsis').should('have.css', '-webkit-line-clamp', '1');
      cy.get('.sd-ellipsis').trigger('mouseenter');
      cy.get('.sd-ellipsis[data-part="root"]').should('have.css', '-webkit-line-clamp', '1');
    });
  }
});
