import { mount } from 'cypress/vue';

import JsonForm from '../index';
import '../style';

describe('JsonForm on-demand styles', () => {
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

  it('styles the form and default input with only the component style entry', () => {
    mount(JsonForm, { props: { schemas: [{ field: 'name', label: 'Name' }] } });
    cy.get('.sd-form').should('have.css', 'display', 'flex');
    cy.get('.sd-input-wrapper').should(($input) => {
      expect(parseFloat(getComputedStyle($input[0]).height)).to.be.closeTo(32, 0.1);
    });
  });

  it('styles built-in controls with only the component style entry', () => {
    mount(JsonForm, {
      props: {
        model: { enabled: false, amount: 10 },
        schemas: [
          { field: 'enabled', type: 'switch' },
          { field: 'amount', type: 'slider' },
        ],
      },
    });
    cy.get('.sd-switch').should('have.css', 'height', '24px');
    cy.get('.sd-slider-track').should('have.css', 'position', 'relative');
  });
});
