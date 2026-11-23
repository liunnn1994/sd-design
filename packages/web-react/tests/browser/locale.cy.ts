describe('React locale', () => {
  beforeEach(() => cy.visit('/locale.html'));

  it('updates global locale without overriding an explicit provider locale', () => {
    cy.get('[data-testid="global-empty"]').should('not.contain.text', 'No Data');
    cy.contains('button', '切换全局英文').click();
    cy.get('[data-testid="global-empty"]').should('contain.text', 'No Data');
    cy.get('[data-testid="localized-empty"]').should('not.contain.text', 'No Data');
    cy.contains('button', '切换局部语言').click();
    cy.get('[data-testid="localized-empty"]').should('contain.text', 'No Data');
  });

  it('refreshes the active dictionary and missing provider keys when the default dictionary is overwritten', () => {
    cy.get('[data-testid="global-empty"]').should('contain.text', '暂无数据');
    cy.get('[data-testid="localized-readonly-tip"]').should('have.text', '当前为只读模式');

    cy.contains('button', '更新默认语言字典').click();

    cy.get('[data-testid="global-empty"]').should('contain.text', '字典已更新');
    cy.get('[data-testid="localized-empty"]').should('contain.text', '暂无数据');
    cy.get('[data-testid="localized-readonly-tip"]').should('have.text', '新只读提示');
  });
});
