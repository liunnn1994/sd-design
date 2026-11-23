import Progress from '../index';

describe('Progress robustness', () => {
  it('updates line dimensions from explicit pixels to a percentage and the size default', () => {
    cy.mount(Progress, { props: { size: 'large', strokeWidth: 4, width: 160, percent: 0.5 } });
    cy.get('.sd-progress-line')
      .should('have.css', 'width', '160px')
      .and('have.css', 'height', '4px');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ width: '75%', strokeWidth: undefined }),
    );
    cy.get('.sd-progress-line').should('have.attr', 'style').and('include', 'width: 75%');
    cy.get('.sd-progress-line').should('have.css', 'height', '8px');
  });
});
