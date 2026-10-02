import Slider from '../index';

describe('Slider value boundaries', () => {
  it('keeps a rounded track value inside the maximum', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(Slider, { props: { min: 0, max: 95, step: 10, onChange } });
    cy.get('.sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.wrap($track).trigger('click', {
        clientX: rect.right,
        clientY: rect.top + rect.height / 2,
      });
    });
    cy.get('@onChange').should('have.been.calledOnceWith', 95);
    cy.get('[role="slider"]').should('have.attr', 'aria-valuenow', '95');
  });

  it('keeps decimal keyboard steps exact', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(Slider, { props: { defaultValue: 0.1, step: 0.2, max: 1, onChange } });
    cy.get('[role="slider"]').focus().type('{rightarrow}');
    cy.get('@onChange').should('have.been.calledOnceWith', 0.3);
    cy.get('[role="slider"]').should('have.attr', 'aria-valuenow', '0.3');
  });

  it('keeps a coincident range endpoint inside the maximum on keyboard input', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(Slider, { props: { range: true, defaultValue: [100, 100], onChange } });
    cy.get('[role="slider"]').last().focus().type('{rightarrow}');
    cy.get('@onChange').should('have.been.calledOnceWith', [100, 100]);
    cy.get('[role="slider"]').last().should('have.attr', 'aria-valuenow', '100');
  });
});
