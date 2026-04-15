```yaml
title:
  zh-CN: 无边框模式
  en-US: Borderless
```

## zh-CN

设置 `bordered="false"` 开启无边框模式，常用于沉浸式使用。

---

## en-US

Set `bordered="false"` to enable borderless mode, which is often used for immersive use.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-select :style="{ width: '100%' }" placeholder="Please select ..." :bordered="false">
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
    </sd-select>
    <sd-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :bordered="false"
    >
      <sd-option>Beijing</sd-option>
      <sd-option :tag-props="{ color: 'red' }">Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
  </sd-space>
</template>
```
