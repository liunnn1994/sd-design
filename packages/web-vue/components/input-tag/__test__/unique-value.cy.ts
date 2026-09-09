import InputTag from '../index';

describe('InputTag unique object values', () => {
  for (const example of [
    { value: { value: 'existing', label: 'Existing label' }, fieldNames: undefined },
    {
      value: { id: 'existing', name: 'Existing label' },
      fieldNames: { value: 'id', label: 'name' },
    },
  ]) {
    it(`rejects duplicates with ${example.fieldNames ? 'custom' : 'default'} fields`, () => {
      cy.mount(InputTag, {
        props: { defaultValue: [example.value], fieldNames: example.fieldNames, uniqueValue: true },
      });
      cy.get('input').type('existing{enter}');
      cy.get('.sd-input-tag-tag').should('have.length', 1);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
        expect(wrapper.emitted('pressEnter')).to.have.length(1);
      });
      cy.get('input').clear().type('new{enter}');
      cy.get('.sd-input-tag-tag').should('have.length', 2);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([
          [example.value, 'new'],
        ]);
      });
    });
  }
});
