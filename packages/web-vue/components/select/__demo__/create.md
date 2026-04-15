```yaml
title:
  zh-CN: 允许创建
  en-US: To Create
```

## zh-CN

通过设置 `allow-create` ，让选择器可以创建选项中不存在的条目。

---

## en-US

By setting `allow-create`, the selector can create items that do not exist in the options.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-select :style="{ width: '320px' }" placeholder="Please select ..." allow-create>
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
    <sd-select :style="{ width: '320px' }" placeholder="Please select ..." multiple allow-create>
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
  </sd-space>
</template>
```
