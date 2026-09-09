import Message from '../../message';
import Copy from '../index';

describe('Copy overlapping operations', () => {
  for (const reverse of [false, true]) {
    it(`reports each copied value with ${reverse ? 'reverse' : 'original'} completion order`, () => {
      const pending: Array<() => void> = [];
      cy.stub(Message, 'success')
        .returns({ close() {} })
        .as('success');
      cy.window().then((win) => {
        Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
        cy.stub(win.navigator.clipboard, 'writeText')
          .callsFake(
            () =>
              new Promise<void>((resolve) => {
                pending.push(resolve);
              }),
          )
          .as('writeText');
      });
      cy.mount(Copy, { props: { component: 'button', content: 'First' } });
      cy.get('button').click();
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ content: 'Second' }));
      cy.get('button').click();
      cy.get('@writeText').should('have.been.calledTwice');
      cy.then(() => pending[reverse ? 1 : 0]());
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('copy')).to.deep.equal([[reverse ? 'Second' : 'First']]);
      });
      cy.then(() => pending[reverse ? 0 : 1]());
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('copy')).to.deep.equal(
          reverse ? [['Second'], ['First']] : [['First'], ['Second']],
        );
      });
      cy.get('@success').should('have.been.calledTwice');
    });
  }
});
