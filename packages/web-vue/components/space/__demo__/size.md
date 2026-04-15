```yaml
title:
  zh-CN: 尺寸
  en-US: Size
```

## zh-CN

内置 4 个尺寸，`mini - 4px` `small - 8px (默认)` `medium - 16px` `large - 24px`，也支持传数字来自定义尺寸。

---

## en-US

Built-in 4 sizes, `mini-4px` `small-8px (default)` `medium-16px` `large-24px`, and also support to pass numbers to customize the size.

---

```vue
<template>
  <div>
    <div style="marginBottom: 20px">
      <sd-radio-group v-model="size" type="button">
        <sd-radio value="mini">mini</sd-radio>
        <sd-radio value="small">small</sd-radio>
        <sd-radio value="medium">medium</sd-radio>
        <sd-radio value="large">large</sd-radio>
      </sd-radio-group>
    </div>
    <sd-space :size="size">
      <sd-button type="primary">Item1</sd-button>
      <sd-button type="primary">Item2</sd-button>
      <sd-button type="primary">Item3</sd-button>
    </sd-space>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        size: 'medium',
      };
    },
  };
</script>
```
