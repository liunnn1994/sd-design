<template>
  <a-empty>
    <template #image>
      <icon-exclamation-circle-fill />
    </template>
    No data, please reload!
  </a-empty>
</template>

<script>
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: {
      IconExclamationCircleFill,
    },
  };
</script>
