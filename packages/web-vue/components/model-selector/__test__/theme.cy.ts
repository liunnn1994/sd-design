import { h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import ModelSelector, { ModelSelectorItem } from '../index';

describe('ModelSelector theme tokens', () => {
  it('updates component tokens and restores defaults when removed', () => {
    const theme = ref<{ components: { ModelSelector: { modelSelectorItemHeight?: string } } }>({
      components: { ModelSelector: { modelSelectorItemHeight: '56px' } },
    });
    cy.mount({
      setup: () => () =>
        h(ConfigProvider, { theme: theme.value }, () =>
          h(ModelSelector, {}, () => h(ModelSelectorItem, { value: 'alpha' }, () => 'Alpha')),
        ),
    });
    cy.get('.sd-model-selector-item').should('have.css', 'min-height', '56px');
    cy.then(() => {
      theme.value = { components: { ModelSelector: { modelSelectorItemHeight: '64px' } } };
    });
    cy.get('.sd-model-selector-item').should('have.css', 'min-height', '64px');
    cy.then(() => {
      theme.value = { components: { ModelSelector: {} } };
    });
    cy.get('.sd-model-selector-item').should('have.css', 'min-height', '40px');
  });
});
