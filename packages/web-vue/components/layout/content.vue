<template>
  <component :is="tagName" :class="classNames">
    <slot />
  </component>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'LayoutContent' });

  const tagName = 'main';
  const prefixCls = getPrefixCls('layout');
  const classNames = computed(() => [`${prefixCls}-content`]);
</script>
