<template>
  <a-button @click="handleClick">Info Message</a-button>
</template>

<script>
  import { h } from 'vue';
  import { IconFaceSmileFill } from '@sdata/web-vue/es/icon/index.js';

  export default {
    methods: {
      handleClick() {
        this.$message.info({
          content: 'This is an info message!',
          icon: () => h(IconFaceSmileFill),
        });
      },
    },
  };
</script>
