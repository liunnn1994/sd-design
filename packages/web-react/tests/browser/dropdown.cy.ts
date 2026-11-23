it('initially opens the React dropdown with its header, group, option adornments and footer', () => {
  cy.visit('/dropdown.html', { qs: { open: '1' } });
  cy.get('.sd-dropdown')
    .should('have.class', 'sd-dropdown-has-header')
    .and('have.class', 'sd-dropdown-has-footer');
  cy.get('.sd-dropdown')
    .children()
    .then(($children) => {
      expect($children.first()).to.have.class('sd-dropdown-header');
      expect($children.eq(1).find('.sd-dropdown-list-wrapper')).to.have.length(1);
      expect($children.last()).to.have.class('sd-dropdown-footer');
    });
  cy.get('.sd-dropdown-group-title').should('have.text', '操作组');
  cy.contains('[role="menuitem"]', '零值选项')
    .should('be.focused')
    .within(() => {
      cy.get('.sd-dropdown-option-icon').should('have.text', '★');
      cy.get('.sd-dropdown-option-suffix').should('have.text', '⌘A');
    });
  cy.contains('[role="menuitem"]', '零值选项').type('{enter}');
  cy.get('[data-testid="dropdown-selected"]').should('have.text', '0');
  cy.get('[role="menu"]').should('not.exist');
});

