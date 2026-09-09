import { defineComponent, h } from 'vue';

import { Row, Col } from '../index';

describe('Grid responsive zero values', () => {
  it('resets breakpoint offset and order to zero and restores them on resize', () => {
    cy.viewport(500, 600);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Row,
            { style: { width: '480px' } },
            {
              default: () =>
                h(
                  Col,
                  {
                    class: 'responsive-cell',
                    xs: { span: 6, offset: 6, order: 2 },
                    md: { span: 6, offset: 0, order: 0 },
                  },
                  { default: () => 'Cell' },
                ),
            },
          ),
      }),
    );
    cy.get('.responsive-cell')
      .should('have.css', 'margin-left', '120px')
      .and('have.css', 'order', '2');
    cy.viewport(900, 600);
    cy.get('.responsive-cell')
      .should('have.css', 'margin-left', '0px')
      .and('have.css', 'order', '0');
    cy.viewport(500, 600);
    cy.get('.responsive-cell')
      .should('have.css', 'margin-left', '120px')
      .and('have.css', 'order', '2');
  });
});
