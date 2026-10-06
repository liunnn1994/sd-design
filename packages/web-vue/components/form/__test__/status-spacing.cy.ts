import { h, ref } from 'vue';

import Input from '../../input';
import Form, { FormItem } from '../index';

describe('Form validation spacing', () => {
  it('preserves spacing when an error status has no message', () => {
    const status = ref<'success' | 'error'>('success');
    cy.mount(() =>
      h(Form, { model: {} }, () =>
        h(
          FormItem,
          {
            label: 'Date',
            validateStatus: status.value,
          },
          () => h(Input),
        ),
      ),
    );
    cy.get('.sd-form-item')
      .invoke('css', 'margin-bottom')
      .then((margin) => {
        expect(parseFloat(margin)).to.be.greaterThan(0);
        status.value = 'error';
        cy.get('.sd-form-item-error').should('have.css', 'margin-bottom', margin);
      });
  });
});
