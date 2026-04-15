```yaml
title:
  zh-CN: 完整功能
  en-US: All features
```

## zh-CN

完整功能

---

## en-US

All features

---

```vue
<template>
  <sd-result status="error" title="No internet ">
    <template #icon>
      <IconFaceFrownFill />
    </template>
    <template #subtitle> DNS_PROBE_FINISHED_NO_INTERNET </template>

    <template #extra>
      <sd-button type="primary">Refresh</sd-button>
    </template>
    <sd-typography style="background: var(--color-fill-2); padding: 24px;">
      <sd-typography-paragraph>Try:</sd-typography-paragraph>
      <ul>
        <li> Checking the network cables, modem, and router </li>
        <li> Reconnecting to Wi-Fi </li>
      </ul>
    </sd-typography>
  </sd-result>
</template>

<script>
  import { IconFaceFrownFill } from '@sdata/web-vue/es/icon';

  export default {
    components: {
      IconFaceFrownFill,
    },
  };
</script>
```
