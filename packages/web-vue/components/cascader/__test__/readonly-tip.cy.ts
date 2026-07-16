import Cascader from '../index';

describe('Cascader readonly tip', () => {
  it('shows a tooltip when clicking a readonly cascader', () => {
    cy.mount(Cascader, { props: { readonly: true, options: [{ value: 'a', label: 'A' }] } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('.sd-select-view').click();
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the cascader is not readonly', () => {
    cy.mount(Cascader, { props: { options: [{ value: 'a', label: 'A' }] } });
    cy.get('.sd-select-view').click();
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
