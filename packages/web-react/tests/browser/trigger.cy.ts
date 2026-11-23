describe('React Trigger', () => {
  beforeEach(() => cy.visit('/trigger.html'));

  it('finishes popup enter and leave animations before firing lifecycle callbacks', () => {
    cy.contains('button', '动画弹层').click();
    cy.contains('动画弹层内容').should('be.visible');
    cy.get('[data-testid="trigger-animation-events"]').should('have.text', 'S');
    cy.contains('button', '动画弹层').click();
    cy.get('[data-testid="trigger-animation-events"]').should('have.text', 'SH');
    cy.contains('动画弹层内容').should('not.exist');
  });

  it('opens context menus at the pointer and dismisses on an outside context menu', () => {
    cy.contains('button', '右键弹层').trigger('contextmenu', { clientX: 400, clientY: 200 });
    cy.contains('.sd-trigger-popup', '右键弹层内容')
      .should('be.visible')
      .should(($popup) => {
        const rect = $popup[0].getBoundingClientRect();
        expect(Math.abs(rect.top - 200)).to.be.lessThan(1);
        expect(Math.abs(rect.left + rect.width / 2 - 400)).to.be.lessThan(1);
      });
    cy.document().then((document) =>
      document.body.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, clientX: 2, clientY: 2 }),
      ),
    );
    cy.contains('右键弹层内容').should('not.exist');
  });

  it('opens click triggers, connects ARIA and closes on Escape or outside click', () => {
    cy.contains('button', '点击弹层').click();
    cy.get('.sd-trigger-popup[role="dialog"]')
      .should('be.visible')
      .and('contain.text', '点击弹层内容');
    cy.contains('button', '点击弹层')
      .should('have.attr', 'aria-expanded', 'true')
      .invoke('attr', 'aria-controls')
      .then((id) => cy.get(`[id="${id}"]`).should('have.attr', 'role', 'dialog'));
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-trigger-popup[role="dialog"]').should('not.exist');
    cy.contains('button', '点击弹层').click();
    cy.get('body').click(1, 1);
    cy.get('.sd-trigger-popup[role="dialog"]').should('not.exist');
  });

  it('waits for controlled popup writeback and keeps nested portal clicks inside the parent', () => {
    cy.contains('button', '锁定弹层').click();
    cy.contains('拒绝写回内容').should('not.exist');
    cy.get('[data-testid="trigger-requests"]').should('have.text', '1');
    cy.contains('button', '受控弹层').click();
    cy.contains('受控弹层内容').should('be.visible');
    cy.contains('button', '外层弹层').click();
    cy.contains('button', '内层弹层').click();
    cy.contains('嵌套弹层内容').click();
    cy.contains('button', '内层弹层').should('be.visible');
    cy.contains('嵌套弹层内容').should('be.visible');
    cy.get('body').click(1, 1);
    cy.contains('嵌套弹层内容').should('not.exist');
  });

  it('honors delayed hover and immediate focus transitions', () => {
    cy.clock();
    cy.contains('button', '悬浮弹层').trigger('mouseover');
    cy.tick(99);
    cy.contains('悬浮弹层内容').should('not.exist');
    cy.tick(1);
    cy.contains('悬浮弹层内容').should('be.visible');
    cy.contains('button', '悬浮弹层').trigger('mouseout', { eventConstructor: 'MouseEvent' });
    cy.get('body').trigger('mousemove', {
      eventConstructor: 'MouseEvent',
      clientX: 0,
      clientY: 0,
      force: true,
    });
    cy.tick(99);
    cy.contains('悬浮弹层内容').should('be.visible');
    cy.tick(1);
    cy.contains('悬浮弹层内容').should('not.exist');
    cy.contains('button', '悬浮弹层').focus();
    cy.contains('悬浮弹层内容').should('be.visible');
    cy.contains('button', '悬浮弹层').blur();
    cy.contains('悬浮弹层内容').should('not.exist');
  });

  it('cancels a pending hover open when the same reference switches to click', () => {
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
    const reference = () => cy.contains('button', /^悬浮弹层$/);
    const popup = () => cy.contains('button', '悬浮弹层内容');
    reference().trigger('mouseover');
    cy.tick(99);
    popup().should('not.exist');
    cy.contains('button', 'Switch combination trigger').click();
    cy.tick(200);
    popup().should('not.exist');
    reference().trigger('mouseover');
    cy.tick(100);
    popup().should('not.exist');
    reference().click();
    popup().should('be.visible');
    reference().click();
    popup().should('not.exist');
  });

  it('keeps focus on the reference while the popup protects it and applies live blur settings', () => {
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
    const reference = () => cy.contains('button', /^悬浮弹层$/);
    const popup = () => cy.contains('button', '悬浮弹层内容');
    cy.contains('button', 'Toggle popup focus protection').click();
    reference().focus();
    popup().click();
    reference().should('be.focused');
    popup().should('be.visible');

    cy.contains('button', 'Toggle blur dismissal').trigger('click');
    cy.contains('button', 'Toggle popup focus protection').trigger('click');
    popup().click().should('be.focused');
    popup().should('be.visible');
    cy.contains('button', 'Toggle blur dismissal').trigger('click');
    reference().focus().blur();
    popup().should('not.exist');
  });

  it('flips the shared floating placement at the viewport boundary', () => {
    cy.get('[data-testid="floating-reference"]')
      .invoke('css', { position: 'fixed', bottom: '2px', right: '2px' })
      .click();
    cy.get('[data-testid="floating-popup"]')
      .should('have.attr', 'data-placement', 'top')
      .should(($popup) => {
        const rect = $popup[0].getBoundingClientRect();
        expect(rect.left).to.be.at.least(8);
        expect(rect.right).to.be.at.most($popup[0].ownerDocument.documentElement.clientWidth - 8);
        expect($popup[0].style.getPropertyValue('--sd-trigger-available-height')).to.match(/px$/);
      });
  });

  it('positions floating content and updates its alignment after reference resize', () => {
    cy.get('[data-testid="floating-reference"]').click();
    cy.get('[data-testid="floating-popup"]')
      .should('be.visible')
      .should('have.attr', 'data-placement', 'bottom');
    const aligned = () =>
      cy.get('[data-testid="floating-popup"]').should(($popup) => {
        const popup = $popup[0].getBoundingClientRect();
        const reference = $popup[0].ownerDocument
          .querySelector('[data-testid="floating-reference"]')!
          .getBoundingClientRect();
        expect(Math.abs(popup.top - reference.bottom - 10)).to.be.lessThan(1);
        expect(
          Math.abs(popup.left + popup.width / 2 - reference.left - reference.width / 2),
        ).to.be.lessThan(1);
      });
    aligned();
    cy.contains('button', '改变锚点宽度').click();
    aligned();
    cy.get('[data-testid="floating-reference"]').click();
    cy.get('[data-testid="floating-popup"]').should('not.exist');
  });

  it('fits a teleported popup to its reference and preserves its node while closed', () => {
    const reference = () => cy.contains('button', 'Sized reference');
    const content = () => cy.get('#trigger-host .custom-trigger-content');
    reference().click().should('have.class', 'sized-open');
    content().should('be.visible').and('have.css', 'background-color', 'rgb(17, 34, 51)');
    cy.get('#trigger-host .sd-trigger-popup').should('have.css', 'width', '180px');
    cy.get('#trigger-host .custom-trigger-arrow').should('exist');
    content().then(($open) => {
      reference().click().should('not.have.class', 'sized-open');
      content().should('not.be.visible');
      reference().click();
      content()
        .should('be.visible')
        .and(($reopened) => expect($reopened[0]).to.equal($open[0]));
    });
  });

  it('closes after the configured scroll distance and keeps a smaller scroll open', () => {
    cy.window().its('scrollY').should('equal', 0);
    cy.contains('button', 'Scroll-sensitive reference').click();
    cy.contains('Scroll-sensitive content').should('be.visible');
    cy.window().then((win) => win.scrollTo(0, 20));
    cy.window().its('scrollY').should('equal', 20);
    cy.contains('Scroll-sensitive content').should('be.visible');
    cy.window().then((win) => win.scrollTo(0, 100));
    cy.window().its('scrollY').should('equal', 100);
    cy.contains('Scroll-sensitive content').should('not.exist');
  });

  it('suppresses disabled and empty popups', () => {
    cy.contains('button', 'Disabled reference').click();
    cy.contains('Disabled content').should('not.exist');
    cy.contains('button', 'Empty reference').click();
    cy.get('.empty-trigger-content').should('not.exist');
  });
});

