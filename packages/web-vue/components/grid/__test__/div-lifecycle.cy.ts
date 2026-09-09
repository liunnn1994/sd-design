import { defineComponent, h, ref } from 'vue';

import { Row, Col } from '../index';

describe('Grid plain div mode', () => {
  it('removes layout classes and styles, then restores them when div mode is disabled', () => {
    const plain = ref(false);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Row,
            {
              class: 'custom-row',
              div: plain.value,
              gutter: 24,
              justify: 'center',
              align: 'end',
              wrap: false,
            },
            {
              default: () =>
                h(
                  Col,
                  { class: 'custom-col', flex: '200px', offset: 2, order: 2 },
                  { default: () => 'Content' },
                ),
            },
          ),
      }),
    );
    cy.get('.custom-col').should('have.css', 'flex-basis', '200px');
    cy.then(() => {
      plain.value = true;
    });
    cy.get('.custom-row').should('have.attr', 'class', 'custom-row');
    cy.get('.custom-col').should('have.attr', 'class', 'custom-col');
    cy.get('.custom-col')
      .should('have.css', 'flex-basis', 'auto')
      .and('have.css', 'padding-left', '0px');
    cy.get('.custom-row').should('have.css', 'margin-left', '0px');
    cy.then(() => {
      plain.value = false;
    });
    cy.get('.custom-row')
      .should('have.class', 'sd-row-nowrap')
      .and('have.class', 'sd-row-justify-center');
    cy.get('.custom-col')
      .should('have.css', 'flex-basis', '200px')
      .and('have.css', 'padding-left', '12px');
  });

  it('renders a zero-span column as a plain div', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Row,
            { div: true },
            {
              default: () =>
                h(Col, { span: 0, class: 'plain-zero' }, { default: () => 'Visible content' }),
            },
          ),
      }),
    );
    cy.get('.plain-zero').should('be.visible').and('have.text', 'Visible content');
  });
});
