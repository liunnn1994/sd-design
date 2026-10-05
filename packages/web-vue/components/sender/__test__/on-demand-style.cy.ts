import { mount } from 'cypress/vue';

import Sender from '../index';
import '../style';

describe('Sender on-demand styles', () => {
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
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles the send button', () => {
    mount(Sender, { props: { defaultValue: 'message' } });
    cy.get('.sd-sender-actions-btn').should('have.css', 'height', '32px');
  });

  it('styles the plain textarea', () => {
    mount(Sender, { props: { autoSize: false } });
    cy.get('.sd-textarea').should('have.css', 'display', 'block');
  });

  it('styles the readonly tooltip', () => {
    mount(Sender, { props: { readonly: true } });
    cy.get('.sd-sender-main').click();
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });

  it('includes the rich text editor control styles', () => {
    mount(Sender, {
      props: { slotConfig: [{ type: 'input', key: 'input', props: { defaultValue: 'value' } }] },
    });
    cy.get('.sd-input-wrapper').should(($input) => {
      expect(parseFloat($input.css('height'))).to.be.closeTo(32, 0.1);
    });
  });
});
