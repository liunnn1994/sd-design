import { defineComponent, h, ref } from 'vue';

import Input from '../../input';
import Form, { type FormInstance } from '../index';

describe('Form scrollToField with HTML identifiers', () => {
  for (const id of ['123form', 'profile:form']) {
    it(`scrolls to the field when the form id is ${id}`, () => {
      const form = ref<FormInstance>();
      cy.mount(
        defineComponent({
          setup() {
            return () =>
              h(
                Form,
                { ref: form, id, model: { name: '' } },
                {
                  default: () =>
                    h(
                      Form.Item,
                      { field: 'name' },
                      {
                        default: () => h(Input),
                      },
                    ),
                },
              );
          },
        }),
      );
      cy.get('.sd-form-item-wrapper-col').then(($field) => {
        cy.stub($field[0], 'scrollIntoView').as('scroll');
      });
      cy.then(() => form.value!.scrollToField('name'));
      cy.get('@scroll').should('have.been.calledOnce');
    });
  }
});
