import IconPlus from '../icon-plus';

describe('Generated icon size lifecycle', () => {
  it('applies zero size and restores inherited size when size is removed', () => {
    cy.mount(IconPlus, { props: { size: 24 }, attrs: { 'aria-label': 'Add' } });
    cy.get('svg').should('have.css', 'width', '24px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ size: 0 }));
    cy.get('svg').should('have.css', 'font-size', '0px').and('have.css', 'width', '0px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ size: 32 }));
    cy.get('svg').should('have.css', 'width', '32px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ size: undefined }));
    cy.get('svg').should(($svg) => {
      expect($svg[0].style.fontSize).to.equal('');
      expect($svg[0].getBoundingClientRect().width).to.be.greaterThan(0);
    });
    cy.get('svg').should('have.attr', 'aria-label', 'Add');
  });
});
