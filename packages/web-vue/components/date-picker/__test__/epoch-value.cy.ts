import DatePicker, { RangePicker } from '../index';

describe('DatePicker epoch timestamps', () => {
  it('displays timestamp zero in UTC and responds to later timestamps', () => {
    cy.mount(DatePicker, {
      props: { modelValue: 0, valueFormat: 'timestamp', showTime: true, utcOffset: 0 },
    });
    cy.get('.sd-picker input').should('have.value', '1970-01-01 00:00:00');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: 86400000 }));
    cy.get('.sd-picker input').should('have.value', '1970-01-02 00:00:00');
  });

  it('preserves timestamp zero as the start of a range', () => {
    cy.mount(RangePicker, {
      props: { modelValue: [0, 86400000], valueFormat: 'timestamp', showTime: true, utcOffset: 0 },
    });
    cy.get('.sd-picker input').eq(0).should('have.value', '1970-01-01 00:00:00');
    cy.get('.sd-picker input').eq(1).should('have.value', '1970-01-02 00:00:00');
  });
});
