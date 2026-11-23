describe('React popconfirm', () => {
  beforeEach(() => cy.visit('/popconfirm.html'));

  it('invalidates pending confirmation when its component is unmounted', () => {
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('button', '卸载异步确认').click();
    cy.get('.sd-popconfirm').should('not.exist');
    cy.contains('button', '解决迟到结果').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '0');
  });

  it('confirms and cancels popconfirm actions with localized labels and status icons', () => {
    cy.contains('button', '基本确认').click();
    cy.get('.sd-popconfirm[role="dialog"]').should('be.visible');
    cy.get('.sd-popconfirm .sd-icon-exclamation-circle-fill').should('exist');
    cy.contains('.sd-popconfirm-footer button', '取消').click();
    cy.get('[data-testid="confirm-cancel"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
    cy.contains('button', '基本确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
  });

  it('runs async confirmation once, recovers from rejection and closes after success', () => {
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').then(($button) => {
      $button[0].click();
      $button[0].click();
    });
    cy.get('[data-testid="confirm-calls"]').should('have.text', '1');
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('button', '拒绝异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定')
      .should('not.have.class', 'sd-btn-loading')
      .click();
    cy.get('[data-testid="confirm-calls"]').should('have.text', '2');
    cy.contains('button', '完成异步确认').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
  });

  it('clears loading after a resolved false without confirming or closing', () => {
    const confirm = () => cy.contains('.sd-popconfirm-footer button', '确定');
    cy.contains('button', '异步确认').click();
    confirm().click().should('have.class', 'sd-btn-loading');
    cy.contains('button', '拒绝关闭').click();
    confirm().should('not.have.class', 'sd-btn-loading');
    cy.get('.sd-popconfirm').should('be.visible');
    cy.get('[data-testid="confirm-ok"]').should('have.text', '0');
    confirm().click().should('have.class', 'sd-btn-loading');
    cy.contains('button', '完成异步确认').click();
    cy.get('.sd-popconfirm').should('not.exist');
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('[data-testid="confirm-calls"]').should('have.text', '2');
  });

  it('keeps the popup open on a synchronous confirm failure and allows retry', () => {
    cy.visit('/popconfirm.html?throw-first');
    const confirm = () => cy.contains('.sd-popconfirm-footer button', '确定');
    cy.contains('button', '基本确认').click();
    confirm().click();
    cy.get('[data-testid="confirm-calls"]').should('have.text', '1');
    cy.get('[data-testid="confirm-ok"]').should('have.text', '0');
    cy.get('.sd-popconfirm').should('be.visible');
    confirm().should('not.have.class', 'sd-btn-loading').click();
    cy.get('.sd-popconfirm').should('not.exist');
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
  });

  it('updates accessible dialog wiring and requests one close on Escape', () => {
    const trigger = () => cy.contains('button', '基本确认');
    trigger().should('have.attr', 'aria-haspopup', 'dialog');
    trigger().should('have.attr', 'aria-expanded', 'false');
    trigger().should('not.have.attr', 'aria-controls');
    trigger().click();
    trigger().should('have.attr', 'aria-expanded', 'true');
    trigger().should(([$trigger]) => {
      const dialog = $trigger.ownerDocument.getElementById($trigger.getAttribute('aria-controls')!);
      expect(dialog?.getAttribute('role')).to.equal('dialog');
    });
    cy.get('[data-testid="confirm-requests"]').should('have.text', '1');
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.get('.sd-popconfirm').should('not.exist');
    trigger().should('have.attr', 'aria-expanded', 'false');
    trigger().should('not.have.attr', 'aria-controls');
    cy.get('[data-testid="confirm-requests"]').should('have.text', '2');
    cy.get('[data-testid="confirm-cancel"]').should('have.text', '0');
  });

  it('discards late async confirmation after cancellation', () => {
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('.sd-popconfirm-footer button', '取消').click();
    cy.contains('button', '解决迟到结果').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '0');
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('not.have.class', 'sd-btn-loading');
  });

  it('honors confirmation vetoes and callback-style completion', () => {
    cy.contains('button', '拦截确认与取消').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.get('.sd-popconfirm').should('be.visible');
    cy.contains('.sd-popconfirm-footer button', '取消').click();
    cy.get('.sd-popconfirm').should('be.visible');
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-popconfirm').should('not.exist');
    cy.contains('button', '回调式确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('button', '完成回调确认').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
  });

  it('keeps controlled confirmation visible until writeback and inherits provider language', () => {
    cy.contains('button', '挂载受控确认').click();
    cy.contains('.sd-popconfirm-footer button', 'Ok').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('[data-testid="confirm-requests"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('be.visible');
    cy.contains('.sd-popconfirm-footer button', 'Cancel').should('be.visible');
  });

  for (const mode of ['callback', 'promise']) {
    it(`ignores an old ${mode} after a controlled reopen while a new confirmation is pending`, () => {
      const confirm = () => cy.contains('.sd-popconfirm-footer button', 'Ok');
      const resolve = () => cy.contains('button', 'Resolve oldest confirmation').click();
      cy.get('[aria-label="Controlled confirmation mode"]').select(mode);
      cy.contains('button', '挂载受控确认').click();
      confirm().click().should('have.class', 'sd-btn-loading');
      cy.contains('button', 'Hide controlled confirmation').click();
      cy.get('.sd-popconfirm').should('not.exist');
      cy.contains('button', 'Reopen controlled confirmation').click();
      confirm().should('not.have.class', 'sd-btn-loading').click();
      confirm().should('have.class', 'sd-btn-loading');
      resolve();
      confirm().should('have.class', 'sd-btn-loading');
      cy.get('[data-testid="confirm-ok"]').should('have.text', '0');
      cy.get('[data-testid="confirm-requests"]').should('have.text', '0');
      resolve();
      confirm().should('not.have.class', 'sd-btn-loading');
      cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
      cy.get('[data-testid="confirm-requests"]').should('have.text', '1');
      cy.get('[data-testid="controlled-confirm"]').should('have.attr', 'aria-expanded', 'true');
    });
  }
});
