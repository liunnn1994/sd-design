describe('React Cascader shared state adapters', () => {
  it('navigates enabled siblings and filtered search results with wraparound', () => {
    cy.visit('/cascader-state.html');
    cy.contains('button', 'Next').click();
    cy.get('[data-testid="active"]').should('have.text', 'a');
    cy.contains('button', 'Next').click();
    cy.get('[data-testid="active"]').should('have.text', 'b');
    cy.contains('button', 'Next').click();
    cy.get('[data-testid="active"]').should('have.text', 'a');
    cy.contains('button', 'Activate child').click();
    cy.contains('button', 'Previous').click();
    cy.get('[data-testid="active"]').should('have.text', 'a-two');
    cy.contains('button', 'Reset').click();
    cy.contains('button', 'Search').click();
    cy.contains('button', 'Next').click();
    cy.get('[data-testid="active"]').should('have.text', 'a-two');
  });
  it('expands selected paths and resets displayed columns', () => {
    cy.visit('/cascader-state.html');
    cy.contains('button', 'Select A').click();
    cy.get('[data-testid="path"]').should('have.text', 'a');
    cy.get('[data-testid="columns"]').should('have.text', 'a,b,c|a-one,a-two');
    cy.contains('button', 'Expand').click();
    cy.contains('button', 'Select A').click();
    cy.get('[data-testid="path"]').should('have.text', 'a,a-one');
    cy.contains('button', 'Reset').click();
    cy.get('[data-testid="columns"]').should('have.text', 'a,b,c');
  });
  it('deduplicates loads in StrictMode and rejects loading disabled or leaf nodes', () => {
    cy.visit('/cascader-state.html');
    cy.contains('button', 'Load guarded').click();
    cy.get('[data-testid="requests"]').should('have.text', '0');
    cy.contains('button', /^Load$/)
      .click()
      .click();
    cy.get('[data-testid="requests"]').should('have.text', '1');
    cy.get('[data-testid="loading"]').should('have.text', 'true');
    cy.contains('button', 'Complete oldest').click();
    cy.get('[data-testid="loading"]').should('have.text', 'false');
    cy.get('[data-testid="children"]').should('have.text', 'Loaded');
    cy.contains('button', /^Load$/).click();
    cy.get('[data-testid="requests"]').should('have.text', '1');
  });
  it('rejects stale callbacks for a replaced option without clearing the new request', () => {
    cy.visit('/cascader-state.html');
    cy.contains('button', /^Load$/).click();
    cy.contains('button', 'Replace').click();
    cy.get('[data-testid="loading"]').should('have.text', 'false');
    cy.contains('button', /^Load$/).click();
    cy.get('[data-testid="requests"]').should('have.text', '2');
    cy.contains('button', 'Complete oldest').click();
    cy.get('[data-testid="applied"]').should('have.text', '0');
    cy.get('[data-testid="loading"]').should('have.text', 'true');
    cy.contains('button', 'Complete oldest').click();
    cy.get('[data-testid="applied"]').should('have.text', '1');
    cy.get('[data-testid="children"]').should('have.text', 'Loaded');
  });
  it('ignores a late completion after unmount and loads again after remount', () => {
    cy.visit('/cascader-state.html');
    cy.contains('button', /^Load$/).click();
    cy.contains('button', 'Mount').click();
    cy.contains('button', 'Complete oldest').click();
    cy.get('[data-testid="applied"]').should('have.text', '0');
    cy.contains('button', 'Mount').click();
    cy.contains('button', /^Load$/).click();
    cy.contains('button', 'Complete oldest').click();
    cy.get('[data-testid="applied"]').should('have.text', '1');
  });
  it('clears rejected loading state and allows retry with the latest loader', () => {
    cy.visit('/cascader-state.html?fail');
    cy.contains('button', /^Load$/).click();
    cy.get('[data-testid="loading"]').should('have.text', 'false');
    cy.contains('button', 'Allow load').click();
    cy.contains('button', /^Load$/).click();
    cy.get('[data-testid="loading"]').should('have.text', 'true');
    cy.contains('button', 'Complete oldest').click();
    cy.get('[data-testid="children"]').should('have.text', 'Loaded');
  });
});
