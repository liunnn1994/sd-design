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

  // vue-clamp resolves to native CSS line-clamp only for the default
  // ellipsis/location/boundary and no `after` slot; anything else falls back to
  // JS clamping, which renders the truncated text into the DOM. In JS mode the
  // clamped source text is kept in a visually-hidden span, so the *visible*
  // text is always the body's last child span.
  const LONG_TEXT =
    '这是一段用来测试文本截断的超长文本内容，需要确保组件在容器宽度有限的时候能够正确地截断并显示省略号。';

  it('reports the clamped state in the clampchange payload', () => {
    const onClampchange = cy.spy().as('clampchange-true');

    cy.mount(LineClamp, {
      props: { text: LONG_TEXT, maxLines: 1, onClampchange },
      attrs: { style: 'width: 160px' },
    });

    cy.get('@clampchange-true').should('have.been.calledWith', true);
  });

  it('reports an unclamped state for text that fits', () => {
    const onClampchange = cy.spy().as('clampchange-false');

    cy.mount(LineClamp, {
      props: { text: '短文本', maxLines: 2, onClampchange },
    });

    cy.get('@clampchange-false').should('have.been.calledWith', false);
  });

  it('expands and collapses through the after-slot controls, emitting update:expanded', () => {
    const onUpdateExpanded = cy.spy().as('update-expanded');

    cy.mount(LineClamp, {
      props: {
        'text': LONG_TEXT,
        'maxLines': 2,
        'onUpdate:expanded': onUpdateExpanded,
      },
      attrs: { style: 'width: 160px' },
      slots: {
        after: ({ toggle }: { toggle: () => void }) =>
          h('button', { type: 'button', onClick: () => toggle() }, '切换'),
      },
    });

    // Clamped initially: the visible text ends with the ellipsis and is short.
    cy.get('[data-part="body"] > span:last-child').should(($text) => {
      const visible = $text[0].textContent ?? '';
      expect(visible.endsWith('…')).to.equal(true);
      expect(visible.length).to.be.lessThan(LONG_TEXT.length);
    });

    cy.contains('button', '切换').click();
    cy.get('[data-part="body"] > span:last-child').should('have.text', LONG_TEXT);
    cy.get('@update-expanded').should('have.been.calledWith', true);

    cy.contains('button', '切换').click();
    cy.get('[data-part="body"] > span:last-child').should(($text) => {
      const visible = $text[0].textContent ?? '';
      expect(visible.endsWith('…')).to.equal(true);
      expect(visible.length).to.be.lessThan(LONG_TEXT.length);
    });
    cy.get('@update-expanded').should('have.been.calledWith', false);
  });

  it('renders the full text without clamping when expanded is initially true', () => {
    const onClampchange = cy.spy().as('clampchange-expanded');

    cy.mount(LineClamp, {
      props: { text: LONG_TEXT, maxLines: 2, expanded: true, onClampchange },
      attrs: { style: 'width: 160px' },
    });

    cy.get('@clampchange-expanded').should('have.been.calledWith', false);
    cy.get('[data-part="body"] > span:last-child').should('have.text', LONG_TEXT);
  });

  it('truncates with a custom ellipsis in non-native clamping mode', () => {
    cy.mount(LineClamp, {
      props: { text: LONG_TEXT, maxLines: 1, ellipsis: '---' },
      attrs: { style: 'width: 160px' },
    });

    cy.get('[data-part="body"] > span:last-child').should(($text) => {
      const visible = $text[0].textContent ?? '';
      expect(visible.endsWith('---')).to.equal(true);
      expect(visible.length).to.be.lessThan(LONG_TEXT.length);
    });
  });

  it('truncates from the tail when location is "start"', () => {
    cy.mount(LineClamp, {
      props: { text: LONG_TEXT, maxLines: 1, location: 'start' },
      attrs: { style: 'width: 160px' },
    });

    cy.get('[data-part="body"] > span:last-child').should(($text) => {
      const visible = $text[0].textContent ?? '';
      expect(visible.startsWith('…')).to.equal(true);
      expect(visible.endsWith(LONG_TEXT.slice(-3))).to.equal(true);
      expect(visible.length).to.be.lessThan(LONG_TEXT.length);
    });
  });

  it('clamps by max height when only maxHeight is provided', () => {
    cy.mount(LineClamp, {
      props: { text: LONG_TEXT, maxHeight: '2em' },
      attrs: { style: 'width: 120px' },
    });

    cy.get('[data-part="body"] > span:last-child').should(($text) => {
      const visible = $text[0].textContent ?? '';
      expect(visible.endsWith('…')).to.equal(true);
      expect(visible.length).to.be.lessThan(LONG_TEXT.length);
    });
  });

  it('supports the before slot and a custom root element via the as prop', () => {
    cy.mount(LineClamp, {
      props: { text: '短文本', maxLines: 2, as: 'article' },
      slots: { before: () => '前缀：' },
    });

    cy.get('article[data-part="root"]')
      .should('exist')
      .find('[data-part="before"]')
      .should('have.text', '前缀：');
  });

  it('splits inline text into start/body/end parts via a custom split function', () => {
    cy.mount(InlineClamp, {
      props: {
        text: 'ABC-XYZ',
        split: (text: string) => ({
          start: text.slice(0, 1),
          body: text.slice(1, -1),
          end: text.slice(-1),
        }),
      },
    });

    cy.get('[data-part="start"]').should('have.text', 'A');
    cy.get('[data-part="body"]').should('have.text', 'BC-XY');
    cy.get('[data-part="end"]').should('have.text', 'Z');
  });

  it('clamps inline text from the tail when location is "start"', () => {
    cy.mount(InlineClamp, {
      props: { text: LONG_TEXT, location: 'start' },
      attrs: { style: 'width: 120px' },
    });

    cy.get('[data-part="body"]').should(($body) => {
      const visible = $body[0].textContent ?? '';
      expect(visible.startsWith('…')).to.equal(true);
      expect(visible.endsWith(LONG_TEXT.slice(-3))).to.equal(true);
      expect(visible.length).to.be.lessThan(LONG_TEXT.length);
    });
  });

  it('tracks hidden items in the after slot and expands via slot controls', () => {
    const onClampchange = cy.spy().as('wrap-clampchange');
    const items = ['项目一', '项目二', '项目三', '项目四', '项目五', '项目六'];

    cy.mount(WrapClamp, {
      props: { items, maxLines: 1, onClampchange },
      attrs: { style: 'width: 80px' },
      slots: {
        after: ({ expand, hiddenItems }: { expand: () => void; hiddenItems: readonly string[] }) =>
          h('button', { type: 'button', onClick: () => expand() }, `展开(${hiddenItems.length})`),
      },
    });

    // Every item is either rendered visible or reported as hidden.
    cy.get('[data-part="after"]').should(($affix) => {
      const label = $affix.text();
      expect(label).to.match(/^展开\(\d+\)$/);
      const hiddenCount = Number(label.match(/\((\d+)\)/)?.[1] ?? NaN);
      const visibleCount = Cypress.$('[data-part="item"]').not('[aria-hidden="true"]').length;
      expect(visibleCount + hiddenCount).to.equal(items.length);
      expect(hiddenCount).to.be.greaterThan(0);
    });
    cy.get('@wrap-clampchange').should('have.been.calledWith', true);

    cy.get('[data-part="after"] button').click();
    cy.get('[data-part="after"]').should('contain.text', '展开(0)');
    cy.get('[data-part="item"][aria-hidden="true"]').should('have.length', 0);
    cy.get('@wrap-clampchange').should('have.been.calledWith', false);
  });

  it('renders object items keyed via the itemKey function with their index', () => {
    interface DemoItem {
      id: string;
      label: string;
    }

    const items: DemoItem[] = [
      { id: 'a', label: '标签A' },
      { id: 'b', label: '标签B' },
    ];

    cy.mount(WrapClamp, {
      props: {
        items,
        itemKey: (item: DemoItem) => item.id,
      },
      slots: {
        item: ({ item, index }: { item: DemoItem; index: number }) => `${index + 1}. ${item.label}`,
      },
    });

    cy.get('[data-part="item"]').should('have.length', 2);
    cy.get('[data-part="item"]').eq(0).should('have.text', '1. 标签A');
    cy.get('[data-part="item"]').eq(1).should('have.text', '2. 标签B');
  });
});
