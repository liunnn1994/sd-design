import { defineComponent, h, ref } from 'vue';

import type { ToolbarModelValue } from '../types';

import Toolbar from '../index';
describe('Toolbar foundation adapter', () => {
  it('keeps the current controlled model until the parent accepts a reset request', () => {
    cy.mount(
      defineComponent({
        setup() {
          const model = ref<ToolbarModelValue>({ term: 'initial' }),
            requested = ref<ToolbarModelValue>(),
            report = ref('');
          return () => [
            h(
              'button',
              {
                id: 'edit-toolbar-model',
                onClick: () => {
                  model.value = { term: 'edited' };
                },
              },
              'Edit',
            ),
            h(
              'button',
              {
                id: 'accept-toolbar-reset',
                onClick: () => {
                  if (requested.value) model.value = requested.value;
                },
              },
              'Accept',
            ),
            h(Toolbar, {
              'modelValue': model.value,
              'schemas': [{ field: 'term', type: 'input' }],
              'searchText': 'Search',
              'resetText': 'Reset',
              'onUpdate:modelValue': (value) => {
                requested.value = value;
              },
              'onSearch': (value) => {
                report.value = JSON.stringify({ same: value === model.value, value });
              },
            }),
            h('output', { id: 'toolbar-request' }, JSON.stringify(requested.value)),
            h('output', { id: 'toolbar-search-report' }, report.value),
          ];
        },
      }),
    );
    cy.get('#edit-toolbar-model').click();
    cy.get('.sd-toolbar input').should('have.value', 'edited');
    cy.contains('.sd-toolbar button', 'Reset').click();
    cy.get('#toolbar-request').should('have.text', '{"term":"initial"}');
    cy.get('.sd-toolbar input').should('have.value', 'edited');
    cy.contains('.sd-toolbar button', 'Search').click();
    cy.get('#toolbar-search-report').should('have.text', '{"same":true,"value":{"term":"edited"}}');
    cy.get('#accept-toolbar-reset').click();
    cy.get('.sd-toolbar input').should('have.value', 'initial');
  });
});
