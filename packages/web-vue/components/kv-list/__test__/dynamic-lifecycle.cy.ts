import { defineComponent, ref } from 'vue';

import Input from '../../input';
import KvList from '../index';

describe('KvList dynamic lifecycle', () => {
  it('switches custom editors back to built-ins while preserving subsequent edits', () => {
    cy.mount(
      defineComponent({
        components: { Input, KvList },
        setup() {
          return { custom: ref(false), json: ref([{ key: 'key', value: 'value' }]) };
        },
        template: `
        <KvList v-model:json="json">
          <template v-if="custom" #value="{ value, update, props }">
            <Input data-testid="custom" v-bind="props" :model-value="value" @update:model-value="update" />
          </template>
        </KvList>
        <button @click="custom = !custom">Toggle</button>
        <output>{{ JSON.stringify(json) }}</output>
      `,
      }),
    );
    cy.get('.sd-kv-list-value input').type('1');
    cy.contains('button', 'Toggle').click();
    cy.get('[data-testid="custom"] input').should('have.value', 'value1').type('2');
    cy.contains('button', 'Toggle').click();
    cy.get('[data-testid="custom"]').should('not.exist');
    cy.get('.sd-kv-list-value input').should('have.value', 'value12').type('3');
    cy.get('output').should('have.text', JSON.stringify([{ key: 'key', value: 'value123' }]));
  });

  it('keeps external nested json updates and bulk replacements editable', () => {
    cy.mount(
      defineComponent({
        components: { KvList },
        setup() {
          return { json: ref([{ key: 'key', value: 'value' }]), bulk: ref('') };
        },
        template: `
        <KvList v-model:json="json" v-model:bulk="bulk" />
        <button @click="json[0].value = ' new value '">Update JSON</button>
        <button @click="bulk = 'next: changed'">Update Bulk</button>
        <output>{{ JSON.stringify(json) }}</output>
        <pre>{{ bulk }}</pre>
      `,
      }),
    );
    cy.contains('button', 'Update JSON').click();
    cy.get('.sd-kv-list-value input').should('have.value', ' new value ').type('x');
    cy.get('output').should('have.text', JSON.stringify([{ key: 'key', value: ' new value x' }]));
    cy.contains('button', 'Update Bulk').click();
    cy.get('.sd-kv-list-key input').should('have.value', 'next');
    cy.get('.sd-kv-list-value input').should('have.value', 'changed').type('!');
    cy.get('output').should('have.text', JSON.stringify([{ key: 'next', value: 'changed!' }]));
    cy.get('pre').should('have.text', 'next: changed!');
  });
});
