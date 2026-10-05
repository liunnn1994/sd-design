import { defineComponent, h, ref } from 'vue';

import Transfer from '../index';

const data = [{ value: 'a', label: 'Alpha' }];

describe('Transfer robustness', () => {
  it('updates an item slot when it is added and removed', () => {
    const custom = ref(false);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Transfer,
            { data },
            custom.value ? { item: () => h('b', { class: 'custom-item' }, 'Custom') } : {},
          ),
      }),
    );
    cy.get('.sd-transfer-list-item').should('contain.text', 'Alpha');
    cy.then(() => {
      custom.value = true;
    });
    cy.get('.custom-item').should('have.text', 'Custom');
    cy.then(() => {
      custom.value = false;
    });
    cy.get('.custom-item').should('not.exist');
    cy.get('.sd-transfer-list-item').should('contain.text', 'Alpha');
  });

  it('keeps disabled selection unchanged through the custom header callback', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(Transfer, {
      props: { data, disabled: true, onSelect },
      slots: {
        'source-title': ({ onSelectAllChange }) =>
          h(
            'button',
            {
              class: 'custom-select-all',
              onClick: () => onSelectAllChange(true),
            },
            'Select all',
          ),
      },
    });
    cy.get('.custom-select-all').click();
    cy.get('@onSelect').should('not.have.been.called');
  });
});
