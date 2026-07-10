import Grid from '../index';

const { Row, Col } = Grid;

describe('Grid', () => {
  it('should render Col children inside Row', () => {
    cy.mount(Row, { slots: { default: [Col, Col, Col] } });
    cy.get('.sd-col').should('have.length', 3);
  });

  it('should render Col text content', () => {
    cy.mount(Col, { slots: { default: `<div class="text">abc</div>` } });
    cy.get('.text').should('contain.text', 'abc');
  });
});
