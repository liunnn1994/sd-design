<template>
  <sd-button type="primary" @click="handleNotification"> Open Notification </sd-button>
</template>

<script>
  import { Notification } from '@sdata/web-vue';

  export default {
    setup() {
      const handleNotification = () => {
        Notification.info({
          title: 'Notification',
          content: 'This is a notification!',
          closable: true,
          style: { width: '500px' },
        });
      };

      return { handleNotification };
    },
  };
</script>
