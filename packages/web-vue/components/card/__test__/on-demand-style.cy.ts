import { mount } from 'cypress/vue';

import Card from '../index';
import '../style';

describe('Card on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles its scrollbar with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    mount(Card, { props: { fullHeight: true }, slots: { default: 'Body' } });
    cy.get('.sd-card-body-scrollbar').should('have.css', 'position', 'relative');
  });
});
