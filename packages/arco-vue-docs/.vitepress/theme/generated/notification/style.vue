<template>
  <a-button type="primary" @click="handleNotification">
    Open Notification
  </a-button>
</template>

<script>
import { Notification } from '@arco-design/web-vue';

export default {
  setup() {
    const handleNotification = () => {
      Notification.info({
        title: 'Notification',
        content: 'This is a notification!',
        closable: true,
        style: { width: '500px' }
      })
    }

    return { handleNotification }
  }
}
</script>
