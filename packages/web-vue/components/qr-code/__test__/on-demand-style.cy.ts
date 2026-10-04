import { mount } from 'cypress/vue';

import QrCode from '../qr-code.vue';
import '../style';

describe('QrCode on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles the loading indicator with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });

    mount(QrCode, {
      props: { value: 'loading', status: 'loading', spinProps: { tip: 'Loading' } },
    });

    cy.get('.sd-qr-code-cover .sd-spin')
      .should('have.css', 'display', 'block')
      .and('have.css', 'position', 'relative');
    cy.get('.sd-qr-code-cover .sd-spin-tip').should('have.css', 'margin-top', '6px');
  });
});