describe('React Trigger scroll lifecycle', () => {
  beforeEach(() => cy.visit('/trigger.html?scroll-lifecycle'));

  for (const target of ['window', 'ancestor']) {
    it(`measures ${target} scroll dismissal from where it was enabled`, () => {
      const popup = () => cy.contains('.sd-trigger-popup', 'Tracked popup');
      const scroll = (top: number) => {
        if (target === 'window') {
          cy.scrollTo(0, top);
          cy.window().its('scrollY').should('equal', top);
        } else {
          const parent = () => cy.get('[data-testid="scroll-parent"]');
          parent().scrollTo(0, top);
          parent().should('have.prop', 'scrollTop', top);
        }
      };
      popup().should('be.visible');
      scroll(35);
      cy.contains('button', 'Enable scroll dismissal').then(([$button]) => $button.click());
      cy.contains('button', 'Enable scroll dismissal').should('be.disabled');
      scroll(50);
      popup().should('be.visible');
      cy.get('[data-testid="scroll-requests"]').should('be.empty');
      scroll(70);
      popup().should('not.exist');
      cy.get('[data-testid="scroll-requests"]').should('have.text', 'false');
    });
  }

  it('refreshes the popup attributes in place while keeping it open', () => {
    const popup = () => cy.contains('.sd-trigger-popup', 'Tracked popup');
    popup()
      .should('have.attr', 'data-label', 'Original')
      .then(([$open]) => {
        cy.contains('button', 'Update popup label').click();
        popup().should(([$updated]) => {
          expect($updated).to.equal($open);
          expect($updated.getAttribute('data-label')).to.equal('Updated');
        });
      });
    cy.get('[data-testid="scroll-requests"]').should('be.empty');
  });

  it('removes the scroll listener on unmount and ignores later window and ancestor events', () => {
    cy.document().then((doc) => {
      const add = cy.spy(doc, 'addEventListener');
      const remove = cy.spy(doc, 'removeEventListener');
      cy.contains('button', 'Enable scroll dismissal').click();
      cy.contains('.sd-trigger-popup', 'Tracked popup').should('be.visible');
      cy.contains('button', 'Unmount scroll trigger').click();
      cy.contains('.sd-trigger-popup', 'Tracked popup').should('not.exist');
      cy.then(() => {
        const listener = add
          .getCalls()
          .find(({ args }) => args[0] === 'scroll' && args[2] === true);
        expect(listener, 'scroll listener registered').not.to.equal(undefined);
        const removed = remove
          .getCalls()
          .some(
            ({ args }) => args[0] === 'scroll' && args[1] === listener?.args[1] && args[2] === true,
          );
        expect(removed, 'scroll listener removed').to.equal(true);
        const win = doc.defaultView!;
        return new Cypress.Promise<void>((resolve) => {
          win.requestAnimationFrame(() => {
            win.scrollTo(0, 60);
            doc.querySelector('[data-testid="scroll-parent"]')!.scrollTop = 60;
            win.requestAnimationFrame(() => resolve());
          });
        });
      });
      cy.get('[data-testid="scroll-requests"]').should('be.empty');
    });
  });
});
