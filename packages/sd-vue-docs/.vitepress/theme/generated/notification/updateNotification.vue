<template>
  <a-button type="primary" @click="handleNotification">
    Open Notification
  </a-button>
</template>

<script>
import { Notification } from '@sd-design/web-vue';

export default {
  setup() {
    const handleNotification = () => {
      Notification.warning({
        id: 'your_id',
        title: 'Ready to update',
        content: 'Will update after 2 seconds...',
      })

      setTimeout(() => {
        Notification.success({
          id: 'your_id',
          title: 'Success',
          content: 'Update success!',
        });
      }, 2000)
    }

    return { handleNotification }
  }
}
</script>
