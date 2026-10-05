import { mount } from 'cypress/vue';

import BloomMenu from '../bloom-menu.vue';
import '../style';

describe('BloomMenu on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles its trigger and popup with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    mount(BloomMenu, { props: { items: [{ value: 'item', label: 'Item' }] } });
    cy.get('[data-bloom-menu-trigger]').should('have.css', 'height', '32px').click();
    cy.get('.sd-trigger-popup').should('have.css', 'position', 'absolute');
    cy.get('[data-bloom-menu-panel]').should('be.visible');
  });
});
