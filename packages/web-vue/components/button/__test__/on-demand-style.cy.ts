import { mount } from 'cypress/vue';

import Button from '../button.vue';
import '../style';

describe('Button on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles its tooltip with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    mount(Button, { props: { tooltip: 'Help' }, slots: { default: 'Action' } });
    cy.get('.sd-btn').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
    cy.get('.sd-tooltip-content').should('have.css', 'padding-top', '8px');
  });
});
