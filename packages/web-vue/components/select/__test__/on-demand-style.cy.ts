import { mount } from 'cypress/vue';

import Select from '../index';
import '../style';

describe('Select on-demand styles', () => {
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

  it('styles the dropdown loading indicator', () => {
    mount(Select, { props: { loading: true, defaultPopupVisible: true } });
    cy.get('.sd-select-dropdown-loading .sd-spin-icon').should('have.css', 'font-size', '20px');
  });
});
