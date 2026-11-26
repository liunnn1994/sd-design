import { h } from 'vue';

import { mount } from 'cypress/vue';

import Button from '../../button';
import Select from '../../select';
import Input, { InputGroup, InputPassword, InputSearch } from '../index';
import '../style';
import '../../select/style';

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

  it('applies the password visibility icon size with only the component style entry', () => {
    mount(InputPassword);
    cy.get('.sd-input-suffix').should('have.css', 'font-size', '12px');
  });

  it('overlaps the adjacent group borders', () => {
    mount(InputGroup, {
      slots: { default: () => [h(Input), h(Input)] },
    });
    cy.get('.sd-input-wrapper').first().should('have.css', 'margin-right', '-1px');
  });

  it('rounds only the outer corners of buttons in a mixed input group', () => {
    mount(InputGroup, {
      slots: {
        default: () => [
          h(Button, {}, () => 'First'),
          h(Select, { options: ['Option'] }),
          h(Button, { shape: 'round' }, () => 'Middle'),
          h(Input),
          h(Button, {}, () => 'Last'),
        ],
      },
    });

    cy.get('.sd-input-group > .sd-btn').should(($buttons) => {
      expect($buttons).to.have.length(3);
      const [first, middle, last] = $buttons
        .toArray()
        .map((button) => button.ownerDocument.defaultView!.getComputedStyle(button));

      for (const style of [first, middle]) {
        expect(style.borderTopRightRadius).to.equal('0px');
        expect(style.borderBottomRightRadius).to.equal('0px');
      }
      for (const style of [middle, last]) {
        expect(style.borderTopLeftRadius).to.equal('0px');
        expect(style.borderBottomLeftRadius).to.equal('0px');
      }
      expect(parseFloat(first.borderTopLeftRadius)).to.be.greaterThan(0);
      expect(parseFloat(first.borderBottomLeftRadius)).to.be.greaterThan(0);
      expect(parseFloat(last.borderTopRightRadius)).to.be.greaterThan(0);
      expect(parseFloat(last.borderBottomRightRadius)).to.be.greaterThan(0);
    });
  });
});
