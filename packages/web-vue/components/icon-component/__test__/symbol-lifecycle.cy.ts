import { defineComponent, h, ref } from 'vue';

import { addFromIconFontCn } from '../add-from-icon-font-cn';

describe('IconFont dynamic symbols and attributes', () => {
  it('switches real symbol geometry, falls back to its slot and forwards changing attributes', () => {
    const type = ref<string | undefined>('small-square');
    const label = ref('Small');
    const clicked = cy.spy().as('clicked');
    const IconFont = addFromIconFontCn({});
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h('svg', { width: 0, height: 0 }, [
              h('defs', [
                h('symbol', { id: 'small-square' }, [h('rect', { width: 10, height: 10 })]),
                h('symbol', { id: 'large-square' }, [h('rect', { width: 20, height: 20 })]),
              ]),
            ]),
            h(
              IconFont,
              {
                'type': type.value,
                'size': 24,
                'aria-label': label.value,
                'data-test': 'dynamic-icon',
                'onClick': clicked,
              },
              {
                default: () => h('circle', { cx: 3, cy: 3, r: 3 }),
              },
            ),
          ]),
      }),
    );
    const geometry = (width: number) =>
      cy.get('svg.sd-icon').should(($svg) => {
        expect(($svg[0] as unknown as SVGGraphicsElement).getBBox().width).to.equal(width);
      });
    geometry(10);
    cy.get('svg.sd-icon')
      .should('have.attr', 'aria-label', 'Small')
      .and('have.attr', 'data-test', 'dynamic-icon');
    cy.then(() => {
      type.value = 'large-square';
      label.value = 'Large';
    });
    geometry(20);
    cy.get('svg.sd-icon').should('have.attr', 'aria-label', 'Large').click();
    cy.get('@clicked').should('have.been.calledOnce');
    cy.then(() => {
      type.value = undefined;
    });
    cy.get('svg.sd-icon use').should('not.exist');
    geometry(6);
    cy.then(() => {
      type.value = 'small-square';
    });
    cy.get('svg.sd-icon circle').should('not.exist');
    geometry(10);
  });
});
