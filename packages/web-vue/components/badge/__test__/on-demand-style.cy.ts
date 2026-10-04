import { mount } from 'cypress/vue';

import Badge from '../badge.vue';
import '../style';

describe('Badge on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles its digits with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });

    mount(Badge, { props: { count: 12, animation: false } });
    cy.get('.sd-number-flow').should('have.css', 'display', 'inline-flex');
    cy.get('.sd-number-flow-digit').should('have.css', 'overflow', 'hidden');
    cy.get('.sd-number-flow-digit-track').should('have.css', 'display', 'flex');
  });
});
