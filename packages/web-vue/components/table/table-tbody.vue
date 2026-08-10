<template>
  <RenderTbody />
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { createVNode } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'Tbody' });

  const slots = defineSlots<{
    default?: () => VNode[];
    tbody?: () => VNode[];
  }>();
  const prefixCls = getPrefixCls('table');
  const RenderTbody = () =>
    createVNode(
      slots.tbody?.()[0] ?? 'div',
      { class: `${prefixCls}-tbody`, role: 'rowgroup' },
      { default: slots.default },
    );
</script>
