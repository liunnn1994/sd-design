describe('React Table split and virtual scrolling', () => {
  const visitVirtualTable = () => {
    cy.on('uncaught:exception', (error) => {
      // Official Virtua 0.53.4 reproduces this native warning without SD components or styles.
      if (error.message.includes('ResizeObserver loop completed with undelivered notifications.'))
        return false;
    });
    cy.visit('/table-virtual.html');
  };
  it('virtualizes real rows and scrolls by index and key through the Table ref', () => {
    visitVirtualTable();
    cy.get('.sd-table-virtual-item').should('have.length.lessThan', 40);
    cy.get('.sd-table-body').should('contain.text', 'Row 0').and('not.contain.text', 'Row 199');
    cy.contains('button', 'Last row').click();
    cy.get('.sd-table-body').should('contain.text', 'Row 199').and('not.contain.text', 'Row 0');
    cy.contains('button', 'Key 150').click();
    cy.get('.sd-table-body').should('contain.text', 'Row 150');
    cy.contains('button', 'First row').click();
    cy.get('.sd-table-body').should('contain.text', 'Row 0');
    cy.get('.sd-table-body .sd-table-cell-inline-icon button').first().click();
    cy.get('.sd-table-body').should('contain.text', 'Child row');
    cy.contains('button', 'Last row').click();
    cy.get('.sd-table-body').should('contain.text', 'Row 199');
  });
  it('synchronizes virtual horizontal scrolling with fixed columns, header and summary', () => {
    visitVirtualTable();
    cy.get('.sd-table-body .sd-virtual-list-scroller').scrollTo(300, 0);
    cy.get('.sd-table-header').should('have.prop', 'scrollLeft', 300);
    cy.get('.sd-table-tfoot').should('have.prop', 'scrollLeft', 300);
    cy.get('.sd-table-container')
      .should('have.class', 'sd-table-scroll-position-middle')
      .and('have.class', 'sd-table-has-fixed-col-left')
      .and('have.class', 'sd-table-has-fixed-col-right');
    cy.get('.sd-table-body .sd-table-col-fixed-left-last')
      .first()
      .should('have.css', 'left', '40px');
    cy.get('.sd-table-body .sd-table-col-fixed-right-first')
      .first()
      .should('have.css', 'right', '0px');
    cy.get('.sd-table-body .sd-virtual-list-scroller').scrollTo('right');
    cy.get('.sd-table-container').should('have.class', 'sd-table-scroll-position-right');
  });
  it('uses a split native scroll body, sticky offset and synchronized summary without virtualization', () => {
    cy.visit('/table-virtual.html?normal&native&sticky');
    cy.get('.sd-table-header-sticky')
      .should('have.css', 'position', 'sticky')
      .and('have.css', 'top', '12px');
    cy.get('.sd-table-body').should('have.css', 'max-height', '220px').scrollTo(300, 300);
    cy.get('.sd-table-header').should('have.prop', 'scrollLeft', 300);
    cy.get('.sd-table-tfoot').should('have.prop', 'scrollLeft', 300);
    cy.get('.sd-table-body .sd-table-tr').should('have.length', 200);
    cy.get('.sd-table-virtual-item').should('not.exist');
  });
  it('switches between empty and virtual views and removes or restores the split header', () => {
    visitVirtualTable();
    cy.contains('button', 'Toggle empty').click();
    cy.get('.sd-table-tr-empty .sd-empty').should('be.visible');
    cy.get('.sd-table-virtual-item').should('not.exist');
    cy.contains('button', 'Toggle empty').click();
    cy.get('.sd-table-virtual-item').should('exist');
    cy.contains('button', 'Toggle header').click();
    cy.get('.sd-table-header').should('not.exist');
    cy.contains('button', 'Toggle header').click();
    cy.get('.sd-table-header').should('exist');
    cy.contains('button', 'Last row').click();
    cy.get('.sd-table-body').should('contain.text', 'Row 199');
  });
});
