<template>
  <Divider :class="prefixCls" />
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';
  import Divider from '../divider';

  defineOptions({ name: 'ModelSelectorSeparator' });

  const prefixCls = getPrefixCls('model-selector-separator');
</script>
