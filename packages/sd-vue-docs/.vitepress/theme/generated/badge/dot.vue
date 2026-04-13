<template>
  <a-space :size="40">
    <a-badge :count="9" dot :offset="[6, -2]">
      <a href="#">Link</a>
    </a-badge>
    <a-badge :count="9" dot :offset="[2, -2]">
      <IconNotification
        :style="{ color: '#888', fontSize: '18px', verticalAlign: '-3px' }"
      />
    </a-badge>
  </a-space>
</template>

<script>
import { IconNotification } from '@sd-design/web-vue/es/icon';

export default {
  components: { IconNotification },
};
</script>
