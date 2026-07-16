import DatePicker from '../index';

describe('DatePicker readonly tip', () => {
  it('shows a tooltip when typing into a readonly date-picker', () => {
    cy.mount(DatePicker, { props: { readonly: true } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('.sd-picker input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the date-picker is not readonly', () => {
    cy.mount(DatePicker, { props: {} });
    cy.get('.sd-picker input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
