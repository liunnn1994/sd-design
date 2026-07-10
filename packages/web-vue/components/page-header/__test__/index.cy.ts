import PageHeader from '../index';

describe('PageHeader', () => {
  it('should emit back event', () => {
    cy.mount(PageHeader, { props: { title: 'SD Design' } });
    cy.get('.sd-page-header-back-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('back')).to.have.length(1);
    });
  });
});
