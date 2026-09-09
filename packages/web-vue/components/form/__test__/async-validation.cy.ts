import { defineComponent, h, reactive, ref } from 'vue';

import Input from '../../input';
import Form, { type FormInstance } from '../index';

describe('Form async validation lifecycle', () => {
  const mountForm = () => {
    const callbacks: Array<(message?: string) => void> = [];
    const pending: Array<ReturnType<FormInstance['validate']>> = [];
    cy.mount(
      defineComponent({
        setup() {
          const form = ref<FormInstance>();
          const model = reactive({ name: 'initial' });
          return () =>
            h(
              Form,
              { ref: form, model },
              {
                default: () => [
                  h(
                    Form.Item,
                    {
                      field: 'name',
                      validateTrigger: [],
                      rules: {
                        validator: (_value: string, callback: (message?: string) => void) => {
                          return new Promise<void>((resolve) => {
                            callbacks.push((message) => {
                              if (message) callback(message);
                              resolve();
                            });
                          });
                        },
                      },
                    },
                    {
                      default: () =>
                        h(Input, {
                          'modelValue': model.name,
                          'onUpdate:modelValue': (value: string) => {
                            model.name = value;
                          },
                        }),
                    },
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: () => {
                        pending.push(form.value!.validate());
                      },
                    },
                    'Validate',
                  ),
                  h(
                    'button',
                    { type: 'button', onClick: () => form.value?.clearValidate() },
                    'Clear',
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
    return { callbacks, pending };
  };

  it('keeps the newest validation result when an older request finishes later', () => {
    const { callbacks, pending } = mountForm();
    cy.contains('button', 'Validate').click();
    cy.get('input').clear().type('new value');
    cy.contains('button', 'Validate').click();
    cy.then(() => {
      expect(callbacks).to.have.length(2);
      callbacks[1]();
      return pending[1];
    });
    cy.then(() => {
      callbacks[0]('Obsolete error');
      return pending[0];
    });
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('.sd-form-item-message').should('not.exist');
    cy.get('.sd-form-item-error').should('not.exist');
  });

  for (const action of ['Clear', 'Reset']) {
    it(`does not restore a pending error after ${action.toLowerCase()}`, () => {
      const { callbacks, pending } = mountForm();
      cy.get('input').clear().type('edited');
      cy.contains('button', 'Validate').click();
      cy.contains('button', action).click();
      cy.then(() => {
        expect(callbacks).to.have.length(1);
        callbacks[0]('Obsolete error');
        return pending[0];
      });
      cy.then(() => Cypress.Promise.delay(0));
      cy.get('.sd-form-item-message').should('not.exist');
      cy.get('input').should('have.value', action === 'Reset' ? 'initial' : 'edited');
    });
  }
});
