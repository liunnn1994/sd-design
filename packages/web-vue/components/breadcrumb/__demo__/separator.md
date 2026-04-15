```yaml
title:
  zh-CN: 自定义分隔符
  en-US: Custom separator
```

## zh-CN

通过 `separator` 属性或插槽自定义分隔符。面包屑子项也可通过 `separator` 属性或插槽自定义分隔符，且优先级高于父项。

---

## en-US

Customize the delimiter through the `separator` attribute or slot. Bread crumb child items can also be customized through the `separator` attribute or slot delimiter, and the priority is higher than the parent item.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb separator="~">
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <sd-breadcrumb-item separator="->">Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
```
