<template>
  <sd-space>
    <sd-button @click="showTopMessage">顶部消息</sd-button>
    <sd-button @click="showBottomMessage">底部消息</sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { getCurrentInstance } from 'vue';

  import { Message } from '@sdata/web-vue';

  interface MessageApi {
    info: (config: { content: string; position?: 'top' | 'bottom' }) => void;
  }

  type MessageProxy = {
    $message?: MessageApi;
  };

  const instance = getCurrentInstance();
  const proxy = instance?.proxy as MessageProxy | undefined;

  const showTopMessage = () => {
    proxy?.$message?.info({ content: '这是一条提示消息！' });
  };

  const showBottomMessage = () => {
    proxy?.$message?.info({
      content: '这是一条提示消息！',
      position: 'bottom',
    });
  };
</script>
