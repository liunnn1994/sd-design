<template>
  <RenderThead />
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { createVNode } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'Thead' });

  const slots = defineSlots<{
    default?: () => VNode[];
    thead?: () => VNode[];
  }>();
  const prefixCls = getPrefixCls('table');
  const RenderThead = () =>
    createVNode(
      slots.thead?.()[0] ?? 'div',
      { class: `${prefixCls}-thead`, role: 'rowgroup' },
      { default: slots.default },
    );
</script>
