describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

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

  it('preserves AutoComplete focus across remote data updates and releases controlled values', () => {
    cy.get('[data-testid="auto-remote"] input').focus();
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { remote: [] } })),
    );
    cy.get('[data-testid="auto-remote"] input')
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
    cy.window().then((win) =>
      win.dispatchEvent(
        new CustomEvent('auto-complete-update', { detail: { remote: ['Reloaded'] } }),
      ),
    );
    cy.get('[data-testid="auto-remote"] input').should('be.focused');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Reloaded').click();
    cy.get('[data-testid="auto-remote"] input').should('have.value', 'Reloaded');
    cy.contains('button', 'Auto release').click();
    cy.get('[data-testid="auto-release"] input').should('have.value', '');
    cy.get('[data-testid="auto-custom"] input').focus();
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Empty').click();
    cy.get('[data-testid="auto-custom"] input').should('have.value', '');
  });

  it('ignores composing AutoComplete selection and closes open popups when disabled or readonly changes', () => {
    cy.get('[data-testid="auto-main"] input')
      .focus()
      .trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('[data-testid="auto-events"]').should('have.text', '');
    cy.get('.sd-auto-complete-dropdown:visible').should('exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { readonly: true } })),
    );
    cy.get('[data-testid="auto-main"] input')
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { readonly: false } })),
    );
    cy.get('[data-testid="auto-main"] input').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-auto-complete-dropdown:visible').should('exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { disabled: true } })),
    );
    cy.get('[data-testid="auto-main"] input')
      .should('be.disabled')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
  });

  it('emits AutoComplete scroll boundaries in both list modes and uses a custom popup container', () => {
    cy.get('[data-testid="auto-scroll"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible [data-overlayscrollbars-viewport]').scrollTo(
      'bottom',
    );
    cy.get('[data-testid="auto-events"]')
      .should('contain.text', 'normal-bottom')
      .and('contain.text', 'normal-scroll');
    cy.get('[data-testid="auto-virtual"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible .sd-select-option-active .sd-ellipsis-content')
      .first()
      .should('have.text', 'Item 400')
      .and('be.visible');
    cy.get('.sd-auto-complete-dropdown:visible [data-overlayscrollbars-viewport]').scrollTo(
      'bottom',
    );
    cy.get('[data-testid="auto-events"]')
      .should('contain.text', '|bottom')
      .and('contain.text', '|scroll');
    cy.get('[data-testid="auto-contained"] input').focus();
    cy.get('#auto-popup-host .sd-auto-complete-dropdown')
      .should('be.visible')
      .and('contain.text', 'Inside');
  });

  it('publishes AutoComplete search, update, change and select in Vue order', () => {
    cy.get('[data-testid="auto-main"] input').type('A');
    cy.get('[data-testid="auto-events"]').should('have.text', 'search:A|value:A|change:A');
    cy.get('.sd-auto-complete-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
    cy.get('.sd-auto-complete-dropdown:visible').should('contain.text', 'Suggestions footer');
    cy.get('[data-testid="auto-main"] input').trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="auto-value"]').should('have.text', 'Alpha');
    cy.get('[data-testid="auto-events"]').should(
      'contain.text',
      'select:Alpha|value:Alpha|change:Alpha',
    );
    cy.get('[data-testid="auto-main"] input')
      .should('not.be.focused')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="auto-main"] input').focus();
    cy.get('[data-testid="auto-main"] .sd-input-clear-btn').click();
    cy.get('[data-testid="auto-value"]').should('have.text', '');
    cy.get('[data-testid="auto-events"]').should('contain.text', 'value:|change:|clear');
  });

  it('navigates AutoComplete groups and skips disabled options while preserving numeric zero', () => {
    cy.get('[data-testid="auto-main"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible .sd-select-group > ul > li').should(
      'have.length',
      2,
    );
    cy.get('[data-testid="auto-main"] input')
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="auto-value"]').should('have.text', '0');
    cy.get('[data-testid="auto-main"] input').focus().trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="auto-main"] input')
      .should('have.attr', 'aria-expanded', 'false')
      .trigger('keydown', { key: 'Enter' });
    cy.get('.sd-auto-complete-dropdown:visible').should('exist');
  });

  it('filters AutoComplete case-sensitively in strict mode and supports normalized custom options', () => {
    cy.get('[data-testid="auto-main"] input').type('a');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Alpha').should('exist');
    cy.contains('button', 'Auto strict').click();
    cy.get('[data-testid="auto-main"] input').focus().clear().type('AL');
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
    cy.get('[data-testid="auto-custom"] input').type('b');
    cy.get('.sd-auto-complete-dropdown:visible [role="option"]')
      .should('have.length', 2)
      .first()
      .should('contain.text', 'Beta')
      .click();
    cy.get('[data-testid="auto-custom"] input').should('have.value', 'Beta');
  });

  it('restores refused AutoComplete writes and responds to external values, empty data and readonly state', () => {
    cy.get('[data-testid="auto-rejected"] input').type('x').should('have.value', '');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="auto-rejected"] input').should('have.value', '');
    cy.contains('button', 'Auto external').click();
    cy.get('[data-testid="auto-main"] input').should('have.value', 'Beta');
    cy.get('[data-testid="auto-remote"] input').type('anything');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Remote').should('exist');
    cy.contains('button', 'Auto empty').click();
    cy.get('[data-testid="auto-remote"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
    cy.contains('button', 'Auto reload').click();
    cy.get('[data-testid="auto-remote"] input').focus();
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Reloaded').should('exist');
    cy.contains('button', 'Auto readonly').click();
    cy.get('[data-testid="auto-main"] input').focus().trigger('keydown', { key: 'a' });
    cy.contains('.sd-tooltip-content:visible', 'Locked autocomplete').should('be.visible');
    cy.get('[data-testid="auto-main"] input').should('have.attr', 'aria-expanded', 'false');
    cy.contains('button', 'Auto disabled').click();
    cy.get('[data-testid="auto-main"] input').should('be.disabled');
  });

  it('scrolls AutoComplete virtual suggestions and honors local provider opt-outs', () => {
    cy.get('[data-testid="auto-virtual"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible [role="option"]').should('have.length.lessThan', 40);
    cy.get('.sd-auto-complete-dropdown:visible .sd-select-option-active .sd-ellipsis-content')
      .first()
      .should('have.text', 'Item 400')
      .and('be.visible');
    cy.get('[data-testid="auto-virtual"] input')
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="auto-virtual"] input').should('have.value', 'Item 401');
    cy.get('[data-testid="auto-optout"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible .sd-virtual-list').should('not.exist');
    cy.get('[data-testid="auto-optout"] .sd-input-clear-btn').should('not.exist');
  });

  it('validates AutoComplete form changes and releases focus refs on unmount', () => {
    cy.get('[data-testid="auto-form"] input').focus().blur();
    cy.contains('Choose a suggestion').should('be.visible');
    cy.get('[data-testid="auto-form"] input').type('v');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'valid').click();
    cy.contains('Choose a suggestion').should('not.exist');
    cy.contains('button', 'Auto focus').click();
    cy.get('[data-testid="auto-main"] input').should('be.focused');
    cy.contains('button', 'Auto blur').click();
    cy.get('[data-testid="auto-main"] input').should('not.be.focused');
    cy.contains('button', 'Auto mount').click();
    cy.get('[data-testid="auto-main"]').should('not.exist');
    cy.contains('button', 'Auto focus').click();
    cy.contains('button', 'Auto mount').click();
    cy.contains('button', 'Auto focus').click();
    cy.get('[data-testid="auto-main"] input').should('be.focused');
  });

  it('adjusts accepted controlled Pagination once and honors autoAdjust opt-out', () => {
    cy.get('[data-testid="pager-accepted"] .sd-select-view').click();
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^5 /).click();
    cy.get('[data-testid="pager-accepted"] [aria-current="page"]').should('have.text', '5');
    cy.get('[data-testid="pager-events"]')
      .invoke('text')
      .should((text) =>
        expect(text.split('|').filter((value) => value === 'accepted:5')).to.have.length(1),
      );
    cy.contains('button', 'Pagination shrink').click();
    cy.get('[data-testid="pager-no-adjust"] [aria-current="page"]').should('not.exist');
  });

  it('changes Pagination by keyboard and preserves update-before-change order', () => {
    cy.get('[data-testid="pager"] .sd-pagination-item')
      .contains(/^4$/)
      .focus()
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '4');
    cy.get('[data-testid="pager-events"]').should('have.text', 'update:4|change:4');
    cy.get('[data-testid="pager"] .sd-pagination-item-next')
      .focus()
      .trigger('keydown', { key: ' ' });
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '5');
    cy.contains('button', 'Pagination disabled').click();
    cy.get('[data-testid="pager"] .sd-pagination-item-next')
      .should('have.attr', 'tabindex', '-1')
      .click();
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '5');
  });

  it('adjusts Pagination around the first record after page-size and total changes', () => {
    cy.get('[data-testid="pager"] .sd-pagination-options .sd-select-view').click();
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^20 /).click();
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '2');
    cy.get('[data-testid="pager-events"]').should(
      'contain.text',
      'size-update:20|size:20|update:2|change:2',
    );
    cy.contains('button', 'Pagination shrink').click();
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '1');
    cy.get('[data-testid="pager"] .sd-pagination-item-next').should(
      'have.attr',
      'aria-disabled',
      'true',
    );
  });

  it('keeps controlled Pagination values until writeback and recalculates external sizes', () => {
    cy.get('[data-testid="pager-controlled"] .sd-pagination-item').contains(/^4$/).click();
    cy.get('[data-testid="pager-controlled"] [aria-current="page"]').should('have.text', '3');
    cy.get('[data-testid="pager-events"]').should('contain.text', 'rejected:4');
    cy.contains('button', 'Pagination external current').click();
    cy.get('[data-testid="pager-controlled"] [aria-current="page"]').should('have.text', '7');
    cy.contains('button', 'Pagination external size').click();
    cy.get('[data-testid="pager-events"]').should('contain.text', 'rejected:4');
    cy.get('[data-testid="pager-controlled"] .sd-pagination-options').should('contain.text', '20');
  });

  it('commits Pagination jumpers, clears ordinary drafts and synchronizes simple mode', () => {
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').type('6{enter}');
    cy.get('[data-testid="pager"] [aria-current="page"]').should('have.text', '6');
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').should('have.value', '');
    cy.contains('button', 'Pagination simple').click();
    cy.get('[data-testid="pager"] .sd-pagination-jumper input')
      .should('have.value', '6')
      .clear()
      .type('8{enter}');
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').should('have.value', '8');
    cy.get('[data-testid="pager"] .sd-pagination-item-next').click();
    cy.get('[data-testid="pager"] .sd-pagination-jumper input').should('have.value', '9');
    cy.get('[data-testid="pager-empty"] .sd-pagination-jumper input').type('2{enter}');
    cy.get('[data-testid="pager-empty"] .sd-pagination-jumper input').should('have.value', '');
    cy.get('[data-testid="pager-hidden"]').should('not.exist');
  });

  it('inherits Pagination configuration, renders custom slots and permits local opt-outs', () => {
    cy.get('[data-testid="pager-provider"]')
      .should('have.class', 'sd-pagination-size-small')
      .and('contain.text', 'Rows 200')
      .and('contain.text', 'Jump')
      .and('contain.text', 'page');
    cy.get('[data-testid="pager-provider"] .sd-pagination-item-ellipsis').first().click();
    cy.get('[data-testid="pager-provider"] [aria-current="page"]').should('have.text', 'P4');
    cy.get('[data-testid="pager-provider"] .sd-pagination-options .sd-select-view').click();
    cy.get('.sd-select-dropdown:visible [role="option"]').should('have.length', 2);
    cy.contains('.sd-select-dropdown:visible [role="option"]', /^50 /).click();
    cy.get('[data-testid="pager-provider"] [aria-current="page"]').should('have.text', 'P2');
    cy.get(
      '[data-testid="pager-optout"] .sd-pagination-total, [data-testid="pager-optout"] .sd-pagination-jumper, [data-testid="pager-optout"] .sd-pagination-options',
    ).should('not.exist');
  });

  it('rebinds the real popup anchor when Select switches between single and multiple views', () => {
    cy.get('[data-testid="select-switch-mode"]').click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
    cy.contains('button', 'Select switch mode').click();
    cy.get('[data-testid="select-switch-mode"]')
      .should('have.class', 'sd-select-view-multiple')
      .click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-switch-mode"] .sd-select-view-tag').should('have.length', 2);
    cy.contains('button', 'Select switch mode').click();
    cy.get('[data-testid="select-switch-mode"]')
      .should('have.class', 'sd-select-view-single')
      .click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
  });

  it('anchors Select popups to the actual view when CSS classes supply its width', () => {
    cy.get('[data-testid="select-class-width"]').should('have.css', 'width', '180px').click();
    cy.get('.sd-select-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
  });

  it('ignores composing Enter and restores a refused controlled search draft', () => {
    cy.get('[data-testid="select-create"] input').type('Composed');
    cy.get('[data-testid="select-create"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: true,
    });
    cy.get('[data-testid="select-create"] .sd-select-view-tag').should('not.exist');
    cy.get('[data-testid="select-create"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: false,
    });
    cy.get('[data-testid="select-create"] .sd-select-view-tag').should('contain.text', 'Composed');
    cy.get('[data-testid="select-create"] input').type('{esc}');
    cy.get('[data-testid="select-rejected"]').click();
    cy.get('[data-testid="select-rejected"] input').type('query').should('have.value', '');
    cy.get('[data-testid="select-rejected"] input').type('{esc}');
    cy.get('[data-testid="select-rejected"] .sd-select-view-value').should('contain.text', 'Zero');
  });

  it('supports controlled show aliases and custom trigger state without duplicate callbacks', () => {
    cy.get('[data-testid="select-custom"]').should('have.text', 'Chosen Alpha / false').click();
    cy.get('[data-testid="select-custom"]').should('have.text', 'Chosen Alpha / true');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-custom"]').should('have.text', 'Chosen Beta / false');
    cy.get('[data-testid="select-events"]').should(
      'have.text',
      'custom-popup:true|custom-popup:false',
    );
  });

  it('honors local search opt-out and initial inactive navigation with boolean values', () => {
    cy.get('[data-testid="select-no-search"]').click();
    cy.get('[data-testid="select-no-search"] input')
      .should('have.prop', 'readOnly', true)
      .should('have.attr', 'aria-autocomplete', 'none')
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="select-events"]').should('not.contain.text', 'no-search:');
    cy.get('[data-testid="select-no-search"] input')
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="select-events"]').should('contain.text', 'no-search:false');
    cy.get('[data-testid="select-no-search"] .sd-select-view-value').should(
      'contain.text',
      'False',
    );
  });

  it('composes scrollbar attributes and publishes reach-bottom before dropdown scroll', () => {
    cy.get('[data-testid="select-scroll"]').click();
    cy.get('.sd-select-dropdown:visible .custom-select-scroll').should(
      'have.css',
      'max-height',
      '90px',
    );
    cy.get('.sd-select-dropdown:visible [data-overlayscrollbars-viewport]').scrollTo('bottom');
    cy.get('[data-testid="select-events"]').should(
      'contain.text',
      'custom-scroll|reached|scrolled',
    );
  });

  it('fits the selection trigger to its label and resizes the popup after changing the selected label', () => {
    cy.get('[data-testid="select-fit"]')
      .should(($el) => expect($el[0].getBoundingClientRect().width).to.be.lessThan(300))
      .invoke('width')
      .then((width) => {
        cy.get('[data-testid="select-fit"]').click();
        cy.contains(
          '.sd-select-dropdown:visible [role="option"]',
          'A much longer option label',
        ).click();
        cy.get('[data-testid="select-fit"]').should(($el) =>
          expect($el[0].getBoundingClientRect().width).to.be.greaterThan(width!),
        );
        cy.get('[data-testid="select-fit"]').then(($el) => {
          const expectedWidth = $el[0].getBoundingClientRect().width;
          cy.get('[data-testid="select-fit"]').click();
          cy.get('.sd-select-dropdown:visible').should(($popup) =>
            expect($popup[0].getBoundingClientRect().width).to.be.closeTo(expectedWidth, 1),
          );
        });
      });
  });

  it('selects typed zero values by keyboard, publishes ordered events and clears to undefined', () => {
    cy.contains('button', 'Select focus').click();
    cy.get('[data-testid="select-single"] input')
      .should('be.focused')
      .click()
      .should('have.attr', 'aria-expanded', 'true')
      .type('{downarrow}{enter}');
    cy.get('[data-testid="select-value"]').should('have.text', '0');
    cy.get('[data-testid="select-events"]').should('contain.text', 'value:0|change:0');
    cy.get('[data-testid="select-single"] input').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="select-single"]').trigger('mouseover');
    cy.get('[data-testid="select-single"] input').focus();
    cy.get('[data-testid="select-single"] .sd-select-view-clear-btn').click();
    cy.get('[data-testid="select-value"]').should('have.text', '');
    cy.get('[data-testid="select-events"]')
      .should('contain.text', 'value:undefined|change:undefined')
      .should('contain.text', 'clear');
    cy.get('[data-testid="select-single"] input').should('have.attr', 'aria-expanded', 'false');
  });

  it('keeps locked multi selections, enforces limits and emits tag removal', () => {
    cy.get('[data-testid="select-multiple"] input').click();
    cy.get(
      '.sd-select-dropdown:visible .sd-select-group > ul[role="presentation"] > li[role="option"]',
    ).should('have.length', 2);
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Zero').click();
    cy.get('[data-testid="select-multiple-value"]').should('have.text', '["locked",0]');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Alpha').click();
    cy.get('[data-testid="select-events"]').should('contain.text', 'limit:a');
    cy.get('[data-testid="select-multiple"] .sd-select-view-tag .sd-tag-close-btn').click();
    cy.get('[data-testid="select-multiple-value"]').should('have.text', '["locked"]');
    cy.get('[data-testid="select-events"]').should('contain.text', 'remove:0');
    cy.get('[data-testid="select-multiple"] input').focus();
    cy.get('[data-testid="select-multiple"] .sd-select-view-clear-btn').click();
    cy.get('[data-testid="select-multiple-value"]').should('have.text', '["locked"]');
  });

  it('rejects controlled writes and creates searched values with cancellable debouncing', () => {
    cy.get('[data-testid="select-rejected"]').click();
    cy.get('[data-testid="select-rejected"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-rejected"] .sd-select-view-value').should('contain.text', 'Zero');
    cy.get('[data-testid="select-events"]').should('contain.text', 'rejected:"b"');
    cy.get('[data-testid="select-create"] input').type('New entry');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'New entry').click();
    cy.get('[data-testid="select-events"]').should('contain.text', 'created:["New entry"]');
    cy.get('[data-testid="select-create"] .sd-select-view-tag').should('contain.text', 'New entry');
    cy.get('[data-testid="select-create"] input').should('have.value', '');
    cy.get('[data-testid="select-events"]').should('contain.text', 'search:New entry');
    cy.clock();
    cy.get('[data-testid="select-create"] input').type('cancelled');
    cy.contains('button', 'Select mount create').click();
    cy.tick(200);
    cy.get('[data-testid="select-events"]').should('not.contain.text', 'search:cancelled');
  });

  it('retains search labels, resolves readonly tips and updates object field mappings', () => {
    cy.get('[data-testid="select-retain"]').click();
    cy.get('[data-testid="select-retain"] input').type('Bet');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="select-retain"] input').should('have.value', 'Beta');
    cy.get('[data-testid="select-readonly"]').click();
    cy.get('[data-testid="select-readonly"] input');
    cy.contains('.sd-tooltip-content', 'Selection locked').should('be.visible');
    cy.get('[data-testid="select-readonly"] input').should('have.attr', 'aria-expanded', 'false');
    cy.contains('button', 'Select readonly').click();
    cy.get('[data-testid="select-readonly"]').click();
    cy.get('[data-testid="select-readonly"] input')
      .should('have.attr', 'aria-expanded', 'true')
      .type('{esc}');
    cy.get('[data-testid="select-objects"] .sd-select-view-value').should(
      'contain.text',
      'Selected Object two',
    );
    cy.contains('button', 'Select fields').click();
    cy.get('[data-testid="select-objects"] .sd-select-view-value').should(
      'contain.text',
      'Selected Updated two',
    );
    cy.get('[data-testid="select-objects"]').click();
    cy.get('[data-testid="select-objects"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Updated three').click();
    cy.get('[data-testid="select-object-value"]').should('have.text', '{"id":3}');
  });

  it('opens virtual selections at the active row and inherits loading and empty renderers', () => {
    cy.get('[data-testid="select-virtual"]').click();
    cy.get('[data-testid="select-virtual"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Choice 400')
      .should('be.visible')
      .should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-select-dropdown:visible [role="option"]').should('have.length.lessThan', 500);
    cy.get('[data-testid="select-virtual"] input').type('{downarrow}{enter}');
    cy.get('[data-testid="select-virtual"] .sd-select-view-value').should(
      'contain.text',
      'Choice 401',
    );
    cy.contains('button', 'Select loading').click();
    cy.get('[data-testid="select-virtual"]').click();
    cy.get('[data-testid="select-virtual"] input');
    cy.contains('.sd-select-dropdown:visible', 'Provider loading').should('be.visible');
    cy.get('[data-testid="select-virtual"] input').type('{esc}');
    cy.get('[data-testid="select-provider-empty"]').click();
    cy.get('[data-testid="select-provider-empty"] input');
    cy.contains('.sd-select-dropdown:visible', 'Empty for select').should('be.visible');
    cy.contains('.sd-select-dropdown:visible', 'Empty header').should('be.visible');
    cy.contains('.sd-select-dropdown:visible', 'Empty footer').should('be.visible');
    cy.get('.sd-select-dropdown:visible .sd-virtual-list').should('not.exist');
  });

  it('validates Select FormItem after value changes and clears the error on selection', () => {
    cy.get('[data-testid="select-form"] input').focus().blur();
    cy.contains('[data-testid="select-fixture"] [role="alert"]', 'Choose one').should('be.visible');
    cy.get('[data-testid="select-form"]').click();
    cy.get('[data-testid="select-form"] input');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Form A').click();
    cy.get('[data-testid="select-form"]').should('not.have.class', 'sd-select-view-error');
  });

  it('measures dynamic virtual rows and resolves function keys after changing size mode', () => {
    cy.contains('button', 'Virtual dynamic').click();
    cy.get('[data-testid="virtual-list-fixture"] li.virtual-row')
      .first()
      .should('have.css', 'height', '50px');
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-virtual-index="90"]').should('be.visible').should('have.text', 'Row 90');
    cy.contains('button', 'Virtual inspect').click();
    cy.get('[data-testid="virtual-report"]')
      .invoke('text')
      .then((text) => {
        const report = JSON.parse(text);
        expect(report.size).to.equal(50);
        expect(report.dynamic).to.equal(50);
        expect(report.cache).to.equal(true);
      });
    cy.contains('button', 'Virtual dynamic').click();
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller').should(($el) =>
      expect($el[0].scrollTop).to.equal(2700),
    );
  });

  it('keeps clamp measurement stable beside synchronous virtualizer updates', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('virtualConsoleErrors');
      },
    });
    cy.get('[data-testid="wrap"]').should('have.css', 'height', '48px');
    cy.contains('button', 'Virtual axis').click();
    cy.contains('button', '改变项目数量').click();
    cy.get('[data-testid="wrap"] [data-part="item"]').should('have.length', 2);
    cy.contains('button', 'Virtual axis').click();
    cy.contains('button', '改变项目数量').click();
    cy.get('[data-testid="wrap"]').should('have.css', 'height', '48px');
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-virtual-index="90"]').should('be.visible');
    cy.get('@virtualConsoleErrors').should('not.have.been.called');
  });

  it('virtualizes selection rows and forwards live-key positioning and measurement commands', () => {
    const viewport = '[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller';
    cy.get('[data-testid="virtual-list-fixture"] li.virtual-row').should(
      'have.length.lessThan',
      200,
    );
    cy.contains('button', 'Virtual jump key').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.equal(2700));
    cy.get('[data-virtual-index="90"]').should('be.visible').should('have.text', 'Row 90');
    cy.contains('button', 'Virtual inspect').click();
    cy.get('[data-testid="virtual-report"]').should(
      'have.text',
      '{"cache":true,"restored":false,"index":90,"offset":2700,"size":30,"dynamic":30}',
    );
    cy.contains('button', 'Virtual reverse').click();
    cy.contains('button', 'Virtual jump key').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.equal(3270));
    cy.get('[data-virtual-index="109"]').should('have.text', 'Row 90').should('be.visible');
  });

  it('rebuilds virtual rows on axis changes and updates scrollbar and container styles', () => {
    const viewport = '[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller';
    cy.contains('button', 'Virtual pixels').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.equal(180));
    cy.contains('button', 'Virtual axis').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollWidth).to.be.greaterThan(180));
    cy.contains('button', 'Virtual pixels').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollLeft).to.equal(180));
    cy.get('[data-testid="virtual-list-fixture"] li.virtual-row')
      .first()
      .should('have.css', 'width', '30px')
      .should('have.css', 'min-width', '20px');
    cy.contains('button', 'Virtual track').click();
    cy.get('[data-testid="virtual-list-fixture"] .sd-scrollbar-type-track ul.track-list').should(
      'have.attr',
      'aria-label',
      'Virtual rows',
    );
    cy.get('[data-testid="virtual-list-fixture"] .os-scrollbar').should(
      'have.class',
      'sd-scrollbar-theme-track',
    );
  });
});

export {};
