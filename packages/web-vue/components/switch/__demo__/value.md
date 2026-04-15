```yaml
title:
  zh-CN: 自定义开关的值
  en-US: Custom Value
```

## zh-CN

通过 `checked-value` 和 `unchecked-value` 可以自定义开关的值。

---

## en-US

The value of the switch can be customized through `checked-value` and `unchecked-value`.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-switch v-model="value" checked-value="yes" unchecked-value="no" />
    <div>Current Value: {{ value }}</div>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref('');

      return {
        value,
      };
    },
  };
</script>
```
