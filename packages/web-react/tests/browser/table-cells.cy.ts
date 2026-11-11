describe('React Table cell views', () => {
  beforeEach(() => cy.visit('/table-cells.html'));
  it('renders row semantics, custom element groups, fixed offsets and summary spans with shared CSS', () => {
    cy.get('section.sd-table-thead[role="rowgroup"]').should('exist');
    cy.get('article.sd-table-tbody[role="rowgroup"] .sd-table-tr-checked').should(
      'have.attr',
      'role',
      'row',
    );
    cy.get('.sd-table-th')
      .first()
      .should('have.class', 'sd-table-col-fixed-left-last')
      .and('have.css', 'left', '40px');
    cy.get('.sd-table-th')
      .last()
      .should('have.class', 'sd-table-col-fixed-right-first')
      .and('have.css', 'right', '0px');
    cy.get('.custom-body').should('have.css', 'color', 'rgb(1, 2, 3)');
    cy.get('.custom-summary')
      .should('have.css', 'grid-column', 'span 2')
      .and('have.css', 'color', 'rgb(4, 5, 6)')
      .and('contain.text', 'Summary');
    cy.contains('button', 'Inspect header').click();
    cy.get('output').first().should('have.text', '0:0::DIV');
  });
  it('sorts with pointer and keyboard and updates accessible sort state and body classes', () => {
    cy.get('.sd-table-th .sd-table-cell[role="button"]').click();
    cy.get('.sd-table-th').first().should('have.attr', 'aria-sort', 'ascending');
    cy.get('.custom-body').should('have.class', 'sd-table-col-sorted');
    cy.get('.sd-table-th .sd-table-cell[role="button"]').trigger('keydown', { key: ' ' });
    cy.get('.sd-table-th').first().should('have.attr', 'aria-sort', 'descending');
    cy.get('.sd-table-th .sd-table-cell[role="button"]').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-table-th').first().should('have.attr', 'aria-sort', 'none');
  });
  it('opens the real checkbox filter, confirms/resets values and preserves header click isolation', () => {
    cy.get('.sd-table-filters').click();
    cy.get('.sd-table-filters-content').should('be.visible');
    cy.get('.sd-table-filters-content .sd-checkbox').first().click();
    cy.get('.sd-table-filters-bottom button').last().click();
    cy.get('[data-testid="filters"]').should('have.text', '{"profile.name":["one"]}');
    cy.get('.sd-table-filters').should('have.class', 'sd-table-filters-active');
    cy.get('output').first().should('have.text', '0:0::');
    cy.contains('button', 'Align filter').click();
    cy.get('.sd-table-cell > .sd-table-filters')
      .should('have.class', 'sd-table-filters-align-left')
      .click();
    cy.get('.sd-table-filters-bottom button').first().click();
    cy.get('[data-testid="filters"]').should('have.text', '{"profile.name":[]}');
  });
  it('updates custom titles and body rendering and renders actual lazy-load status without row clicks', () => {
    cy.contains('button', 'Custom').click();
    cy.get('.custom-header .sd-table-th-title > .sd-ellipsis-content').should(
      'have.text',
      'Custom title',
    );
    cy.get('.custom-body').should('contain.text', 'Custom:0:42');
    cy.contains('button', 'Expand row').click();
    cy.get('.sd-table-cell-inline-icon .sd-icon-loading').should('exist');
    cy.get('output').first().should('have.text', '0:0::');
    cy.contains('button', 'Resolve children').click();
    cy.get('.sd-table-cell-inline-icon .sd-icon-loading').should('not.exist');
    cy.get('output').first().should('have.text', '0:0:one:');
  });
});
