import { createVNode, defineComponent } from 'vue';

import { getPrefixCls } from '../_utils/global-config';

export default defineComponent({
  name: 'Tbody',
  setup(_, { slots }) {
    const prefixCls = getPrefixCls('table');

    return () => {
      return createVNode(
        slots.tbody?.()[0] ?? 'div',
        { class: `${prefixCls}-tbody` },
        {
          default: slots.default,
        },
      );
    };
  },
});
