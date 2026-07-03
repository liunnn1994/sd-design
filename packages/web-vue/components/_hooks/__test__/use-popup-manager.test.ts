import { mount } from '@vue/test-utils';
import { computed, defineComponent, h, nextTick } from 'vue';

import usePopupManager, { type PopupType } from '../use-popup-manager';

const PopupLayer = defineComponent({
  props: {
    type: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      default: undefined,
    },
    runOnMounted: Boolean,
  },
  setup(props) {
    const { zIndex } = usePopupManager(props.type as PopupType, {
      visible: computed(() => props.visible ?? false),
      runOnMounted: props.runOnMounted,
    });

    return {
      zIndex,
    };
  },
  render() {
    return h('div');
  },
});

describe('usePopupManager', () => {
  it('keeps later dialog layers above existing message layers', async () => {
    const message = mount(PopupLayer, {
      props: {
        type: 'message',
        runOnMounted: true,
      },
    });
    const dialog = mount(PopupLayer, {
      props: {
        type: 'dialog',
        visible: false,
      },
    });
    await nextTick();

    const messageZIndex = Number(message.vm.zIndex);

    await dialog.setProps({ visible: true });

    expect(Number(dialog.vm.zIndex)).toBeGreaterThan(messageZIndex);

    dialog.unmount();
    message.unmount();
  });
});
