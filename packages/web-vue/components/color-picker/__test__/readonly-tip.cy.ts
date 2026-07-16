import ColorPicker from '../index';

describe('ColorPicker readonly tip', () => {
  it('shows a tooltip when clicking a readonly color-picker', () => {
    cy.mount(ColorPicker, { props: { readonly: true } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('.sd-color-picker').click();
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the color-picker is not readonly', () => {
    cy.mount(ColorPicker, { props: {} });
    cy.get('.sd-color-picker').click();
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
