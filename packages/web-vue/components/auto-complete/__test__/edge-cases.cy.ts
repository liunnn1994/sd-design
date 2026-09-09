import { h } from 'vue';

import AutoComplete from '../index';

describe('AutoComplete boundary interactions', () => {
  it('uses the option slot for zero and empty string values', () => {
    cy.mount(AutoComplete, {
      props: { data: [0, { value: '', label: 'Empty' }] },
      slots: { option: ({ data }) => h('span', { class: 'custom-option' }, data.label) },
    });
    cy.get('input').focus();
    cy.get('.custom-option').should('have.length', 2);
  });

  it('normalizes numeric selections to the string model contract', () => {
    cy.mount(AutoComplete, { props: { data: [0, 12] } });
    cy.get('input').focus();
    cy.get('.sd-select-option').first().should('contain.text', '0').click();
    cy.get('input').should('have.value', '0');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.deep.equal([['0']]);
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([['0']]);
    });
    cy.get('input').focus().type('2');
    cy.get('input').should('have.value', '02');
  });

  for (const state of ['readonly', 'disabled'] as const) {
    it(`closes an open dropdown when ${state} becomes true`, () => {
      cy.mount(AutoComplete, { props: { data: ['Apple', 'Banana'] } });
      cy.get('input').focus();
      cy.get('.sd-select-dropdown').should('be.visible');
      cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ [state]: true })));
      cy.get('input').should('have.attr', 'aria-expanded', 'false');
      cy.get('.sd-select-dropdown').should('not.be.visible');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('select')).to.equal(undefined);
      });
    });
  }

  it('mounts its popup inside popupContainer', () => {
    cy.mount({
      components: { AutoComplete },
      template:
        '<div id="autocomplete-popup-host"><AutoComplete :data="[\'Apple\']" popup-container="#autocomplete-popup-host" /></div>',
    });
    cy.get('input').focus();
    cy.get('#autocomplete-popup-host .sd-select-dropdown').should('be.visible');
  });

  it('scrolls virtual options into view during keyboard navigation', () => {
    cy.mount(AutoComplete, {
      props: {
        data: Array.from({ length: 80 }, (_, index) => `Option ${index}`),
        virtualListProps: { height: 144 },
      },
    });
    cy.get('input').focus();
    cy.get('input').click();
    cy.get('.sd-select-option-active').should('be.visible');
    cy.get('input').type('{downarrow}'.repeat(30));
    cy.get('.sd-virtual-list-scroller').should(($el) => {
      expect($el[0].scrollTop).to.be.greaterThan(500);
    });
    cy.get('.sd-select-option-active').should('be.visible').and('contain.text', 'Option 30');
    cy.get('input').type('{enter}').should('have.value', 'Option 30');
  });

  it('skips disabled options and does not select while composing', () => {
    cy.mount(AutoComplete, {
      props: { data: ['Apple', { value: 'Blocked', disabled: true }, 'Banana'] },
    });
    cy.get('input').click();
    cy.get('.sd-select-option-active').should('contain.text', 'Apple');
    cy.get('input').type('{downarrow}');
    cy.get('.sd-select-option-active').should('contain.text', 'Banana');
    cy.get('input').trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('select')).to.equal(undefined));
    cy.get('input').type('{enter}').should('have.value', 'Banana');
  });

  it('refreshes remote suggestions while the input stays focused', () => {
    cy.mount(AutoComplete, { props: { data: [] } });
    cy.get('input').click().type('Ap');
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ data: ['Apple', 'Apricot'] })));
    cy.get('.sd-select-option').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ data: ['Apricot'] })));
    cy.get('input').type('{enter}').should('have.value', 'Apricot');
  });

  for (const virtual of [false, true]) {
    it(`emits scroll and reach-bottom events with virtual=${virtual}`, () => {
      cy.mount(AutoComplete, {
        props: {
          data: Array.from({ length: 80 }, (_, index) => `Option ${index}`),
          virtualListProps: virtual ? { height: 144 } : undefined,
        },
      });
      cy.get('input').click();
      cy.get('.sd-select-dropdown [data-overlayscrollbars-viewport]').scrollTo('bottom');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('dropdownScroll')?.length).to.be.greaterThan(0);
        expect(wrapper.emitted('dropdownReachBottom')?.length).to.be.greaterThan(0);
      });
    });
  }
});
