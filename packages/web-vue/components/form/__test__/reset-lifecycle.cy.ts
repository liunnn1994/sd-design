import { defineComponent, h, reactive, ref } from 'vue';

import Form, { type FormInstance } from '../index';

describe('Form mutable initial values', () => {
  for (const kind of ['array', 'object'] as const) {
    it(`restores the initial ${kind} after repeated in-place edits and resets`, () => {
      const initial = kind === 'array' ? ['initial'] : { name: 'initial' };
      const expected = JSON.stringify(initial);
      cy.mount(
        defineComponent({
          setup() {
            const form = ref<FormInstance>();
            const model = reactive({ value: initial });
            return () =>
              h(
                Form,
                { ref: form, model },
                {
                  default: () => [
                    h(
                      Form.Item,
                      { field: 'value' },
                      {
                        default: () => h('output', JSON.stringify(model.value)),
                      },
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        onClick: () => {
                          if (Array.isArray(model.value)) model.value.push('edited');
                          else model.value.name = 'edited';
                        },
                      },
                      'Edit',
                    ),
                    h(
                      'button',
                      { type: 'button', onClick: () => form.value?.resetFields() },
                      'Reset',
                    ),
                  ],
                },
              );
          },
        }),
      );
      for (let iteration = 0; iteration < 2; iteration++) {
        cy.contains('button', 'Edit').click();
        cy.get('output').should('contain.text', 'edited');
        cy.contains('button', 'Reset').click();
        cy.get('output').should('have.text', expected);
      }
    });
  }
});
