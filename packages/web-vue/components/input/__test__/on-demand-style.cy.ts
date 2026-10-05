import { h } from 'vue';

import { mount } from 'cypress/vue';

import Input, { InputGroup, InputSearch } from '../index';
import '../style';

describe('Input on-demand styles', () => {
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

  it('styles the readonly tooltip with only the component style entry', () => {
    mount(Input, { props: { readonly: true, modelValue: 'hello' } });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('have.css', 'padding-left', '12px');
  });

  it('styles the search button with only the component style entry', () => {
    mount(InputSearch, { props: { searchButton: true } });
    cy.get('.sd-input-search-btn').should('have.css', 'height', '32px');
  });

  it('overlaps the adjacent group borders', () => {
    mount(InputGroup, {
      slots: { default: () => [h(Input), h(Input)] },
    });
    cy.get('.sd-input-wrapper').first().should('have.css', 'margin-right', '-1px');
  });
});
