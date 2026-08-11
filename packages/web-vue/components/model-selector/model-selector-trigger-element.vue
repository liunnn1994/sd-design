<script lang="ts">
  import { defineComponent, h } from 'vue';

  import { mergeFirstChild } from '../_utils/vue-utils';
  import Button from '../button';

  export default defineComponent({
    name: 'ModelSelectorTriggerElement',
    inheritAttrs: false,
    setup: (_, { attrs, slots }) => {
      return () => {
        const children = slots.default?.() ?? [];
        if (mergeFirstChild(children, attrs)) {
          return children;
        }

        return h(Button, attrs, { default: () => children });
      };
    },
  });
</script>
