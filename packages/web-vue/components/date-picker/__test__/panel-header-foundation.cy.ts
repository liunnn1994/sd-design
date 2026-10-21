import { reactive } from 'vue';

import { dayjs } from '../../_utils/date';
import { PickerInjectionKey } from '../context';
import Header from '../panels/header.vue';

describe('Date panel header label foundation', () => {
  it('updates injected language formats, mode and missing value without changing label clicks', () => {
    const formats = reactive({ year: 'YY [year]', month: 'MMMM' });
    const click = cy.spy().as('label');
    cy.mount(Header, {
      props: {
        prefixCls: 'sd-datepicker',
        title: 'Header fallback',
        mode: 'date',
        value: dayjs('2025-07-08'),
        onLabelClick: click,
      },
      global: {
        provide: {
          [PickerInjectionKey as symbol]: {
            datePickerT: (key: string) =>
              key.endsWith('yearFormat') ? formats.year : formats.month,
          },
        },
      },
    });
    cy.get('.sd-datepicker-header-label')
      .should('have.length', 2)
      .first()
      .should('have.text', '25 year')
      .click();
    cy.get('@label').should('have.been.calledWithExactly', 'year');
    cy.get('.sd-datepicker-header-label').last().should('have.text', 'July');
    cy.then(() => {
      formats.year = 'datePicker.yearFormat';
      formats.month = 'MM';
    });
    cy.get('.sd-datepicker-header-label').first().should('have.text', '2025');
    cy.get('.sd-datepicker-header-label').last().should('have.text', '07');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mode: 'quarter' }));
    cy.get('.sd-datepicker-header-label').should('have.length', 1).and('have.text', '2025');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mode: 'year' }));
    cy.get('.sd-datepicker-header-label').should('not.exist');
    cy.get('.sd-datepicker-header-title').should('have.text', 'Header fallback');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mode: 'date', value: undefined }));
    cy.get('.sd-datepicker-header-title').should('have.text', 'Header fallback');
  });
});
