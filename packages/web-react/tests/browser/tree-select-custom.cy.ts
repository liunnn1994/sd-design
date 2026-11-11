describe('React TreeSelect custom content', () => {
  it('updates a custom trigger and retains raw selection in the displayed state', () => {
    cy.visit('/tree-select-root.html?custom');
    cy.contains('button', 'Pick team').click().should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-tree-select-header').should('have.text', 'Choose team');
    cy.get('.sd-tree-select-footer').should('have.text', 'Team footer');
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.contains('button', 'One').should('have.attr', 'aria-expanded', 'false');
    cy.contains('button', 'Focus').click();
    cy.contains('button', 'One').should('be.focused');
  });
  for (const show of [false, true])
    it(`applies header/footer visibility on empty data with flags=${show}`, () => {
      cy.visit(`/tree-select-root.html?custom&empty${show ? '&showempty' : ''}`);
      cy.contains('button', 'Pick team').click();
      cy.get('.sd-tree-select-popup').should('contain.text', 'No teams');
      cy.get('.sd-tree-select-header').should(show ? 'exist' : 'not.exist');
      cy.get('.sd-tree-select-footer').should(show ? 'exist' : 'not.exist');
      cy.get('.sd-tree-select-popup [role="tree"]').should('not.exist');
    });
  it('renders a custom loader before the actual panel becomes available', () => {
    cy.visit('/tree-select-root.html?loading');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup').should('contain.text', 'Loading teams');
    cy.get('.sd-tree-select-popup [role="tree"]').should('not.exist');
    cy.contains('button', 'Finish loading').click();
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup [role="tree"]').should('be.visible');
  });
});
