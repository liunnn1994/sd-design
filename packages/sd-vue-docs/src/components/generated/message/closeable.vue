<template>
  <sd-button @click="handleClick">可关闭的消息</sd-button>
</template>

<script setup lang="ts">
  import { Message } from '@sdata/web-vue';

  function handleClick() {
    Message.info({
      content: '这是一条提示消息！',
      closable: true,
    });
  }
</script>
