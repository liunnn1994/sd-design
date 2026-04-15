```yaml
title:
  zh-CN: 密码输入框
  en-US: Password Input
```

## zh-CN

用于输入密码。

---

## en-US

Used to enter a password.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-switch v-model="visibility" />
    <sd-input-password
      v-model:visibility="visibility"
      placeholder="Please enter something"
      :style="{ width: '320px' }"
      :defaultVisibility="false"
      allow-clear
    />
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const visibility = ref(true);

      return {
        visibility,
      };
    },
  };
</script>
```
