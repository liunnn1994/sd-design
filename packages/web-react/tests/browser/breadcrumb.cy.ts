describe('React breadcrumb', () => {
  beforeEach(() => cy.visit('/breadcrumb.html'));

  it('recalculates breadcrumb collapse across fragments, max-count changes and route mode', () => {
    cy.get('[data-testid="dynamic-breadcrumb"]').should('have.attr', 'role', 'list');
    cy.get('[data-testid="dynamic-breadcrumb"] [role="listitem"]').should('have.length', 3);
    cy.get('[data-testid="dynamic-breadcrumb"] [aria-label="更多面包屑项"]').should(
      'have.text',
      '更多路径',
    );
    cy.contains('button', '切换面包屑限制').click();
    cy.get('[data-testid="dynamic-breadcrumb"] [role="listitem"]').should('have.length', 5);
    cy.contains('button', '切换面包屑限制').click();
    cy.contains('button', '切换面包屑来源').click();
    cy.get('[data-testid="dynamic-breadcrumb"] [role="listitem"]').should('have.length', 3);
    cy.get('[data-testid="dynamic-breadcrumb"] [aria-label="更多面包屑项"]').should('not.exist');
    cy.get('[data-testid="dynamic-breadcrumb"] a')
      .eq(1)
      .should('have.attr', 'href', '#/home/section');
    cy.get('[data-testid="dynamic-breadcrumb"] .sd-breadcrumb-item-separator').should(
      'have.length',
      2,
    );
  });

  it('updates breadcrumb dropdown content and separator precedence without retaining popup state', () => {
    cy.get('[data-testid="custom-breadcrumb"]').should('have.attr', 'aria-label', '面包屑');
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-separator')
      .should('have.text', '-')
      .and('have.attr', 'aria-hidden', 'true');
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-dropdown-icon').should(
      'not.exist',
    );
    cy.contains('button', '切换面包屑下拉').click();
    cy.contains('[role="listitem"]', '动态首页').click();
    cy.contains('[role="menuitem"]', '自定义路径').click();
    cy.get('[data-testid="breadcrumb-selected"]').should('have.text', 'custom');
    cy.contains('[role="listitem"]', '动态首页').click();
    cy.contains('[role="menuitem"]', '自定义路径').should('be.visible');
    cy.contains('button', '切换面包屑下拉').click();
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-dropdown-icon').should(
      'not.exist',
    );
    cy.contains('[role="menuitem"]', '自定义路径').should('not.exist');
    cy.contains('button', '切换面包屑下拉').click();
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-dropdown-icon-active').should(
      'not.exist',
    );
  });

  it('builds custom breadcrumb URLs and passes accumulated paths to item renderers', () => {
    cy.get('[data-testid="url-breadcrumb"] a')
      .eq(1)
      .should('have.attr', 'href', '/browse/home/section');
    cy.get('[data-testid="url-breadcrumb"] .sd-breadcrumb-item')
      .last()
      .find('a')
      .should('not.exist');
    cy.get('[data-testid="render-breadcrumb"] [data-paths]')
      .last()
      .should('have.attr', 'data-paths', 'home|section|detail')
      .and('have.text', '详情渲染');
    cy.get('[data-testid="url-breadcrumb"] .sd-breadcrumb-item-with-dropdown').click('right');
    cy.contains('[role="menuitem"]', '下拉路径').should('be.visible');
    cy.contains('[role="menuitem"]', '同路径选项').should('be.visible');
  });
});
