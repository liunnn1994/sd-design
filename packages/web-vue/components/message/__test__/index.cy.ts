import Message from '../index';
import MessageList from '../message-list.vue';

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
});
