import InputMask from '../index';

describe('InputMask array literals', () => {
  const mask = ['+86 ', /\d/, /\d/] as const;

  it('keeps literal digits out of the editable value while typing', () => {
    cy.mount(InputMask, { props: { mask, maskChar: null } });
    cy.get('input').type('12').should('have.value', '+86 12');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('+86 12');
      expect(wrapper.emitted('complete')).to.deep.equal([['+86 12']]);
    });
  });
});
