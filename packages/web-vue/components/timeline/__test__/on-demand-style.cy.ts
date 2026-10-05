import { mount } from 'cypress/vue';

import Timeline from '../index';
import '../style';

describe('Timeline on-demand styles', () => {
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

  it('includes pending spinner styles', () => {
    mount(Timeline, { props: { pending: true } });
    cy.get('.sd-spin').should('have.css', 'position', 'relative');
  });
});
