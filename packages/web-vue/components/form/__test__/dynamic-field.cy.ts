import { defineComponent, h, reactive, ref } from 'vue';

import Input from '../../input';
import Form, { type FormInstance } from '../index';

describe('Form dynamic field paths', () => {
  const mountForm = (initialField: string) =>
    cy.mount(
      defineComponent({
        setup() {
          const form = ref<FormInstance>();
          const field = ref(initialField);
          const model = reactive<Record<string, string>>({ first: '', second: 'Second initial' });
          const result = ref('');
          return () =>
            h(
              Form,
              { ref: form, model },
              {
                default: () => [
                  h(
                    Form.Item,
                    {
                      field: field.value,
                      rules: { required: true, message: 'Required' },
                      validateTrigger: [],
                    },
                    {
                      default: () =>
                        h(Input, {
                          'modelValue': model[field.value] ?? '',
                          'onUpdate:modelValue': (value: string) => {
                            model[field.value] = value;
                          },
                        }),
                    },
                  ),
                  ...['first', 'second', ''].map((path) =>
                    h(
                      'button',
                      {
                        type: 'button',
                        onClick: () => {
                          field.value = path;
                        },
                      },
                      path || 'Clear path',
                    ),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: async () => {
                        const errors = await form.value!.validate();
                        result.value = errors ? Object.keys(errors).join(',') : 'valid';
                      },
                    },
                    'Validate',
                  ),
                  h(
                    'button',
                    { type: 'button', onClick: () => form.value?.resetFields() },
                    'Reset',
                  ),
                  h('output', result.value),
                ],
              },
            );
        },
      }),
    );

  it('registers a field assigned after mount and removes it when cleared', () => {
    mountForm('');
    cy.contains('button', 'first').click();
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'first');
    cy.get('.sd-form-item-message').should('have.text', 'Required');
    cy.contains('button', 'Clear path').click();
    cy.get('.sd-form-item-message').should('not.exist');
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'valid');
    cy.contains('button', 'first').click();
    cy.contains('button', 'Validate').click();
    cy.get('output').should('have.text', 'first');
  });

  it('clears old errors and resets using the replacement field initial value', () => {
    mountForm('first');
    cy.contains('button', 'Validate').click();
    cy.get('.sd-form-item-message').should('have.text', 'Required');
    cy.contains('button', 'second').click();
    cy.get('.sd-form-item-message').should('not.exist');
    cy.get('input').clear().type('Edited');
    cy.contains('button', 'Reset').click();
    cy.get('input').should('have.value', 'Second initial');
  });
});
