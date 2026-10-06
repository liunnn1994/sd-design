import Message from '../message.vue';

describe('Message keyboard close', () => {
  for (const key of ['Enter', ' ']) {
    it(`closes with ${JSON.stringify(key)}`, () => {
      const close = cy.spy().as('close');
      cy.mount(Message, { props: { closable: true, duration: 0, onClose: close } });
      cy.get('.sd-message-close-btn').focus().trigger('keydown', { key });
      cy.get('@close').should('have.been.calledOnce');
    });
  }
});
