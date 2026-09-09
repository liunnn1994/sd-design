import ColorPicker from '../index';

describe('ColorPicker HEX8 editing', () => {
  it('applies the separate alpha input to an eight-digit color', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, format: 'HEX8', enableAlpha: true, defaultValue: '#FF0000FF' },
    });
    cy.get('.sd-color-picker-format-input input').eq(1).clear().type('50%{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal('#FF000080');
    });
    cy.get('.sd-color-picker-format-input input').first().should('have.value', 'FF000080');
  });

  it('uses embedded alpha when editing the eight-digit color', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, format: 'HEX8', enableAlpha: true, defaultValue: '#FF0000FF' },
    });
    cy.get('.sd-color-picker-format-input input').first().clear().type('0000FF80{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal('#0000FF80');
    });
    cy.get('.sd-color-picker-format-input input').eq(1).should('have.value', '50%');
  });
});
