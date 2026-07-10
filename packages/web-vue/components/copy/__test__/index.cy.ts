import Message from '../../message';
import Copy from '../index';

// Real browser clipboard interactions are stubbed, mirroring the vitest spies.
describe('Copy', () => {
  beforeEach(() => {
    cy.stub(Message, 'success')
      .returns({ close() {} })
      .as('success');
  });

  it('copies content and shows a success message', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      props: { content: 'https://sd-design.js.org' },
      slots: { default: '复制链接' },
    });
    cy.get('a').click();
    cy.get('@writeText').should('have.been.calledWith', 'https://sd-design.js.org');
    cy.get('@success').should('have.been.calledWith', '复制成功');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.deep.equal([['https://sd-design.js.org']]);
    });
  });

  it('does not copy when the trigger is disabled', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      attrs: { disabled: true },
      props: { content: 'disabled-text' },
      slots: { default: '不可复制' },
    });
    cy.get('a').click({ force: true });
    cy.get('@writeText').should('not.be.called');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.equal(undefined);
    });
  });

  it('falls back to execCommand/prompt in a non-secure context', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: false });
      Object.defineProperty(win, 'prompt', {
        configurable: true,
        value: cy.stub().as('prompt'),
      });
    });
    cy.document().then((doc) => {
      cy.stub(doc, 'execCommand').returns(false).as('execCommand');
    });
    cy.mount(Copy, {
      props: { content: 'clipboard-text', clipboardProps: { fallbackToPrompt: true } },
      slots: { default: '复制文本' },
    });
    cy.get('a').click();
    cy.get('@execCommand').should('have.been.calledWith', 'copy');
    cy.get('@prompt').should(
      'have.been.calledWith',
      'Copy to clipboard: Ctrl+C, Enter',
      'clipboard-text',
    );
  });
});
