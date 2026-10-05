import { defineComponent, Fragment, h } from 'vue';

import { padStart } from '../pad';
import { getChildrenComponents } from '../vue-utils';

describe('Shared utility robustness', () => {
  it('handles an empty padding string without recursion', () => {
    expect(padStart('1', 2, '')).to.equal('1');
  });

  it('limits a multi-character padding string to the requested length', () => {
    expect(padStart('1', 4, 'ab')).to.equal('aba1');
  });

  it('pads long values without overflowing the stack', () => {
    const prefix = '0'.repeat(49999);
    expect(padStart('1', 50000, '0')).to.equal(`${prefix}1`);
    expect(padStart(3, 2, '0')).to.equal('03');
  });

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
