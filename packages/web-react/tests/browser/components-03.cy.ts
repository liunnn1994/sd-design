describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

  it('reports virtual scrolling boundaries, replaces empty rows and releases unmounted listeners', () => {
    cy.contains('button', 'Virtual pixels').click();
    cy.get('[data-testid="virtual-events"]')
      .should('contain.text', 'end')
      .should('not.contain.text', 'bottom');
    cy.contains('button', 'Virtual bottom').click();
    cy.get('[data-testid="virtual-events"]').should('contain.text', 'bottom');
    cy.contains('button', 'Virtual empty').click();
    cy.get('[data-testid="virtual-list-fixture"] ul').should('not.exist');
    cy.contains('[data-testid="virtual-list-fixture"]', 'No virtual items').should('be.visible');
    cy.contains('button', 'Virtual empty').click();
    cy.get('[data-testid="virtual-list-fixture"] ul').should('exist');
    cy.get('[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller').then(($el) => {
      const node = $el[0];
      cy.contains('button', 'Virtual mount').click();
      cy.get('[data-testid="virtual-events"]')
        .invoke('text')
        .then((before) => {
          node.dispatchEvent(new Event('scroll'));
          cy.get('[data-testid="virtual-events"]').should('have.text', before);
        });
    });
    cy.get('[data-testid="virtual-list-fixture"] .os-scrollbar').should('not.exist');
    cy.contains('button', 'Virtual mount').click();
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-virtual-index="90"]').should('be.visible');
  });

  it('activates the focused selection clear button with native Enter input', () => {
    cy.get('[data-testid="select-view"] input').focus();
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn')
      .should('be.visible')
      .focus()
      .should('be.focused');
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
    cy.get('[data-testid="view-events"]')
      .should('contain.text', 'clear')
      .should('not.contain.text', 'bubbled');
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn').should('not.exist');
  });

  it('switches selection labels and input, closes focus and dispatches form focus exactly once', () => {
    cy.get('[data-testid="select-view"] .sd-select-view-value').should('contain.text', 'One');
    cy.contains('button', 'Focus selection').click();
    cy.get('[data-testid="select-view"] input')
      .should('be.focused')
      .should('not.have.class', 'sd-select-view-input-hidden')
      .should('have.attr', 'placeholder', 'One')
      .type('search');
    cy.get('[data-testid="view-query"]').should('have.text', 'search');
    cy.get('[data-testid="view-events"]').should('have.text', 'view-focus|form-focus');
    cy.contains('button', 'Toggle view open').click();
    cy.get('[data-testid="select-view"] input')
      .should('not.be.focused')
      .should('have.class', 'sd-select-view-input-hidden');
    cy.get('[data-testid="view-events"]').should(
      'have.text',
      'view-focus|form-focus|view-blur|form-blur',
    );
  });

  it('renders one selection clear control, honors explicit opt-out and stops a cancelled native click', () => {
    cy.contains('button', 'Toggle selection mode').click();
    cy.get('[data-testid="select-view"] input').focus();
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn')
      .should('have.length', 1)
      .should('be.visible')
      .focus();
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn').should('be.focused').click();
    cy.get('[data-testid="select-view"] .sd-select-view-tag').should('not.exist');
    cy.get('[data-testid="view-events"]')
      .should('contain.text', 'clear')
      .should('not.contain.text', 'bubbled');
    cy.get('[data-testid="select-view-no-clear"] .sd-select-view-clear-btn').should('not.exist');
  });

  it('resolves selection icon priority, custom labels, disabled state and create-only input', () => {
    cy.get('[data-testid="select-view"] .sd-select-view-arrow-icon').should('exist');
    cy.contains('button', 'Toggle view open').click();
    cy.get('[data-testid="select-view"] .sd-icon-search').should('exist');
    cy.contains('button', 'Toggle selection loading').click();
    cy.get('[data-testid="select-view"] .sd-icon-loading').should('exist');
    cy.get('[data-testid="select-view"] .sd-icon-search').should('not.exist');
    cy.contains('button', 'Toggle selection loading').click();
    cy.contains('button', 'Toggle selection search').click();
    cy.get('[data-testid="select-view"] input').should('have.attr', 'readonly');
    cy.contains('button', 'Toggle selection disabled').click();
    cy.get('[data-testid="select-view"] input').should('be.disabled');
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn').should('not.exist');
    cy.get('[data-testid="select-view-no-clear"]')
      .should('contain.text', 'Custom arrow')
      .should('contain.text', 'Custom One');
    cy.get('[data-testid="select-view-create"] input').should('not.have.attr', 'readonly');
  });

  it('restores controlled label input and preserves IME drafts and native input styling', () => {
    cy.get('[data-testid="input-label-controlled"] input')
      .should('have.class', 'label-custom')
      .should('have.css', 'color', 'rgb(12, 34, 56)')
      .focus()
      .type('x')
      .should('have.value', 'fixed');
    cy.get('[data-testid="view-events"]').should('contain.text', 'label:fixedx');
    cy.get('[data-testid="input-label-controlled"] input')
      .trigger('compositionstart', { data: '' })
      .invoke('val', '中文')
      .trigger('compositionupdate', { data: '中文' })
      .trigger('input')
      .should('have.value', '中文');
    cy.get('[data-testid="input-label-controlled"] input')
      .trigger('compositionend', { data: '中文' })
      .should('have.value', 'fixed');
    cy.get('[data-testid="view-events"]').should('contain.text', 'label:中文');
  });

  it('reorders keyed tags, cancels a pending leave on reinsertion and forwards native input events', () => {
    cy.clock();
    cy.contains('button', 'Reverse tag order').click();
    cy.get('[data-testid="tags-ordered"] .sd-tag b').then(($tags) =>
      expect([...$tags].map((tag) => tag.textContent)).to.deep.equal(['third', 'second', 'first']),
    );
    cy.get('[data-testid="tags-ordered"] .sd-tag-close-btn').last().click();
    cy.get('[data-testid="tags-ordered"] .input-tag-zoom-leave-active').should('exist');
    cy.contains('button', 'Restore tag order').click();
    cy.get('[data-testid="tags-ordered"] .input-tag-zoom-leave-active').should('not.exist');
    cy.tick(1000);
    cy.get('[data-testid="tags-ordered"] .sd-tag b').then(($tags) =>
      expect([...$tags].map((tag) => tag.textContent)).to.deep.equal(['first', 'second', 'third']),
    );
    cy.get('[data-testid="tags-ordered"] input')
      .should('have.attr', 'name', 'ordered-tags')
      .should('have.attr', 'maxlength', '8')
      .trigger('paste');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'paste:INPUT');
  });

  it('merges native InputTag class and style without losing managed width', () => {
    cy.get('[data-testid="tags-mapped"] input')
      .should('have.class', 'custom-tag-input')
      .should('have.class', 'sd-input-tag-input')
      .should('have.css', 'color', 'rgb(12, 34, 56)');
    cy.get('[data-testid="tags-mapped"] input')
      .type('wider-input')
      .then(($input) => expect($input[0].getBoundingClientRect().width).to.be.greaterThan(30));
  });

  it('animates an initial tag when restored after its leave has finished', () => {
    cy.get('[data-testid="tags-ordered"] .sd-tag-close-btn').first().click();
    cy.get('[data-testid="tags-ordered"] .sd-tag').should('have.length', 2);
    cy.contains('button', 'Restore tag order').click();
    cy.get('[data-testid="tags-ordered"] .input-tag-zoom-enter-active').should('exist');
    cy.get('[data-testid="tags-ordered"] .sd-tag').should('have.length', 3);
  });

  it('creates unique tags, preserves event order, animates removal and clears the list', () => {
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 2);
    cy.get('[data-testid="tags-basic"] input').type('three{enter}').should('have.value', '');
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 3);
    cy.get('[data-testid="tag-events"]').should(
      'contain.text',
      'update:["one","two","three"]|change:["one","two","three"]|enter:three',
    );
    cy.get('[data-testid="tags-basic"] input').type('three{enter}').should('have.value', 'three');
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 3);
    cy.get('[data-testid="tags-basic"] input').clear().type('{backspace}');
    cy.get('[data-testid="tags-basic"] .input-tag-zoom-leave-active').should('exist');
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 2);
    cy.get('[data-testid="tag-events"]').should('contain.text', 'remove:three');
    cy.get('[data-testid="tags-basic"] .sd-input-tag-clear-btn').click({ force: true });
    cy.get('[data-testid="tags-basic"] .sd-tag').should('not.exist');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'update:[]|change:[]|clear');
  });

  it('restores controlled tag and input values and accepts external reset and release', () => {
    cy.get('[data-testid="tags-controlled"] input')
      .should('have.value', 'kept')
      .type('x')
      .should('have.value', 'kept');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'input:keptx');
    cy.get('[data-testid="tags-controlled"] input').type('{enter}').should('have.value', 'kept');
    cy.get('[data-testid="tags-controlled"] .sd-tag').should('have.length', 1);
    cy.get('[data-testid="tag-events"]').should('contain.text', 'controlled:["fixed","kept"]');
    cy.contains('button', 'Reset tag input').click();
    cy.get('[data-testid="tags-controlled"] input').should('have.value', 'reset');
    cy.get('[data-testid="tags-external"] input').type('added{enter}');
    cy.get('[data-testid="tags-external"] .sd-tag').should('have.length', 2);
    cy.contains('button', 'Release tag model').click();
    cy.get('[data-testid="tags-external"] .sd-tag').should('not.exist');
  });

  it('preserves composition drafts until committed and configures retention and fit width', () => {
    cy.get('[data-testid="tags-retained"] input')
      .focus()
      .trigger('compositionstart', { data: '' })
      .invoke('val', '中文')
      .trigger('compositionupdate', { data: '中文' })
      .trigger('input')
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="tags-retained"] .sd-tag').should('not.exist');
    cy.get('[data-testid="tags-retained"] input')
      .should('have.value', '中文')
      .trigger('compositionend', { data: '中文' })
      .type('{enter}')
      .should('have.value', '中文');
    cy.get('[data-testid="tags-retained"] .sd-tag').should('contain.text', '中文');
    cy.get('[data-testid="tags-retained"]')
      .should('have.class', 'sd-input-tag-fit-width')
      .should('have.class', 'sd-input-tag-has-prefix')
      .should('have.class', 'sd-input-tag-has-suffix');
    cy.get('[data-testid="tags-retained"] input')
      .type('longer-value')
      .then(($input) => {
        expect($input[0].getBoundingClientRect().width).to.be.greaterThan(30);
      });
    cy.get('[data-testid="tags-retained"] input').blur().should('have.value', '');
  });

  it('keeps input focus and draft when switching tag overflow layouts and responds to resize', () => {
    cy.get(
      '[data-testid="tags-responsive"] .sd-input-tag-tag-counter > .sd-tag-text > .sd-ellipsis-content',
    ).should('have.text', '+2');
    cy.contains('button', 'Focus tag input').click();
    cy.get('[data-testid="tags-responsive"] input')
      .should('be.focused')
      .should('have.value', 'draft');
    cy.contains('button', 'Toggle tag layout').click();
    cy.get('[data-testid="tags-responsive"]').should('have.class', 'sd-input-tag-responsive');
    cy.get('[data-testid="tags-responsive"] input')
      .should('be.focused')
      .should('have.value', 'draft');
    cy.get('[data-testid="tags-responsive"] .sd-input-tag-tag-counter:visible').should('exist');
    cy.contains('button', 'Resize tags').click();
    cy.get('[data-testid="tags-responsive"] .sd-input-tag-tag-counter:visible').should('not.exist');
    cy.get('[data-testid="tags-responsive"] .sd-input-tag-item-holder:visible').should(
      'have.length',
      4,
    );
    cy.contains('button', 'Toggle tag layout').click();
    cy.get('[data-testid="tags-responsive"] input')
      .should('be.focused')
      .should('have.value', 'draft');
  });

  it('maps tag fields, skips locked tags, honors readonly and composes FormItem context', () => {
    cy.get('[data-testid="tags-mapped"] .sd-tag')
      .first()
      .should('contain.text', 'Label:Mapped')
      .should('have.class', 'sd-tag-red');
    cy.get('[data-testid="tags-mapped"] .sd-tag-close-btn').click();
    cy.get('[data-testid="tag-events"]').should('contain.text', 'mapped-close');
    cy.get('[data-testid="tags-mapped"] .sd-tag').should('have.length', 1);
    cy.get('[data-testid="tags-mapped"] input').type('{backspace}');
    cy.get('[data-testid="tags-mapped"] .sd-tag').should('have.length', 1);
    cy.get('[data-testid="tags-readonly"] .sd-tag-close-btn').should('not.exist');
    cy.get('[data-testid="tags-readonly"] .sd-input-tag-clear-btn').should('not.exist');
    cy.get('[data-testid="tags-readonly"] input').trigger('keydown', { key: 'Backspace' });
    cy.contains('[role="tooltip"]', 'Tags are locked').should('be.visible');
    cy.get('[data-testid="tags-disabled"] input').should('be.disabled');
    cy.get('[data-testid="tags-uninjected"] input').should('not.be.disabled');
    cy.get('[data-testid="tags-uninjected"]')
      .should('have.class', 'sd-input-tag-size-small')
      .find('.sd-input-tag-clear-btn')
      .should('exist');
    cy.get('[data-testid="tags-form"] input').type('valid{enter}');
    cy.get('[data-testid="tags-form"] .sd-input-tag-clear-btn').click({ force: true });
    cy.contains('Tags required').should('be.visible');
  });

  it('copies through StrictMode, refreshes feedback and inherits localized success messages', () => {
    cy.clock();
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').resolves(),
    );
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledWith', 'test-copy-content');
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('exist');
    cy.contains('.sd-message', 'Copied').should('exist');
    cy.get('[data-testid="copy-events"]').should('contain.text', 'test-copy-content');
    cy.tick(2000);
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledTwice');
    cy.get('[data-testid="copy-events"]').should(
      'have.text',
      '["test-copy-content","test-copy-content"]',
    );
    cy.tick(1000);
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('exist');
    cy.tick(1500);
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('not.exist');
    cy.contains('button', 'Toggle copy language').click();
    cy.get('[data-testid="copy-link"]').should('have.attr', 'aria-label', '复制').click();
    cy.contains('.sd-message', '复制成功').should('exist');
  });

  it('forwards button styling, custom icon and tooltip while suppressing disabled and empty copies', () => {
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').resolves(),
    );
    cy.get('[data-testid="copy-disabled"]').click({ force: true });
    cy.get('[data-testid="copy-empty"]').click();
    cy.get('@copyWrite').should('not.have.been.called');
    cy.get('[data-testid="copy-button"]').should('have.class', 'sd-btn-primary').click();
    cy.get('@copyWrite').should('have.been.calledWith', 'button-content');
    cy.contains('.sd-message', 'Custom success').should('exist');
    cy.get('[data-testid="copy-custom"]')
      .should('not.have.class', 'sd-copy-inherit')
      .should('contain.text', 'Custom icon')
      .trigger('mouseover');
    cy.contains('[role="tooltip"]', 'Override tooltip').should('be.visible');
  });

  it('suppresses async copy completion after unmount and supports remounting', () => {
    let finish: () => void;
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText')
        .callsFake(
          () =>
            new Promise<void>((resolve) => {
              finish = resolve;
            }),
        )
        .as('copyWrite');
    });
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledOnce');
    cy.contains('button', 'Toggle copy mount').click();
    cy.get('[data-testid="copy-link"]')
      .should('not.exist')
      .then(() => finish());
    cy.get('[data-testid="copy-events"]').should('have.text', '[]');
    cy.get('.sd-message').should('not.exist');
    cy.contains('button', 'Toggle copy mount').click();
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite')
      .should('have.been.calledTwice')
      .then(() => finish());
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('exist');
    cy.get('[data-testid="copy-events"]').should('have.text', '["test-copy-content"]');
  });

  it('toggles Secret with native keyboard activation, copies hidden text and honors controlled refusal', () => {
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').resolves(),
    );
    cy.get('[data-testid="secret-default"]').should('not.contain.text', 'demo-sensitive-content');
    cy.get('[data-testid="secret-default"] .sd-copy').click();
    cy.get('@copyWrite').should('have.been.calledWith', 'demo-sensitive-content');
    cy.get('[data-testid="secret-default"] .sd-secret-trigger')
      .should('have.attr', 'aria-label', 'Show sensitive information')
      .focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="secret-default"] .sd-secret-trigger')
      .should('have.attr', 'aria-pressed', 'true')
      .should('have.attr', 'aria-label', 'Hide sensitive information');
    cy.get('[data-testid="secret-default"]').should('contain.text', 'demo-sensitive-content');
    cy.get('[data-testid="secret-default"] .sd-secret-trigger').click();
    cy.get('[data-testid="secret-default"] .sd-secret-placeholder').should('exist');
    cy.get('[data-testid="secret-controlled"] .sd-copy').should('not.exist');
    cy.get('[data-testid="secret-controlled"] .sd-secret-trigger').click();
    cy.get('[data-testid="secret-controlled"] .sd-secret-placeholder').should(
      'have.text',
      'Hidden',
    );
    cy.get('[data-testid="copy-events"]').should('have.text', '["true"]');
    cy.contains('button', 'Control secret').click();
    cy.get('[data-testid="secret-controlled"]').should('contain.text', 'controlled-content');
  });

  it('does not claim copy success when the clipboard API and fallback both fail', () => {
    const errors: string[] = [];
    cy.on('uncaught:exception', (error) => {
      if (error.message.includes('[sdCopy]')) {
        errors.push(error.message);
        return false;
      }
      return undefined;
    });
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').rejects(new Error('denied')),
    );
    cy.document().then((doc) => cy.stub(doc, 'execCommand').as('copyFallback').returns(false));
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledOnce');
    cy.get('@copyFallback').should('have.been.calledWith', 'copy');
    cy.wrap(errors).should('have.length', 1);
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('not.exist');
    cy.get('[data-testid="copy-events"]').should('have.text', '[]');
    cy.get('.sd-message').should('not.exist');
  });

  it('renders Message types, positions, updates and keyboard closing with returned handles', () => {
    cy.window()
      .its('noticeFixture.message')
      .invoke('info', { id: '__sd_message_2', content: 'Explicit', duration: 0 })
      .as('noticeHandle', { type: 'static' });
    cy.window()
      .its('noticeFixture.message')
      .invoke('success', { content: 'Generated', duration: 0, closable: true });
    cy.get('.sd-message-list-top .sd-message').should('have.length', 2);
    cy.window().its('noticeFixture.message').invoke('warning', {
      id: '__sd_message_2',
      content: 'Updated',
      duration: 0,
      showIcon: false,
    });
    cy.contains('.sd-message', 'Updated').find('.sd-message-icon').should('not.exist');
    cy.get('@noticeHandle').invoke('close');
    cy.contains('.sd-message', 'Updated').should('not.exist');
    cy.contains('.sd-message', 'Generated').find('[role="button"]').focus().type('{enter}');
    cy.get('.sd-overlay-message').should('not.exist');
    cy.window()
      .its('noticeFixture.message')
      .invoke('loading', { content: 'Bottom loading', position: 'bottom', duration: 0 });
    cy.get('.sd-message-list-bottom .sd-icon-loading').should('exist');
    cy.window().its('noticeFixture.message').invoke('normal', { content: 'Normal', duration: 0 });
    cy.contains('.sd-message', 'Normal').find('.sd-message-icon').should('not.exist');
    cy.window().its('noticeFixture.message').invoke('clear', 'bottom');
    cy.get('.sd-message-list-bottom').should('not.exist');
    cy.contains('.sd-message', 'Normal').should('exist');
  });

  it('deduplicates across notice positions, respects type policy and restarts reused timers', () => {
    cy.clock();
    cy.window()
      .its('noticeFixture.message')
      .invoke('info', { content: 'Repeated', duration: 1000, deduplicate: true });
    cy.get('.sd-message').should('have.length', 1);
    cy.tick(800);
    cy.window().its('noticeFixture.message').invoke('info', {
      content: 'Repeated',
      duration: 1000,
      position: 'bottom',
      deduplicate: true,
    });
    cy.tick(800);
    cy.get('.sd-message').should('have.length', 1);
    cy.window()
      .its('noticeFixture.message')
      .invoke('error', { content: 'Repeated', duration: 0, deduplicate: true });
    cy.get('.sd-message').should('have.length', 2);
    cy.window().its('noticeFixture.message').invoke('warning', {
      content: 'Repeated',
      duration: 0,
      deduplicate: true,
      deduplicateByType: false,
    });
    cy.get('.sd-message').should('have.length', 2);
    cy.window().its('noticeFixture.message').invoke('clear');
    cy.get('.fade-message-leave-active').should('have.length', 2);
    cy.tick(1000);
    cy.get('.sd-message').should('not.exist');
  });

  it('pauses Message updates while hovered and resumes a full duration on leave', () => {
    cy.clock();
    const closed = cy.spy().as('noticeClosed');
    cy.window()
      .its('noticeFixture.message')
      .invoke('info', { id: 'hover', content: 'Hover old', duration: 100, onClose: closed });
    cy.get('.sd-message').trigger('mouseover');
    cy.window()
      .its('noticeFixture.message')
      .invoke('info', { id: 'hover', content: 'Hover new', duration: 100 });
    cy.tick(1000);
    cy.get('@noticeClosed').should('not.have.been.called');
    cy.contains('.sd-message', 'Hover new').trigger('mouseout');
    cy.tick(100);
    cy.get('@noticeClosed').should('have.been.calledOnceWith', 'hover');
  });

  it('recreates detached notice managers and permits reentrant onClose with the same id', () => {
    cy.window()
      .its('noticeFixture.message')
      .then((message) => {
        const handle = message.info({
          id: 'reentrant',
          content: 'Old notice',
          duration: 0,
          onClose: () => message.info({ id: 'reentrant', content: 'New notice', duration: 0 }),
        });
        cy.contains('.sd-message', 'Old notice').then(() => handle.close());
      });
    cy.get('.sd-message').should('have.length', 1).and('have.text', 'New notice');
    cy.get('.sd-overlay-message').then(($overlay) => {
      const old = $overlay[0];
      old.remove();
      cy.window()
        .its('noticeFixture.message')
        .invoke('info', { content: 'Replacement notice', duration: 0 });
      cy.wrap({ old }).should(({ old }) =>
        expect(old.querySelector('.sd-message-list')).to.equal(null),
      );
    });
    cy.get('.sd-message').should('have.length', 1).and('have.text', 'Replacement notice');
  });

  it('inherits notice hook context, locale, theme and deduplication and cleans up on unmount', () => {
    cy.contains('button', 'Hook context message').click();
    cy.contains('.sd-message', 'Inherited context')
      .find('[role="button"]')
      .should('have.attr', 'aria-label', 'Close');
    cy.get('.sd-message-list')
      .should('have.attr', 'sd-theme', 'dark')
      .and('have.css', '--color-primary-6', '#d03050');
    cy.contains('button', 'Toggle notice language').click();
    cy.contains('.sd-message', 'Inherited context')
      .find('[role="button"]')
      .should('have.attr', 'aria-label', '关闭');
    cy.window()
      .its('noticeFixture.hookMessage')
      .invoke('info', { content: 'Provider duplicate', duration: 0 });
    cy.window()
      .its('noticeFixture.hookMessage')
      .invoke('info', { content: 'Provider duplicate', duration: 0 });
    cy.get('.sd-message').should('have.length', 2);
    cy.contains('button', 'Toggle notice hooks').click();
    cy.get('.sd-overlay-message').should('not.exist');
    cy.contains('button', 'Toggle notice hooks').click();
    cy.contains('button', 'Hook context message').click();
    cy.get('.sd-message').should('have.length', 1);
  });

  it('renders Notification custom content, positions, remove and position-specific clear', () => {
    cy.contains('button', 'Hook context notification').click();
    cy.get('.custom-notice')
      .should('have.css', 'width', '350px')
      .and('contain.text', 'Custom title')
      .and('contain.text', 'Inherited context')
      .and('contain.text', 'Custom icon');
    cy.contains('.custom-notice [role="button"]', 'Custom close').focus().type(' ');
    cy.get('.sd-notification').should('not.exist');
    for (const position of ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']) {
      cy.window().its('noticeFixture.notification').invoke('info', {
        id: position,
        title: position,
        content: 'Position notification',
        position,
        duration: 0,
      });
    }
    cy.get('.sd-notification-list').should('have.length', 4);
    cy.window().its('noticeFixture.notification').invoke('remove', 'topLeft');
    cy.get('.sd-notification-list-top-left').should('not.exist');
    cy.window().its('noticeFixture.notification').invoke('clear', 'bottomRight');
    cy.get('.sd-notification-list-bottom-right').should('not.exist');
    cy.get('.sd-notification').should('have.length', 2);
  });

  it('honors Notification title deduplication and explicit timer reset policy', () => {
    cy.clock();
    const closed = cy.spy().as('notificationClosed');
    cy.window().its('noticeFixture.notification').invoke('info', {
      id: 'timed',
      title: 'Title',
      content: 'First',
      duration: 1000,
      onClose: closed,
    });
    cy.get('.sd-notification').should('exist');
    cy.tick(500);
    cy.window()
      .its('noticeFixture.notification')
      .invoke('success', { id: 'timed', content: 'Second', duration: 5000, resetOnUpdate: false });
    cy.tick(500);
    cy.get('@notificationClosed').should('have.been.calledOnce');
    cy.window()
      .its('noticeFixture.notification')
      .invoke('warning', { title: 'A', content: 'Same', duration: 0, deduplicate: true });
    cy.window()
      .its('noticeFixture.notification')
      .invoke('warning', { title: 'B', content: 'Same', duration: 0, deduplicate: true });
    cy.window()
      .its('noticeFixture.notification')
      .invoke('warning', { title: 'A', content: 'Same', duration: 0, deduplicate: true });
    cy.get('.slide-right-notification-leave-active').should('exist');
    cy.tick(1000);
    cy.get('.sd-notification').should('have.length', 2);
  });

  it('owns notices opened during StrictMode effect replay and releases them on unmount', () => {
    cy.window().then((win) => cy.spy(win.console, 'error').as('noticeConsoleError'));
    cy.contains('button', 'Toggle effect notices').click();
    cy.get('.sd-message').should('have.length', 1).and('have.text', 'Effect notice');
    cy.get('.sd-overlay-message').should('have.length', 1);
    cy.contains('button', 'Toggle effect notices').click();
    cy.get('.sd-overlay-message').should('not.exist');
    cy.contains('button', 'Toggle effect notices').click();
    cy.get('.sd-message').should('have.length', 1).and('have.text', 'Effect notice');
    cy.get('@noticeConsoleError').should('not.have.been.called');
  });

  it('applies explicit static notice context and allows local deduplication overrides', () => {
    const context = {
      prefixCls: 'special',
      message: { deduplicate: true, deduplicateByType: false },
    };
    cy.window()
      .its('noticeFixture.message')
      .invoke('info', { content: 'Explicit context', duration: 0 }, context);
    cy.window()
      .its('noticeFixture.message')
      .invoke('error', { content: 'Explicit context', duration: 0 }, context);
    cy.get('.special-message').should('have.length', 1).and('have.class', 'special-message-info');
    cy.window()
      .its('noticeFixture.message')
      .invoke('warning', { content: 'Explicit context', duration: 0, deduplicate: false }, context);
    cy.get('.special-message').should('have.length', 2);
    cy.window().its('noticeFixture.message').invoke('clear');
    cy.get('.sd-overlay-message').should('not.exist');
    cy.window()
      .its('noticeFixture.hookMessage')
      .invoke('info', { content: 'Partial context', duration: 0 }, { prefixCls: 'partial' });
    cy.window()
      .its('noticeFixture.hookMessage')
      .invoke('info', { content: 'Partial context', duration: 0 }, { prefixCls: 'partial' });
    cy.get('.partial-message').should('have.length', 1);
  });

  it('keeps a closing notice in its original DOM position until its exit finishes', () => {
    cy.clock();
    cy.window()
      .its('noticeFixture.notification')
      .then((notification) => {
        const handle = notification.info({
          title: 'First notice',
          content: 'First body',
          duration: 0,
        });
        notification.info({ title: 'Second notice', content: 'Second body', duration: 0 });
        return handle;
      })
      .as('firstNotice', { type: 'static' });
    cy.get('.sd-notification').should('have.length', 2);
    cy.get('@firstNotice').invoke('close');
    cy.get('.sd-notification.slide-right-notification-leave-active').should(($leaving) => {
      expect($leaving[0].textContent).to.contain('First notice');
      expect($leaving[0].nextElementSibling?.textContent).to.contain('Second notice');
    });
    cy.tick(1000);
    cy.get('.sd-notification').should('have.length', 1).and('contain.text', 'Second notice');
  });

  it('formats InputMask, emits completion once in StrictMode and clears empty masks', () => {
    cy.get('[data-testid="mask-events"]').should('have.text', 'initial:12');
    cy.get('[data-testid="mask-main"] input')
      .should('have.value', '12-__')
      .focus()
      .type('34')
      .blur()
      .should('have.value', '12-34');
    cy.get('[data-testid="mask-value"]').should('have.text', '12-34');
    cy.get('[data-testid="mask-events"]').should('contain.text', 'complete:12-34');
    cy.get('[data-testid="mask-main"] .sd-input-word-limit').should('not.exist');
    cy.get('[data-testid="mask-main"] .sd-input-clear-btn').click({ force: true });
    cy.get('[data-testid="mask-main"] input').blur().should('have.value', '');
    cy.get('[data-testid="mask-main"] .sd-input-clear-btn').should('not.exist');
    cy.get('[data-testid="mask-main"] input')
      .focus()
      .should('have.value', '__-__')
      .type('56')
      .should('have.value', '56-__');
  });

  it('synchronizes external InputMask resets and mask removal without retaining placeholders', () => {
    cy.contains('button', 'Toggle mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '12-');
    cy.contains('button', 'Toggle mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '12-__');
    cy.contains('button', 'Set raw mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '98-76');
    cy.contains('button', 'Reset mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '');
    cy.contains('button', 'Focus mask').click();
    cy.get('[data-testid="mask-main"] input').should('be.focused').and('have.value', '__-__');
    cy.contains('button', 'Blur mask').click();
    cy.get('[data-testid="mask-main"] input').should('not.be.focused').and('have.value', '');
  });

  it('switches InputMask presets, preserves native overrides and handles array literals', () => {
    cy.get('[data-testid="mask-preset"] input')
      .type('20261107')
      .should('have.value', '2026-11-07')
      .and('have.attr', 'inputmode', 'numeric');
    cy.contains('button', 'Change mask preset').click();
    cy.get('[data-testid="mask-preset"] input')
      .clear()
      .type('name@example.com')
      .should('have.value', 'name@example.com')
      .and('have.attr', 'inputmode', 'email');
    cy.contains('button', 'Change mask preset').click();
    cy.get('[data-testid="mask-preset"] input').should('not.have.attr', 'inputmode');
    cy.get('[data-testid="mask-preset"] input').should('not.have.attr', 'data-mask-preset');
    cy.get('[data-testid="mask-array"] input').type('12').should('have.value', '+86 12');
    cy.get('[data-testid="mask-native"] input').should('have.attr', 'inputmode', 'tel');
    cy.get('[data-testid="mask-placeholder"] input').should('have.value', '😀😀');
  });

  it('respects InputMask callback rejection and keeps a usable cursor after remount', () => {
    cy.get('[data-testid="mask-reject"] input').type('12').should('have.value', '1_');
    cy.get('[data-testid="mask-events"]').should('not.contain.text', 'reject-complete:12');
    cy.get('[data-testid="mask-reject"] input').type('3').should('have.value', '13');
    cy.get('[data-testid="mask-events"]').should('contain.text', 'reject-complete:13');
    cy.contains('button', 'Toggle mask mount').click();
    cy.contains('button', 'Toggle mask mount').click();
    cy.get('[data-testid="mask-main"] input').focus().type('34').should('have.value', '12-34');
    cy.get<HTMLInputElement>('[data-testid="mask-main"] input')
      .then(($input) => {
        $input[0].setSelectionRange(1, 2);
        $input[0].dispatchEvent(new Event('select', { bubbles: true }));
      })
      .type('9')
      .should('have.value', '19-34');
  });

  it('formats VerificationCode typing and emits ordered completion events', () => {
    cy.get('[data-testid="verification"] input').first().type('a1234');
    cy.get('[data-testid="verification-value"]').should('have.text', '1234');
    cy.get('[data-testid="verification-events"]').should(
      'contain.text',
      'update:1234|change:1234|finish:1234',
    );
    cy.get('[data-testid="verification"] input').last().should('be.focused');
    cy.get('[data-testid="verification-separator"]').should('have.text', '-');
  });

  it('pastes filtered VerificationCode and restores declined controlled writes', () => {
    cy.get('[data-testid="verification"] input')
      .first()
      .then(($input) => {
        const data = new DataTransfer();
        data.setData('text', '1a2b34');
        $input[0].dispatchEvent(
          new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }),
        );
      });
    cy.get('[data-testid="verification-value"]').should('have.text', '1234');
    cy.get('[data-testid="verification-locked"] input').eq(2).type('3');
    cy.get('[data-testid="verification-locked"] input').eq(2).should('have.value', '');
    cy.get('[data-testid="verification-events"]').should('contain.text', 'locked:123');
    cy.get('[data-testid="verification-locked"] input').eq(2).type('4');
    cy.get('[data-testid="verification-events"]').should('contain.text', 'locked:124');
  });

  it('synchronizes VerificationCode length, external values, navigation and refs', () => {
    cy.contains('button', 'Set code').click();
    cy.contains('button', 'Focus code').click();
    cy.get('[data-testid="verification"] input')
      .eq(2)
      .should('be.focused')
      .trigger('keydown', { key: 'Backspace' });
    cy.get('[data-testid="verification-value"]').should('have.text', '9');
    cy.get('[data-testid="verification"] input')
      .eq(1)
      .should('be.focused')
      .trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="verification"] input')
      .first()
      .should('be.focused')
      .trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="verification"] input').eq(1).should('be.focused');
    cy.contains('button', 'Blur code').click();
    cy.get('[data-testid="verification"] input').eq(1).should('not.be.focused');
    cy.get('[data-testid="verification-default"] input').eq(2).type('3');
    cy.contains('button', 'Resize code').click();
    cy.get('[data-testid="verification"] input').should('have.length', 6);
    cy.get('[data-testid="verification-default"] input').eq(2).should('have.value', '3');
    cy.get('[data-testid="verification-default"] input').should('have.length', 6);
  });

  it('preserves VerificationCode masks, readonly and inherited disabled inputs', () => {
    cy.get('[data-testid="verification-readonly"] input')
      .should('have.attr', 'type', 'password')
      .and('have.attr', 'readonly');
    cy.get('[data-testid="verification-form-disabled"] input').each(($input) =>
      cy.wrap($input).should('be.disabled'),
    );
    cy.contains('button', 'Disable code').click();
    cy.get('[data-testid="verification"] input').each(($input) =>
      cy.wrap($input).should('be.disabled'),
    );
  });

  it('steps Slider from displayed values, preserves decimal bounds and validates changes', () => {
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('keydown', { key: 'Home' });
    cy.get('[data-testid="slider-value"]').should('have.text', '0');
    cy.contains('Amount too low').should('be.visible');
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('keydown', { key: 'End' });
    cy.get('[data-testid="slider-value"]').should('have.text', '95');
    cy.contains('Amount too low').should('not.exist');
    cy.get('[data-testid="locked-slider"] [role="slider"]')
      .trigger('keydown', { key: 'ArrowRight' })
      .trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="slider-events"]').should('contain.text', 'locked:30|locked:30');
    cy.get('[data-testid="locked-slider"] [role="slider"]').should(
      'have.attr',
      'aria-valuenow',
      '20',
    );
    cy.get('[data-testid="decimal-slider"] [role="slider"]')
      .first()
      .trigger('keydown', { key: 'End' });
    cy.get('[data-testid="decimal-slider"] [role="slider"]')
      .first()
      .should('have.attr', 'aria-valuenow', '0.1');
  });

  it('moves the nearest Slider endpoint and sorts crossing numeric inputs', () => {
    cy.get('[data-testid="range-slider"] .sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.wrap($track).trigger('click', {
        clientX: rect.left + rect.width * 0.1,
        clientY: rect.top + rect.height / 2,
      });
    });
    cy.get('[data-testid="slider-range"]').should('have.text', '[10,60]');
    cy.get('[data-testid="range-slider"] input').first().clear().type('80').blur();
    cy.get('[data-testid="slider-range"]').should('have.text', '[60,80]');
    cy.get('[data-testid="range-slider"] input').last().clear().type('20').blur();
    cy.get('[data-testid="slider-range"]').should('have.text', '[20,60]');
  });

  it('drags Slider with a live tooltip and stops listeners on disable and unmount', () => {
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('mousedown');
    cy.get('[data-testid="single-slider"] .sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.window().then((win) =>
        win.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: rect.left + rect.width * 0.53,
            clientY: rect.top,
          }),
        ),
      );
    });
    cy.get('[data-testid="slider-value"]').should('have.text', '50');
    cy.contains('.sd-tooltip-content', '50 percent').should('be.visible');
    cy.contains('button', 'Toggle slider disabled').trigger('click');
    cy.get('[data-testid="single-slider"] [role="slider"]').should('have.attr', 'tabindex', '-1');
    cy.window().then((win) =>
      win.dispatchEvent(new MouseEvent('mousemove', { clientX: 9999, clientY: 0 })),
    );
    cy.get('[data-testid="slider-value"]').should('have.text', '50');
    cy.contains('button', 'Toggle slider disabled').trigger('click');
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('mousedown');
    cy.contains('button', 'Toggle slider mount').trigger('click');
    cy.window().then((win) =>
      win.dispatchEvent(new MouseEvent('mousemove', { clientX: 9999, clientY: 0 })),
    );
    cy.get('[data-testid="slider-events"]').should('have.text', 'single:50');
  });
});

export {};
