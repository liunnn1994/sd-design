import { mount } from 'cypress/vue';

import Breadcrumb from '../breadcrumb.vue';
import '../style';

describe('Breadcrumb on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles its dropdown with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    mount(Breadcrumb, {
      props: {
        routes: [
          { path: '/home', label: 'Home', children: [{ path: '/child', label: 'Child' }] },
          { path: '/current', label: 'Current' },
        ],
      },
    });
    cy.get('.sd-breadcrumb-item-with-dropdown').click();
    cy.get('.sd-dropdown-option').should('have.css', 'display', 'flex');
    cy.get('.sd-dropdown-list').should('have.css', 'list-style-type', 'none');
  });
});
