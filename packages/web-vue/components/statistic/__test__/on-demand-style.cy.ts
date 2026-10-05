import { mount } from 'cypress/vue';

import Statistic from '../index';
import '../style';

describe('Statistic on-demand styles', () => {
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

  it('includes the number flow layout styles', () => {
    mount(Statistic, { props: { value: 123, animation: false } });
    cy.get('.sd-number-flow').should('have.css', 'display', 'inline-flex');
  });
});
