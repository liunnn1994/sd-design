import Notification from '../index';
import NotificationList from '../notification-list';

describe('Notification', () => {
  afterEach(() => {
    Notification.clear();
  });

  it('renders notifications', () => {
    cy.mount(NotificationList, {
      props: {
        notifications: [
          { id: 0, content: 'Info Message', type: 'info' },
          { id: 1, content: 'Success Message', type: 'success' },
          { id: 2, content: 'Warning Message', type: 'warning' },
          { id: 3, content: 'Error Message', type: 'error' },
        ],
      },
    });
    cy.get('.sd-notification').should('have.length', 4);
  });

  it('shows & removes notifications', () => {
    cy.mount({
      template:
        '<button id="add" @click="handleAdd">Add</button>' +
        '<button id="clear" @click="handleClear">Clear</button>',
      methods: {
        handleAdd() {
          Notification.info({ content: 'Info Message', closable: true });
        },
        handleClear() {
          Notification.clear();
        },
      },
    });
    cy.get('#add').click();
    cy.get('#add').click();
    cy.get('.sd-notification').should('have.length', 2);
    cy.get('.sd-notification-close-btn').first().click({ force: true });
    cy.get('#clear').click();
    cy.get('.sd-notification').should('have.length', 0);
  });

  it('emits close event', () => {
    cy.mount(NotificationList, {
      props: {
        notifications: [{ id: 0, content: 'Info Message', type: 'info', closable: true }],
      },
    });
    cy.get('.sd-notification-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('updates notification content', () => {
    let count = 0;
    cy.mount({
      template: '<button @click="handleClick">Click</button>',
      methods: {
        handleClick() {
          Notification.info({ id: '1', content: `Info Message ${++count}` });
        },
      },
    });
    cy.get('button').click();
    cy.get('.sd-notification').should('contain.text', 'Info Message 1');
    cy.get('button').click();
    cy.get('.sd-notification').should('contain.text', 'Info Message 2');
  });
});
