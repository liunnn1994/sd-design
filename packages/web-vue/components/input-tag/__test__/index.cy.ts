import InputTag from '../index';

describe('InputTag', () => {
  it('should emit change on enter', () => {
    cy.mount(InputTag);
    cy.get('input').type('test{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      const emits = wrapper.emitted('change');
      expect(emits).to.have.length(1);
      expect(emits![0][0]).to.deep.equal(['test']);
    });
  });

  it('should remove a tag and clear all', () => {
    cy.mount(InputTag, {
      props: { defaultValue: ['test', 'test-2', 'test-3'], allowClear: true },
    });
    cy.get('.sd-tag').should('have.length', 3);
    cy.get('.sd-tag-close-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('remove')).to.have.length(1);
    });
    cy.get('.sd-input-tag-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
    });
  });
});
