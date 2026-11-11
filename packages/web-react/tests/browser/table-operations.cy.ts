describe('React Table operation views', () => {
  beforeEach(() => cy.visit('/table-operations.html'));
  it('selects enabled leafs through the tree checkbox without triggering row clicks', () => {
    cy.get('[data-testid="parent"] .sd-checkbox').click();
    cy.get('output').should('have.text', '["off-page",1]:0:false');
    cy.get('[data-testid="parent"] input').should('be.checked');
    cy.get('.sd-table-th input').should('be.checked');
    cy.get('[data-testid="disabled"] input').should('be.disabled').and('not.be.checked');
    cy.get('.sd-table-th .sd-checkbox').click();
    cy.get('output').should('have.text', '["off-page"]:0:false');
  });
  it('supports radio rows and keeps the disabled row disabled', () => {
    cy.contains('button', 'Radio').click();
    cy.get('[data-testid="parent"] .sd-radio').click();
    cy.get('output').should('have.text', '["parent"]:0:false');
    cy.get('[data-testid="parent"] input[type="radio"]').should('be.checked');
    cy.get('[data-testid="disabled"] input[type="radio"]').should('be.disabled');
  });
  it('renders operation offsets, expansion and a custom drag handle, leaving summary actions empty', () => {
    cy.get('[data-testid="parent"] .sd-table-expand').should('have.css', 'left', '50px');
    cy.get('[data-testid="parent"] .sd-table-drag-handle').should('have.text', 'Drag');
    cy.contains('button', 'Expand').click();
    cy.get('output').should('have.text', '["off-page"]:0:true');
    cy.get('[data-testid="summary"] .sd-table-cell').should('be.empty');
    cy.get('[data-testid="summary"] .sd-table-td').should('have.css', 'grid-row', 'span 2');
  });
  it('uses a custom operation renderer before the built-in control and suppresses it for summaries', () => {
    cy.contains('button', 'Custom').click();
    cy.get('[data-testid="parent"] strong').should('have.text', 'Custom:parent');
    cy.get('[data-testid="parent"] input').should('not.exist');
    cy.get('[data-testid="summary"] strong').should('not.exist');
  });
});
