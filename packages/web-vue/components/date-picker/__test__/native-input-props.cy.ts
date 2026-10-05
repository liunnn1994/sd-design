import DatePicker, { RangePicker } from '../index';

describe('DatePicker native input properties', () => {
  it('forwards and updates inputProps on the date input', () => {
    cy.mount(DatePicker, { props: { inputProps: { 'aria-label': 'Date', 'maxlength': 10 } } });
    cy.get('.sd-picker input')
      .should('have.attr', 'aria-label', 'Date')
      .and('have.attr', 'maxlength', '10');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ inputProps: { 'aria-label': 'Updated' } }),
    );
    cy.get('.sd-picker input')
      .should('have.attr', 'aria-label', 'Updated')
      .and('not.have.attr', 'maxlength');
  });

  it('forwards each range input configuration while preserving disabled and readonly state', () => {
    cy.mount(RangePicker, {
      props: {
        disabled: [true, false],
        readonly: true,
        inputProps: [
          { 'aria-label': 'Start', 'disabled': false, 'readonly': false },
          { 'aria-label': 'End', 'readonly': false },
        ],
      },
    });
    cy.get('.sd-picker input')
      .eq(0)
      .should('have.attr', 'aria-label', 'Start')
      .and('be.disabled')
      .and('have.attr', 'readonly');
    cy.get('.sd-picker input')
      .eq(1)
      .should('have.attr', 'aria-label', 'End')
      .and('not.be.disabled')
      .and('have.attr', 'readonly');
  });
});
