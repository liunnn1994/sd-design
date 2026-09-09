import InputTag from '../index';

describe('InputTag draft lifecycle', () => {
  for (const prop of ['inputValue', 'defaultInputValue'] as const) {
    it(`displays and submits the initial ${prop}`, () => {
      cy.mount(InputTag, { props: { [prop]: 'initial draft' } });
      cy.get('input').should('have.value', 'initial draft');
      cy.get('input').type('{enter}');
      cy.get('.sd-input-tag-tag').should('contain.text', 'initial draft');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([['initial draft']]);
      });
    });
  }

  it('preserves the draft when switching responsive tag layout', () => {
    cy.mount(InputTag);
    cy.get('input').type('draft');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ maxTagCount: 'responsive' }));
    cy.get('input').should('have.value', 'draft');
    cy.get('input').should('be.focused');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ maxTagCount: 0 }));
    cy.get('input').should('have.value', 'draft');
    cy.get('input').should('be.focused');
    cy.get('input').type('{enter}');
    cy.get('.sd-input-tag-tag').should('contain.text', 'draft');
  });
});
