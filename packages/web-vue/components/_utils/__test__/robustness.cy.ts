import { defineComponent, Fragment, h } from 'vue';

import { getChildrenComponents } from '../vue-utils';

describe('Vue VNode traversal', () => {
  it('preserves the starting index through nested fragments and default slots', () => {
    const Item = defineComponent({ name: 'IndexedItem', render: () => h('div') });
    const Container = defineComponent({ name: 'ItemContainer', render: () => h('div') });
    const children = [
      h(Item),
      h(Fragment, [h(Item), h(Container, {}, { default: () => [h(Item)] })]),
      h(Item),
    ];
    const indexed = getChildrenComponents(children, 'IndexedItem', (_, index) => ({ index }), 7);
    expect(indexed.map((child) => child.props?.index)).to.deep.equal([7, 8, 9, 10]);
  });
});
