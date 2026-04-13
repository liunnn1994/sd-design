<template>
  <a-empty>
    <template #image>
      <icon-exclamation-circle-fill />
    </template>
    No data, please reload!
  </a-empty>
</template>

<script>
import { IconExclamationCircleFill } from '@sd-design/web-vue/es/icon';

export default {
  components: {
    IconExclamationCircleFill
  },
}
</script>
