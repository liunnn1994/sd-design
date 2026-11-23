describe('React message', () => {
  beforeEach(() => cy.visit('/notice.html'));

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

  it('keeps a reused Message deadline when unrelated messages are added and removed', () => {
    cy.clock();
    cy.window().then((win) => {
      const timeout = cy.spy(win, 'setTimeout');
      cy.wrap(timeout.withArgs(Cypress.sinon.match.func, 1000)).as('scheduleNotice');
    });
    const closed = cy.spy().as('reusedMessageClosed');
    const message = () => cy.window().its('noticeFixture.message');
    message().then((api) =>
      api.info({
        id: 'timed-message',
        content: 'Timed message',
        duration: 1000,
        deduplicate: true,
        onClose: closed,
      }),
    );
    cy.get('@scheduleNotice').should('have.been.calledOnce');
    cy.tick(700);
    message().then((api) => api.info({ content: 'Timed message', deduplicate: true }));
    cy.get('@scheduleNotice').should('have.been.calledTwice');
    cy.tick(400);
    message()
      .then((api) => {
        api.normal({ content: 'Persistent neighbor', duration: 0 });
        return api.success({ content: 'Temporary neighbor', duration: 0 });
      })
      .as('temporaryNeighbor', { type: 'static' });
    cy.get('.sd-message').should('have.length', 3);
    cy.tick(400);
    cy.get('@temporaryNeighbor').then((handle) => {
      handle.close();
    });
    cy.contains('.sd-message', 'Temporary neighbor').should(
      'have.class',
      'fade-message-leave-active',
    );
    cy.tick(199);
    cy.get('@reusedMessageClosed').should('not.have.been.called');
    cy.tick(1);
    cy.get('@reusedMessageClosed').should('have.been.calledOnceWith', 'timed-message');
    cy.contains('.sd-message', 'Timed message').should('have.class', 'fade-message-leave-active');
    cy.tick(5000);
    cy.get('.sd-message').should('have.length', 1).and('contain.text', 'Persistent neighbor');
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
});
