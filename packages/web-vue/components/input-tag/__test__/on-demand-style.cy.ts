import { mount } from 'cypress/vue';

import InputTag from '../index';
import '../style';

describe('InputTag on-demand styles', () => {
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

  it('styles the readonly tooltip with only the component style entry', () => {
    mount(InputTag, { props: { readonly: true } });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });
});
