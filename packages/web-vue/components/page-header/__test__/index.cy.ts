import PageHeader from '../index';

describe('PageHeader', () => {
  it('should emit back event', () => {
    cy.mount(PageHeader, { props: { title: 'SD Design' } });
    cy.get('.sd-page-header-back-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('back')).to.have.length(1);
    });
  });

  it('exposes the back control as a keyboard-accessible button with a name', () => {
    cy.mount(PageHeader, { props: { title: 'Detail' } });
    cy.get('.sd-page-header-back-btn').as('back');
    cy.get('@back').should('have.attr', 'role', 'button');
    cy.get('@back').should('have.attr', 'tabindex', '0');
    cy.get('@back').should('have.attr', 'aria-label', 'Back');
    cy.get('@back').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('back'), 'back emitted on Enter').to.have.length(1);
    });
  });
});
