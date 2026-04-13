<template>
  <a-space>
    <a-button type="primary" @click="handleNotification"> Top Right </a-button>
    <a-button type="primary" @click="handleNotificationTopLeft"> Top Left </a-button>
    <a-button type="primary" @click="handleNotificationBottomRight"> Bottom Right </a-button>
    <a-button type="primary" @click="handleNotificationBottomLeft"> Bottom Left </a-button>
  </a-space>
</template>

<script>
import { Notification } from '@sd-design/web-vue';

export default {
  setup() {
    const handleNotification = () => {
      Notification.info({
        title: 'Title',
        content: 'This is a Notification!',
      })
    }

    const handleNotificationTopLeft = () => {
      Notification.info({
        title: 'Title',
        content: 'This is a Notification!',
        position: "topLeft"
      })
    }

    const handleNotificationBottomRight = () => {
      Notification.info({
        title: 'Title',
        content: 'This is a Notification!',
        position: 'bottomRight'
      })
    }

    const handleNotificationBottomLeft = () => {
      Notification.info({
        title: 'Title',
        content: 'This is a Notification!',
        position: "bottomLeft"
      })
    }

    return {
      handleNotification,
      handleNotificationTopLeft,
      handleNotificationBottomRight,
      handleNotificationBottomLeft
    }
  }
}
</script>
