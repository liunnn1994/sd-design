<script setup lang="ts">
  import { defineComponent, h, useAttrs } from 'vue';

  import { mergeFirstChild } from '../_utils/vue-utils';
  import Button from '../button';

  defineOptions({ name: 'ModelSelectorTriggerElement', inheritAttrs: false });
  const attrs = useAttrs();
  const TriggerContent = defineComponent((_, { slots }) => () => {
    const children = slots.default?.() ?? [];
    if (mergeFirstChild(children, attrs)) return children;
    return h(Button, attrs, { default: () => children });
  });
</script>

<template>
  <TriggerContent><slot /></TriggerContent>
</template>
