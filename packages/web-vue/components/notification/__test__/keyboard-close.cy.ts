import Notification from '../notification.vue';

describe('Notification keyboard close', () => {
  for (const key of ['Enter', ' ']) {
    it(`closes with ${JSON.stringify(key)}`, () => {
      const close = cy.spy().as('close');
      cy.mount(Notification, { props: { closable: true, duration: 0, onClose: close } });
      cy.get('.sd-notification-close-btn').focus().trigger('keydown', { key });
      cy.get('@close').should('have.been.calledOnce');
    });
  }
});
