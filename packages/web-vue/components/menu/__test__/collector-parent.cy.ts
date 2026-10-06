import { defineComponent, h, onMounted, ref } from 'vue';

import useMenuDataCollector, {
  useMenuDataCollectorContext,
} from '../hooks/use-menu-data-collector';

describe('Menu nested popup data collection', () => {
  it('reports nested popup data under the owning parent key', () => {
    const Leaf = defineComponent({
      setup() {
        const collector = useMenuDataCollectorContext();
        onMounted(() => collector?.collectMenuItem('leaf'));
        return () => h('span', 'Leaf');
      },
    });
    const Popup = defineComponent({
      setup() {
        useMenuDataCollector({ type: 'popupMenu' });
        return () => h(Leaf);
      },
    });
    const Child = defineComponent({
      setup() {
        useMenuDataCollector({ type: 'subMenu', key: 'child' });
        const open = ref(false);
        return () => [
          h(
            'button',
            {
              onClick: () => {
                open.value = true;
              },
            },
            'Open popup',
          ),
          open.value ? h(Popup) : null,
        ];
      },
    });
    const Parent = defineComponent({
      setup() {
        useMenuDataCollector({ type: 'subMenu', key: 'parent' });
        return () => h(Child);
      },
    });
    cy.mount(
      defineComponent({
        setup() {
          const { menuData } = useMenuDataCollector({ type: 'menu' });
          return () => [h(Parent), h('output', JSON.stringify(menuData.value))];
        },
      }),
    );
    cy.contains('button', 'Open popup').click();
    cy.get('output').should(($output) => {
      expect(JSON.parse($output.text())).to.deep.equal([
        { key: 'parent', children: [{ key: 'child', children: [{ key: 'leaf' }] }] },
      ]);
    });
  });
});
