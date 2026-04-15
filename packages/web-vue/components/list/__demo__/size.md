```yaml
title:
  zh-CN: 不同尺寸
  en-US: Sizes
```

## zh-CN

列表组件提供了三种大小 `small, medium, large` ，可根据业务需求自行选择。

---

## en-US

The list component provides three sizes `small, medium, large`, which can be selected according to business needs.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="small">Small</sd-radio>
      <sd-radio value="medium">Medium</sd-radio>
      <sd-radio value="large">Large</sd-radio>
    </sd-radio-group>
    <sd-list :size="size">
      <template #header> List title </template>
      <sd-list-item>Beijing Bytedance Technology Co., Ltd.</sd-list-item>
      <sd-list-item>Bytedance Technology Co., Ltd.</sd-list-item>
      <sd-list-item>Beijing Toutiao Technology Co., Ltd.</sd-list-item>
      <sd-list-item>Beijing Volcengine Technology Co., Ltd.</sd-list-item>
      <sd-list-item>China Beijing Bytedance Technology Co., Ltd.</sd-list-item>
    </sd-list>
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
