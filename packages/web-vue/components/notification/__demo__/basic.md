```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

通知提醒框的基本用法。

---

## en-US

Basic usage of notification.

---

```vue
<template>
  <sd-space>
    <sd-button
      type="primary"
      @click="
        () =>
          this.$notification.info({
            title: 'Notification',
            content: 'This is a notification!',
          })
      "
    >
      Open Notification
    </sd-button>
    <sd-button @click="handleNotification"> Open Notification </sd-button>
  </sd-space>
</template>

<script>
  import { Notification } from '@sdata/web-vue';

  export default {
    setup() {
      const handleNotification = () => {
        Notification.info({
          title: 'Notification',
          content: 'This is a notification!',
        });
      };

      return { handleNotification };
    },
  };
</script>
```
