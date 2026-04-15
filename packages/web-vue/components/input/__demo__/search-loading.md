```yaml
title:
  zh-CN: 搜索框（加载中）
  en-US: Search Input (Loading)
```

## zh-CN

通过 `loading` 属性可以让搜索框展示加载中状态。

---

## en-US

The `loading` property allows the search box to display the loading status.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-input-search :style="{ width: '320px' }" placeholder="Please enter something" loading />
    <sd-input-search
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      search-button
      loading
    />
  </sd-space>
</template>
```
