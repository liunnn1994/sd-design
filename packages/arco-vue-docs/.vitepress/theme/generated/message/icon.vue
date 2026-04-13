<template>
  <a-button @click="handleClick">Info Message</a-button>
</template>

<script>
import { h } from 'vue';
import { IconFaceSmileFill } from '@arco-design/web-vue/es/icon';

export default {
  methods: {
    handleClick() {
      this.$message.info({
        content: 'This is an info message!',
        icon: () => h(IconFaceSmileFill)
      });
    }
  }
}
</script>
