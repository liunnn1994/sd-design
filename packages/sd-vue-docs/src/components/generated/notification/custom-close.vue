<template>
  <sd-space>
    <sd-button type="primary" @click="handleNotification"> 打开通知 </sd-button>
    <sd-button type="primary" status="danger" @click="handleNotification2"> 打开通知 </sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { h } from 'vue';

  import { Button, Notification } from '@sdata/web-vue';
  import { IconCloseCircle } from '@sdata/web-vue/es/icon/index.js';

  function handleNotification() {
    Notification.info({
      title: '通知',
      content: '这是一条通知！',
      closable: true,
      closeIcon: () => h(IconCloseCircle),
    });
  }

  function handleNotification2() {
    Notification.error({
      title: '通知',
      content: '这是一条通知！',
      closable: true,
      closeIconElement: () => h(Button, { size: 'mini' }, () => '关闭'),
    });
  }
</script>
