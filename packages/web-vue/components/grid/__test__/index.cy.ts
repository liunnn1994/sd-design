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

  it('should apply base span, offset, and order styles', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row style="width: 960px">
          <Col :span="24" data-testid="full-width" />
          <Col :span="6" :offset="6" :order="2" data-testid="configured" />
        </Row>
      `,
    });

    cy.get('[data-testid="full-width"]').should('have.css', 'width', '960px');
    cy.get('[data-testid="configured"]')
      .should('have.css', 'width', '240px')
      .and('have.css', 'margin-left', '240px')
      .and('have.css', 'order', '2');
  });
});
