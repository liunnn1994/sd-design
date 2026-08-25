import { h } from 'vue';

import { InlineClamp, LineClamp, RichLineClamp, WrapClamp } from '../index';

describe('Clamp', () => {
  it('forwards LineClamp props, attrs, slots and events', () => {
    const onClampchange = cy.spy().as('clampchange');

    cy.mount(LineClamp, {
      props: {
        text: '需要根据容器宽度裁剪的长文本',
        maxLines: 2,
        onClampchange,
      },
      attrs: { 'class': 'custom-line-clamp', 'data-testid': 'line-clamp' },
      slots: { after: ({ clamped }: { clamped: boolean }) => (clamped ? '更多' : '') },
    });

    cy.get('[data-testid="line-clamp"]')
      .should('have.class', 'custom-line-clamp')
      .and('have.attr', 'data-part', 'root');
    cy.get('@clampchange').should('have.been.called');
  });

  it('exposes every vue-clamp component without an SD wrapper DOM node', () => {
    cy.mount({
      render: () =>
        h('div', [
          h(InlineClamp, { text: 'report-final.pdf' }),
          h(RichLineClamp, { html: '<strong>可信富文本</strong>', maxLines: 1 }),
          h(
            WrapClamp,
            { items: ['设计', '开发'], maxLines: 1 },
            { item: ({ item }: { item: unknown }) => String(item) },
          ),
        ]),
    });

    cy.get('[data-part="root"]').should('have.length', 3);
    cy.contains('strong', '可信富文本').should('exist');
    cy.get('[data-part="item"]').should('have.length', 2);
  });
});
