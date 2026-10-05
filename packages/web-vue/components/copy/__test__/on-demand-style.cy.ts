import { mount } from 'cypress/vue';

import Message from '../../message';
import Copy from '../index';
import '../style';

describe('Copy on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  beforeEach(() => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
  });

  afterEach(() => {
    Message.clear();
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles the link trigger with only the component style entry', () => {
    mount(Copy, { slots: { default: 'Copy text' } });
    cy.get('.sd-copy.sd-link').should('have.css', 'cursor', 'pointer');
  });

  it('styles the button trigger with only the component style entry', () => {
    mount(Copy, { props: { component: 'button' } });
    cy.get('.sd-copy.sd-btn').should('have.css', 'height', '32px');
  });

  it('styles the tooltip with only the component style entry', () => {
    mount(Copy, { props: { tooltipProps: { defaultPopupVisible: true } } });
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });

  it('styles the success message after copying with only the component style entry', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined);
    });
    mount(Copy, { props: { content: 'copied text' } });
    cy.get('.sd-copy').click();
    cy.get('.sd-message').should('contain', '复制成功');
    cy.get('.sd-message-list').should('have.css', 'position', 'fixed');
  });
});
