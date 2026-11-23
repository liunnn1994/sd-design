describe('BloomMenu React', { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.visit('/bloom-menu.html');
    cy.get('[data-testid="bloom-main"]').scrollIntoView({ offset: { top: -220, left: 0 } });
  });
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );
  const trigger = () => cy.get('[data-testid="bloom-main"] [data-bloom-menu-trigger]');
  it('opens a dialog from the native trigger, focuses an enabled item and selects in order', () => {
    cy.contains('button', 'Bloom ref').click();
    trigger().scrollIntoView().focus().should('have.focus');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type: 'keyDown',
          key: 'Enter',
          code: 'Enter',
          windowsVirtualKeyCode: 13,
          text: '\r',
        },
      }),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
      }),
    );
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
    cy.get('[data-bloom-menu-panel]')
      .should('have.attr', 'role', 'dialog')
      .and('have.attr', 'aria-label', 'Create');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type: 'keyDown',
          key: 'Enter',
          code: 'Enter',
          windowsVirtualKeyCode: 13,
          text: '\r',
        },
      }),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
      }),
    );
    cy.get('[data-testid="bloom-events"]').should(
      'have.text',
      'update:true|open|select:one:0|update:false|close',
    );
    trigger().should('have.focus');
    cy.get('[data-bloom-menu-panel]').should('not.exist');
  });
  it('rejects opening when controlled false and reopens after an ignored controlled close', () => {
    cy.contains('button', 'Bloom reject open').click();
    trigger().click();
    cy.get('[data-bloom-menu-panel]').should('not.exist');
    cy.get('[data-testid="bloom-events"]').should('have.text', 'update:true|open');
    cy.contains('button', 'Bloom force open').click();
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.get('[data-bloom-menu-panel]').should('not.exist');
    trigger().click();
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
  });
  it('preserves the closing morph and cancels a pending hide on controlled reopen', () => {
    cy.contains('button', 'Bloom force open').click();
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
    cy.window().then((win) => win.dispatchEvent(new win.Event('bloom-close')));
    cy.get('[data-bloom-menu-panel]').should('exist');
    cy.window().then((win) => win.dispatchEvent(new win.Event('bloom-open')));
    cy.wait(500);
    cy.get('[data-bloom-menu-panel]').should('be.visible');
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
  });
  it('uses current item indices and never selects disabled entries', () => {
    cy.contains('button', 'Bloom reorder').click();
    trigger().click();
    cy.contains('.sd-bloom-menu-item', 'Second').should('have.focus');
    cy.contains('.sd-bloom-menu-item', 'First').should('be.disabled').click({ force: true });
    cy.get('[data-testid="bloom-events"]').should('not.contain.text', 'select:');
    cy.contains('.sd-bloom-menu-item', 'Second').click();
    cy.get('[data-testid="bloom-events"]').should('contain.text', 'select:two:0');
  });
  it('updates open offsets without scroll or resize and preserves centered positioning', () => {
    cy.viewport(1200, 900);
    trigger()
      .scrollIntoView({ offset: { top: -300, left: 0 } })
      .click();
    cy.get('[data-bloom-menu-panel]').should('have.css', 'opacity', '1');
    cy.wait(1000);
    cy.get('.sd-bloom-menu-popup').then(($popup) => {
      const previous = $popup[0].getBoundingClientRect();
      cy.window().then((win) => win.dispatchEvent(new win.Event('bloom-offset')));
      cy.get('.sd-bloom-menu-popup').should(($next) => {
        const next = $next[0].getBoundingClientRect();
        expect(next.left - previous.left).to.be.closeTo(40, 2);
        expect(next.top - previous.top).to.be.closeTo(20, 2);
      });
    });
  });
  it('normalizes columns and renders custom trigger, header, item and empty content', () => {
    cy.contains('button', 'Bloom custom').click();
    cy.contains('button', 'Bloom columns').click();
    trigger().should('contain.text', 'Custom actions').click();
    cy.get('[data-bloom-menu-panel]').should('have.css', '--bloom-menu-columns', '2');
    cy.contains('.sd-bloom-menu-item', '0:First').should('be.visible');
    cy.contains('button', 'Custom close').click();
    trigger().should('have.focus');
    cy.get('[data-bloom-menu-panel]').should('not.exist');
    cy.contains('button', 'Bloom empty').click();
    trigger().click();
    cy.get('.sd-bloom-menu-empty').should('have.text', 'Custom empty');
  });
  it('forwards Button props and pointer events and labels the close action', () => {
    cy.contains('button', 'Bloom button props').click();
    trigger()
      .should('have.class', 'sd-btn-primary')
      .and('have.class', 'sd-btn-size-large')
      .and('have.class', 'sd-btn-shape-circle')
      .and('have.class', 'custom-bloom-button')
      .and('have.attr', 'aria-label', 'Commands');
    trigger().should('have.css', 'height', '40px').and('have.css', 'opacity', '0.99').click();
    cy.get('[data-testid="bloom-events"]').should('contain.text', 'pointer|update:true|open');
    cy.get('.sd-bloom-menu-close').should('have.attr', 'aria-label', 'Dismiss actions');
  });
  it('renders item icons and gives the icon renderer precedence for every item', () => {
    cy.contains('button', 'Bloom item icons').click();
    trigger().click();
    cy.get('[data-testid="bloom-inline-icon"]')
      .not('[data-ellipsis-measure] *')
      .should('have.length', 1);
    cy.get('.sd-bloom-menu-close').click();
    cy.get('[data-bloom-menu-panel]').should('not.exist');
    cy.contains('button', 'Bloom render icons').click();
    trigger().click();
    cy.get('[data-testid="bloom-icon"]').not('[data-ellipsis-measure] *').should('have.length', 2);
    cy.get('[data-testid="bloom-inline-icon"]').should('not.exist');
    cy.contains('.sd-bloom-menu-item', 'Zero').click();
    cy.get('[data-testid="bloom-events"]').should('contain.text', 'select:0:0');
  });
  it('focuses the close button with no enabled items and closes on an outside click', () => {
    cy.contains('button', 'Bloom all disabled').click();
    trigger().click();
    cy.get('.sd-bloom-menu-close').should('have.focus');
    cy.get('[data-testid="bloom-outside"]').click();
    cy.get('[data-bloom-menu-panel]').should('not.exist');
    cy.contains('button', 'Bloom empty').click();
    trigger().click();
    cy.get('.sd-bloom-menu-close').should('have.focus');
    cy.get('.sd-bloom-menu-empty').should('be.visible');
  });
  it('keeps the animated panel within the viewport at a screen edge', () => {
    cy.contains('button', 'Bloom edge').click();
    trigger().click();
    cy.get('[data-bloom-menu-panel]').should('have.css', 'opacity', '1');
    cy.window().then((win) => {
      cy.get('[data-bloom-menu-panel]').should(($panel) => {
        const rect = $panel[0].getBoundingClientRect();
        expect(rect.left).to.be.at.least(0);
        expect(rect.top).to.be.at.least(0);
        expect(rect.right).to.be.at.most(win.innerWidth);
        expect(rect.bottom).to.be.at.most(win.innerHeight);
      });
    });
  });
  it('honors reduced motion and releases portal and pending work on unmount', () => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    trigger().click();
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
    cy.get('.sd-bloom-menu-close').click();
    cy.get('[data-bloom-menu-panel]').should('not.exist');
    trigger().click();
    cy.contains('button', 'Bloom ref').click({ force: true });
    cy.get('[data-testid="bloom-ref"]').should('have.text', 'DIV');
    cy.contains('button', 'Bloom mount').click({ force: true });
    cy.contains('button', 'Bloom ref').click();
    cy.get('[data-testid="bloom-ref"]').should('have.text', 'none');
    cy.get('[data-bloom-menu-panel]').should('not.exist');
    cy.wait(500);
    cy.get('[data-bloom-menu-panel]').should('not.exist');
  });
});

export {};
