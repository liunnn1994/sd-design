import { defineComponent } from 'vue';

import Input from '../../input';
import Form from '../index';
import Demo from './demo.vue';

const FormItem = Form.Item;

describe('Form', () => {
  it('should show an error message for invalid input', () => {
    cy.mount(Demo);
    cy.get('#name input').focus();
    cy.get('#name input').type('test');
    cy.get('#name input').blur();
    cy.get('.sd-form-item-message').should('have.text', 'name should up 6 chars');
  });

  it('should emit submit with validation errors', () => {
    cy.mount(Demo);
    cy.get('@vue').then(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      return cy.wrap(form.trigger('submit'));
    });
    cy.get('@vue').should(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      const emitted = form.emitted<{ errors: Record<string, string[]> }[]>('submit');
      expect(emitted).to.not.equal(undefined);
      expect(emitted![0][0].errors).to.have.property('name');
    });
  });

  it('associates the label with its control via matching for/id', () => {
    const TestApp = defineComponent({
      name: 'LabelAssocDemo',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name" label="Username">
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(TestApp);
    cy.get('.sd-form-item-label')
      .eq(0)
      .then(($label) => {
        const forAttr = $label.attr('for');
        expect(forAttr, 'label has for').to.not.equal(undefined);
        cy.get('input')
          .eq(0)
          .then(($input) => {
            expect($input.attr('id'), 'input id matches label for').to.equal(forAttr);
          });
      });
  });
});
