describe('React collapse', () => {
  beforeEach(() => cy.visit('/collapse.html'));

  it('switches accordion panels by keyboard and destroys content after leaving', () => {
    cy.contains('[role="button"]', '面板一').should('have.attr', 'aria-expanded', 'true');
    cy.get('[aria-label="面板一输入"]').should('be.visible');
    cy.get('[aria-label="面板二输入"]').should('not.exist');
    cy.contains('[role="button"]', '面板二').focus().type('{enter}');
    cy.get('[aria-label="面板二输入"]').should('be.visible');
    cy.get('[aria-label="面板一输入"]').should('not.exist');
    cy.contains('[role="button"]', '面板二').should(([$header]) => {
      const region = $header.ownerDocument.getElementById($header.getAttribute('aria-controls')!);
      expect(region?.getAttribute('role')).to.equal('region');
      const label = $header.ownerDocument.getElementById(region!.getAttribute('aria-labelledby')!);
      expect($header.contains(label)).to.equal(true);
      expect(label?.textContent).to.equal('面板二');
    });
    cy.get('[data-testid="accordion"] i').should('have.text', '局部开');
    cy.get('[data-testid="accordion"]').should('have.class', 'sd-collapse-borderless');
    cy.contains('[role="button"]', '禁用面板')
      .click()
      .should('have.attr', 'aria-expanded', 'false')
      .and('have.attr', 'aria-disabled', 'true')
      .and('have.attr', 'tabindex', '-1');
  });

  it('retains collapse content when destruction changes or a leave animation is cancelled', () => {
    cy.get('[aria-label="面板一输入"]').type('保留内容');
    cy.contains('[role="button"]', '面板一').then(($header) =>
      cy.window().then(
        (win) =>
          new Cypress.Promise<void>((resolve) => {
            $header[0].click();
            win.requestAnimationFrame(() => {
              expect($header.attr('aria-expanded')).to.eq('false');
              $header[0].click();
              resolve();
            });
          }),
      ),
    );
    cy.get('[aria-label="面板一输入"]').should('be.visible').and('have.value', '保留内容');
    cy.contains('button', '切换折叠销毁').click();
    cy.contains('[role="button"]', '面板一').click();
    cy.get('[aria-label="面板一输入"]').should('exist').and('not.be.visible');
    cy.get('[aria-label="面板二输入"]').should('exist');
    cy.contains('button', '切换折叠销毁').click();
    cy.get('[aria-label="面板一输入"]').should('not.exist');
    cy.contains('button', '切换折叠图标').click();
    cy.get('[data-testid="accordion"] .sd-collapse-item-icon-hover').should('not.exist');
  });

  it('keeps controlled numeric keys and does not intercept editable header keys or extra actions', () => {
    cy.contains('[role="button"]', '数字零面板')
      .click()
      .should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="collapse-requests"]').should('have.text', '1');
    cy.contains('button', '独立操作').click();
    cy.get('[data-testid="collapse-requests"]').should('have.text', '1');
    cy.contains('button', '外部展开面板').click();
    cy.contains('[role="button"]', '数字零面板').should('have.attr', 'aria-expanded', 'true');
    cy.get('[aria-label="标题输入"]').focus().type('a b').should('have.value', 'a b');
    cy.get('[aria-label="标题输入"]')
      .closest('[role="button"]')
      .should('have.attr', 'aria-expanded', 'false');
  });

  it('keeps non-accordion panels independent and preserves closed panel state by default', () => {
    const editable = () => cy.get('[aria-label="标题输入"]').closest('[role="button"]');
    const independent = () => cy.contains('[role="button"]', '独立面板');
    editable().focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    editable().should('have.attr', 'aria-expanded', 'true');
    independent().click().should('have.attr', 'aria-expanded', 'true');
    independent().find('.sd-collapse-item-icon-hover').should('not.exist');
    cy.get('[aria-label="独立面板输入"]').type('草稿');
    independent().click().should('have.attr', 'aria-expanded', 'false');
    cy.get('[aria-label="独立面板输入"]').should('exist').and('not.be.visible');
    editable().should('have.attr', 'aria-expanded', 'true');
    independent().click();
    cy.get('[aria-label="独立面板输入"]').should('be.visible').and('have.value', '草稿');
  });

  it('updates custom icon placement and restores symmetric padding when icons are hidden', () => {
    const header = () => cy.contains('[role="button"]', '面板一');
    const assertNoPaddingBias = () =>
      header().should(([$header]) => {
        const style = getComputedStyle($header);
        expect(style.paddingLeft).to.equal(style.paddingRight);
      });
    header()
      .should('have.class', 'sd-collapse-item-header-right')
      .find('b')
      .should('have.text', 'right:开');
    cy.contains('button', '切换折叠图标').click();
    header().find('.sd-collapse-item-icon-hover').should('not.exist');
    assertNoPaddingBias();
    cy.contains('button', '切换折叠图标位置').click();
    header().should('have.class', 'sd-collapse-item-header-left');
    assertNoPaddingBias();
    cy.contains('button', '切换折叠图标').click();
    header().find('b').should('have.text', 'left:开');
  });
});
