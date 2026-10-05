import { mount } from 'cypress/vue';

import Pagination from '../index';
import '../style';

describe('Pagination on-demand styles', () => {
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

  it('applies the InputNumber radius token to the page jumper', () => {
    mount(Pagination, {
      props: { total: 100, showJumper: true },
      attrs: { style: '--component-input-number-border-radius: 12px' },
    });
    cy.get('.sd-pagination-jumper-input').should('have.css', 'border-radius', '12px');
  });
});
