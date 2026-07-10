import Demo from './demo.vue';

describe('Form', () => {
  it('should show an error message for invalid input', () => {
    cy.mount(Demo);
    cy.get('#name input').focus();
    cy.get('#name input').type('test');
    cy.get('#name input').blur();
    cy.get('.sd-form-item-message').should('have.text', 'name should up 6 chars');
  });

  it('should emit submit with validation errors', () => {
    cy.mount(Demo);
    cy.get('@vue').then(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      return cy.wrap(form.trigger('submit'));
    });
    cy.get('@vue').should(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      const emitted = form.emitted<{ errors: Record<string, string[]> }[]>('submit');
      expect(emitted).to.not.equal(undefined);
      expect(emitted![0][0].errors).to.have.property('name');
    });
  });
});
