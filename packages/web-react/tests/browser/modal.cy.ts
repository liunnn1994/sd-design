describe('React Modal and Drawer portals', () => {
  beforeEach(() => cy.visit('/modal.html'));

  for (const kind of ['Modal', 'Drawer'])
    it(`preserves ${kind} content and lifecycle when moving its portal container`, () => {
      cy.contains('button', `Open moving ${kind}`).click();
      cy.get(`[aria-label="Moving ${kind} draft"]`)
        .type(' draft')
        .then((element) => ({ node: element[0] }))
        .as('movingInput', { type: 'static' });
      cy.get(`[data-testid="moving-${kind}-opens"]`).should('have.text', '1');
      cy.get(`#moving-${kind}-a`).should('have.css', 'overflow', 'hidden');
      cy.get(`#moving-${kind}-a .sd-${kind.toLowerCase()}-container`)
        .parent()
        .then((host) => ({ node: host[0] }))
        .as('movingHost', { type: 'static' });
      cy.window().then((win) => win.dispatchEvent(new Event(`move-${kind}`)));
      cy.get(`#moving-${kind}-b input`)
        .should('have.value', 'initial draft')
        .then((element) =>
          cy
            .get('@movingInput')
            .then((saved) => expect(Reflect.get(saved, 'node')).to.equal(element[0])),
        );
      cy.get(`#moving-${kind}-a`).should('have.css', 'overflow', 'auto');
      cy.get(`#moving-${kind}-b`).should('have.css', 'overflow', 'hidden');
      cy.get(`[aria-label="Moving ${kind} draft"]`)
        .should('be.focused')
        .trigger('keydown', { key: 'Escape' });
      cy.get(`#moving-${kind}-b input`).should('not.exist');
      cy.get(`#moving-${kind}-b`).should('have.css', 'overflow', 'auto');
      cy.get(`[data-testid="moving-${kind}-opens"]`).should('have.text', '1');
      cy.window().then((win) =>
        win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'moving-unmount' } })),
      );
      cy.get('@movingHost').should((saved) =>
        expect(Reflect.get(saved, 'node').isConnected).to.equal(false),
      );
    });

  it('ignores a retained Modal hook API after owner unmount without leaking overlays', () => {
    cy.contains('button', 'Open hook modal').click();
    cy.contains('[role="dialog"]', 'Hook modal').should('be.visible');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'hook-unmount' } })),
    );
    cy.get('.sd-overlay-modal').should('not.exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'late-hook' } })),
    );
    cy.get('.sd-overlay-modal').should('not.exist');
  });

  it('keeps controlled Modal open when updates are rejected and supports default and explicit contexts', () => {
    cy.contains('button', 'Open rejected modal').click();
    cy.get('[data-testid="modal-rejected"] .sd-modal-footer .sd-btn-primary').click();
    cy.get('[data-testid="modal-events"]').should('contain.text', 'rejected:false');
    cy.get('[data-testid="modal-rejected"]').should('be.visible');
    cy.get('[aria-label="Rejected input"]').trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="modal-rejected"]').should('not.be.visible');
    cy.contains('button', 'Open default modal').click();
    cy.contains('[role="dialog"]', 'Default content')
      .should('be.visible')
      .find('.sd-btn-primary')
      .click();
    cy.contains('[role="dialog"]', 'Default content').should('not.exist');
    cy.contains('button', 'Open context modal').click();
    cy.contains('[role="dialog"]', 'Context content').should('have.css', 'width', '310px');
    cy.contains('button', 'Context confirm').click();
    cy.contains('[role="dialog"]', 'Context content').should('not.exist');
  });

  it('opens Modal with accessible focus, traps nested dialogs and restores the opener', () => {
    cy.contains('button', 'Open modal').click();
    cy.get('[aria-label="Modal input"]').should('be.focused');
    cy.get('[data-testid="modal-main"] [role="dialog"]')
      .should('have.attr', 'aria-modal', 'true')
      .and('have.css', 'width', '360px');
    cy.get('[data-testid="modal-events"]').should('contain.text', 'before-open|open');
    cy.contains('button', 'Open nested modal').click();
    cy.get('[aria-label="Nested modal input"]')
      .should('be.focused')
      .trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="modal-nested"]').should('not.exist');
    cy.get('[data-testid="modal-main"]').should('be.visible');
    cy.contains('button', 'Open nested modal')
      .should('be.focused')
      .trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.contains('button', 'Open modal').should('be.focused');
    cy.get('[data-testid="modal-events"]').should(
      'contain.text',
      'cancel|visible:false|before-close|close',
    );
  });

  it('cycles Tab within the upper Modal and releases focus and body styles after unmount', () => {
    const bodyStyle = { width: '98%', boxSizing: 'content-box', overflow: 'scroll' };
    cy.document().then(({ body }) => {
      Object.assign(body.style, bodyStyle);
    });

    cy.contains('button', 'Open modal').click();
    cy.get('[aria-label="Modal input"]').should('be.focused');
    cy.contains('button', 'Open nested modal').click();
    cy.get('[aria-label="Nested modal input"]').should('be.focused');
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.contains('button', 'Unmount nested modal').should('be.focused');
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get('[data-testid="modal-nested"] .sd-modal-close-btn').should('be.focused');
    cy.contains('button', 'Unmount nested modal').click();

    cy.get('[data-testid="modal-nested"]').should('not.exist');
    cy.contains('button', 'Open nested modal').should('be.focused');
    cy.get('body').should('have.css', 'overflow', 'hidden');
    cy.contains('button', 'Confirm modal').focus();
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get('[data-testid="modal-main"] .sd-modal-close-btn').should('be.focused');
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.contains('button', 'Open modal').should('be.focused');
    cy.document().should(({ body }) => {
      for (const [name, value] of Object.entries(bodyStyle)) {
        expect(body.style[name as keyof typeof bodyStyle]).to.equal(value);
      }
    });
  });

  it('updates the accessible Modal title and closes from the header with Space', () => {
    const dialog = () => cy.get('[data-testid="modal-main"] [role="dialog"]');
    const assertTitle = () =>
      dialog().should(([$dialog]) => {
        const title = $dialog.ownerDocument.getElementById(
          $dialog.getAttribute('aria-labelledby')!,
        );
        expect(title?.querySelector('.sd-ellipsis-content')?.textContent).to.equal('Main modal');
      });
    cy.contains('button', 'Open modal').click();
    cy.get('[data-testid="modal-events"]').should('have.text', 'before-open|open');
    assertTitle();
    cy.contains('button', 'Toggle modal title').click();
    dialog().should('not.have.attr', 'aria-labelledby');
    dialog().find('.sd-modal-title').should('not.exist');
    cy.contains('button', 'Toggle modal title').click();
    assertTitle();
    dialog().find('.sd-modal-close-btn').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    dialog().should('not.exist');
    cy.get('[data-testid="modal-events"]').should(
      'have.text',
      'before-open|open|cancel|visible:false|before-close|close',
    );
  });

  it('keeps the modal open after a thrown confirmation and allows a successful retry', () => {
    cy.contains('button', 'Open modal').click();
    cy.get('[data-testid="modal-events"]').should('have.text', 'before-open|open');
    cy.contains('button', 'Fail next modal confirmation').click();
    cy.contains('button', 'Confirm modal').click();
    cy.get('[data-testid="modal-main"]').should('be.visible');
    cy.contains('button', 'Confirm modal').should('not.have.class', 'sd-btn-loading');
    cy.get('[data-testid="modal-events"]').should('have.text', 'before-open|open');

    cy.contains('button', 'Confirm modal').click();
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.get('[data-testid="modal-events"]').should(
      'have.text',
      'before-open|open|ok|visible:false|before-close|close',
    );
  });

  it('honors Modal confirmation vetoes, async results and cancellation after unmount', () => {
    cy.contains('button', 'Open modal').click();
    cy.contains('button', 'Modal veto').click();
    cy.contains('button', 'Confirm modal').click();
    cy.contains('button', 'Cancel modal').click();
    cy.get('[data-testid="modal-main"]').should('be.visible');
    cy.contains('button', 'Modal veto').click();
    cy.contains('button', 'Modal async').click();
    cy.contains('button', 'Confirm modal').click().should('have.class', 'sd-btn-loading');
    cy.window().then((win) =>
      win.dispatchEvent(
        new CustomEvent('modal-action', { detail: { type: 'resolve', value: false } }),
      ),
    );
    cy.contains('button', 'Confirm modal').should('not.have.class', 'sd-btn-loading').click();
    cy.window().then((win) =>
      win.dispatchEvent(
        new CustomEvent('modal-action', { detail: { type: 'resolve', value: true } }),
      ),
    );
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.get('[data-testid="modal-events"]').should('contain.text', 'ok|visible:false');
    cy.contains('button', 'Open modal').click();
    cy.contains('button', 'Confirm modal').click();
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'unmount' } })),
    );
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.window().then((win) =>
      win.dispatchEvent(
        new CustomEvent('modal-action', { detail: { type: 'resolve', value: true } }),
      ),
    );
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.get('[data-testid="modal-events"]')
      .invoke('text')
      .should((text) =>
        expect(text.split('|').filter((value) => value === 'ok')).to.have.length(1),
      );
  });

  for (const mode of ['Modal async', 'Modal deferred callback']) {
    it(`ignores a stale confirmation after controlled reopening using ${mode}`, () => {
      const action = (type: string) =>
        cy
          .window()
          .then((win) => win.dispatchEvent(new CustomEvent('modal-action', { detail: { type } })));
      const confirm = () => cy.contains('button', 'Confirm modal');
      cy.contains('button', 'Open modal').click();
      cy.contains('button', mode).click();
      confirm().click().should('have.class', 'sd-btn-loading');
      action('hide');
      cy.get('[data-testid="modal-main"]').should('not.exist');
      cy.contains('button', 'Open modal').click();
      action('resolve');
      confirm().should('not.have.class', 'sd-btn-loading');
      cy.get('[data-testid="modal-events"]').should('not.contain.text', 'ok');
      confirm().click().should('have.class', 'sd-btn-loading');
      action('resolve');
      cy.get('[data-testid="modal-main"]').should('not.exist');
      cy.get('[data-testid="modal-events"]').should('contain.text', 'ok|visible:false');
    });
  }

  it('updates Escape handling while open and restores the opener when enabled', () => {
    cy.contains('button', 'Open modal').click();
    cy.contains('button', 'Modal toggle Escape').click();
    cy.get('[aria-label="Modal input"]').type('{esc}').should('be.visible');
    cy.get('[data-testid="modal-events"]').should('not.contain.text', 'cancel');
    cy.contains('button', 'Modal toggle Escape').click();
    cy.get('[aria-label="Modal input"]').type('{esc}');
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.contains('button', 'Open modal').should('be.focused');
    cy.get('[data-testid="modal-events"]').should('contain.text', 'cancel|visible:false');
  });

  it('blocks both mask click paths while disabled and cancels once when enabled', () => {
    const modal = '[data-testid="modal-main"]';
    const clickMask = () => cy.get(`${modal} .sd-modal-mask`).then(([$mask]) => $mask.click());
    cy.contains('button', 'Open modal').click();
    cy.get('[data-testid="modal-events"]').should('have.text', 'before-open|open');
    cy.contains('button', 'Modal toggle mask closing').click();
    cy.get(`${modal} .sd-modal-wrapper`).click('topLeft');
    clickMask();
    cy.get(modal).should('be.visible');
    cy.get('[data-testid="modal-events"]').should('have.text', 'before-open|open');

    cy.contains('button', 'Modal toggle mask closing').click();
    clickMask();
    cy.get(modal).should('not.exist');
    cy.get('[data-testid="modal-events"]').should(
      'have.text',
      'before-open|open|cancel|visible:false|before-close|close',
    );
  });

  it('requires a Modal mask gesture and does not reopen on fullscreen changes', () => {
    cy.contains('button', 'Open modal').click();
    cy.get('[data-testid="modal-events"]').should('contain.text', 'before-open|open');
    cy.get('[data-testid="modal-main"] .sd-modal-wrapper').trigger('click', { force: true });
    cy.get('[data-testid="modal-main"]').should('be.visible');
    cy.contains('button', 'Modal fullscreen').click();
    cy.get('[data-testid="modal-main"] .sd-modal')
      .should('have.class', 'sd-modal-fullscreen')
      .and('not.have.class', 'zoom-in-enter-active');
    cy.contains('button', 'Modal fullscreen').click();
    cy.get('[data-testid="modal-main"] .sd-modal')
      .should('not.have.class', 'sd-modal-fullscreen')
      .and('not.have.class', 'zoom-modal-enter-active');
    cy.get('[data-testid="modal-events"]')
      .invoke('text')
      .should((text) =>
        expect(text.split('|').filter((value) => value === 'open')).to.have.length(1),
      );
    cy.get('[data-testid="modal-main"] .sd-modal-wrapper')
      .trigger('mousedown', { force: true })
      .trigger('click', { force: true });
    cy.get('[data-testid="modal-main"]').should('not.exist');
  });

  it('drags Modal within its wrapper and resets the dragged position after closing', () => {
    cy.contains('button', 'Open modal').click();
    cy.get('[data-testid="modal-main"] .sd-modal-header').trigger('mousedown', {
      eventConstructor: 'MouseEvent',
      clientX: 450,
      clientY: 200,
    });
    cy.window().then((win) => {
      win.dispatchEvent(new win.MouseEvent('mousemove', { clientX: 550, clientY: 250 }));
      win.dispatchEvent(new win.MouseEvent('mouseup'));
    });
    cy.get('[data-testid="modal-main"] .sd-modal-wrapper').should(
      'have.class',
      'sd-modal-wrapper-moved',
    );
    cy.get('[data-testid="modal-main"] .sd-modal')
      .should('have.attr', 'style')
      .and('contain', 'translate(');
    cy.contains('button', 'Cancel modal').click();
    cy.get('[data-testid="modal-main"]').should('not.exist');
    cy.contains('button', 'Open modal').click();
    cy.get('[data-testid="modal-main"] .sd-modal-wrapper').should(
      'not.have.class',
      'sd-modal-wrapper-moved',
    );
  });

  it('unregisters active window drag listeners when the Modal unmounts', () => {
    cy.contains('button', 'Open modal').click();
    cy.window().then((win) => {
      const add = cy.spy(win, 'addEventListener');
      const remove = cy.spy(win, 'removeEventListener');
      cy.get('[data-testid="modal-main"] .sd-modal-header').trigger('mousedown', {
        eventConstructor: 'MouseEvent',
        clientX: 450,
        clientY: 200,
      });
      cy.then(() =>
        win.dispatchEvent(new win.CustomEvent('modal-action', { detail: { type: 'unmount' } })),
      );
      cy.get('[data-testid="modal-main"]').should('not.exist');
      cy.get('body').should('not.have.css', 'overflow', 'hidden');
      cy.then(() => {
        for (const type of ['mousemove', 'mouseup', 'contextmenu']) {
          const registration = add.getCalls().find(({ args }) => args[0] === type);
          expect(registration, `${type} registered`).not.to.equal(undefined);
          const removed = remove
            .getCalls()
            .some(({ args }) => args[0] === type && args[1] === registration?.args[1]);
          expect(removed, `${type} removed`).to.equal(true);
        }
      });
    });
  });

  it('renders local Modal layout and custom footer without locking an unrelated container', () => {
    cy.contains('button', 'Open local modal').click();
    cy.get('#modal-local-host [data-testid="modal-local"]').should('be.visible');
    cy.get('[data-testid="modal-local"] .sd-modal')
      .should('have.css', 'width', '280px')
      .and('have.css', 'top', '40px');
    cy.get(
      '[data-testid="modal-local"] .sd-modal-header, [data-testid="modal-local"] .sd-modal-mask',
    ).should('not.exist');
    cy.get('[data-testid="modal-local"] .custom-modal-body').should('have.css', 'padding', '12px');
    cy.get('[data-testid="modal-local"] .sd-modal-footer').should('have.text', 'Custom footer');
    cy.get('#modal-local-host').should('have.css', 'overflow', 'hidden');
    cy.get('[data-testid="modal-local"] [role="dialog"]').trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="modal-local"]').should('not.be.visible');
    cy.get('#modal-local-host').should('have.css', 'overflow', 'auto');
  });

  it('updates static Modal instances, preserves callback order and cleans immediate closes', () => {
    cy.contains('button', 'Open static modal').click();
    cy.get('.sd-overlay-modal .sd-modal').should('have.class', 'sd-modal-simple');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'update' } })),
    );
    cy.get('.sd-overlay-modal .sd-modal').should('have.css', 'width', '420px');
    cy.contains('button', 'Updated confirm').click();
    cy.get('.sd-overlay-modal').should('not.exist');
    cy.get('[data-testid="modal-events"]').should('contain.text', 'static-close|static-ok');
    cy.contains('button', 'Immediate modal close').click();
    cy.get('.sd-overlay-modal').should('not.exist');
    cy.get('[data-testid="modal-events"]').should('contain.text', 'immediate-close');
  });

  it('creates all Modal message variants and destroys the global registry', () => {
    cy.contains('button', 'Open modal types').click();
    cy.get('.sd-overlay-modal').should('have.length', 4);
    cy.get('.sd-overlay-modal .sd-modal-simple').should('not.exist');
    cy.get('.sd-overlay-modal .sd-modal-title-icon svg').should('have.length', 4);
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'destroy' } })),
    );
    cy.get('.sd-overlay-modal').should('not.exist');
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
  });

  it('inherits Modal holder context and local theme and owns StrictMode effect instances', () => {
    cy.window().then((win) => cy.spy(win.console, 'error').as('modalErrors'));
    cy.contains('button', 'Open hook modal').click();
    cy.get('.sd-overlay-modal').should('contain.text', 'Holder context');
    cy.contains('button', 'Inherited confirm').should('exist');
    cy.get('.sd-overlay-modal .sd-modal-container')
      .should('have.attr', 'sd-theme', 'dark')
      .and('have.css', '--color-primary-6', '#d03050');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'hook-unmount' } })),
    );
    cy.get('.sd-overlay-modal').should('not.exist');
    cy.contains('button', 'Open effect modal').click();
    cy.get('.sd-overlay-modal').should('have.length', 1).and('contain.text', 'Owned effect modal');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('modal-action', { detail: { type: 'effect-unmount' } })),
    );
    cy.get('.sd-overlay-modal').should('not.exist');
    cy.get('@modalErrors').should('not.have.been.called');
  });
});
