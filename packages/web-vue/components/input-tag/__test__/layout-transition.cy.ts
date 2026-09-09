import InputTag from '../index';

describe('InputTag real layout and transitions', () => {
  it('removes and adds tags with real transitions and keeps editing usable', () => {
    cy.mount(InputTag, {
      props: { defaultValue: ['one', 'two'] },
      global: { stubs: { 'transition': false, 'transition-group': false } },
    });
    cy.get('.sd-tag-close-btn').first().click();
    cy.get('.sd-input-tag-tag').should('have.length', 1).and('contain.text', 'two');
    cy.get('input').type('three{enter}');
    cy.get('.sd-input-tag-tag').should('have.length', 2);
    cy.get('.input-tag-zoom-enter-active, .input-tag-zoom-leave-active').should('not.exist');
    cy.get('.sd-input-tag-tag').last().should('have.css', 'opacity', '1');
    cy.get('input').type('{backspace}');
    cy.get('.sd-input-tag-tag').should('have.length', 1).and('contain.text', 'two');
  });

  it('recalculates overflow when resized and recovers after clearing', () => {
    cy.mount(
      {
        components: { InputTag },
        template: `<div data-test="container" style="width:400px"><InputTag :default-value="['one','two','three']" max-tag-count="responsive" allow-clear /></div>`,
      },
      { global: { stubs: { 'transition': false, 'transition-group': false } } },
    );
    cy.get('.sd-input-tag-tag-counter:visible').should('not.exist');
    cy.get('[data-test="container"]').invoke('css', 'width', '150px');
    cy.get('.sd-input-tag-tag-counter:visible').should('have.text', '+2');
    cy.get('[data-test="container"]').invoke('css', 'width', '400px');
    cy.get('.sd-input-tag-tag-counter:visible').should('not.exist');
    cy.get('.sd-tag-close-btn').eq(1).click();
    cy.get('.sd-input-tag-tag').should('have.length', 2);
    cy.get('.sd-input-tag-clear-btn').click({ force: true });
    cy.get('.sd-input-tag-tag').should('not.exist');
    cy.get('input').type('fresh{enter}');
    cy.get('.sd-input-tag-tag').should('have.length', 1).and('contain.text', 'fresh');
  });
});
