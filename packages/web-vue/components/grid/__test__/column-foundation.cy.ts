import { defineComponent, h, reactive } from 'vue';

import { Row, Col } from '../index';

describe('Grid column foundation adapter', () => {
  it('updates flex rules, responsive-zero classes and gutters without replacing slot content', () => {
    const state = reactive({
      flex: undefined as string | number | undefined,
      gutter: [16, 8] as [number, number],
      zero: false,
    });
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Row, { gutter: state.gutter, style: { width: '400px' } }, () =>
            h(
              Col,
              {
                class: 'foundation-col',
                flex: state.flex,
                span: 12,
                xs: state.zero ? { span: 12, offset: 0, order: 0 } : undefined,
              },
              () => h('input', { key: 'input', class: 'foundation-input' }),
            ),
          ),
      }),
    );
    let input: HTMLElement;
    cy.get('.foundation-input')
      .type('draft')
      .then((element) => {
        input = element[0];
      });
    cy.get('.foundation-col')
      .should('have.class', 'sd-col-12')
      .and('have.css', 'padding-left', '8px')
      .and('have.css', 'padding-top', '4px');
    cy.then(() => {
      state.flex = '120px';
      state.gutter = [0, 20];
    });
    cy.get('.foundation-col')
      .should('not.have.class', 'sd-col-12')
      .and('have.css', 'flex', '0 0 120px')
      .and('have.css', 'padding-left', '0px')
      .and('have.css', 'padding-top', '10px');
    cy.then(() => {
      state.flex = '1.5rem';
      state.zero = true;
    });
    cy.get('.foundation-col')
      .should('have.class', 'sd-col-xs-12')
      .and('have.class', 'sd-col-xs-offset-0')
      .and('have.class', 'sd-col-xs-order-0');
    cy.then(() => {
      state.flex = 0;
    });
    cy.get('.foundation-col')
      .should('have.css', 'flex-grow', '0')
      .and('not.have.class', 'sd-col-xs-12');
    cy.get('.foundation-input')
      .should('have.value', 'draft')
      .and((element) => expect(element[0]).to.equal(input));
  });
});
