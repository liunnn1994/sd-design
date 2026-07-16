import Rate from '../index';

describe('Rate readonly tip', () => {
  it('shows a tooltip when clicking a readonly rate', () => {
    cy.mount(Rate, { props: { readonly: true, modelValue: 3 } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('.sd-rate-character').first().click();
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the rate is not readonly', () => {
    cy.mount(Rate, { props: { modelValue: 3 } });
    cy.get('.sd-rate-character').first().click();
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
