import { mount } from 'cypress/vue';

import RegexVis from '../index';
import '../style';

describe('RegexVis on-demand styles', () => {
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

  it('styles the expression input', () => {
    mount(RegexVis, { props: { modelValue: 'abc' } });
    cy.get('.sd-regex-vis-input').should(($input) => {
      expect(parseFloat($input.css('height'))).to.be.closeTo(32, 0.1);
    });
  });

  it('styles the flag checkboxes', () => {
    mount(RegexVis, { props: { modelValue: 'abc' } });
    cy.get('.sd-checkbox').first().should('have.css', 'display', 'inline-flex');
  });
});
