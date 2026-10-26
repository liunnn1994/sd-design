<template>
  <sd-space>
    <sd-button type="primary" @click="handleNotification"> 打开通知 </sd-button>
    <sd-button @click="handleNotification"> 打开通知 </sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { Notification } from '@sdata/web-vue';

  const handleNotification = () => {
    Notification.info({
      title: '通知',
      content: '这是一条通知！',
    });
  };
</script>
