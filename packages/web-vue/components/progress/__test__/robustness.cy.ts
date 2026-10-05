import Progress from '../index';

describe('Progress robustness', () => {
  it('applies numeric line widths in pixels', () => {
    cy.mount(Progress, { props: { width: 160, percent: 0.5 } });
    cy.get('.sd-progress-line').should('have.css', 'width', '160px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ width: '75%' }));
    cy.get('.sd-progress-line').should('have.attr', 'style').and('include', 'width: 75%');
  });

  for (const size of ['small', 'large'] as const) {
    it(`honors an explicit four-pixel stroke for ${size} lines`, () => {
      cy.mount(Progress, { props: { size, strokeWidth: 4 } });
      cy.get('.sd-progress-line').should('have.css', 'height', '4px');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ strokeWidth: undefined }));
      cy.get('.sd-progress-line').should('have.css', 'height', size === 'small' ? '3px' : '8px');
    });
  }
});
