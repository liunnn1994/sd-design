import Checkbox from '../index';

describe('Checkbox native mixed state', () => {
  it('keeps the native indeterminate state in sync after activation', () => {
    cy.mount(Checkbox, {
      props: { indeterminate: true, modelValue: false },
      slots: { default: 'Choice' },
    });
    cy.get('input').should('have.prop', 'indeterminate', true);
    cy.contains('label', 'Choice').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([[true]]);
    });
    cy.get('input').should('not.be.checked').and('have.prop', 'indeterminate', true);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ indeterminate: false }));
    cy.get('input').should('have.prop', 'indeterminate', false);
  });
});
