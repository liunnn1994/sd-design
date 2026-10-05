import { mount } from 'cypress/vue';

import Textarea from '../index';
import '../style';

describe('Textarea on-demand styles', () => {
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

  it('includes readonly tooltip styles', () => {
    mount(Textarea, { props: { readonly: true, modelValue: 'hello' } });
    cy.get('textarea').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });
});
