import { mount } from 'cypress/vue';

import Drawer from '../index';
import '../style';

describe('Drawer on-demand styles', () => {
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

  it('constrains its title ellipsis with only the component style entry', () => {
    mount(Drawer, {
      props: { defaultVisible: true, renderToBody: false, title: 'Drawer title' },
    });
    cy.get('.sd-drawer-title-text').should('have.css', 'max-width', '100%');
  });
});
