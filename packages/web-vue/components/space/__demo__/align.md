```yaml
title:
  zh-CN: 对齐
  en-US: Align
```

## zh-CN

内置 4 种对齐方式，分别为 `start` `center` `end` `baseline`，在水平模式下默认为 `center`。

---

## en-US

There are 4 built-in alignment methods, namely `start` `center` `end` `baseline`, and the default is `center` in horizontal mode.

---

```vue
<template>
  <div>
    <div style="marginBottom: 20px">
      <sd-radio-group v-model="align" type="button">
        <sd-radio value="start">start</sd-radio>
        <sd-radio value="center">center</sd-radio>
        <sd-radio value="end">end</sd-radio>
        <sd-radio value="baseline">baseline</sd-radio>
      </sd-radio-group>
    </div>
    <sd-space :align="align" style="backgroundColor: var(--color-fill-2);padding: 10px;">
      <sd-typography-text>Space:</sd-typography-text>
      <sd-button type="primary">Item2</sd-button>
      <sd-card title="Card"> Card content </sd-card>
    </sd-space>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        align: 'center',
      };
    },
  };
</script>
```
