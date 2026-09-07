import { h } from 'vue';

import Scrollbar from '../../scrollbar';
import List, { ListItem, ListItemMeta } from '../index';

describe('List', () => {
  it('renders item meta props with performant ellipsis', () => {
    cy.mount(ListItemMeta, {
      props: { title: 'Title long long long', description: 'Description long long long' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findAllComponents({ name: 'PerformantEllipsis' })).to.have.length(2);
    });
  });

  it('does not wrap item meta slots with performant ellipsis', () => {
    cy.mount(ListItemMeta, {
      slots: {
        title: () => h('span', { class: 'custom-title' }, 'Title'),
        description: () => h('span', { class: 'custom-description' }, 'Description'),
      },
    });
    cy.get('.custom-title').should('exist');
    cy.get('.custom-description').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
  });

  it('renders the empty component for empty data', () => {
    cy.mount(List, { props: { data: [] } });
    cy.get('.sd-empty').should('exist');
  });

  it('passes spinProps to the loading overlay', () => {
    cy.mount(List, {
      props: { data: [], loading: true, spinProps: { tip: '列表加载中', size: 24 } },
    });
    cy.get('.sd-list-wrapper .sd-spin-tip').should('have.text', '列表加载中');
    cy.get('.sd-list-wrapper .sd-spin-icon').should('have.css', 'font-size', '24px');
  });

  it('applies size, bordered, split and hoverable classes', () => {
    cy.mount(List, { props: { data: [], size: 'small' } });
    cy.get('.sd-list').should('have.class', 'sd-list-small');

    cy.mount(List, {
      props: { data: [], bordered: false, split: false, hoverable: true },
    });
    cy.get('.sd-list')
      .should('not.have.class', 'sd-list-bordered')
      .and('not.have.class', 'sd-list-split')
      .and('have.class', 'sd-list-hover');
  });

  it('renders header and footer slots', () => {
    cy.mount(List, {
      props: { data: ['a'] },
      slots: {
        header: () => h('div', { class: 'list-header' }, 'Header'),
        footer: () => h('div', { class: 'list-footer' }, 'Footer'),
      },
    });
    cy.get('.sd-list-header .list-header').should('have.text', 'Header');
    cy.get('.sd-list-footer .list-footer').should('have.text', 'Footer');
  });

  it('renders data items through the item slot with item and index', () => {
    cy.mount(List, {
      props: { data: ['a', 'b', 'c'] },
      slots: {
        item: ({ item, index }: { item: string; index: number }) =>
          h('div', { class: 'list-cell' }, `${index}-${item}`),
      },
    });
    cy.get('.list-cell').should('have.length', 3);
    cy.get('.list-cell').eq(1).should('have.text', '1-b');
  });

  it('renders VNode data items without the item slot', () => {
    cy.mount(List, {
      props: {
        data: [
          h('div', { class: 'vnode-item' }, 'VNode A'),
          h('div', { class: 'vnode-item' }, 'VNode B'),
        ],
      },
    });
    cy.get('.vnode-item').should('have.length', 2);
  });

  it('renders a custom empty slot instead of the default empty', () => {
    cy.mount(List, {
      props: { data: [] },
      slots: { empty: () => h('div', { class: 'custom-empty' }, 'Nothing here') },
    });
    cy.get('.custom-empty').should('have.text', 'Nothing here');
    cy.get('.sd-empty').should('not.exist');
  });

  it('renders the scroll-loading slot when provided', () => {
    cy.mount(List, {
      props: { data: ['a'] },
      slots: {
        'item': ({ item }: { item: string }) => h('div', { class: 'list-cell' }, item),
        'scroll-loading': () => h('div', { class: 'loading-more' }, '加载中...'),
      },
    });
    cy.get('.sd-list-scroll-loading .loading-more').should('have.text', '加载中...');
  });

  it('emits reachBottom on mount when all content fits', () => {
    cy.mount(List, {
      props: { data: ['a', 'b'] },
      slots: {
        item: ({ item }: { item: string }) => h('div', { class: 'list-cell' }, item),
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('reachBottom')).to.have.length(1);
    });
  });

  it('emits scroll and reachBottom when scrolled to the bottom', () => {
    cy.mount(List, {
      props: { data: Array.from({ length: 30 }, (_, i) => `item-${i}`), maxHeight: 100 },
      slots: {
        item: ({ item }: { item: string }) => h('div', { class: 'list-cell' }, item),
      },
    });
    // OverlayScrollbars 的滚动回调在本测试环境不可靠，改为向 Scrollbar 直接派发
    // 伪造的原生滚动事件，验证 List 的触底（bottomOffset）阈值逻辑。
    cy.get('@vue').should(({ wrapper }) => {
      const scrollbar = wrapper.findComponent(Scrollbar);
      expect(scrollbar.exists()).to.equal(true);
      const vm = scrollbar.vm;
      const baselineReachBottom = wrapper.emitted('reachBottom')?.length ?? 0;
      const forgeScroll = (scrollTop: number) => {
        vm.$emit('scroll', {
          target: { scrollTop, scrollHeight: 500, offsetHeight: 100 },
        });
      };

      forgeScroll(50); // 向下滚动但未触底：bottom = 350 > bottomOffset
      forgeScroll(400); // 到达底部：bottom = 0 <= bottomOffset

      expect(wrapper.emitted('scroll')?.length).to.equal(2);
      expect(wrapper.emitted('reachBottom')?.length).to.equal(baselineReachBottom + 1);
    });
  });

  it('paginates data and emits pageChange when a page is clicked', () => {
    cy.mount(List, {
      props: {
        data: ['a', 'b', 'c', 'd', 'e'],
        paginationProps: { pageSize: 2 },
      },
      slots: {
        item: ({ item }: { item: string }) => h('div', { class: 'list-cell' }, item),
      },
    });
    cy.get('.list-cell').should('have.length', 2);
    cy.get('.sd-list-pagination').should('exist');
    cy.get('.sd-list-pagination').contains('li.sd-pagination-item', /^2$/).click();
    cy.get('.list-cell').eq(0).should('have.text', 'c');
    cy.get('.list-cell').eq(1).should('have.text', 'd');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('pageChange')?.at(-1)?.[0]).to.equal(2);
    });
  });

  it('renders pagination total from data length when total is omitted', () => {
    cy.mount(List, {
      props: {
        data: ['a', 'b', 'c'],
        paginationProps: { pageSize: 3, showTotal: true },
      },
      slots: {
        item: ({ item }: { item: string }) => h('div', { class: 'list-cell' }, item),
      },
    });
    cy.get('.sd-list-pagination .sd-pagination-total').should('have.text', '共 3 条');
  });
});

