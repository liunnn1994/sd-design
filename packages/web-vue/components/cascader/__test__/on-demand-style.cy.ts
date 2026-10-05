import { mount } from 'cypress/vue';

import Cascader from '../index';
import '../style';

describe('Cascader on-demand styles', () => {
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

  it('styles its readonly tooltip with only the component style entry', () => {
    mount(Cascader, { props: { readonly: true } });
    cy.get('.sd-select-view').click();
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });

  it('styles its loading indicator with only the component style entry', () => {
    mount(Cascader, { props: { loading: true, defaultPopupVisible: true } });
    cy.get('.sd-cascader-panel .sd-spin-icon').should('have.css', 'font-size', '20px');
  });
});
