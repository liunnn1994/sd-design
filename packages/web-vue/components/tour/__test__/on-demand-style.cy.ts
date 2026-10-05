import { mount } from 'cypress/vue';

import Tour from '../index';
import '../style';

describe('Tour on-demand styles', () => {
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

  it('includes navigation button styles', () => {
    mount(Tour, { props: { defaultVisible: true, steps: [{ popover: { title: 'Welcome' } }] } });
    cy.get('.sd-tour-popover-next-btn').should('have.css', 'height', '28px');
  });
});
