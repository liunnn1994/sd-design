describe('React popover', () => {
  beforeEach(() => cy.visit('/popover.html'));

  it('renders interactive popover content and switches between custom and native scrolling', () => {
    cy.get('[data-testid="popover-trigger"]').click();
    cy.get('[data-testid="popover-trigger"]')
      .should('have.attr', 'aria-haspopup', 'true')
      .and('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-popover-title strong').should('have.text', '弹出标题');
    cy.get('.sd-popover .sd-scrollbar-type-track .os-scrollbar-vertical').should('exist');
    cy.contains('button', '弹层内计数').click();
    cy.get('[data-testid="popover-count"]').should('have.text', '1');
    cy.contains('button', '切换弹层滚动').click();
    cy.get('.sd-popover .sd-scrollbar').should('not.exist');
    cy.get('.sd-popover-content').should('contain.text', '弹层内计数');
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-popover').should('not.exist');
  });

  it('waits for controlled popover writeback and initializes default visibility on mount', () => {
    const reference = () => cy.contains('button', '拒绝打开 Popover');
    const content = () => cy.contains('.sd-popover-content', '受控内容');
    const toggle = () => cy.contains('button', 'Toggle controlled popover').click();
    reference().click().should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="popover-requests"]').should('have.text', 'true');
    content().should('not.exist');
    toggle();
    content().should('be.visible');
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="popover-requests"]').should('have.text', 'true|false');
    reference().should('have.attr', 'aria-expanded', 'true');
    content().should('be.visible');
    toggle();
    content().should('not.exist');
    cy.contains('button', '挂载默认打开').click();
    cy.contains('.sd-popover-content', '默认打开内容').should('be.visible');
    cy.contains('button', '挂载默认打开').click();
    cy.contains('.sd-popover-content', '默认打开内容').should('not.exist');
  });

  it('opens and closes on hover and applies popup placement and arrow styling', () => {
    const reference = () => cy.contains('button', 'Hover reference');
    const events = () => cy.get('[data-testid="popover-hover-events"]');
    reference().trigger('mouseover');
    reference().should('have.attr', 'aria-expanded', 'true');
    events().should('have.text', 'true');
    cy.get('.sd-popover').should('have.attr', 'trigger-placement', 'right');
    cy.get('.sd-popover .custom-popover-content').should(
      'have.css',
      'background-color',
      'rgb(18, 52, 86)',
    );
    cy.get('.sd-popover-popup-arrow.custom-popover-arrow').should(([$arrow]) => {
      const style = $arrow.ownerDocument.defaultView!.getComputedStyle($arrow);
      expect(style.zIndex).to.equal('-1');
      const borders = [
        style.borderTopStyle,
        style.borderRightStyle,
        style.borderBottomStyle,
        style.borderLeftStyle,
      ];
      expect(borders.filter((border) => border === 'none')).to.have.length(2);
    });
    reference().trigger('mouseout');
    reference().should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-popover').should('not.exist');
    events().should('have.text', 'true|false');
  });

  it('keeps parent popovers open while interacting with nested portals', () => {
    let scrollY = 0;
    cy.contains('button', '打开父 Popover').click({ scrollBehavior: 'center' });
    cy.window()
      .its('scrollY')
      .should('be.greaterThan', 0)
      .then((value) => {
        scrollY = value;
      });
    cy.contains('button', '打开子 Popover').should('be.visible').click({ scrollBehavior: false });
    cy.contains('.sd-popover-content', '嵌套 Popover 内容')
      .should('be.visible')
      .click({ scrollBehavior: false });
    cy.window()
      .its('scrollY')
      .should((value) => expect(value).to.equal(scrollY));
    cy.get('.sd-popover').should('have.length', 2);
    cy.contains('button', '打开父 Popover').click();
    cy.get('.sd-popover').should('not.exist');
  });

  it('opens on focus and closes on blur with matching ARIA state', () => {
    cy.contains('button', 'Focus reference').focus().should('have.attr', 'aria-expanded', 'true');
    cy.contains('.sd-popover-content', 'Focus content').should('be.visible');
    cy.contains('button', 'Focus reference').blur().should('have.attr', 'aria-expanded', 'false');
    cy.contains('.sd-popover-content', 'Focus content').should('not.exist');
  });

  it('opens a context-menu popover in the requested container and closes on left click', () => {
    const reference = () => cy.contains('button', 'Context reference');
    reference().rightclick();
    reference().should('have.attr', 'aria-expanded', 'true');
    cy.contains('#popover-host .sd-popover-content', 'Context content').should('be.visible');
    reference().click();
    reference().should('have.attr', 'aria-expanded', 'false');
    cy.get('#popover-host .sd-popover').should('not.exist');
  });
});
