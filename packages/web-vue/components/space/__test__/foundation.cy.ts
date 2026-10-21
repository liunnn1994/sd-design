import { Comment, defineComponent, h, reactive } from 'vue';

import ConfigProvider from '../../config-provider';
import Space from '../index';

describe('Space foundation adapter', () => {
  it('updates scalar/tuple sizes and default alignment while preserving keyed input focus', () => {
    const state = reactive({
      size: 'mini' as number | 'mini' | 'large' | [number | 'mini', number | 'large'],
      direction: 'horizontal' as 'horizontal' | 'vertical',
      align: undefined as 'baseline' | undefined,
      rtl: false,
    });
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(ConfigProvider, { rtl: state.rtl }, () =>
            h(
              Space,
              {
                size: state.size,
                direction: state.direction,
                align: state.align,
                wrap: true,
                fill: true,
              },
              {
                default: () => [
                  h(Comment),
                  h('input', { key: 0, class: 'space-foundation-input' }),
                  h('b', { key: 'b' }, 'Second'),
                ],
                split: () => h('i', '|'),
              },
            ),
          ),
      }),
    );
    let input: HTMLElement;
    cy.get('.space-foundation-input')
      .type('draft')
      .then((element) => {
        input = element[0];
      });
    cy.get('.sd-space')
      .should('have.css', 'column-gap', '4px')
      .and('have.class', 'sd-space-align-center')
      .and('have.class', 'sd-space-wrap')
      .and('have.class', 'sd-space-fill');
    cy.then(() => {
      state.size = [0, 'large'];
      state.direction = 'vertical';
      state.rtl = true;
    });
    cy.get('.sd-space')
      .should('have.css', 'column-gap', '0px')
      .and('have.css', 'row-gap', '24px')
      .and('not.have.class', 'sd-space-align-center')
      .and('have.class', 'sd-space-rtl');
    cy.then(() => {
      (state.size as [number, 'large'])[0] = 6;
      state.align = 'baseline';
    });
    cy.get('.sd-space')
      .should('have.css', 'column-gap', '6px')
      .and('have.class', 'sd-space-align-baseline');
    cy.get('.sd-space-item').should('have.length', 2);
    cy.get('.sd-space-item-split').should('have.length', 1);
    cy.get('.space-foundation-input')
      .should('have.value', 'draft')
      .and('be.focused')
      .and((element) => expect(element[0]).to.equal(input));
  });
});
