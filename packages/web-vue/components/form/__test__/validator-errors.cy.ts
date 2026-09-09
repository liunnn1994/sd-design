import { defineComponent, h, reactive } from 'vue';

import Input from '../../input';
import Form from '../index';

describe('Form custom validator errors', () => {
  for (const mode of ['throw', 'reject'] as const) {
    it(`reports a validator ${mode} as failure and supports a successful retry`, () => {
      const failed = cy.spy().as('failed');
      const success = cy.spy().as('success');
      cy.mount(
        defineComponent({
          setup() {
            const model = reactive({ name: 'bad' });
            return () =>
              h(
                Form,
                { model, onSubmitFailed: failed, onSubmitSuccess: success },
                {
                  default: () => [
                    h(
                      Form.Item,
                      {
                        field: 'name',
                        validateTrigger: [],
                        rules: {
                          validator: (value: string) => {
                            if (value === 'good') return;
                            const error = new Error('Validation unavailable');
                            if (mode === 'throw') throw error;
                            return Promise.reject(error);
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
                    h('button', { type: 'submit' }, 'Submit'),
                  ],
                },
              );
          },
        }),
      );
      cy.contains('button', 'Submit').click();
      cy.get('@failed').should('have.been.calledOnce');
      cy.get('.sd-form-item-message').should('have.text', 'Validation unavailable');
      cy.get('@success').should('not.have.been.called');
      cy.get('input').clear().type('good');
      cy.contains('button', 'Submit').click();
      cy.get('@success').should('have.been.calledOnce');
      cy.get('.sd-form-item-message').should('not.exist');
      cy.get('@failed').should('have.been.calledOnce');
    });
  }
});
