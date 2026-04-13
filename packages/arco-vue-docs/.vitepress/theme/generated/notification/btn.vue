<template>
  <a-button type="primary" @click="handleNotification">
    Open Notification
  </a-button>
</template>

<script lang="jsx">
import { Notification, Space, Button } from '@arco-design/web-vue';

export default {
  setup() {
    const handleNotification = () => {
      const id = `${Date.now()}`;
      const closeNotification =  Notification.info({
        id,
        title:'Notification',
        content:'This is a notification!',
        duration: 0,
        footer: <Space>
          <Button
            type="secondary"
            size="small"
            onClick={() => Notification.remove(id)}
          >
            Cancel
          </Button>
          <Button type="primary" size="small" onClick={closeNotification}>
            Ok
          </Button>
        </Space>
      })
    }

    return { handleNotification }
  }
}
</script>
