import InputTag from '../index';

describe('InputTag unique object values', () => {
  it('rejects a duplicate using a custom value field and adds a different draft', () => {
    const existing = { id: 'existing', name: 'Existing label' };
    cy.mount(InputTag, {
      props: {
        defaultValue: [existing],
        fieldNames: { value: 'id', label: 'name' },
        uniqueValue: true,
      },
    });
    cy.get('input').type('existing{enter}').should('have.value', 'existing');
    cy.get('.sd-input-tag-tag').should('have.length', 1).and('contain.text', 'Existing label');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
      expect(wrapper.emitted('pressEnter')).to.have.length(1);
    });
    cy.get('input').clear().type('new{enter}');
    cy.get('.sd-input-tag-tag').should('have.length', 2);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([[existing, 'new']]);
    });
  });
});
