<template>
  <sd-button @click="handleClick">提示消息</sd-button>
</template>

<script setup lang="ts">
  import { Message } from '@sdata/web-vue';

  function handleClick() {
    Message.info('这是一条提示消息');
  }
</script>
