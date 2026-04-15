<template>
  <sd-space>
    <sd-button type="primary" @click="handleNotification"> Open Notification </sd-button>
    <sd-button type="primary" status="danger" @click="handleNotification2">
      Open Notification
    </sd-button>
  </sd-space>
</template>

<script lang="jsx">
  import { Notification, Button } from '@sdata/web-vue';
  import { IconCloseCircle } from '@sdata/web-vue/es/icon/index.js';

  export default {
    setup() {
      const handleNotification = () => {
        Notification.info({
          title: 'Notification',
          content: 'This is a notification!',
          closable: true,
          closeIcon: <IconCloseCircle />,
        });
      };

      const handleNotification2 = () => {
        Notification.error({
          title: 'Notification',
          content: 'This is a notification!',
          closable: true,
          closeIconElement: <Button size="mini">Close</Button>,
        });
      };

      return { handleNotification, handleNotification2 };
    },
  };
</script>
