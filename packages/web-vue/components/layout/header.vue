<template>
  <component :is="tagName" :class="classNames">
    <slot />
  </component>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'LayoutHeader' });

  const tagName = 'header';
  const prefixCls = getPrefixCls('layout');
  const classNames = computed(() => [`${prefixCls}-header`]);
</script>
