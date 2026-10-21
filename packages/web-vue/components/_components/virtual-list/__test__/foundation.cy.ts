import { defineComponent, ref } from 'vue';

import type { VirtualListRef } from '../interface';

import VirtualList from '../virtual-list.vue';

describe('VirtualList foundation adapter', () => {
  it('scrolls to a live item key and retains opaque cache and legacy restore behavior', () => {
    cy.mount(
      defineComponent({
        components: { VirtualList },
        setup() {
          const list = ref<VirtualListRef>();
          const report = ref('');
          return {
            list,
            report,
            items: Array.from({ length: 200 }, (_, index) => ({
              key: `row-${index}`,
              label: `Row ${index}`,
            })),
            jump: () => list.value?.scrollTo({ key: 'row-90', align: 'top' }),
            cache() {
              const snapshot = list.value?.cacheSnapshot();
              report.value = JSON.stringify({
                saved: Boolean(snapshot),
                restored: list.value?.restoreCache(snapshot),
              });
            },
          };
        },
        template:
          '<VirtualList ref="list" :items="items" :height="120" :item-size="30" fixed-size style="width:300px"><template #item="{ item }"><div style="height:30px">{{ item.label }}</div></template></VirtualList><button @click="jump">Jump key</button><button @click="cache">Read cache</button><output>{{ report }}</output>',
      }),
    );
    cy.contains('button', 'Jump key').click();
    cy.get('.sd-virtual-list-scroller').should((el) => expect(el[0].scrollTop).to.equal(2700));
    cy.contains('.sd-virtual-list-content', 'Row 90').should('be.visible');
    cy.contains('button', 'Read cache').click();
    cy.get('output').should('have.text', '{"saved":true,"restored":false}');
  });

  it('rebuilds the SDK for a new axis and keeps native pixel commands on that axis', () => {
    cy.mount(
      defineComponent({
        components: { VirtualList },
        setup() {
          const list = ref<VirtualListRef>();
          const direction = ref<'vertical' | 'horizontal'>('vertical');
          return {
            list,
            direction,
            items: Array.from({ length: 100 }, (_, key) => ({ key })),
            horizontal() {
              direction.value = 'horizontal';
            },
            scroll: () => list.value?.scrollToPosition(180),
          };
        },
        template:
          '<VirtualList ref="list" :items="items" :direction="direction" :height="90" :item-size="30" fixed-size style="width:120px"><template #item="{ item }"><div style="width:30px;height:30px">{{ item.key }}</div></template></VirtualList><button @click="horizontal">Horizontal</button><button @click="scroll">Scroll pixels</button>',
      }),
    );
    cy.contains('button', 'Scroll pixels').click();
    cy.get('.sd-virtual-list-scroller').should((el) => expect(el[0].scrollTop).to.equal(180));
    cy.contains('button', 'Horizontal').click();
    cy.get('.sd-virtual-list-scroller').should((el) =>
      expect(el[0].scrollWidth).to.be.greaterThan(120),
    );
    cy.contains('button', 'Scroll pixels').click();
    cy.get('.sd-virtual-list-scroller').should((el) => expect(el[0].scrollLeft).to.equal(180));
  });
});
