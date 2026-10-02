import Tag from '../index';

describe('Tag gradient color', () => {
  it('uses the gradient average instead of inheriting the page text color', () => {
    cy.mount(Tag, {
      props: { color: 'linear-gradient(90deg, #ff0000, #0000ff)' },
      slots: { default: 'Gradient tag' },
    });
    cy.get('.sd-tag').should('have.css', 'background-color', 'rgb(128, 0, 128)');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ color: '#ff0000' }));
    cy.get('.sd-tag').should('have.css', 'background-color', 'rgb(255, 0, 0)');
  });
});
