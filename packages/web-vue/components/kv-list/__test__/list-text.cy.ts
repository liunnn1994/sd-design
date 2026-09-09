import { defineComponent, ref } from 'vue';

import KvList from '../index';

describe('KvList list text preservation', () => {
  for (const value of ['hello world', ' leading ', 'https://example.test/a:b']) {
    it(`preserves typed value ${JSON.stringify(value)} and focus`, () => {
      cy.mount(
        defineComponent({
          components: { KvList },
          setup() {
            return { json: ref([{ key: 'key', value: '' }]), bulk: ref('') };
          },
          template:
            '<KvList v-model:json="json" v-model:bulk="bulk" /><output>{{ JSON.stringify(json) }}</output>',
        }),
      );
      cy.get('.sd-kv-list-value input').type(value);
      cy.get('.sd-kv-list-value input').should('have.value', value).and('be.focused');
      cy.get('output').should('have.text', JSON.stringify([{ key: 'key', value }]));
    });
  }
});
