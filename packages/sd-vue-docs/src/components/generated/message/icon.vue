<template>
  <sd-button @click="handleClick">提示消息</sd-button>
</template>

<script setup lang="ts">
  import { h } from 'vue';

  import { Message } from '@sdata/web-vue';
  import { IconFaceSmileFill } from '@sdata/web-vue/es/icon/index.js';

  function handleClick() {
    Message.info({
      content: '这是一条提示消息！',
      icon: () => h(IconFaceSmileFill),
    });
  }
</script>
