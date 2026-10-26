<template>
  <sd-button type="primary" @click="handleNotification"> 打开通知 </sd-button>
</template>

<script setup lang="ts">
  import { Notification } from '@sdata/web-vue';

  const handleNotification = () => {
    Notification.warning({
      id: 'your_id',
      title: '准备更新',
      content: '将在 2 秒后更新…',
    });

    setTimeout(() => {
      Notification.success({
        id: 'your_id',
        title: '成功',
        content: '更新成功！',
      });
    }, 2000);
  };
</script>
