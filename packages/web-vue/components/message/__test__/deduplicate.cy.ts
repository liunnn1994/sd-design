import { defineComponent, h, getCurrentInstance, nextTick } from 'vue';

import ConfigProvider from '../../config-provider';
import Message from '../index';

describe('Message deduplication', () => {
  beforeEach(() => {
    cy.then(() => Message.clear());
    cy.get('.sd-message').should('not.exist');
  });
  afterEach(() => Message.clear());

  it('allows duplicates by default and separates message types', () => {
    cy.then(() => {
      Message.success({ content: 'Same', duration: 0 });
      Message.success({ content: 'Same', duration: 0 });
      Message.error({ content: 'Same', duration: 0, deduplicate: true });
      Message.error({ content: 'Same', duration: 0, deduplicate: true });
    });
    cy.get('.sd-message-success').should('have.length', 2);
    cy.get('.sd-message-error').should('have.length', 1);
  });

  it('can ignore type per call while retaining the original type', () => {
    cy.then(() => {
      Message.success({ content: 'Same', duration: 0, deduplicate: true });
      Message.error({ content: 'Same', duration: 0, deduplicate: true, deduplicateByType: false });
      Message.warning({
        content: 'Different',
        duration: 0,
        deduplicate: true,
        deduplicateByType: false,
      });
    });
    cy.get('.sd-message').should('have.length', 2);
    cy.get('.sd-message-success').should('have.length', 1);
    cy.get('.sd-message-error').should('not.exist');
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
                Message.success({ content: 'Same', duration: 0 }, context);
                Message.error({ content: 'Same', duration: 0 }, context);
                Message.warning({ content: 'Same', duration: 0, deduplicateByType: true }, context);
              },
            },
            'Show',
          );
      },
    });
    cy.mount(ConfigProvider, {
      props: { global: true, message: { deduplicate: true, deduplicateByType: false } },
      slots: { default: () => h(Trigger) },
    });
    cy.get('button').click();
    cy.get('.sd-message').should('have.length', 2);
    cy.get('.sd-message-success').should('have.length', 1);
    cy.get('.sd-message-warning').should('have.length', 1);
    cy.get('.sd-message-error').should('not.exist');
  });

  it('restarts the timer on every repeated call, including different positions', () => {
    cy.mount({ template: '<div />' });
    cy.clock();
    const onClose = cy.spy().as('closed');
    cy.then(() => Message.info({ content: 'Repeat', duration: 1000, deduplicate: true, onClose }));
    cy.get('.sd-message').should('have.length', 1);
    cy.then(() => nextTick());
    cy.tick(700);
    cy.then(() => Message.info({ content: 'Repeat', deduplicate: true, position: 'bottom' }));
    cy.get('.sd-message').should('have.length', 1);
    cy.then(() => nextTick());
    cy.tick(700);
    cy.get('@closed').should('not.have.been.called');
    cy.then(() => Message.info({ content: 'Repeat', deduplicate: true }));
    cy.get('.sd-message').should('have.length', 1);
    cy.then(() => nextTick());
    cy.tick(999);
    cy.get('@closed').should('not.have.been.called');
    cy.tick(1);
    cy.get('@closed').should('have.been.calledOnce');
    cy.tick(1000);
    cy.clock().then((clock) => clock.restore());
    cy.then(() => Message.info({ content: 'Repeat', duration: 0, deduplicate: true }));
    cy.get('.sd-message').should('have.length', 1);
  });

  it('does not restart a reused message timer when other messages are added or removed', () => {
    cy.mount({ template: '<div />' });
    cy.clock();
    const onClose = cy.spy().as('closed');
    let closeOther: () => void;
    cy.then(() => Message.info({ content: 'Repeat', duration: 1000, deduplicate: true, onClose }));
    cy.then(() => nextTick());
    cy.tick(700);
    cy.then(() => Message.info({ content: 'Repeat', deduplicate: true }));
    cy.then(() => nextTick());
    cy.tick(400);
    cy.then(() => {
      ({ close: closeOther } = Message.success({ content: 'Other', duration: 0 }));
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

  it('keeps different explicit IDs independently updatable and closable', () => {
    const firstClosed = cy.spy().as('firstClosed');
    const secondClosed = cy.spy().as('secondClosed');
    let closeFirst: () => void;
    let closeSecond: () => void;
    cy.then(() => {
      ({ close: closeFirst } = Message.info({
        id: 'first',
        content: 'Same',
        duration: 0,
        deduplicate: true,
        onClose: firstClosed,
      }));
      ({ close: closeSecond } = Message.info({
        id: 'second',
        content: 'Same',
        duration: 0,
        deduplicate: true,
        onClose: secondClosed,
      }));
    });
    cy.get('.sd-message').should('have.length', 2);
    cy.then(() =>
      Message.info({ id: 'second', content: 'Updated', duration: 0, deduplicate: true }),
    );
    cy.get('.sd-message').should('have.length', 2);
    cy.get('.sd-message-content').should(($items) => {
      expect(Array.from($items, (item) => item.textContent)).to.deep.equal(['Same', 'Updated']);
    });
    cy.then(() => closeSecond());
    cy.get('.sd-message').should('have.length', 1).and('contain.text', 'Same');
    cy.get('@secondClosed').should('have.been.calledOnceWith', 'second');
    cy.get('@firstClosed').should('not.have.been.called');
    cy.then(() => closeFirst());
    cy.get('.sd-message').should('not.exist');
    cy.get('@firstClosed').should('have.been.calledOnceWith', 'first');
  });

  it('does not discard an explicit ID when matching an anonymous message', () => {
    let closeExplicit: () => void;
    cy.then(() => {
      Message.info({ content: 'Same', duration: 0, deduplicate: true });
      ({ close: closeExplicit } = Message.info({
        id: 'explicit',
        content: 'Same',
        duration: 0,
        deduplicate: true,
      }));
    });
    cy.get('.sd-message').should('have.length', 2);
    cy.then(() =>
      Message.info({ id: 'explicit', content: 'Updated', duration: 0, deduplicate: true }),
    );
    cy.get('.sd-message').should('have.length', 2);
    cy.get('.sd-message-content').should(($items) => {
      expect(Array.from($items, (item) => item.textContent)).to.deep.equal(['Same', 'Updated']);
    });
    cy.then(() => closeExplicit());
    cy.get('.sd-message').should('have.length', 1).and('contain.text', 'Same');
  });

  it('keeps the same explicit ID independent across positions and updates the target position', () => {
    const topClosed = cy.spy().as('topClosed');
    const bottomClosed = cy.spy().as('bottomClosed');
    const updatedClosed = cy.spy().as('updatedClosed');
    let closeTop: () => void;
    cy.then(() => {
      ({ close: closeTop } = Message.info({
        id: 'same-id',
        content: 'Same',
        position: 'top',
        duration: 0,
        deduplicate: true,
        onClose: topClosed,
      }));
      Message.info({
        id: 'same-id',
        content: 'Same',
        position: 'bottom',
        duration: 0,
        deduplicate: true,
        closable: true,
        onClose: bottomClosed,
      });
    });
    cy.get('.sd-message-list-top .sd-message').should('have.length', 1);
    cy.get('.sd-message-list-bottom .sd-message').should('have.length', 1);
    cy.get('.sd-message-list-top .sd-message-close-btn').should('not.exist');
    cy.get('.sd-message-list-bottom .sd-message-close-btn').should('exist');
    cy.then(() =>
      Message.success({
        id: 'same-id',
        content: 'Updated',
        position: 'bottom',
        duration: 0,
        deduplicate: true,
        onClose: updatedClosed,
      }),
    );
    cy.get('.sd-message-list-bottom .sd-message-success')
      .should('have.length', 1)
      .and('contain.text', 'Updated');
    cy.get('.sd-message-list-top .sd-message-info').should('contain.text', 'Same');
    cy.get('.sd-message-list-bottom .sd-message-close-btn').click();
    cy.get('.sd-message-list-bottom .sd-message').should('not.exist');
    cy.get('@updatedClosed').should('have.been.calledOnceWith', 'same-id');
    cy.get('@bottomClosed').should('not.have.been.called');
    cy.get('@topClosed').should('not.have.been.called');
    cy.then(() => closeTop());
    cy.get('.sd-message').should('not.exist');
    cy.get('@topClosed').should('have.been.calledOnceWith', 'same-id');
  });

  it('removes closed and cleared entries and returns a usable duplicate handle', () => {
    let close: () => void;
    cy.then(() => {
      Message.info({ content: 'Repeat', duration: 0, deduplicate: true });
      ({ close } = Message.info({ content: 'Repeat', deduplicate: true }));
    });
    cy.get('.sd-message').should('have.length', 1);
    cy.then(() => close());
    cy.get('.sd-message').should('not.exist');
    cy.then(() => {
      Message.info({ content: 'Repeat', duration: 0, deduplicate: true });
      Message.clear();
      Message.info({ content: 'Repeat', duration: 0, deduplicate: true });
    });
    cy.get('.sd-message').should('have.length', 1);
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
                Message.success('Same', context);
                Message.success('Same', context);
                Message.error('Same', context);
                Message.success({ content: 'Same', deduplicate: false }, context);
              },
            },
            'Show',
          );
      },
    });
    cy.mount(ConfigProvider, {
      props: { global: true, message: { deduplicate: true } },
      slots: { default: () => h(Trigger) },
    });
    cy.get('button').click();
    cy.get('.sd-message-success').should('have.length', 2);
    cy.get('.sd-message-error').should('have.length', 1);
  });
});
