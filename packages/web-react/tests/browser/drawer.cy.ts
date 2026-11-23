describe('React drawer', () => {
  it('opens, updates and closes imperative drawers with provider settings and cleanup', () => {
    cy.visit('/drawer.html');
    cy.contains('button', '打开命令抽屉').click();
    cy.get('[aria-label="命令抽屉输入"]').should('be.focused');
    cy.get('.imperative-drawer .sd-drawer').should('have.css', 'left', '0px');
    cy.get('.imperative-drawer .sd-drawer').should('have.css', 'width', '280px');
    // The imperative drawer traps focus, so its public handle drives updates from the fixture.
    cy.contains('button', '更新命令抽屉').click({ force: true });
    cy.get('.imperative-drawer .sd-drawer').should('have.css', 'width', '410px');
    cy.get('.imperative-drawer .sd-drawer-mask').click('right');
    cy.get('.imperative-drawer .sd-drawer').should('be.visible');
    cy.get('.imperative-drawer .sd-drawer-footer').contains('button', '确定').click();
    cy.get('.imperative-drawer').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'imperativeOk,imperativeClose');
    cy.contains('button', '打开命令抽屉').click();
    cy.get('.imperative-drawer .sd-drawer-footer').contains('button', '取消').click();
    cy.get('.imperative-drawer').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should(
      'contain.text',
      'imperativeCancel,imperativeClose',
    );
    cy.contains('button', '打开命令抽屉').click();
    cy.contains('button', '关闭命令抽屉').click({ force: true });
    cy.get('.imperative-drawer').should('not.exist');
    cy.contains('button', '立即关闭命令抽屉').click();
    cy.contains('瞬时抽屉').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'immediateClose');
  });

  it('traps drawer focus, closes only the top dialog with Escape and restores focus', () => {
    cy.visit('/drawer.html');
    cy.contains('button', '打开抽屉测试').click();
    cy.get('[aria-label="抽屉输入"]').should('be.focused');
    cy.get('.sd-drawer').filter(':visible').should('have.css', 'width', '320px');
    cy.get('.sd-drawer[role="dialog"]:visible').should(([$dialog]) => {
      const document = $dialog.ownerDocument;
      const title = document.getElementById($dialog.getAttribute('aria-labelledby')!);
      const body = document.getElementById($dialog.getAttribute('aria-describedby')!);
      expect(title?.textContent).to.contain('抽屉测试');
      expect(Boolean(body?.querySelector('[aria-label="抽屉输入"]'))).to.equal(true);
      expect($dialog.getAttribute('aria-modal')).to.equal('true');
    });
    cy.get('body').should('have.css', 'overflow', 'hidden');
    cy.contains('button', '打开内层抽屉').click();
    cy.get('[aria-label="内层输入"]').should('be.focused');
    const upper = () => cy.get('[aria-label="内层输入"]').closest('[role="dialog"]');
    cy.press(Cypress.Keyboard.Keys.TAB);
    upper().find('.sd-drawer-close-btn').should('be.focused');
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get('[aria-label="内层输入"]').should('be.focused');
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.contains('.sd-drawer-title', '内层抽屉').should('not.exist');
    cy.contains('button', '打开内层抽屉').should('be.focused');
    cy.get('body').should('have.css', 'overflow', 'hidden');
    const lower = () => cy.get('[aria-label="抽屉输入"]').closest('[role="dialog"]');
    lower().find('.sd-drawer-footer .sd-btn-primary').focus();
    cy.press(Cypress.Keyboard.Keys.TAB);
    lower().find('.sd-drawer-close-btn').should('be.focused');
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.contains('.sd-drawer-title', '抽屉测试').should('not.exist');
    cy.contains('button', '打开抽屉测试').should('be.focused');
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'beforeClose,close');
  });

  for (const heading of ['title', 'header']) {
    it(`refreshes the drawer accessible title after changing the ${heading}`, () => {
      cy.visit(`/drawer.html?scenario=${heading}`);
      cy.contains('button', '打开抽屉测试').click();
      const dialog = () => cy.get('[aria-label="抽屉输入"]').closest('[role="dialog"]');
      const expectLabel = (title: string) =>
        dialog().should(([$dialog]) => {
          const id = $dialog.getAttribute('aria-labelledby');
          expect($dialog.ownerDocument.getElementById(id ?? '')?.textContent).to.include(title);
        });
      if (heading === 'title') dialog().should('not.have.attr', 'aria-labelledby');
      else expectLabel('抽屉测试');
      cy.contains('button', 'Toggle drawer heading').click();
      if (heading === 'title') expectLabel('Custom title');
      else {
        dialog().should('contain.text', 'Custom header');
        dialog().should('not.have.attr', 'aria-labelledby');
      }
      cy.contains('button', 'Toggle drawer heading').click();
      if (heading === 'title') dialog().should('not.have.attr', 'aria-labelledby');
      else expectLabel('抽屉测试');
    });
  }

  it('retains a vetoed drawer and completes async confirmation before unmounting', () => {
    cy.visit('/drawer.html');
    cy.contains('button', '打开抽屉测试').click();
    cy.get('.sd-drawer-footer').filter(':visible').contains('button', '确定').click();
    cy.get('.sd-drawer-footer .sd-btn-loading').should('exist');
    cy.get('.sd-drawer-footer .sd-btn-loading').should('not.exist');
    cy.get('[aria-label="抽屉输入"]').should('be.visible');
    cy.contains('button', '允许抽屉确认').click();
    cy.get('.sd-drawer-footer').filter(':visible').contains('button', '确定').click();
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'ok,beforeClose,close');
  });

  it('clears pending confirmation after a rejection and lets the user retry', () => {
    cy.visit('/drawer.html?pending=promise');
    const confirm = () => cy.get('.sd-drawer-footer:visible').contains('button', '确定');
    const events = () => cy.get('[data-testid="drawer-events"]');
    cy.contains('button', '打开抽屉测试').click();
    events().should('have.text', 'beforeOpen,open');
    confirm().click().should('have.class', 'sd-btn-loading');
    cy.contains('button', 'Reject confirmation').click();
    confirm().should('not.have.class', 'sd-btn-loading');
    cy.get('[aria-label="抽屉输入"]').should('be.visible');
    events().should('have.text', 'beforeOpen,open');

    confirm().click().should('have.class', 'sd-btn-loading');
    cy.contains('button', 'Finish confirmation').click();
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    events().should('have.text', 'beforeOpen,open,ok,beforeClose,close');
  });

  it('unmounts the draft after leaving and mounts fresh input on reopening', () => {
    cy.visit('/drawer.html');
    const opener = () => cy.contains('button', '打开抽屉测试');
    const input = () => cy.get('[aria-label="抽屉输入"]');
    const events = () => cy.get('[data-testid="drawer-events"]');
    opener().click();
    events().should('have.text', 'beforeOpen,open');
    input().type('Draft').should('have.value', 'Draft');
    cy.get('.sd-drawer:visible .sd-drawer-close-btn').click();
    events().should('have.text', 'beforeOpen,open,beforeClose,close');
    input().should('not.exist');

    opener().should('be.focused').click();
    events().should('have.text', 'beforeOpen,open,beforeClose,close,beforeOpen,open');
    input().should('be.focused').and('have.value', '');
  });

  it('renders a maskless bottom drawer inside its custom container', () => {
    cy.visit('/drawer.html');
    cy.contains('button', '切换容器抽屉').click();
    cy.get('#drawer-container .sd-drawer')
      .should('be.visible')
      .should('have.css', 'height', '80px');
    cy.get('#drawer-container .sd-drawer-container').should('have.css', 'position', 'absolute');
    cy.get('#drawer-container .sd-drawer-mask').should('not.exist');
    cy.get('#drawer-container .sd-drawer').type('{esc}').should('be.visible');
  });

  it('honors mask policy and cancel veto before requesting controlled dismissal', () => {
    cy.visit('/drawer.html?scenario=cancel');
    const events = () => cy.get('[data-testid="drawer-events"]');
    const mask = () => cy.get('.sd-drawer-mask:visible');
    cy.contains('button', '打开抽屉测试').click();
    events().should('have.text', 'beforeOpen,open');
    mask().click('right');
    events().should('have.text', 'beforeOpen,open');
    cy.get('[aria-label="抽屉输入"]').should('be.visible');

    cy.contains('button', 'Enable mask dismissal').click();
    mask().click('right');
    events().should('have.text', 'beforeOpen,open,beforeCancel');
    cy.get('[aria-label="抽屉输入"]').should('be.visible');

    cy.contains('button', 'Allow cancel').click();
    cy.get('.sd-drawer:visible [data-drawer-close]').focus();
    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    events().should(
      'have.text',
      'beforeOpen,open,beforeCancel,beforeCancel,cancel,visible:false,beforeClose,close',
    );

    cy.contains('button', '打开抽屉测试').click();
    events().should('contain.text', 'beforeClose,close,beforeOpen,open');
    mask().click('right');
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    events().should(
      'contain.text',
      'close,beforeOpen,open,beforeCancel,cancel,visible:false,beforeClose,close',
    );
  });

  it('keeps a shared scroll container locked when the lower drawer closes first', () => {
    cy.visit('/drawer.html?ownership');
    cy.get('#drawer-scroll-owner').should('have.css', 'overflow', 'hidden');
    cy.get('#drawer-scroll-owner .sd-drawer[role="dialog"]').should('have.length', 2);
    cy.contains('button', 'Close lower owner').click();
    cy.contains('.sd-drawer-title', 'Lower owner').should('not.exist');
    cy.contains('.sd-drawer-title', 'Upper owner').should('be.visible');
    cy.get('#drawer-scroll-owner').should('have.css', 'overflow', 'hidden');
    cy.contains('button', 'Close upper owner').click();
    cy.get('#drawer-scroll-owner .sd-drawer').should('not.exist');
    cy.get('#drawer-scroll-owner').should('have.css', 'overflow', 'auto');
  });

  it('keeps a shared scroll container locked when the upper drawer closes first', () => {
    cy.visit('/drawer.html?ownership');
    cy.get('#drawer-scroll-owner .sd-drawer[role="dialog"]').should('have.length', 2);
    cy.contains('button', 'Close upper owner').click();
    cy.contains('.sd-drawer-title', 'Upper owner').should('not.exist');
    cy.get('#drawer-scroll-owner').should('have.css', 'overflow', 'hidden');
    cy.contains('button', 'Close remaining owner').click();
    cy.get('#drawer-scroll-owner .sd-drawer').should('not.exist');
    cy.get('#drawer-scroll-owner').should('have.css', 'overflow', 'auto');
  });

  it('removes an unmounted upper drawer from the Escape stack', () => {
    cy.visit('/drawer.html?scenario=unmount');
    cy.contains('button', '打开抽屉测试').click();
    cy.contains('button', '打开内层抽屉').click();
    cy.get('[aria-label="内层输入"]').should('be.focused');
    cy.contains('button', 'Remove upper drawer').click();
    cy.get('[aria-label="内层输入"]').should('not.exist');
    cy.get('body').should('have.css', 'overflow', 'hidden');
    cy.get('[aria-label="抽屉输入"]').type('{esc}');
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    cy.contains('button', '打开抽屉测试').should('be.focused');
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
  });

  it('uses the updated Escape setting while the drawer remains open', () => {
    cy.visit('/drawer.html?scenario=escape');
    cy.contains('button', '打开抽屉测试').click();
    cy.get('[aria-label="抽屉输入"]').type('{esc}').should('be.visible');
    cy.contains('button', 'Enable Escape').click();
    cy.get('[aria-label="抽屉输入"]').type('{esc}');
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    cy.contains('button', '打开抽屉测试').should('be.focused');
  });

  it('retains the drawer when confirmation throws and allows a successful retry', () => {
    cy.visit('/drawer.html?scenario=throw');
    const confirm = () => cy.get('.sd-drawer-footer:visible').contains('button', '确定');
    cy.contains('button', '打开抽屉测试').click();
    confirm().click();
    confirm().should('not.have.class', 'sd-btn-loading');
    cy.get('[aria-label="抽屉输入"]').should('be.visible');
    cy.get('[data-testid="drawer-events"]').should('not.contain.text', 'ok');
    cy.contains('button', '允许抽屉确认').click();
    confirm().click();
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'ok,beforeClose,close');
  });

  for (const pending of ['callback', 'promise']) {
    it(`ignores a stale ${pending} after a controlled close and reopen`, () => {
      cy.visit(`/drawer.html?pending=${pending}`);
      const open = () => cy.contains('button', '打开抽屉测试').click();
      const confirm = () => cy.get('.sd-drawer-footer:visible').contains('button', '确定');
      const finish = () => cy.contains('button', 'Finish confirmation').click();
      open();
      confirm().click().should('have.class', 'sd-btn-loading');
      cy.contains('button', 'External close').click();
      cy.get('[aria-label="抽屉输入"]').should('not.exist');
      open();
      finish();
      confirm().should('not.have.class', 'sd-btn-loading');
      cy.get('[data-testid="drawer-events"]').should('not.contain.text', 'ok');
      confirm().click().should('have.class', 'sd-btn-loading');
      finish();
      cy.get('[aria-label="抽屉输入"]').should('not.exist');
      cy.get('[data-testid="drawer-events"]').should(([$events]) => {
        expect($events.textContent.split(',').filter((event) => event === 'ok')).to.have.length(1);
      });
    });
  }
});
