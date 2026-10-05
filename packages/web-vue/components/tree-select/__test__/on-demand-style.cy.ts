import { mount } from 'cypress/vue';

import TreeSelect from '../index';
import '../style';

describe('TreeSelect on-demand styles', () => {
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

  it('includes popup loading styles', () => {
    mount(TreeSelect, { props: { loading: true, defaultPopupVisible: true } });
    cy.get('.sd-spin-icon').should('have.css', 'font-size', '20px');
  });

  it('includes panel scrollbar styles', () => {
    mount(TreeSelect, {
      props: { data: [{ key: 'one', title: 'One' }], defaultPopupVisible: true },
    });
    cy.get('.sd-tree-select-popup .sd-scrollbar').should('have.css', 'position', 'relative');
  });
});
