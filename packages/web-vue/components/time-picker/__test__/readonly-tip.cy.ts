import TimePicker from '../index';

describe('TimePicker readonly tip', () => {
  it('shows a tooltip when typing into a readonly time-picker', () => {
    cy.mount(TimePicker, { props: { readonly: true } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('.sd-picker input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the time-picker is not readonly', () => {
    cy.mount(TimePicker, { props: {} });
    cy.get('.sd-picker input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
