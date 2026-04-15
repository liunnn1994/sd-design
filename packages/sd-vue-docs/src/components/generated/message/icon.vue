<template>
  <sd-button @click="handleClick">Info Message</sd-button>
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
