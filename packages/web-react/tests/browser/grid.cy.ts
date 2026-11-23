describe('React grid', () => {
  beforeEach(() => cy.visit('/grid.html'));

  it('handles responsive row gutters, zero spans, flex zero and dynamic div mode', () => {
    cy.viewport(1000, 800);
    cy.get('[data-testid="row"]')
      .should('have.class', 'sd-row-nowrap')
      .and('have.class', 'sd-row-justify-center')
      .and('have.class', 'sd-row-align-stretch')
      .and('have.css', 'margin-left', '-8px');
    cy.get('[data-testid="row"]').should('have.css', 'margin-top', '-4px');
    cy.get('[data-testid="col-zero"]')
      .should('be.visible')
      .and('have.class', 'sd-col-md-12')
      .and('have.css', 'padding-left', '8px');
    cy.get('[data-testid="col-zero"]').should('have.css', 'padding-top', '4px');
    cy.get('[data-testid="col-flex"]')
      .should('have.css', 'flex-grow', '0')
      .and('not.have.class', 'sd-col-24');
    cy.get('[data-testid="col-fixed"]').should('have.css', 'flex-basis', '100px');
    cy.viewport(500, 700);
    cy.get('[data-testid="col-zero"]').should('not.exist');
    cy.get('[data-testid="row"]').should('have.css', 'margin-left', '0px');
    cy.contains('button', '切换栅格 div').click();
    cy.get('[data-testid="col-zero"]').should('exist').and('not.have.class', 'sd-col');
    cy.get('[data-testid="row"]').should('not.have.class', 'sd-row');
    cy.contains('button', '切换栅格 div').click();
    cy.get('[data-testid="col-zero"]').should('not.exist');
  });

  it('resets responsive column offset and order to zero and restores them on resize', () => {
    cy.viewport(500, 600);
    cy.get('[data-testid="col-responsive-offset"]').should('have.css', 'margin-left', '120px');
    cy.get('[data-testid="col-responsive-offset"]').should('have.css', 'order', '2');
    cy.viewport(900, 600);
    cy.get('[data-testid="col-responsive-offset"]').should('have.css', 'margin-left', '0px');
    cy.get('[data-testid="col-responsive-offset"]').should('have.css', 'order', '0');
    cy.viewport(500, 600);
    cy.get('[data-testid="col-responsive-offset"]').should('have.css', 'margin-left', '120px');
    cy.get('[data-testid="col-responsive-offset"]').should('have.css', 'order', '2');
  });

  it('updates collapsed grid collection after keyed deletion, reordering and remounting', () => {
    cy.get('[data-testid="grid-A"]').should('be.visible');
    cy.get('[data-testid="grid-B"]').should('be.visible');
    cy.get('[data-testid="grid-C"]').should('not.be.visible');
    cy.get('[data-testid="grid-suffix"]').should('have.text', 'true');
    cy.contains('button', '删除网格 B').click();
    cy.get('[data-testid="grid-B"]').should('not.exist');
    cy.get('[data-testid="grid-C"]').should('be.visible');
    cy.get('[data-testid="grid-suffix"]').should('have.text', 'false');
    cy.contains('button', '重排网格').click();
    cy.get('[data-testid="grid-D"]').should('be.visible');
    cy.get('[data-testid="grid-A"]').should('not.be.visible');
    cy.get('[data-testid="grid-suffix"]').should('have.text', 'true');
    cy.contains('button', '挂载网格').click();
    cy.get('[data-testid="grid-collection"]').should('not.exist');
    cy.contains('button', '挂载网格').click();
    cy.get('[data-testid="grid-D"]').should('be.visible');
    cy.get('[data-testid="grid-A"]').should('not.be.visible');
  });

  it('preserves collapsed row geometry and responsive item offsets', () => {
    cy.get('[data-testid="grid-geometry"]').should('have.css', 'height', '50px');
    cy.get('[data-testid="geometry-2"]').should('not.be.visible');
    cy.contains('button', '切换网格折叠').click();
    cy.get('[data-testid="geometry-2"]').should('be.visible');
    cy.get('[data-testid="grid-geometry"]').should('have.css', 'height', '80px');
    cy.viewport(1000, 800);
    cy.get('[data-testid="grid-responsive"]').should('have.css', 'column-gap', '8px');
    cy.get('[data-testid="grid-offset"]').should('have.css', 'margin-left', '82px');
    cy.get('[data-testid="grid-span"]').should('be.visible');
    cy.viewport(500, 700);
    cy.get('[data-testid="grid-span"]').should('not.be.visible');
    cy.get('[data-testid="grid-offset"]').should('have.css', 'margin-left', '160px');
  });
});
