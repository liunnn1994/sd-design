<template>
  <sd-empty>
    <template #image>
      <icon-exclamation-circle-fill />
    </template>
    No data, please reload!
  </sd-empty>
</template>

<script>
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: {
      IconExclamationCircleFill,
    },
  };
</script>
