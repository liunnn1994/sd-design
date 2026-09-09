import { defineComponent, h, ref } from 'vue';

import { Row, Col } from '../index';

describe('Grid numeric zero flex', () => {
  it('applies zero flex and restores span layout when flex is removed', () => {
    const flex = ref<number>();
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Row,
            { style: { width: '400px' } },
            {
              default: () =>
                h(Col, { class: 'cell', span: 12, flex: flex.value }, { default: () => 'Cell' }),
            },
          ),
      }),
    );
    cy.get('.cell').should('have.class', 'sd-col-12').and('have.css', 'width', '200px');
    cy.then(() => {
      flex.value = 0;
    });
    cy.get('.cell').should('not.have.class', 'sd-col-12');
    cy.get('.cell').should('have.css', 'flex-grow', '0').and('have.css', 'flex-basis', '0%');
    cy.then(() => {
      flex.value = 1;
    });
    cy.get('.cell').should('have.css', 'flex-grow', '1').and('have.css', 'width', '400px');
    cy.then(() => {
      flex.value = undefined;
    });
    cy.get('.cell').should('have.class', 'sd-col-12').and('have.css', 'width', '200px');
  });
});
