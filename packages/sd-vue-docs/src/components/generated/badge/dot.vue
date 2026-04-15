<template>
  <sd-space :size="40">
    <sd-badge :count="9" dot :offset="[6, -2]">
      <a href="#">Link</a>
    </sd-badge>
    <sd-badge :count="9" dot :offset="[2, -2]">
      <IconNotification :style="{ color: '#888', fontSize: '18px', verticalAlign: '-3px' }" />
    </sd-badge>
  </sd-space>
</template>

<script>
  import { IconNotification } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconNotification },
  };
</script>
