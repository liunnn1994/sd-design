import { defineComponent, h, reactive, ref } from 'vue';

import Form, { type FormInstance } from '../index';

describe('Form setFields validation lifecycle', () => {
  for (const result of ['success', 'error'] as const) {
    it(`preserves a manually assigned ${result} after an older validation completes`, () => {
      const form = ref<FormInstance>();
      let finish: () => void;
      let pending: ReturnType<FormInstance['validate']>;
      cy.mount(
        defineComponent({
          setup() {
            const model = reactive({ name: 'Original' });
            return () =>
              h(
                Form,
                { ref: form, model },
                {
                  default: () =>
                    h(Form.Item, {
                      field: 'name',
                      validateTrigger: [],
                      rules: {
                        validator: (_value: unknown, callback: (error?: string) => void) =>
                          new Promise<void>((resolve) => {
                            finish = () => {
                              if (result === 'success') callback('Obsolete error');
                              resolve();
                            };
                          }),
                      },
                    }),
                },
              );
          },
        }),
      );
      cy.then(() => {
        pending = form.value!.validate();
        form.value!.setFields({
          name: { status: result, message: result === 'error' ? 'Server error' : '' },
        });
      });
      cy.get('.sd-form-item').should('have.class', `sd-form-item-status-${result}`);
      cy.then(() => {
        finish();
        return pending;
      });
      cy.get('.sd-form-item').should('have.class', `sd-form-item-status-${result}`);
      if (result === 'error') cy.get('.sd-form-item-message').should('have.text', 'Server error');
      else cy.get('.sd-form-item-message').should('not.exist');
    });
  }
});
