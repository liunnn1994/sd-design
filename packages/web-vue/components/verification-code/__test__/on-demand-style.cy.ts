import { mount } from 'cypress/vue';

import VerificationCode from '../verification-code.vue';
import '../style';

describe('VerificationCode on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles the input cells with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });

    mount(VerificationCode, {
      props: { length: 4 },
      attrs: { style: { '--component-input-input-color-bg': 'rgb(12, 34, 56)' } },
    });

    cy.get('.sd-verification-code .sd-input-wrapper')
      .should('have.length', 4)
      .and('have.css', 'background-color', 'rgb(12, 34, 56)');
  });
});
