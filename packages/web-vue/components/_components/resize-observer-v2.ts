import { defineComponent, onBeforeUnmount, watch } from 'vue';

import { useFirstElement } from '../_hooks/use-first-element';
import { createResizeObserverController } from '../_utils/resize-observer';

export default defineComponent({
  name: 'ResizeObserver',
  props: {
    watchOnUpdated: Boolean,
  },
  emits: [
    /**
     * resize 事件
     * @property {ResizeObserverEntry} entry 触发 resize 的 dom 元素
     */
    'resize',
  ],
  setup(props, { emit, slots }) {
    const { children, firstElement } = useFirstElement();
    const observer = createResizeObserverController((entry) => emit('resize', entry));
    watch(firstElement, observer.observe);
    onBeforeUnmount(observer.disconnect);

    return () => {
      children.value = slots.default?.();
      return children.value;
    };
  },
});
