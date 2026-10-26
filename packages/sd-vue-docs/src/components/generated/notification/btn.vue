<template>
  <sd-button type="primary" @click="handleNotification"> 打开通知 </sd-button>
</template>

<script setup lang="ts">
  import { h } from 'vue';

  import { Button, Notification, Space } from '@sdata/web-vue';

  function handleNotification() {
    const id = `${Date.now()}`;
    const closeNotification = Notification.info({
      id,
      title: '通知',
      content: '这是一条通知！',
      duration: 0,
      footer: () =>
        h(Space, null, () => [
          h(
            Button,
            { type: 'secondary', size: 'small', onClick: () => Notification.remove(id) },
            () => '取消',
          ),
          h(
            Button,
            { type: 'primary', size: 'small', onClick: () => closeNotification.close() },
            () => '确认',
          ),
        ]),
    });
  }
</script>
