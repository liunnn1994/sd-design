import { defineComponent, h, reactive, ref } from 'vue';

import JsonForm, { type JsonFormInstance } from '../index';

describe('JsonForm validation lifecycle', () => {
  it('removes hidden required fields from validation and restores them on return', () => {
    cy.mount(
      defineComponent({
        setup() {
          const model = reactive({ name: '' });
          const hidden = ref(false);
          const form = ref<JsonFormInstance>();
          const result = ref('');
          return () =>
            h('div', [
              h(JsonForm, {
                ref: form,
                model,
                schemas: [{ field: 'name', label: 'Name', required: true, hidden: hidden.value }],
              }),
              h(
                'button',
                {
                  onClick: async () => {
                    result.value = (await form.value?.validate()) ? 'invalid' : 'valid';
                  },
                },
                'Validate',
              ),
              h(
                'button',
                {
                  onClick: () => {
                    hidden.value = !hidden.value;
                  },
                },
                'Toggle',
              ),
              h('button', { onClick: () => form.value?.resetFields() }, 'Reset'),
              h('output', result.value),
            ]);
        },
      }),
    );
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'invalid');
    cy.contains('button', 'Toggle').click();
    cy.get('input').should('not.exist');
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'valid');
    cy.contains('button', 'Toggle').click();
    cy.get('input').should('have.value', '');
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'invalid');
    cy.get('input').type('Alice');
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'valid');
    cy.contains('button', 'Reset').click();
    cy.get('input').should('have.value', '');
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'invalid');
  });
});
