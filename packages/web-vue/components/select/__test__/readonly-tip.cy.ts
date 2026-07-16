import Select from '../index';

describe('Select readonly tip', () => {
  it('shows a tooltip and blocks the dropdown when clicking a readonly select', () => {
    cy.mount(Select, { props: { readonly: true, options: [{ label: 'A', value: 'a' }] } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('.sd-select-view').click();
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
    // readonly blocks the dropdown from opening
    cy.get('.sd-select-dropdown').should('not.be.visible');
  });

  it('does not show a tooltip when the select is not readonly', () => {
    cy.mount(Select, { props: { options: [{ label: 'A', value: 'a' }] } });
    cy.get('.sd-select-view').click();
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
