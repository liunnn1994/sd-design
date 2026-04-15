```yaml
title:
  zh-CN: 图形骨架屏
  en-US: Shape Skeleton
```

## zh-CN

图形骨架屏分为 `square` - **正方形（默认）**、 `circle` - **圆形**两种形状，并提供 `small`、`medium`、`large` 三种尺寸。

---

## en-US

The graphic skeleton screen is divided into two shapes: `square`, `circle`, and provides three sizes of `small`, `medium`, and `large`.

---

```vue
<template>
  <sd-skeleton>
    <sd-space size="large">
      <sd-skeleton-shape size="small" />
      <sd-skeleton-shape />
      <sd-skeleton-shape size="large" />
      <sd-skeleton-shape shape="circle" size="small" />
      <sd-skeleton-shape shape="circle" />
      <sd-skeleton-shape shape="circle" size="large" />
    </sd-space>
  </sd-skeleton>
</template>
```
