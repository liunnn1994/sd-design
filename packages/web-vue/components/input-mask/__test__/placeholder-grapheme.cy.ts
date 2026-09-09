import InputMask from '../index';

describe('InputMask placeholder graphemes', () => {
  for (const placeholder of ['e\u0301', '👩‍💻']) {
    it(`keeps the whole ${placeholder} placeholder while editing`, () => {
      cy.mount(InputMask, {
        props: { mask: '99', maskChar: `${placeholder}x`, alwaysShowMask: true },
      });
      cy.get('input').should('have.value', placeholder.repeat(2));
      cy.get('input').type('1').should('have.value', `1${placeholder}`);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('1');
      });
      cy.get('input').type('2').should('have.value', '12');
      cy.get('input').clear().blur().should('have.value', placeholder.repeat(2));
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('');
      });
    });
  }
});
