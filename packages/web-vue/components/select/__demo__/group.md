```yaml
title:
  zh-CN: 分组
  en-US: Group
```

## zh-CN

使用 `optgroup` 组件添加分组选项。

---

## en-US

Use the `optgroup` component to add grouping options.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-select :style="{ width: '320px' }" placeholder="Please select ...">
      <sd-optgroup label="Group-1">
        <sd-option>Beijing</sd-option>
        <sd-option>Shanghai</sd-option>
      </sd-optgroup>
      <sd-optgroup label="Group-2">
        <sd-option>Guangzhou</sd-option>
        <sd-option disabled>Disabled</sd-option>
        <sd-option>Shenzhen</sd-option>
      </sd-optgroup>
      <sd-optgroup label="Group-3">
        <sd-option>Chengdu</sd-option>
        <sd-option>Wuhan</sd-option>
      </sd-optgroup>
    </sd-select>
    <sd-select :style="{ width: '320px' }" placeholder="Please select ..." multiple>
      <sd-optgroup label="Group-1">
        <sd-option>Beijing</sd-option>
        <sd-option>Shanghai</sd-option>
      </sd-optgroup>
      <sd-optgroup label="Group-2">
        <sd-option>Guangzhou</sd-option>
        <sd-option disabled>Disabled</sd-option>
        <sd-option>Shenzhen</sd-option>
      </sd-optgroup>
      <sd-optgroup label="Group-3">
        <sd-option>Chengdu</sd-option>
        <sd-option>Wuhan</sd-option>
      </sd-optgroup>
    </sd-select>
  </sd-space>
</template>
```
