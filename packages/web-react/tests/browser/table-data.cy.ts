describe('React Table data adapter', () => {
  it('composes nested processing, enabled keys, filtering, sorting and page slicing', () => {
    cy.visit('/table-data.html');
    cy.get('[data-testid="keys"]').should(
      'have.text',
      '{"all":["parent","child","lazy","last"],"current":["parent","child","lazy"],"enabled":["parent","lazy"]}',
    );
    cy.contains('button', 'Sort').click();
    cy.get('[data-testid="rows"]')
      .should('contain', '"key":"lazy"')
      .and('not.contain', '"key":"parent"');
    cy.contains('button', 'Filter').click();
    cy.get('[data-testid="rows"]').should(
      'have.text',
      '[{"key":"last","subtree":false},{"key":"parent","subtree":true,"children":["child"]}]',
    );
    cy.get('[data-testid="raw"]').should('contain', '"key":"child"');
    cy.contains('button', 'Page two').click();
    // Vue keeps all rows when the filtered count is no greater than pageSize.
    cy.get('[data-testid="rows"]').should('contain', '"key":"last"');
  });
  it('includes lazy children in current keys and handles empty expansion policy', () => {
    cy.visit('/table-data.html');
    cy.contains('button', 'Load children').click();
    cy.get('[data-testid="rows"]').should('contain', '"children":["loaded"]');
    cy.get('[data-testid="keys"]').should(
      'contain',
      '"current":["parent","child","lazy","loaded"]',
    );
    cy.get('[data-testid="keys"]').should('contain', '"all":["parent","child","lazy","last"]');
    cy.contains('button', 'Empty children').click();
    cy.get('[data-testid="rows"]').should('contain', '"key":"lazy","subtree":true,"children":[]');
    cy.contains('button', 'Hide empty').click();
    cy.get('[data-testid="rows"]').should('contain', '"key":"lazy","subtree":false,"children":[]');
  });
  it('supports callback row keys and preserves source raw objects', () => {
    cy.visit('/table-data.html');
    cy.contains('button', 'Callback key').click();
    cy.get('[data-testid="rows"]')
      .should('contain', '"key":"key:parent"')
      .and('contain', '"children":["key:child"]');
    cy.get('[data-testid="raw"]')
      .should('contain', '"key":"parent"')
      .and('not.contain', 'key:parent');
    cy.contains('button', 'Page two').click();
    cy.get('[data-testid="rows"]').should('have.text', '[{"key":"key:last","subtree":false}]');
  });
  it('extracts nested fragment declarations in order and reflects removal and changed props', () => {
    cy.visit('/table-data.html');
    cy.get('[data-testid="columns"]').should(
      'have.text',
      '[{"title":"Initial","dataIndex":"age"},{"title":"Group","children":[{"dataIndex":"group","title":"Child"}]}]',
    );
    cy.contains('button', 'Change declarations').click();
    cy.get('[data-testid="columns"]').should(
      'have.text',
      '[{"title":"Changed","dataIndex":"age"}]',
    );
  });
});
