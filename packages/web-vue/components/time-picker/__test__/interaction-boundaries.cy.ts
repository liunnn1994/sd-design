import TimePicker from '../index';

describe('TimePicker interaction boundaries', () => {
  for (const lock of ['disabled', 'readonly'] as const) {
    it(`locks an already open panel when ${lock} changes`, () => {
      const onChange = cy.spy().as('change');
      const onSelect = cy.spy().as('select');
      cy.mount(TimePicker, {
        props: {
          defaultValue: '09:00:00',
          popupVisible: true,
          disableConfirm: true,
          onChange,
          onSelect,
        },
      });
      cy.get('.sd-timepicker-column').should('be.visible');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [lock]: true }));
      if (lock === 'disabled') cy.get('.sd-picker input').should('be.disabled');
      else cy.get('.sd-picker input').should('have.attr', 'readonly');
      cy.get('.sd-timepicker-column').first().contains('li', /^10$/).click({ force: true });
      cy.get('@select').should('not.have.been.called');
      cy.get('@change').should('not.have.been.called');
      cy.get('.sd-picker input').should('have.value', '09:00:00');
    });
  }

  for (const lock of ['disabled', 'readonly'] as const) {
    it(`disables the footer actions when ${lock} changes`, () => {
      cy.mount(TimePicker, { props: { defaultValue: '09:00:00', popupVisible: true } });
      cy.get('.sd-timepicker-footer-btn-wrapper button').should('have.length', 2);
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [lock]: true }));
      cy.get('.sd-timepicker-footer-btn-wrapper button').each(($button) => {
        expect(($button[0] as HTMLButtonElement).disabled).to.equal(true);
      });
    });
  }

  it('does not confirm a pending value after becoming readonly', () => {
    const onChange = cy.spy().as('change');
    cy.mount(TimePicker, { props: { defaultValue: '09:00:00', popupVisible: true, onChange } });
    cy.get('.sd-timepicker-column').first().contains('li', /^10$/).click();
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ readonly: true }));
    cy.get('.sd-picker input').should('have.attr', 'readonly');
    cy.get('.sd-picker input').focus().trigger('keydown', { key: 'Enter' });
    cy.get('@change').should('not.have.been.called');
  });
});
