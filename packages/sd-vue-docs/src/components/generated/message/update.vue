<template>
  <sd-button @click="handleClick">更新提示消息</sd-button>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  import { Message } from '@sdata/web-vue';

  const index = shallowRef(0);

  function handleClick() {
    Message.info({
      id: 'myInfo',
      content: `提示消息 ${index.value++}`,
      duration: 2000,
    });
  }
</script>
