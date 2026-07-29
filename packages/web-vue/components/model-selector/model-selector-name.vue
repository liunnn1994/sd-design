<template>
  <span :class="prefixCls"><slot /></span>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'ModelSelectorName' });

  const prefixCls = getPrefixCls('model-selector-name');
</script>
