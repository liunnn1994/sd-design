<template>
  <Empty v-if="context.visibleItemCount.value === 0" :class="prefixCls" role="status">
    <slot>未找到匹配的模型</slot>
  </Empty>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';
  import Empty from '../empty';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorEmpty' });

  const prefixCls = getPrefixCls('model-selector-empty');
  const context = useModelSelectorContext('ModelSelectorEmpty');
</script>
