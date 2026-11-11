describe('React Table column resize', () => {
  beforeEach(() => cy.visit('/table-resize.html'));
  const move = (offset: number) =>
    cy.get('.sd-table-th').then(($th) => {
      cy.window().trigger('mousemove', { clientX: $th[0]!.getBoundingClientRect().x + offset });
    });
  it('uses real header geometry, enforces minimum width and releases the drag on mouseup', () => {
    cy.get('.sd-table-column-handle').trigger('mousedown', { clientX: 160 });
    cy.get('.sd-table-th').should('have.class', 'sd-table-th-resizing');
    move(230);
    cy.get('.sd-table-th').should('have.css', 'width', '230px');
    move(10);
    cy.get('.sd-table-th').should('have.css', 'width', '40px');
    cy.window().trigger('mouseup');
    cy.get('.sd-table-th').should('not.have.class', 'sd-table-th-resizing');
    move(300);
    cy.get('output').should('have.text', '230,40');
  });
  it('releases window listeners when a drag is interrupted by a context menu', () => {
    cy.get('.sd-table-column-handle').trigger('mousedown');
    move(200);
    cy.window().trigger('contextmenu');
    move(250);
    cy.get('output').should('have.text', '200');
    cy.get('.sd-table-th').should('not.have.class', 'sd-table-th-resizing');
  });
  it('disposes a pending drag when its header unmounts and can start a fresh drag after remount', () => {
    cy.get('.sd-table-column-handle').trigger('mousedown');
    move(200);
    cy.contains('button', 'Toggle header').trigger('click');
    cy.window().trigger('mousemove', { clientX: 300 });
    cy.get('output').should('have.text', '200');
    cy.contains('button', 'Toggle header').click();
    cy.get('.sd-table-th').should('have.css', 'width', '160px');
    cy.get('.sd-table-column-handle').trigger('mousedown');
    move(220);
    cy.window().trigger('mouseup');
    cy.get('output').should('have.text', '200,220');
  });
});
