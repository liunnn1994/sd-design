import { h } from 'vue';

import type { MessageReturn } from '../interface';

import Message from '../index';
import MessageList from '../message-list.vue';
import MessageComponent from '../message.vue';

describe('Message', () => {
  // Imperative messages mount into document.body outside the test component, so
  // clear them between tests to keep counts deterministic.
  afterEach(() => {
    Message.clear();
  });

  it('should render messages', () => {
    cy.mount(MessageList, {
      props: {
        messages: [
          { id: 0, content: 'Info Message', type: 'info' },
          { id: 1, content: 'Success Message', type: 'success' },
          { id: 2, content: 'Warning Message', type: 'warning' },
          { id: 3, content: 'Error Message', type: 'error' },
        ],
      },
    });
    cy.get('.sd-message').should('have.length', 4);
  });

  it('should show & remove message', () => {
    cy.mount({
      template:
        '<button id="add" @click="handleAdd">Add</button>' +
        '<button id="clear" @click="handleClear">Clear</button>',
      methods: {
        handleAdd() {
          Message.info({ content: 'Info Message', closable: true });
        },
        handleClear() {
          Message.clear();
        },
      },
    });
    cy.get('#add').click();
    cy.get('#add').click();
    cy.get('.sd-message').should('have.length', 2);
    cy.get('.sd-message-close-btn').first().click();
    cy.get('#clear').click();
    cy.get('.sd-message').should('have.length', 0);
  });

  it('should emit close event', () => {
    cy.mount(MessageList, {
      props: {
        messages: [{ id: 0, content: 'Info Message', type: 'info', closable: true }],
      },
    });
    cy.get('.sd-message-close-btn').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('should update message content', () => {
    let count = 0;
    cy.mount({
      template: '<button @click="handleClick">Click</button>',
      methods: {
        handleClick() {
          Message.info({ id: '1', content: `Info Message ${++count}` });
        },
      },
    });
    cy.get('button').click();
    cy.get('.sd-message').should('contain.text', 'Info Message 1');
    cy.get('button').click();
    cy.get('.sd-message').should('contain.text', 'Info Message 2');
  });

  // --- message.vue component-level coverage ---

  it('shows the type icon by default and hides it when show-icon is false', () => {
    cy.mount(MessageComponent, {
      props: { type: 'success' },
      slots: { default: 'Info Message' },
    });
    cy.get('.sd-message-icon').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ showIcon: false })));
    cy.get('.sd-message-icon').should('not.exist');
  });

  it('renders no icon for the normal type without an icon slot', () => {
    cy.mount(MessageComponent, {
      props: { type: 'normal' },
      slots: { default: 'Normal Message' },
    });
    cy.get('.sd-message-normal').should('exist');
    cy.get('.sd-message-icon').should('not.exist');
  });

  it('renders a custom icon from the icon slot', () => {
    cy.mount(MessageComponent, {
      slots: {
        default: 'Info Message',
        icon: '<span id="slot-icon">X</span>',
      },
    });
    cy.get('#slot-icon').should('exist');
  });

  it('auto-closes after the given duration and emits close', () => {
    cy.clock();
    cy.mount(MessageComponent, {
      props: { duration: 100 },
      slots: { default: 'Info Message' },
    });
    cy.tick(99);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
    });
    cy.tick(1);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('never auto-closes when duration is 0', () => {
    cy.clock();
    cy.mount(MessageComponent, {
      props: { duration: 0 },
      slots: { default: 'Info Message' },
    });
    cy.tick(5000);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
    });
  });

  it('pauses the auto-close timer while hovered and restarts it on leave (reset-on-hover)', () => {
    cy.clock();
    cy.mount(MessageComponent, {
      props: { duration: 500 },
      slots: { default: 'Info Message' },
    });
    cy.tick(400);
    cy.get('.sd-message').trigger('mouseenter');
    cy.tick(500);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
    });
    cy.get('.sd-message').trigger('mouseleave');
    cy.tick(499);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
    });
    cy.tick(1);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('restarts the auto-close timer on update when reset-on-update is true', () => {
    cy.clock();
    cy.mount(MessageComponent, {
      props: { duration: 100, resetOnUpdate: true },
      slots: { default: 'Info Message' },
    });
    cy.tick(50);
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ duration: 10000 })));
    cy.tick(100);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
    });
    cy.tick(9900);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  // --- imperative API coverage ---

  it('renders type-specific classes and icons for every imperative type method', () => {
    cy.then(() => {
      Message.success('Saved');
      Message.warning('Watch out');
      Message.error('Failed');
      Message.loading('Loading');
      Message.normal('Plain');
    });
    cy.get('.sd-message-success').should('contain.text', 'Saved');
    cy.get('.sd-message-warning').should('contain.text', 'Watch out');
    cy.get('.sd-message-error').should('contain.text', 'Failed');
    cy.get('.sd-message-loading').should('contain.text', 'Loading');
    cy.get('.sd-message-normal').should('contain.text', 'Plain');
    cy.get('.sd-message-loading').find('.sd-message-icon').should('exist');
    cy.get('.sd-message-normal').find('.sd-message-icon').should('not.exist');
  });

  it('accepts a plain string as the config', () => {
    cy.then(() => {
      Message.info('Plain info');
    });
    cy.get('.sd-message').should('contain.text', 'Plain info');
  });

  it('renders a custom icon from the icon config', () => {
    cy.then(() => {
      Message.info({ content: 'With icon', icon: () => h('i', { id: 'imperative-icon' }, 'i') });
    });
    cy.get('#imperative-icon').should('exist');
  });

  it('closing via the returned handle removes only that message', () => {
    let first: MessageReturn | undefined;
    let second: MessageReturn | undefined;
    cy.then(() => {
      first = Message.info({ id: 'm-first', content: 'First' });
      second = Message.info({ id: 'm-second', content: 'Second' });
    });
    cy.get('.sd-message').should('have.length', 2);
    cy.then(() => {
      first!.close();
    });
    cy.get('.sd-message').should('have.length', 1);
    cy.get('.sd-message').should('contain.text', 'Second');
    cy.then(() => {
      second!.close();
    });
    cy.get('.sd-message').should('have.length', 0);
  });

  it('calls onClose with the message id', () => {
    const onClose = cy.spy().as('onClose');
    cy.then(() => {
      Message.info({ id: 'm-1', content: 'Closable', closable: true, onClose });
    });
    cy.get('.sd-message-close-btn').click();
    cy.get('@onClose').should('have.been.calledWith', 'm-1');
  });

  it('renders in the requested position container', () => {
    cy.then(() => {
      Message.info({ content: 'Top message', position: 'top' });
      Message.info({ content: 'Bottom message', position: 'bottom' });
    });
    cy.get('.sd-message-list-top').should('contain.text', 'Top message');
    cy.get('.sd-message-list-bottom').should('contain.text', 'Bottom message');
  });

  it('clears only the requested position', () => {
    cy.then(() => {
      Message.info({ content: 'Top message', position: 'top' });
      Message.info({ content: 'Bottom message', position: 'bottom' });
    });
    cy.get('.sd-message-list-top .sd-message').should('have.length', 1);
    cy.get('.sd-message-list-bottom .sd-message').should('have.length', 1);
    cy.then(() => {
      Message.clear('top');
    });
    cy.get('.sd-message-list-top .sd-message').should('have.length', 0);
    cy.get('.sd-message-list-bottom .sd-message').should('have.length', 1);
  });
});
