import { h, ref } from 'vue';

import InputLabel from '../../_components/input-label/input-label.vue';

describe('InputLabel foundation adapter', () => {
  it('reacts to formatter, focus, selected value and placeholder changes', () => {
    const enabled = ref(false),
      empty = ref(false),
      value = ref(''),
      model = ref<{ value: string; label: string; closable: boolean } | undefined>({
        value: 'id',
        label: 'Label',
        closable: false,
      });
    cy.mount({
      setup: () => () =>
        h(InputLabel, {
          modelValue: model.value,
          inputValue: value.value,
          enabledInput: enabled.value,
          placeholder: 'Placeholder',
          formatLabel: () => (empty.value ? '' : 'Formatted'),
        }),
    });
    cy.get('input')
      .should('have.class', 'sd-input-label-input-hidden')
      .and('have.attr', 'placeholder', 'Placeholder');
    cy.get('.sd-input-label-value').should('contain.text', 'Formatted');
    cy.then(() => {
      enabled.value = true;
    });
    cy.get('input')
      .should('have.attr', 'placeholder', 'Formatted')
      .focus()
      .should('not.have.class', 'sd-input-label-input-hidden');
    cy.then(() => {
      empty.value = true;
    });
    cy.get('input')
      .should('have.attr', 'placeholder', '')
      .blur()
      .should('have.class', 'sd-input-label-input-hidden');
    cy.then(() => {
      model.value = undefined;
    });
    cy.get('input')
      .should('not.have.class', 'sd-input-label-input-hidden')
      .and('have.attr', 'placeholder', 'Placeholder');
  });
});
