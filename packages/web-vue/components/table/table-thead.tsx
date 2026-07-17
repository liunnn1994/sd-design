import { createVNode, defineComponent } from 'vue';

import { getPrefixCls } from '../_utils/global-config';

export default defineComponent({
  name: 'Thead',
  setup(_, { slots }) {
    const prefixCls = getPrefixCls('table');

    return () => {
      return createVNode(
        slots.thead?.()[0] ?? 'div',
        { class: `${prefixCls}-thead`, role: 'rowgroup' },
        {
          default: slots.default,
        },
      );
    };
  },
});
