import { h } from 'vue';

import Mention from '../index';

describe('Mention robustness', () => {
  it('renders selectable children from grouped data', () => {
    cy.mount(Mention, {
      props: { data: [{ isGroup: true, label: 'People', options: ['Alice', 'Bob'] }] },
    });
    cy.get('input').type('@');
    cy.get('.sd-select-option').should('have.length', 2);
    cy.contains('.sd-select-option', 'Bob').click();
    cy.get('input').should('have.value', '@Bob');
  });
  for (const value of [0, '']) {
    it(`renders the option slot for value ${JSON.stringify(value)}`, () => {
      cy.mount(Mention, {
        props: { data: [{ value, label: 'Option' }] },
        slots: { option: () => h('strong', { 'data-test': 'option' }, 'Custom option') },
      });
      cy.get('input').type('@');
      cy.get('[data-test="option"]').should('have.text', 'Custom option');
    });
  }

  it('preserves the latest controlled tail when selecting', () => {
    cy.mount(Mention, { props: { modelValue: '@a old', data: ['Alice'] } });
    cy.get('input')
      .focus()
      .then(($input) => {
        ($input[0] as HTMLInputElement).setSelectionRange(2, 2);
      })
      .trigger('input');
    cy.get('.sd-select-option').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '@a new' }));
    cy.get('input').should('have.value', '@a new');
    cy.get('.sd-select-option').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)).to.deep.equal(['@Alice new']);
    });
  });

  for (const type of ['input', 'textarea'] as const) {
    for (const state of ['readonly', 'disabled']) {
      it(`closes an open ${type} popup when ${state} becomes true`, () => {
        cy.mount(Mention, { props: { type, data: ['Alice'] } });
        cy.get(type).type('@');
        cy.get('.sd-select-option').should('be.visible');
        cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [state]: true }));
        cy.get('.sd-select-dropdown').should('not.be.visible');
        cy.get(type).trigger('keydown', { key: 'Enter', keyCode: 13, force: true });
        cy.get('@vue').should(({ wrapper }) => {
          expect(wrapper.emitted('select')).to.equal(undefined);
        });
      });
    }
  }
});
