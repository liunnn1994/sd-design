<template>
  <a-space>
    <a-button type="primary" @click="handleNotification">
      Open Notification
    </a-button>
    <a-button type="primary" status="danger" @click="handleNotification2">
      Open Notification
    </a-button>
  </a-space>
</template>

<script lang="jsx">
import { Notification, Button } from '@sd-design/web-vue';
import { IconCloseCircle } from '@sd-design/web-vue/es/icon';

export default {
  setup() {
    const handleNotification = () => {
      Notification.info({
        title:'Notification',
        content:'This is a notification!',
        closable: true,
        closeIcon: <IconCloseCircle />
      })
    }

    const handleNotification2 = () => {
      Notification.error({
        title:'Notification',
        content:'This is a notification!',
        closable: true,
        closeIconElement: <Button size="mini">Close</Button>
      })
    }

    return { handleNotification, handleNotification2 }
  }
}
</script>
