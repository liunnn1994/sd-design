<template>
  <a-space>
    <a-button type="primary" @click="() => this.$notification.info({
      title:'Notification',
      content:'This is a notification!'
    })"
    >
      Open Notification
    </a-button>
    <a-button @click="handleNotification">
      Open Notification
    </a-button>
  </a-space>
</template>

<script>
import { Notification } from '@arco-design/web-vue';

export default {
  setup() {
    const handleNotification = () => {
      Notification.info({
        title: 'Notification',
        content: 'This is a notification!',
      })
    }

    return { handleNotification }
  }
}
</script>
