import { Comment, createTextVNode, defineComponent, h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import Space from '../index';

const sizes = ['mini', 'small', 'medium', 'large'] as const;

describe('Space', () => {
  it('preserves slotted element identity across updates', () => {
    const TestComponent = defineComponent({
      setup() {
        const value = ref('');

        return () =>
          h(Space, null, {
            default: () => [
              h('input', {
                class: 'space-test-input',
                value: value.value,
                onInput: (event: Event) => {
                  value.value = (event.target as HTMLInputElement).value;
                },
              }),
              h('span', value.value),
            ],
          });
      },
    });

    cy.mount(TestComponent);
    cy.get('.space-test-input').then(($input) => {
      const input = $input[0];
      cy.wrap(input).type('a');
      cy.focused().should(($focused) => {
        expect($focused[0]).to.equal(input);
        expect(input.isConnected).to.equal(true);
      });
    });
  });

  sizes.forEach((size) => {
    it(`renders with size ${size}`, () => {
      cy.mount(Space, {
        props: { size },
        slots: { default: ['<div>aaa</div>', '<div>bbb</div>'] },
      });
      cy.get('.sd-space').should('exist');
    });
  });

  it('defaults to horizontal direction with center alignment and small gap', () => {
    cy.mount(Space, { slots: { default: () => [h('div', 'a'), h('div', 'b')] } });
    cy.get('.sd-space')
      .should('have.class', 'sd-space-horizontal')
      .and('have.class', 'sd-space-align-center')
      .and('not.have.class', 'sd-space-wrap')
      .and('not.have.class', 'sd-space-fill')
      .and('not.have.class', 'sd-space-rtl');
    cy.get('.sd-space').invoke('attr', 'style').should('contain', 'gap: 8px');
  });

  it('applies explicit direction, align, wrap and fill classes', () => {
    cy.mount(Space, {
      props: { direction: 'vertical', align: 'end', wrap: true, fill: true },
      slots: { default: () => [h('div', 'a'), h('div', 'b')] },
    });
    cy.get('.sd-space')
      .should('have.class', 'sd-space-vertical')
      .and('have.class', 'sd-space-align-end')
      .and('have.class', 'sd-space-wrap')
      .and('have.class', 'sd-space-fill');
  });

  it('omits the align class when vertical without explicit align', () => {
    cy.mount(Space, {
      props: { direction: 'vertical' },
      slots: { default: () => [h('div', 'a'), h('div', 'b')] },
    });
    cy.get('.sd-space').invoke('attr', 'class').should('not.contain', 'sd-space-align');
  });

  it('renders the rtl class under ConfigProvider rtl', () => {
    cy.mount(() =>
      h(ConfigProvider, { rtl: true }, () =>
        h(Space, null, { default: () => [h('div', 'a'), h('div', 'b')] }),
      ),
    );
    cy.get('.sd-space').should('have.class', 'sd-space-rtl');
  });

  it('maps numeric and named sizes to pixel gaps', () => {
    cy.mount(Space, {
      props: { size: 24 },
      slots: { default: () => [h('div', 'a'), h('div', 'b')] },
    });
    cy.get('.sd-space').invoke('attr', 'style').should('contain', 'gap: 24px');

    cy.mount(Space, {
      props: { size: 'large' },
      slots: { default: () => [h('div', 'a'), h('div', 'b')] },
    });
    cy.get('.sd-space').invoke('attr', 'style').should('contain', 'gap: 24px');

    cy.mount(Space, {
      props: { size: 'mini' },
      slots: { default: () => [h('div', 'a'), h('div', 'b')] },
    });
    cy.get('.sd-space').invoke('attr', 'style').should('contain', 'gap: 4px');
  });

  it('maps a [horizontal, vertical] size tuple to column-gap and row-gap', () => {
    cy.mount(Space, {
      props: { size: [10, 20] },
      slots: { default: () => [h('div', 'a'), h('div', 'b')] },
    });
    cy.get('.sd-space').invoke('attr', 'style').should('contain', 'gap: 20px 10px');
  });

  it('wraps each child in an item and renders the split slot between children', () => {
    cy.mount(Space, {
      slots: {
        default: () => [h('div', 'a'), h('div', 'b'), h('div', 'c')],
        split: () => h('i', { class: 'space-split' }),
      },
    });
    cy.get('.sd-space-item').should('have.length', 3);
    cy.get('.sd-space-item-split').should('have.length', 2);
    cy.get('.sd-space-item-split').first().find('.space-split').should('exist');
  });

  it('does not render a split for a single child', () => {
    cy.mount(Space, {
      slots: {
        default: () => [h('div', 'a')],
        split: () => h('i', { class: 'space-split' }),
      },
    });
    cy.get('.sd-space-item').should('have.length', 1);
    cy.get('.sd-space-item-split').should('not.exist');
  });

  it('wraps text children and filters comment vnodes out of items', () => {
    cy.mount(Space, {
      slots: {
        default: () => [
          createTextVNode('plain text'),
          h(Comment, 'hidden comment'),
          h('span', 'visible'),
        ],
      },
    });
    cy.get('.sd-space-item').should(($items) => {
      // 注释 vnode 被过滤，文本与 span 各占一个 item
      const texts = Array.from($items)
        .map((el) => el.textContent?.trim())
        .sort();
      expect(texts).to.deep.equal(['plain text', 'visible']);
    });
    cy.contains('hidden comment').should('not.exist');
  });
});
