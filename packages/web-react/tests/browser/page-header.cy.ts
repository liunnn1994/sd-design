describe('React page-header', () => {
  beforeEach(() => cy.visit('/page-header.html'));

  it('activates page header back with mouse and keyboard and uses provider labels', () => {
    cy.get('[data-testid="page-header"] [role="button"]')
      .should('have.attr', 'aria-label', 'Back')
      .click();
    cy.get('[data-testid="page-header-events"]').should('have.text', 'click,');
    cy.get('[data-testid="page-header"] [role="button"]')
      .focus()
      .trigger('keydown', { key: 'Enter' })
      .trigger('keydown', { key: ' ' })
      .trigger('keydown', { key: 'Spacebar' })
      .trigger('keydown', { key: 'Escape' })
      .trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="page-header-events"]').should('have.text', 'click,keydown,keydown,');
    cy.get('[data-testid="page-header-custom"] [role="button"]')
      .should('have.text', '← 返回')
      .click();
    cy.get('[data-testid="page-header-events"]').should('have.text', 'custom');
  });

  it('updates page header regions and shared layout classes', () => {
    cy.get('[data-testid="page-header"]')
      .should('have.class', 'sd-page-header-with-breadcrumb')
      .and('have.class', 'sd-page-header-with-content');
    cy.get('[data-testid="page-header"] .sd-page-header-header').should(
      'have.css',
      'display',
      'flex',
    );
    cy.get('[data-testid="page-header"] .sd-page-header-divider').should(
      'have.attr',
      'aria-hidden',
      'true',
    );
    cy.contains('button', '页头操作').click();
    cy.get('[data-testid="page-header-events"]').should('have.text', 'extra');
    cy.contains('button', '切换页头区域').click();
    cy.get('[data-testid="page-header"]')
      .should('not.have.class', 'sd-page-header-with-breadcrumb')
      .and('not.have.class', 'sd-page-header-with-content');
    for (const part of ['back-btn', 'subtitle', 'divider', 'breadcrumb', 'extra', 'content'])
      cy.get(`[data-testid="page-header"] .sd-page-header-${part}`).should('not.exist');
    cy.get('[data-testid="page-header"] .sd-page-header-title strong').should(
      'have.text',
      '页面标题',
    );
  });
});
