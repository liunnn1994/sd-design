<template>
  <a-space :size="40">
    <a-badge :count="9">
      <a-avatar shape="square" />
    </a-badge>
    <a-badge :count="9" dot :dotStyle="{ width: '10px', height: '10px' }">
      <a-avatar shape="square" />
    </a-badge>
    <a-badge :dotStyle="{ height: '16px', width: '16px', fontSize: '14px' }">
      <template #content>
        <IconClockCircle :style="{ verticalAlign: 'middle', color: 'var(--color-text-2)' }" />
      </template>
      <a-avatar shape="square" />
    </a-badge>
  </a-space>
</template>

<script>
  import { IconClockCircle } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconClockCircle },
  };
</script>
