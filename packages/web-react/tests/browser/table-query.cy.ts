describe('React Table query adapters', () => {
  it('restores selective filter defaults and resets when column defaults change', () => {
    cy.visit('/table-query.html');
    cy.contains('button', 'Edit').click();
    cy.get('[data-testid="filters"]').should(
      'have.text',
      '{"first":["edited"],"second":["retained"]}',
    );
    cy.contains('button', 'Reset first').click();
    cy.get('[data-testid="filters"]').should(
      'have.text',
      '{"first":["initial"],"second":["retained"]}',
    );
    cy.contains('button', 'Change defaults').click();
    cy.get('[data-testid="filters"]').should(
      'have.text',
      '{"first":["changed"],"second":["keep"]}',
    );
    cy.get('[data-testid="sorter"]').should('have.text', '{"field":"first","direction":"descend"}');
    cy.contains('button', 'Clear filters').click();
    cy.get('[data-testid="filters"]').should('have.text', '{"first":[],"second":[]}');
  });
  it('preserves controlled empty filters and sort direction while notifying reset callers', () => {
    cy.visit('/table-query.html?controlled');
    cy.contains('button', 'Edit').click();
    cy.get('[data-testid="filters"]').should('have.text', '{"first":[],"second":["retained"]}');
    cy.get('[data-testid="sorter"]').should(
      'have.text',
      '{"field":"second","direction":"descend"}',
    );
    cy.contains('button', 'Reset sorters').click();
    cy.get('[data-testid="events"]').should('have.text', 'sort:first:ascend,sort:second:');
    cy.get('[data-testid="sorter"]').should(
      'have.text',
      '{"field":"second","direction":"descend"}',
    );
  });
  it('retains Vue clear-sort notification semantics and uses current callbacks', () => {
    cy.visit('/table-query.html');
    cy.contains('button', 'Edit').click();
    cy.contains('button', 'Clear sorters').click();
    cy.get('[data-testid="events"]').should('have.text', 'sort:first:,sort:second:');
    cy.get('[data-testid="sorter"]').should('have.text', '{"field":"first","direction":"descend"}');
    cy.contains('button', 'Reset sorters').click();
    cy.get('[data-testid="sorter"]').should('have.text', '{"field":"first","direction":"ascend"}');
  });
  it('initializes pagination defaults, respects controlled values and retains local changes', () => {
    cy.visit('/table-query.html');
    cy.get('[data-testid="page"]').should('have.text', '2:5');
    cy.contains('button', 'Page').click();
    cy.contains('button', 'Size').click();
    cy.get('[data-testid="page"]').should('have.text', '3:15');
    cy.contains('button', 'Toggle controlled').click();
    cy.contains('button', 'Page').click();
    cy.contains('button', 'Size').click();
    cy.get('[data-testid="page"]').should('have.text', '7:20');
    cy.get('[data-testid="events"]').should('have.text', 'page:3,size:15,page:3,size:15');
    cy.contains('button', 'Toggle controlled').click();
    cy.get('[data-testid="page"]').should('have.text', '3:15');
  });
});
