<template>
  <Empty v-if="context.visibleItemCount.value === 0" :class="prefixCls" role="status">
    <slot>{{ t('modelSelector.empty') }}</slot>
  </Empty>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';
  import Empty from '../empty';
  import { useI18n } from '../locale';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorEmpty' });

  const { t } = useI18n();

  const prefixCls = getPrefixCls('model-selector-empty');
  const context = useModelSelectorContext('ModelSelectorEmpty');
</script>
