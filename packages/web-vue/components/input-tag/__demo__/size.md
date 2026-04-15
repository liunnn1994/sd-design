```yaml
title:
  zh-CN: 输入框尺寸
  en-US: Input Size
```

## zh-CN

输入框分为 `mini`、`small`、`medium`、`large` 四种尺寸。

---

## en-US

The input box is divided into four sizes: `mini`, `small`, `medium`, and `large`.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" v-model="size">
      <sd-radio value="mini">mini</sd-radio>
      <sd-radio value="small">small</sd-radio>
      <sd-radio value="medium">medium</sd-radio>
      <sd-radio value="large">large</sd-radio>
    </sd-radio-group>
    <sd-input-tag
      :default-value="['one']"
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      :size="size"
      allow-clear
    />
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const size = ref('medium');

      return {
        size,
      };
    },
  };
</script>
```
