import { defineComponent, h, reactive, ref } from 'vue';

import Input from '../../input';
import Form, { type FormInstance } from '../index';

describe('Form nested field lifecycle', () => {
  for (const timing of ['completed', 'pending'] as const) {
    it(`clears a removed noStyle field with ${timing} validation`, () => {
      let finish: () => void;
      let validation: ReturnType<FormInstance['validate']>;
      cy.mount(
        defineComponent({
          setup() {
            const form = ref<FormInstance>();
            const visible = ref(true);
            const model = reactive({ name: '' });
            return () =>
              h(
                Form,
                { ref: form, model },
                {
                  default: () => [
                    h(
                      Form.Item,
                      { label: 'Parent' },
                      {
                        default: () =>
                          visible.value
                            ? h(
                                Form.Item,
                                {
                                  field: 'name',
                                  noStyle: true,
                                  validateTrigger: [],
                                  rules: {
                                    validator: (
                                      _value: string,
                                      callback: (message?: string) => void,
                                    ) =>
                                      new Promise<void>((resolve) => {
                                        finish = () => {
                                          callback('Nested error');
                                          resolve();
                                        };
                                      }),
                                  },
                                },
                                { default: () => h(Input, { modelValue: model.name }) },
                              )
                            : null,
                      },
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        onClick: () => {
                          validation = form.value!.validate();
                        },
                      },
                      'Validate',
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        onClick: () => {
                          visible.value = false;
                        },
                      },
                      'Remove',
                    ),
                  ],
                },
              );
          },
        }),
      );
      cy.contains('button', 'Validate').click();
      if (timing === 'completed') {
        cy.then(() => {
          finish();
          return validation;
        });
        cy.get('.sd-form-item-message').should('have.text', 'Nested error');
      }
      cy.contains('button', 'Remove').click();
      cy.get('input').should('not.exist');
      if (timing === 'pending') {
        cy.then(() => {
          finish();
          return validation;
        });
      }
      cy.then(() => Cypress.Promise.delay(0));
      cy.get('.sd-form-item-message').should('not.exist');
      cy.get('.sd-form-item-error').should('not.exist');
      cy.contains('button', 'Validate').click();
      cy.then(async () => {
        expect(await validation).to.equal(undefined);
      });
    });
  }
});