describe('ListItem', () => {
  it('renders default, actions and extra slots', () => {
    cy.mount(ListItem, {
      slots: {
        default: () => h('span', { class: 'item-text' }, 'Item content'),
        actions: () => [h('span', '编辑'), h('span', '删除')],
        extra: () => h('span', { class: 'item-extra' }, 'Extra'),
      },
    });
    cy.get('.sd-list-item').should('have.attr', 'role', 'listitem');
    cy.get('.sd-list-item-content').should('have.text', 'Item content');
    cy.get('.sd-list-item-action li').should('have.length', 2);
    cy.get('.sd-list-item-action li').eq(0).should('have.text', '编辑');
    cy.get('.sd-list-item-extra').should('have.text', 'Extra');
  });

  it('places actions inside main for the vertical action layout', () => {
    cy.mount(ListItem, {
      props: { actionLayout: 'vertical' },
      slots: { actions: () => [h('span', '编辑')] },
    });
    cy.get('.sd-list-item-main .sd-list-item-action').should('exist');
  });

  it('keeps actions outside main for the default horizontal layout', () => {
    cy.mount(ListItem, {
      slots: { actions: () => [h('span', '编辑')] },
    });
    cy.get('.sd-list-item > .sd-list-item-main').should('exist');
    cy.get('.sd-list-item > ul.sd-list-item-action').should('exist');
  });

  it('renders meta slot and omits extra when not provided', () => {
    cy.mount(ListItem, {
      slots: {
        meta: () => h(ListItemMeta, { title: 'Meta title' }),
      },
    });
    cy.get('.sd-list-item-meta-title').should('have.text', 'Meta title');
    cy.get('.sd-list-item-extra').should('not.exist');
  });
});

describe('ListItemMeta', () => {
  it('renders avatar slot and title/description props', () => {
    cy.mount(ListItemMeta, {
      props: { title: 'T', description: 'D' },
      slots: { avatar: () => h('span', { class: 'meta-avatar' }) },
    });
    cy.get('.sd-list-item-meta-avatar').should('exist');
    cy.get('.sd-list-item-meta-title').should('have.text', 'T');
    cy.get('.sd-list-item-meta-description').should('have.text', 'D');
  });

  it('lets title and description slots override props', () => {
    cy.mount(ListItemMeta, {
      props: { title: 'Prop title' },
      slots: {
        title: () => h('span', { class: 'custom-title' }, 'Slot title'),
        description: () => h('span', { class: 'custom-description' }, 'Slot description'),
      },
    });
    cy.get('.sd-list-item-meta-title .custom-title').should('have.text', 'Slot title');
    cy.get('.sd-list-item-meta-description .custom-description').should(
      'have.text',
      'Slot description',
    );
  });

  it('renders no content area without title, description or related slots', () => {
    cy.mount(ListItemMeta, {});
    cy.get('.sd-list-item-meta-content').should('not.exist');
  });
});
