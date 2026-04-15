```yaml
title:
  zh-CN: 单选框组
  en-US: Radio Group
```

## zh-CN

通过 `<sd-radio-group>` 组件展示单选框组。

---

## en-US

The radio group is displayed through the `<sd-radio-group>` component.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group>
      <sd-radio value="A">A</sd-radio>
      <sd-radio value="B">B</sd-radio>
      <sd-radio value="C">C</sd-radio>
      <sd-radio value="D">D</sd-radio>
    </sd-radio-group>
    <sd-radio-group>
      <sd-radio value="A">A</sd-radio>
      <sd-radio value="B">B</sd-radio>
      <sd-radio value="C">C</sd-radio>
      <sd-radio value="D" disabled>D</sd-radio>
    </sd-radio-group>
  </sd-space>
</template>
```
