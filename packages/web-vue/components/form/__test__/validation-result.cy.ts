import { defineComponent, h, reactive, ref } from 'vue';

import Form, { type FormInstance } from '../index';

describe('Form validation result identity', () => {
  it('keeps the original field and label when a path changes during validation', () => {
    let finish: () => void;
    let pending: ReturnType<FormInstance['validate']>;
    const callback = cy.spy().as('validated');
    cy.mount(
      defineComponent({
        setup() {
          const form = ref<FormInstance>();
          const field = ref('first');
          const model = reactive({ first: 'First value', second: 'Second value' });
          return () =>
            h(
              Form,
              { ref: form, model },
              {
                default: () => [
                  h(Form.Item, {
                    field: field.value,
                    label: field.value === 'first' ? 'First label' : 'Second label',
                    rules: {
                      validator: (_value: string, report: (message?: string) => void) =>
                        new Promise<void>((resolve) => {
                          finish = () => {
                            report('Original error');
                            resolve();
                          };
                        }),
                    },
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: () => {
                        pending = form.value!.validate(callback);
                      },
                    },
                    'Validate',
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: () => {
                        field.value = 'second';
                      },
                    },
                    'Switch',
                  ),
                ],
              },
            );
        },
      }),
    );
    cy.contains('button', 'Validate').click();
    cy.contains('button', 'Switch').click();
    cy.then(async () => {
      finish();
      const errors = await pending;
      expect(Object.keys(errors!)).to.deep.equal(['first']);
      expect(errors!.first).to.include({
        field: 'first',
        label: 'First label',
        value: 'First value',
        message: 'Original error',
      });
      expect(callback).to.have.been.calledOnceWith(errors);
    });
    cy.get('.sd-form-item-message').should('not.exist');
  });
});
