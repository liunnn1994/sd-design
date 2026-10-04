<template>
  <article :class="classNames"><slot /></article>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'Typography' });

  defineSlots<{
    /**
     * @zh 排版内容
     * @en Content rendered inside the typography wrapper
     */
    default?: () => VNode[];
  }>();

  const prefixCls = getPrefixCls('typography');

  const classNames = [prefixCls];
</script>
