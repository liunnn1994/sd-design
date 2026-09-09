import Message from '../../message';
import Copy from '../index';

describe('Copy asynchronous lifecycle', () => {
  let finish: () => void;

  beforeEach(() => {
    cy.stub(Message, 'success')
      .returns({ close() {} })
      .as('success');
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
      cy.stub(win.navigator.clipboard, 'writeText')
        .callsFake(
          () =>
            new Promise<void>((resolve) => {
              finish = resolve;
            }),
        )
        .as('writeText');
    });
  });

  it('emits the content actually copied when props change before completion', () => {
    cy.mount(Copy, { props: { content: 'Original', component: 'button' } });
    cy.get('button').click();
    cy.get('@writeText').should('have.been.calledWith', 'Original');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ content: 'Changed' }));
    cy.then(() => finish());
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.deep.equal([['Original']]);
    });
  });

  it('does not display a success notification after unmount', () => {
    cy.mount(Copy, { props: { content: 'Original', component: 'button' } });
    cy.get('button').click();
    cy.get('@writeText').should('have.been.calledOnce');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => {
      finish();
      return Cypress.Promise.delay(0);
    });
    cy.get('@success').should('not.have.been.called');
  });
});
