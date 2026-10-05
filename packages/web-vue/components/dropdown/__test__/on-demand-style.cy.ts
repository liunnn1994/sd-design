import { mount } from 'cypress/vue';

import Dropdown from '../index';
import '../style';

describe('Dropdown on-demand styles', () => {
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

  it('styles its split buttons with only the component style entry', () => {
    mount(Dropdown.Button, { slots: { default: 'Actions' } });
    cy.get('.sd-btn').first().should('have.css', 'height', '32px');
  });

  it('styles its empty state with only the component style entry', () => {
    mount(Dropdown, {
      props: { isEmpty: true, defaultPopupVisible: true },
      slots: { default: '<button>Open</button>' },
    });
    cy.get('.sd-dropdown-empty .sd-empty').should('have.css', 'text-align', 'center');
  });
});
