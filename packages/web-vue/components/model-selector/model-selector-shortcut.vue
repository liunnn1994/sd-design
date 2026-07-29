<template>
  <kbd :class="prefixCls"><slot /></kbd>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'ModelSelectorShortcut' });

  const prefixCls = getPrefixCls('model-selector-shortcut');
</script>
