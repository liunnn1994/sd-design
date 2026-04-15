<template>
  <sd-space :size="40">
    <sd-badge :count="9">
      <sd-avatar shape="square" />
    </sd-badge>
    <sd-badge :count="9" dot :dotStyle="{ width: '10px', height: '10px' }">
      <sd-avatar shape="square" />
    </sd-badge>
    <sd-badge :dotStyle="{ height: '16px', width: '16px', fontSize: '14px' }">
      <template #content>
        <IconClockCircle :style="{ verticalAlign: 'middle', color: 'var(--color-text-2)' }" />
      </template>
      <sd-avatar shape="square" />
    </sd-badge>
  </sd-space>
</template>

<script>
  import { IconClockCircle } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconClockCircle },
  };
</script>
