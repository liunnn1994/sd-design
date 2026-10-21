import { defineComponent, h, ref } from 'vue';

import Form, { type FormInstance } from '../index';

describe('Form initial value and validation reads', () => {
  it('reads a plain model at the first explicit validation rather than at snapshot creation', () => {
    const model = { name: '' };
    cy.mount(
      defineComponent({
        setup() {
          const form = ref<FormInstance>();
          const result = ref('');
          return () =>
            h('div', [
              h(
                Form,
                { ref: form, model },
                {
                  default: () => h(Form.Item, { field: 'name', required: true }),
                },
              ),
              h(
                'button',
                {
                  onClick: async () => {
                    model.name = 'Filled before the first validation';
                    result.value = (await form.value!.validate()) ? 'invalid' : 'valid';
                  },
                },
                'Validate',
              ),
              h('output', result.value),
            ]);
        },
      }),
    );
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'valid');
  });
});
