import { h } from 'vue';

import JsonForm from '../index';

describe('JsonForm component slot forwarding', () => {
  for (const name of ['prefix', 'suffix']) {
    it(`forwards the ${name} slot with the current field value`, () => {
      cy.mount(JsonForm, {
        props: { model: { name: 'initial' }, schemas: [{ field: 'name', type: 'input' }] },
        slots: {
          [name]: ({ value }: { value: unknown }) =>
            h('span', { 'data-test': 'field-slot' }, String(value)),
        },
      });
      cy.get(`.sd-input-${name} [data-test="field-slot"]`).should('have.text', 'initial');
      cy.get('input').type('!');
      cy.get(`.sd-input-${name} [data-test="field-slot"]`).should('have.text', 'initial!');
    });
  }
});
