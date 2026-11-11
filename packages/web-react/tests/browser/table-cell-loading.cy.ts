describe('React Table cell loading adapter', () => {
  it('deduplicates requests and retains a pending request when its raw row is rewrapped', () => {
    cy.visit('/table-cell-loading.html');
    cy.get('[data-testid="cell"]').click().click().should('have.text', 'original:true');
    cy.get('output').should('have.text', '1::0');
    cy.contains('button', 'Rewrap').click();
    cy.get('[data-testid="cell"]').should('have.text', 'original:true');
    cy.contains('button', 'Resolve oldest').click();
    cy.get('[data-testid="cell"]').should('have.text', 'original:false');
    cy.get('output').should('have.text', '1:original:0');
  });
  it('ignores replaced and unmounted row requests without clearing the replacement request', () => {
    cy.visit('/table-cell-loading.html');
    cy.get('[data-testid="cell"]').click();
    cy.contains('button', 'Replace').click();
    cy.get('[data-testid="cell"]').should('have.text', 'replacement:false').click();
    cy.contains('button', 'Resolve oldest').click();
    cy.get('[data-testid="cell"]').should('have.text', 'replacement:true');
    cy.get('output').should('have.text', '2::0');
    cy.contains('button', 'Toggle mount').click();
    cy.contains('button', 'Resolve oldest').click();
    cy.contains('button', 'Toggle mount').click();
    cy.get('[data-testid="cell"]').should('have.text', 'replacement:false');
    cy.get('output').should('have.text', '2::0');
  });
  it('does not request children for leaves or already loaded child lists', () => {
    cy.visit('/table-cell-loading.html');
    cy.contains('button', 'Leaf').click();
    cy.get('[data-testid="cell"]').click();
    cy.contains('button', 'Children').click();
    cy.get('[data-testid="cell"]').click();
    cy.get('output').should('have.text', '0::0');
  });
});
