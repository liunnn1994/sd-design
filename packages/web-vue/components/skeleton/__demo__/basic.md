```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

骨架屏组件提供 `<sd-skeleton-line>` 和 `<sd-skeleton-shape>` 两种组件，用户可根据需要组合使用。

---

## en-US

The skeleton screen component provides two components: `<sd-skeleton-line>` and `<sd-skeleton-shape>`, users can combine them according to their needs.

---

```vue
<template>
  <sd-skeleton>
    <sd-space direction="vertical" :style="{ width: '100%' }" size="large">
      <sd-skeleton-line :rows="3" />
      <sd-skeleton-shape />
    </sd-space>
  </sd-skeleton>
</template>
```
