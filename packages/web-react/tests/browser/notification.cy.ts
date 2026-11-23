describe('React notification', () => {
  beforeEach(() => cy.visit('/notice.html'));

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

  it('updates and closes same-ID notifications independently by position', () => {
    const notification = () => cy.window().its('noticeFixture.notification');
    const top = '.sd-notification-list-top-right';
    const bottom = '.sd-notification-list-bottom-left';
    const topClosed = cy.spy().as('topNotificationClosed');
    const bottomClosed = cy.spy().as('bottomNotificationClosed');
    const updatedClosed = cy.spy().as('updatedNotificationClosed');
    const options = { id: 'shared-id', duration: 0, deduplicate: true };

    notification()
      .invoke('info', {
        ...options,
        content: 'Top notice',
        position: 'topRight',
        onClose: topClosed,
      })
      .as('topNotification', { type: 'static' });
    notification().invoke('info', {
      ...options,
      content: 'Bottom notice',
      position: 'bottomLeft',
      closable: true,
      onClose: bottomClosed,
    });
    cy.get(top).should('contain.text', 'Top notice');
    cy.get(bottom).should('contain.text', 'Bottom notice');
    notification().invoke('success', {
      ...options,
      content: 'Updated bottom notice',
      position: 'bottomLeft',
      onClose: updatedClosed,
    });
    cy.get(`${bottom} .sd-notification-success`).should('contain.text', 'Updated bottom notice');
    cy.get(`${top} .sd-notification-info`).should('contain.text', 'Top notice');
    cy.get(`${bottom} .sd-notification-close-btn`).focus().type('{enter}');
    cy.get(bottom).should('not.exist');
    cy.get('@updatedNotificationClosed').should('have.been.calledOnceWith', 'shared-id');
    cy.get('@bottomNotificationClosed').should('not.have.been.called');
    cy.get('@topNotificationClosed').should('not.have.been.called');
    cy.get('@topNotification').invoke('close');
    cy.get(top).should('not.exist');
    cy.get('@topNotificationClosed').should('have.been.calledOnceWith', 'shared-id');
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
});
