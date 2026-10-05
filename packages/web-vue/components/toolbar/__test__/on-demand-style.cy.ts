import { mount } from 'cypress/vue';

import Toolbar from '../index';
import '../style';

describe('Toolbar on-demand styles', () => {
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

  it('includes action button styles', () => {
    mount(Toolbar);
    cy.get('.sd-btn').first().should('have.css', 'height', '32px');
  });

  it('includes loading mask styles', () => {
    mount(Toolbar, { props: { loading: true } });
    cy.get('.sd-spin-mask').should('have.css', 'position', 'absolute');
  });

  it('includes schema control styles', () => {
    mount(Toolbar, { props: { schemas: [{ field: 'name', type: 'Input' }] } });
    cy.get('.sd-input-wrapper').should(($input) => {
      expect($input[0].getBoundingClientRect().height).to.be.closeTo(32, 0.1);
    });
  });
});
