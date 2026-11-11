describe('React Table scoped root renderers', () => {
  it('passes raw scope data and merges classes, styles, semantics and generated children', () => {
    cy.visit('/table-render.html');
    cy.get('section.custom-head.sd-table-thead').should('have.attr', 'role', 'rowgroup');
    cy.get('article[data-testid="custom-body"]').should('have.class', 'sd-table-tbody');
    cy.get('[data-row="1"][data-index="0"]')
      .should('have.class', 'sd-table-tr')
      .and('have.attr', 'role', 'row');
    cy.get('[data-column="name"]')
      .should('have.class', 'sd-table-th')
      .and('have.attr', 'role', 'columnheader')
      .and('have.css', 'background-color', 'rgb(4, 5, 6)')
      .and('contain.text', 'Name');
    cy.get('[data-cell="1:name:0"]')
      .should('have.attr', 'role', 'cell')
      .and('have.css', 'color', 'rgb(1, 2, 3)')
      .and('have.css', 'border-top-width', '7px')
      .and('contain.text', 'Ada');
  });
  it('composes custom and Table event handlers in order', () => {
    cy.visit('/table-render.html');
    cy.contains('[data-cell="1:name:0"]', 'Ada').click();
    cy.get('[data-testid="events"]').should('have.text', 'custom-cell,cell,custom-row,row');
  });
  it('keeps column measurement and resize wired to the custom header element', () => {
    cy.visit('/table-render.html');
    cy.get('[data-column="name"]').then(($header) => {
      const x = $header[0]!.getBoundingClientRect().x;
      cy.get('[data-column="name"] .sd-table-column-handle').trigger('mousedown', {
        clientX: x + 180,
      });
      cy.window().trigger('mousemove', { clientX: x + 230 });
    });
    cy.get('[data-column="name"]')
      .should('have.class', 'sd-table-th-resizing')
      .and('have.css', 'width', '230px');
    cy.window().trigger('mouseup');
    cy.get('[data-column="name"]').should('not.have.class', 'sd-table-th-resizing');
  });
  it('preserves a custom callback ref across rerenders and runs its React 19 cleanup when replaced', () => {
    cy.visit('/table-render.html');
    cy.contains('button', 'Inspect refs').click();
    cy.get('[data-testid="refs"]')
      .should('contain.text', 'ARTICLE:mount:ARTICLE')
      .then(($output) => {
        const previous = $output.text();
        cy.contains('button', 'Rerender').click();
        cy.contains('button', 'Inspect refs').click();
        cy.get('[data-testid="refs"]').should('have.text', previous);
      });
    cy.contains('button', 'Toggle custom').click();
    cy.get('.custom-th').should('not.exist');
    cy.get('.sd-table-th').first().should('have.prop', 'tagName', 'DIV');
    cy.contains('button', 'Inspect refs').click();
    cy.get('[data-testid="refs"]')
      .invoke('text')
      .should('match', /^none:.*cleanup$/);
  });
  for (const mode of ['manual', 'implicit']) {
    it(`renders ${mode} content without generated rows, loading wrapper or pagination and restores generated mode`, () => {
      cy.visit(`/table-render.html?${mode}`);
      cy.get('.sd-table')
        .should('contain.text', 'Manual heading')
        .and('contain.text', 'Manual content')
        .and('not.contain.text', 'Ada');
      cy.get('.sd-table .sd-spin').should('not.exist');
      cy.get('.sd-pagination').should('not.exist');
      cy.get('.sd-table-footer').should('have.text', 'Manual footer');
      cy.contains('button', 'Toggle custom').click();
      cy.get('.sd-table').should('contain.text', 'Ada').and('not.contain.text', 'Manual content');
      cy.get('.sd-table .sd-spin').should('exist');
    });
  }
});
