```yaml
title:
  zh-CN: 显示省略
  en-US: Show ellipsis
```

## zh-CN

通过 `max-count` 来指定面包屑的最多渲染数量，超出的部分将显示为省略号。

---

## en-US

Use `max-count` to specify the maximum number of breadcrumbs to render, and the excess will be displayed as an ellipsis.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-breadcrumb :max-count="3">
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Sub Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>All Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
      <sd-breadcrumb-item>Post</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb :max-count="3">
      <template #more-icon>
        <sd-tooltip content="more routes a/b/c">
          <icon-more />
        </sd-tooltip>
      </template>
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Sub Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>All Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
      <sd-breadcrumb-item>Post</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
```
