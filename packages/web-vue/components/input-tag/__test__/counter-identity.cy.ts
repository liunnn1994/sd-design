import InputTag from '../index';

describe('InputTag overflow counter identity', () => {
  it('renders a user value matching the internal counter value as an ordinary tag', () => {
    cy.mount(InputTag, {
      props: { defaultValue: ['__arco__more', 'second', 'hidden'], maxTagCount: 2 },
    });
    cy.get('.sd-input-tag-tag-counter').should('have.length', 1).and('contain.text', '+1');
    cy.get('.sd-input-tag-tag').first().should('not.have.class', 'sd-input-tag-tag-counter');
    cy.get('.sd-tag-close-btn').first().click();
    cy.get('.sd-input-tag-tag').should('have.length', 2);
    cy.get('.sd-input-tag-tag-counter').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([['second', 'hidden']]);
    });
  });
});
