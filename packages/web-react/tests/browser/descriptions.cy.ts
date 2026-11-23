describe('React descriptions', () => {
  beforeEach(() => cy.visit('/descriptions.html'));

  it('renders descriptions layouts with shared spans, alignment and provider size', () => {
    cy.viewport(1000, 800);
    cy.get('[data-testid="descriptions"]')
      .should('have.class', 'sd-descriptions-size-small')
      .and('have.class', 'sd-descriptions-border');
    cy.get('[data-testid="descriptions"] table').should('have.css', 'table-layout', 'fixed');
    cy.get('[data-testid="descriptions"] tr')
      .should('have.length', 2)
      .first()
      .find('td')
      .eq(3)
      .should('have.attr', 'colspan', '3');
    cy.get('[data-testid="descriptions"] .sd-descriptions-item-label')
      .first()
      .should('have.text', '0:A')
      .and('have.css', 'text-align', 'right')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
    cy.get('[data-testid="descriptions"] .sd-descriptions-item-value')
      .first()
      .should('have.css', 'text-align', 'center')
      .find('b')
      .should('have.text', '第一项');
    cy.get('[aria-label="描述列表布局"]').select('vertical');
    cy.get('[data-testid="descriptions"] tr')
      .should('have.length', 4)
      .first()
      .find('td')
      .eq(1)
      .should('have.attr', 'colspan', '2');
    for (const layout of ['inline-horizontal', 'inline-vertical']) {
      cy.get('[aria-label="描述列表布局"]').select(layout);
      cy.get('[data-testid="descriptions"] tr')
        .should('have.length', 2)
        .first()
        .find('td')
        .should('have.length', 2);
      cy.get('[data-testid="descriptions"] .sd-descriptions-item-label-inline').should(
        'have.length',
        4,
      );
    }
  });

  it('reflows descriptions at breakpoints and refreshes columns when switching from numeric mode', () => {
    cy.viewport(500, 700);
    cy.get('[data-testid="descriptions"] tr').should('have.length', 4);
    cy.contains('button', '切换固定列数').click();
    cy.get('[data-testid="descriptions"] tr').should('have.length', 3);
    cy.viewport(1000, 800);
    cy.get('[data-testid="descriptions"] tr').should('have.length', 3);
    cy.contains('button', '切换固定列数').click();
    cy.get('[data-testid="descriptions"] tr').should('have.length', 2);
  });

  it('uses fragment description items in preference to the data and renderer props', () => {
    cy.viewport(1000, 800);
    cy.contains('button', '切换描述子项').click();
    cy.get('[data-testid="descriptions"] tr').should('have.length', 1);
    cy.get('[data-testid="descriptions"] .sd-descriptions-item-label em').should(
      'have.text',
      '子项标签',
    );
    cy.contains('[data-testid="descriptions"] button', '子项按钮').should('be.visible');
    cy.get('[data-testid="descriptions"]').should('not.contain.text', '第一项');
    cy.contains('button', '切换描述子项').click();
    cy.get('[data-testid="descriptions"]').should('contain.text', '第一项');
  });

  it('replaces and clears live description data without retaining stale cells', () => {
    cy.viewport(1000, 800);
    const values = '[data-testid="descriptions"] .sd-descriptions-item-value';
    cy.get(values).should('have.length', 4);
    cy.contains('button', '更新描述数据').click();
    cy.get('[data-testid="descriptions"] tr').should('have.length', 1);
    cy.get(values)
      .should('have.length', 2)
      .first()
      .should('have.text', '替换项')
      .and('have.attr', 'colspan', '3');
    cy.get('[data-testid="descriptions"] .sd-descriptions-item-label')
      .last()
      .should('have.text', '1:A');
    cy.contains('button', '清空描述数据').click();
    cy.get('[data-testid="descriptions"] tr').should('not.exist');
    cy.get('[data-testid="descriptions"] strong').should('have.text', '描述标题');
  });
});
