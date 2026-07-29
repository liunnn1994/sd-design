<template>
  <Scrollbar
    :id="context.listId"
    :class="`${prefixCls}-content`"
    :outer-class="prefixCls"
    :outer-style="outerStyle"
    role="listbox"
    disable-horizontal
  >
    <slot />
  </Scrollbar>
</template>

<script setup lang="ts">
  import type { StyleValue } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import Scrollbar from '../scrollbar';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorList' });

  const prefixCls = getPrefixCls('model-selector-list');
  const context = useModelSelectorContext('ModelSelectorList');
  const outerStyle: StyleValue = {
    height: `calc(100dvh - var(--${prefixCls}-viewport-offset))`,
    maxHeight: `var(--${prefixCls}-max-height)`,
  };
</script>
