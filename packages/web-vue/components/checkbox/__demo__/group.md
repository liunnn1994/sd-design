```yaml
title:
  zh-CN: 复选框组
  en-US: Checkbox Group
```

## zh-CN

通过 `<sd-checkbox-group>` 组件展示复选框组。设置 `direction="vertical"` 可以展示竖向的复选框组。

---

## en-US

Display the checkbox group through the `<sd-checkbox-group>` component. Set `direction="vertical"` to show the vertical checkbox group.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-checkbox-group :default-value="['1']">
      <sd-checkbox value="1">Option 1</sd-checkbox>
      <sd-checkbox value="2">Option 2</sd-checkbox>
      <sd-checkbox value="3">Option 3</sd-checkbox>
    </sd-checkbox-group>
    <sd-checkbox-group direction="vertical">
      <sd-checkbox value="1">Option 1</sd-checkbox>
      <sd-checkbox value="2">Option 2</sd-checkbox>
      <sd-checkbox value="3">Option 3</sd-checkbox>
    </sd-checkbox-group>
  </sd-space>
</template>
```
