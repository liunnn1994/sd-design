describe('React ellipsis', () => {
  beforeEach(() => cy.visit('/clamp.html'));

  it('expands lazy ellipsis on its first click', () => {
    cy.get('[data-testid="lazy-click"]').click();
    cy.get('[data-testid="lazy-clicks"]').should('have.text', '1');
    cy.get('[data-testid="lazy-click"]').should('have.attr', 'aria-expanded', 'true');
  });

  it('forwards external focus without moving focus away from the native control', () => {
    cy.contains('button', '转交焦点提示').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '外部控件聚焦时显示完整省略内容');
    cy.contains('button', '转交焦点提示').should('have.focus').blur();
    cy.get('[role="tooltip"]').should('not.exist');
  });

  it('omits empty render-function affixes', () => {
    cy.get('[data-testid="empty-affix"] [data-part="before"]').should('not.exist');
    cy.get('[data-testid="empty-affix"] [data-part="after"]').should('not.exist');
  });

  it('keeps Ellipsis triggerRef and triggerElement on the current native root', () => {
    cy.visit('/clamp.html?ellipsis-ref-alias');
    cy.contains('button', '读取省略引用').click();
    cy.get('[data-testid="ellipsis-ref-status"]').should('have.text', 'true:SPAN');
    cy.contains('button', '切换省略容器').click();
    cy.contains('button', '读取省略引用').click();
    cy.get('[data-testid="ellipsis-ref-status"]').should('have.text', 'true:DIV');
  });

  it('leaves spaces typed inside nested inputs intact and only expands from the root', () => {
    const root = '[data-testid="nested-ellipsis"]';
    const input = `${root} > .sd-ellipsis-content input`;
    cy.get(root).should('have.class', 'sd-ellipsis--expandable');
    cy.get(input).type('a b').should('have.value', 'a b');
    cy.get(root).should('have.attr', 'aria-expanded', 'false');
    cy.get(root).focus().trigger('keydown', { key: 'Enter' });
    cy.get(root).should('have.attr', 'aria-expanded', 'true');
    cy.get(input).should('have.value', 'a b');
  });

  it('measures ellipsis, exposes native titles and expands through keyboard interaction', () => {
    cy.get('[data-testid="native-ellipsis"]').should(
      'have.attr',
      'title',
      '关闭气泡时应使用原生标题提示完整内容',
    );
    cy.get('[data-testid="single-ellipsis"]').should('have.attr', 'role', 'button').focus();
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', '这是很长的富文本省略内容');
    cy.get('[data-testid="single-ellipsis"]').trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="single-ellipsis"]').should('have.attr', 'aria-expanded', 'true');
    cy.get('[role="tooltip"]').should('not.exist');
    cy.get('[data-testid="single-ellipsis"]').trigger('keydown', { key: ' ' });
    cy.get('[data-testid="single-ellipsis"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="multi-ellipsis"]')
      .should('have.attr', 'role', 'button')
      .should(($root) => expect($root[0].getBoundingClientRect().height).to.be.at.most(41));
    cy.get('[data-testid="multi-ellipsis"]').click();
    cy.get('[data-testid="multi-ellipsis"]')
      .should('have.attr', 'aria-expanded', 'true')
      .should(($root) => expect($root[0].getBoundingClientRect().height).to.be.greaterThan(60));
  });
});
