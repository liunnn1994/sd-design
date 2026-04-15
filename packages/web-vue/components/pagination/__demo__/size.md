```yaml
title:
  zh-CN: 分页尺寸
  en-US: Pagination Size
```

## zh-CN

分页分为 `mini`、`small`、`medium`、`large` 四种尺寸。

---

## en-US

The pagination is divided into four sizes: `mini`, `small`, `medium`, and `large`.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" v-model="size">
      <sd-radio value="mini">Mini</sd-radio>
      <sd-radio value="small">Small</sd-radio>
      <sd-radio value="medium">Medium</sd-radio>
      <sd-radio value="large">Large</sd-radio>
    </sd-radio-group>
    <sd-pagination :total="50" :size="size" show-total show-jumper show-page-size />
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