describe('React dropdown', () => {
  beforeEach(() => cy.visit('/dropdown.html'));

  it('focuses dropdown options, skips disabled items and selects zero values by keyboard', () => {
    cy.contains('button', '打开菜单测试').click();
    cy.contains('[role="menuitem"]', '零值选项').should('be.focused').type('{uparrow}');
    cy.contains('[role="menuitem"]', '更多操作').should('be.focused').type('{downarrow}');
    cy.contains('[role="menuitem"]', '零值选项').should('be.focused').type('{downarrow}');
    cy.contains('[role="menuitem"]', '回退文本').should('be.focused').type('{downarrow}');
    cy.contains('[role="menuitem"]', '更多操作').should('be.focused').type('{home}');
    cy.get('.sd-dropdown-submenu').should('not.exist');
    cy.get('[data-testid="dropdown-selected"]').should('be.empty');
    cy.contains('[role="menuitem"]', '零值选项').should('be.focused').type('{enter}');
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '0');
    cy.get('.sd-dropdown').should('not.exist');
    cy.contains('button', '打开菜单测试').click();
    cy.contains('[role="menuitem"]', '回退文本').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '"回退文本"');
  });

  it('selects nested dropdown values without selecting the submenu trigger', () => {
    cy.contains('button', '打开菜单测试').click();
    cy.contains('[role="menuitem"]', '禁用选项').click();
    cy.contains('[role="menuitem"]', '禁用子菜单').should('have.attr', 'aria-disabled', 'true');
    cy.contains('[role="menuitem"]', '禁用子菜单').click();
    cy.get('.sd-dropdown-submenu').should('not.exist');
    cy.get('[data-testid="dropdown-selected"]').should('be.empty');
    cy.contains('[role="menuitem"]', '更多操作').click();
    cy.contains('[role="menuitem"]', '更多操作').should('have.class', 'sd-dropdown-option-active');
    cy.get('.sd-dropdown-submenu').should('be.visible');
    cy.contains('[role="menuitem"]', '更多操作').click();
    cy.get('.sd-dropdown-submenu').should('not.exist');
    cy.contains('[role="menuitem"]', '更多操作').should(
      'not.have.class',
      'sd-dropdown-option-active',
    );
    cy.contains('[role="menuitem"]', '更多操作').click();
    cy.get('[data-testid="dropdown-selected"]').should('be.empty');
    cy.contains('[role="menuitem"]', '子菜单操作').should('be.focused').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '{"id":7}');
    cy.get('.sd-dropdown').should('not.exist');
  });

  it('refreshes the text fallback, footer and height cap while the menu stays open', () => {
    cy.contains('button', '保留菜单测试').click();
    cy.get('.sd-dropdown-list-wrapper').should('have.css', 'max-height', '100px');
    cy.contains('[role="menuitem"]', '更新前').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '更新前');
    cy.get('.sd-dropdown').should('not.have.class', 'sd-dropdown-has-footer');
    cy.get('.sd-dropdown-footer').should('not.exist');
    cy.get('.sd-dropdown-list-wrapper').should('have.css', 'max-height', 'none');
    cy.contains('[role="menuitem"]', '更新后').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '更新后');
    cy.get('.sd-dropdown').should('have.class', 'sd-dropdown-has-footer');
    cy.get('.sd-dropdown-footer').should('have.text', '保留菜单尾');
    cy.get('.sd-dropdown-list-wrapper').should('have.css', 'max-height', '100px');
  });

  it('preserves editable keyboard behavior and updates dropdown empty state without closing', () => {
    cy.contains('button', '保留菜单测试').click();
    cy.get('.sd-dropdown-list-wrapper').should('have.css', 'max-height', '100px');
    cy.get('[aria-label="列表内输入"]')
      .type('a b{home}{rightarrow}')
      .should('have.value', 'a b')
      .should('be.focused');
    cy.contains('[role="menuitem"]', '切换菜单空态').click();
    cy.get('.sd-dropdown-empty').should('be.visible');
    cy.get('.sd-dropdown-footer').should('not.exist');
    cy.contains('[role="menuitem"]', '切换菜单空态').click();
    cy.get('.sd-dropdown-empty').should('not.exist');
    cy.get('.sd-dropdown-footer').should('contain.text', '保留菜单尾');
  });

  it('waits for controlled dropdown writeback and keeps both split buttons disabled', () => {
    cy.contains('button', '拒绝菜单写回').click();
    cy.get('.sd-dropdown').should('not.exist');
    cy.get('[data-testid="dropdown-requests"]').should('have.text', '1');
    cy.contains('button', '外部切换菜单').click();
    cy.contains('[role="menuitem"]', '受控菜单内容').should('be.visible');
    cy.get('body').click(1, 1);
    cy.contains('[role="menuitem"]', '受控菜单内容').should('be.visible');
    cy.contains('button', '外部切换菜单').click();
    cy.get('[data-testid="split-dropdown"] button').each(
      ($button) => expect($button).to.be.disabled,
    );
    cy.contains('button', '主操作').click({ force: true });
    cy.get('[data-testid="dropdown-selected"]').should('be.empty');
    cy.get('[data-testid="split-root"]')
      .should('have.class', 'sd-btn-group')
      .and('have.class', 'split-custom');
    cy.contains('button', '切换分裂禁用').click();
    cy.contains('button', '主操作').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', 'main');
    cy.contains('button', '打开分裂菜单').click();
    cy.contains('[role="menuitem"]', '分裂选项').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', 'split');
  });

  it('disables the main action independently while leaving the split menu usable', () => {
    cy.visit('/dropdown.html?main-disabled');
    cy.contains('button', '主操作').should('be.disabled').click({ force: true });
    cy.get('[data-testid="dropdown-selected"]').should('be.empty');
    cy.contains('button', '打开分裂菜单').should('not.be.disabled').click();
    cy.contains('[role="menuitem"]', '分裂选项').should('be.focused').type('{enter}');
    cy.get('[data-testid="dropdown-selected"]').should('have.text', 'split');
    cy.get('[role="menu"]').should('not.exist');
  });

  it('returns focus to the first enabled option after dismissal and reopening', () => {
    const trigger = () => cy.contains('button', '打开菜单测试');
    trigger().click();
    cy.get('[role="menu"]').should('be.visible');
    cy.contains('[role="menuitem"]', '零值选项').should('be.focused').type('{downarrow}');
    cy.contains('[role="menuitem"]', '回退文本').should('be.focused');
    cy.get('body').click(1, 1);
    cy.get('[role="menu"]').should('not.exist');
    trigger().click();
    cy.contains('[role="menuitem"]', '零值选项').should('be.focused');
  });

  it('reports scrolling to the real viewport bottom and keeps the last item selectable', () => {
    cy.contains('button', '保留菜单测试').click();
    cy.get('.sd-dropdown [data-overlayscrollbars-viewport]').scrollTo('bottom');
    cy.get('[data-testid="dropdown-scroll"]').should('include.text', 'bottom');
    cy.get('[data-testid="dropdown-scroll"]').should('include.text', 'scroll');
    cy.contains('[role="menuitem"]', '滚动项 11').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '11');
    cy.get('[role="menu"]').should('be.visible');
  });

  it('blocks disabled hover activation and preserves focus when enabled', () => {
    const trigger = () => cy.contains('button', '悬停菜单测试');
    trigger().trigger('mouseover');
    cy.get('[role="menu"]').should('not.exist');
    trigger().trigger('mouseout');
    cy.contains('button', '切换分裂禁用').click();
    cy.get('[aria-label="菜单外输入"]').focus();
    trigger().trigger('mouseover');
    cy.contains('[role="menuitem"]', '悬停菜单内容').should('be.visible');
    cy.get('[aria-label="菜单外输入"]').should('be.focused');
  });
});
