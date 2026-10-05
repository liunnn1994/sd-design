import { h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import Select from '../index';

describe('Select provided empty state', () => {
  it('updates provider empty slot content without remounting the dropdown', () => {
    const text = ref('Old');
    cy.mount({
      setup: () => () =>
        h(
          ConfigProvider,
          {},
          {
            default: () => h(Select, { defaultPopupVisible: true }),
            empty: () => h('div', { class: 'provided-empty' }, text.value),
          },
        ),
    });
    cy.get('.provided-empty').should('have.text', 'Old');
    cy.then(() => {
      text.value = 'New';
    });
    cy.get('.provided-empty').should('have.text', 'New');
  });
});
