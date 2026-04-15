```yaml
title:
  zh-CN: 输入框尺寸
  en-US: Input Size
```

## zh-CN

输入框定义了四种默认尺寸 `mini, small, medium, large` ，分别为 `24px, 28px, 32px, 36px` 。

---

## en-US

The input box defines four default sizes `mini, small, medium, large`, which are `24px, 28px, 32px, 36px` respectively.

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
    <sd-input
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
