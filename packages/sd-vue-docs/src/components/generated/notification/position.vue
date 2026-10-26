<template>
  <sd-space>
    <sd-button type="primary" @click="handleNotification"> 右上 </sd-button>
    <sd-button type="primary" @click="handleNotificationTopLeft"> 左上 </sd-button>
    <sd-button type="primary" @click="handleNotificationBottomRight"> 右下 </sd-button>
    <sd-button type="primary" @click="handleNotificationBottomLeft"> 左下 </sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { Notification } from '@sdata/web-vue';

  const handleNotification = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
    });
  };

  const handleNotificationTopLeft = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
      position: 'topLeft',
    });
  };

  const handleNotificationBottomRight = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
      position: 'bottomRight',
    });
  };

  const handleNotificationBottomLeft = () => {
    Notification.info({
      title: '标题',
      content: '这是一条通知！',
      position: 'bottomLeft',
    });
  };
</script>
