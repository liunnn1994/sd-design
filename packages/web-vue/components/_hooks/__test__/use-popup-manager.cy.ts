import { computed, defineComponent, h, nextTick } from 'vue';

import usePopupManager, { type PopupType } from '../use-popup-manager';

const PopupLayer = defineComponent({
  name: 'PopupLayer',
  props: {
    type: { type: String, required: true },
    visible: { type: Boolean, default: undefined },
    runOnMounted: Boolean,
  },
  setup(props) {
    const { zIndex } = usePopupManager(props.type as PopupType, {
      visible: computed(() => props.visible ?? false),
      runOnMounted: props.runOnMounted,
    });
    return { zIndex };
  },
  render() {
    return h('div');
  },
});

describe('usePopupManager', () => {
  it('releases a visible popup layer when unmounted', () => {
    cy.mount(
      defineComponent({
        components: { PopupLayer },
        data: () => ({ first: true, second: false }),
        template:
          '<PopupLayer v-if="first" type="popup" :visible="true" /><PopupLayer v-if="second" type="popup" :visible="true" />',
      }),
    );
    cy.get('@vue').then(async ({ wrapper }) => {
      const firstZ = Number((wrapper.findComponent(PopupLayer).vm as { zIndex: number }).zIndex);
      (wrapper.vm as { first: boolean }).first = false;
      await nextTick();
      (wrapper.vm as { second: boolean }).second = true;
      await nextTick();
      const secondZ = Number((wrapper.findComponent(PopupLayer).vm as { zIndex: number }).zIndex);
      expect(secondZ).to.equal(firstZ);
    });
  });
  it('keeps a later dialog layer above an existing message layer', () => {
    cy.mount(
      defineComponent({
        components: { PopupLayer },
        data: () => ({ dialogVisible: false }),
        template:
          '<PopupLayer type="message" :run-on-mounted="true" /><PopupLayer type="dialog" :visible="dialogVisible" />',
      }),
    );
    cy.get('@vue').then(async ({ wrapper }) => {
      const layers = wrapper.findAllComponents(PopupLayer);
      const messageZ = Number((layers[0].vm as { zIndex: number }).zIndex);
      (wrapper.vm as { dialogVisible: boolean }).dialogVisible = true;
      await nextTick();
      const dialogZ = Number((layers[1].vm as { zIndex: number }).zIndex);
      expect(dialogZ).to.be.greaterThan(messageZ);
    });
  });
});
