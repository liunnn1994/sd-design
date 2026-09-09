import InputMask from '../index';

describe('InputMask callback completion', () => {
  it('does not emit complete when the callback rejects the final character', () => {
    cy.mount(InputMask, {
      props: {
        mask: '99',
        beforeMaskedValueChange: (next, previous) => (next.value === '12' ? previous : next),
      },
    });
    cy.get('input').type('12').should('have.value', '1_');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('1');
      expect(wrapper.emitted('complete')).to.equal(undefined);
    });
    cy.get('input').type('3').should('have.value', '13');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('complete')).to.deep.equal([['13']]);
    });
  });

  it('emits complete when the callback supplies the remaining characters', () => {
    cy.mount(InputMask, {
      props: {
        mask: '99',
        beforeMaskedValueChange: (next) => ({ ...next, value: '12' }),
      },
    });
    cy.get('input').type('1').should('have.value', '12');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('12');
      expect(wrapper.emitted('complete')).to.deep.equal([['12']]);
    });
  });
});
