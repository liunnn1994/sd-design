import { defineComponent, h, getCurrentInstance, nextTick } from 'vue';

import ConfigProvider from '../../config-provider';
import Notification from '../index';

describe('Notification deduplication', () => {
  beforeEach(() => {
    cy.then(() => Notification.clear());
    cy.get('.sd-notification').should('not.exist');
  });
  afterEach(() => Notification.clear());

  it('allows duplicates by default and separates message types', () => {
    cy.then(() => {
      Notification.success({ content: 'Same', duration: 0 });
      Notification.success({ content: 'Same', duration: 0 });
      Notification.error({ content: 'Same', duration: 0, deduplicate: true });
      Notification.error({ content: 'Same', duration: 0, deduplicate: true });
    });
    cy.get('.sd-notification-success').should('have.length', 2);
    cy.get('.sd-notification-error').should('have.length', 1);
  });

  it('can ignore type per call while retaining the original type', () => {
    cy.then(() => {
      Notification.success({ content: 'Same', duration: 0, deduplicate: true });
      Notification.error({
        content: 'Same',
        duration: 0,
        deduplicate: true,
        deduplicateByType: false,
      });
      Notification.warning({
        content: 'Different',
        duration: 0,
        deduplicate: true,
        deduplicateByType: false,
      });
    });
    cy.get('.sd-notification').should('have.length', 2);
    cy.get('.sd-notification-success').should('have.length', 1);
    cy.get('.sd-notification-error').should('not.exist');
  });

  it('inherits the type comparison setting and allows a per-call override', () => {
    const Trigger = defineComponent({
      setup() {
        const context = getCurrentInstance()!.appContext;
        return () =>
          h(
            'button',
            {
              onClick: () => {
                Notification.success({ content: 'Same', duration: 0 }, context);
                Notification.error({ content: 'Same', duration: 0 }, context);
                Notification.warning(
                  { content: 'Same', duration: 0, deduplicateByType: true },
                  context,
                );
              },
            },
            'Show',
          );
      },
    });
    cy.mount(ConfigProvider, {
      props: { global: true, notification: { deduplicate: true, deduplicateByType: false } },
      slots: { default: () => h(Trigger) },
    });
    cy.get('button').click();
    cy.get('.sd-notification').should('have.length', 2);
    cy.get('.sd-notification-success').should('have.length', 1);
    cy.get('.sd-notification-warning').should('have.length', 1);
    cy.get('.sd-notification-error').should('not.exist');
  });

  it('restarts the timer on every repeated call, including different positions', () => {
    cy.mount({ template: '<div />' });
    cy.clock();
    const onClose = cy.spy().as('closed');
    cy.then(() =>
      Notification.info({ content: 'Repeat', duration: 1000, deduplicate: true, onClose }),
    );
    cy.get('.sd-notification').should('have.length', 1);
    cy.then(() => nextTick());
    cy.tick(700);
    cy.then(() =>
      Notification.info({ content: 'Repeat', deduplicate: true, position: 'bottomLeft' }),
    );
    cy.get('.sd-notification').should('have.length', 1);
    cy.then(() => nextTick());
    cy.tick(700);
    cy.get('@closed').should('not.have.been.called');
    cy.then(() => Notification.info({ content: 'Repeat', deduplicate: true }));
    cy.get('.sd-notification').should('have.length', 1);
    cy.then(() => nextTick());
    cy.tick(999);
    cy.get('@closed').should('not.have.been.called');
    cy.tick(1);
    cy.get('@closed').should('have.been.calledOnce');
    cy.tick(1000);
    cy.clock().then((clock) => clock.restore());
    cy.then(() => Notification.info({ content: 'Repeat', duration: 0, deduplicate: true }));
    cy.get('.sd-notification').should('have.length', 1);
  });

  it('does not restart a reused notification timer when other notifications are added or removed', () => {
    cy.mount({ template: '<div />' });
    cy.clock();
    const onClose = cy.spy().as('closed');
    let closeOther: () => void;
    cy.then(() =>
      Notification.info({ content: 'Repeat', duration: 1000, deduplicate: true, onClose }),
    );
    cy.then(() => nextTick());
    cy.tick(700);
    cy.then(() => Notification.info({ content: 'Repeat', deduplicate: true }));
    cy.then(() => nextTick());
    cy.tick(400);
    cy.then(() => {
      ({ close: closeOther } = Notification.success({ content: 'Other', duration: 0 }));
    });
    cy.then(() => nextTick());
    cy.tick(400);
    cy.then(() => closeOther());
    cy.then(() => nextTick());
    cy.tick(199);
    cy.get('@closed').should('not.have.been.called');
    cy.tick(1);
    cy.get('@closed').should('have.been.calledOnce');
    cy.clock().then((clock) => clock.restore());
  });

  it('keeps different explicit IDs independently removable', () => {
    const firstClosed = cy.spy().as('firstClosed');
    const secondClosed = cy.spy().as('secondClosed');
    cy.then(() => {
      Notification.info({
        id: 'first',
        content: 'Same',
        duration: 0,
        deduplicate: true,
        onClose: firstClosed,
      });
      Notification.info({
        id: 'second',
        content: 'Same',
        duration: 0,
        deduplicate: true,
        onClose: secondClosed,
      });
    });
    cy.get('.sd-notification').should('have.length', 2);
    cy.then(() => Notification.remove('second'));
    cy.get('.sd-notification').should('have.length', 1);
    cy.get('@secondClosed').should('have.been.calledOnceWith', 'second');
    cy.get('@firstClosed').should('not.have.been.called');
    cy.then(() =>
      Notification.info({ id: 'first', content: 'Updated', duration: 0, deduplicate: true }),
    );
    cy.get('.sd-notification').should('have.length', 1).and('contain.text', 'Updated');
    cy.then(() => Notification.remove('first'));
    cy.get('.sd-notification').should('not.exist');
    cy.get('@firstClosed').should('have.been.calledOnceWith', 'first');
  });

  it('does not discard an explicit ID when matching an anonymous notification', () => {
    cy.then(() => {
      Notification.info({ content: 'Same', duration: 0, deduplicate: true });
      Notification.info({ id: 'explicit', content: 'Same', duration: 0, deduplicate: true });
    });
    cy.get('.sd-notification').should('have.length', 2);
    cy.then(() => Notification.remove('explicit'));
    cy.get('.sd-notification').should('have.length', 1);
  });

  it('keeps the same explicit ID independent across positions and updates the target position', () => {
    const topClosed = cy.spy().as('topClosed');
    const bottomClosed = cy.spy().as('bottomClosed');
    const updatedClosed = cy.spy().as('updatedClosed');
    let closeTop: () => void;
    cy.then(() => {
      ({ close: closeTop } = Notification.info({
        id: 'same-id',
        content: 'Same',
        position: 'topRight',
        duration: 0,
        deduplicate: true,
        onClose: topClosed,
      }));
      Notification.info({
        id: 'same-id',
        content: 'Same',
        position: 'bottomLeft',
        duration: 0,
        deduplicate: true,
        closable: true,
        onClose: bottomClosed,
      });
    });
    cy.get('.sd-notification-list-top-right .sd-notification').should('have.length', 1);
    cy.get('.sd-notification-list-bottom-left .sd-notification').should('have.length', 1);
    cy.get('.sd-notification-list-top-right .sd-notification-close-btn').should('not.exist');
    cy.get('.sd-notification-list-bottom-left .sd-notification-close-btn').should('exist');
    cy.then(() =>
      Notification.success({
        id: 'same-id',
        content: 'Updated',
        position: 'bottomLeft',
        duration: 0,
        deduplicate: true,
        onClose: updatedClosed,
      }),
    );
    cy.get('.sd-notification-list-bottom-left .sd-notification-success')
      .should('have.length', 1)
      .and('contain.text', 'Updated');
    cy.get('.sd-notification-list-top-right .sd-notification-info').should('contain.text', 'Same');
    cy.get('.sd-notification-list-bottom-left .sd-notification-close-btn').click();
    cy.get('.sd-notification-list-bottom-left .sd-notification').should('not.exist');
    cy.get('@updatedClosed').should('have.been.calledOnceWith', 'same-id');
    cy.get('@bottomClosed').should('not.have.been.called');
    cy.get('@topClosed').should('not.have.been.called');
    cy.then(() => closeTop());
    cy.get('.sd-notification').should('not.exist');
    cy.get('@topClosed').should('have.been.calledOnceWith', 'same-id');
  });

  it('removes closed and cleared entries and returns a usable duplicate handle', () => {
    let close: () => void;
    cy.then(() => {
      Notification.info({ content: 'Repeat', duration: 0, deduplicate: true });
      ({ close } = Notification.info({ content: 'Repeat', deduplicate: true }));
    });
    cy.get('.sd-notification').should('have.length', 1);
    cy.then(() => close());
    cy.get('.sd-notification').should('not.exist');
    cy.then(() => {
      Notification.info({ content: 'Repeat', duration: 0, deduplicate: true });
      Notification.clear();
      Notification.info({ content: 'Repeat', duration: 0, deduplicate: true });
    });
    cy.get('.sd-notification').should('have.length', 1);
  });

  it('reads ConfigProvider defaults and honors per-call overrides', () => {
    const Trigger = defineComponent({
      setup() {
        const context = getCurrentInstance()!.appContext;
        return () =>
          h(
            'button',
            {
              onClick: () => {
                Notification.success('Same', context);
                Notification.success('Same', context);
                Notification.error('Same', context);
                Notification.success({ content: 'Same', deduplicate: false }, context);
              },
            },
            'Show',
          );
      },
    });
    cy.mount(ConfigProvider, {
      props: { global: true, notification: { deduplicate: true } },
      slots: { default: () => h(Trigger) },
    });
    cy.get('button').click();
    cy.get('.sd-notification-success').should('have.length', 2);
    cy.get('.sd-notification-error').should('have.length', 1);
  });
  it('keeps notifications with different titles separate', () => {
    cy.then(() => {
      Notification.info({ title: 'A', content: 'Same', duration: 0, deduplicate: true });
      Notification.info({ title: 'B', content: 'Same', duration: 0, deduplicate: true });
      Notification.info({ title: 'A', content: 'Same', duration: 0, deduplicate: true });
    });
    cy.get('.sd-notification').should('have.length', 2);
  });
});
