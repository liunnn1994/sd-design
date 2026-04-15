```yaml
title:
  zh-CN: 自定义尺寸
  en-US: Custom Size
```

## zh-CN

通过指定样式来自定义面包屑的尺寸。

---

## en-US

Customize the breadcrumb size by specifying the style.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-breadcrumb>
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb :style="{ fontSize: `12px` }">
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
```
