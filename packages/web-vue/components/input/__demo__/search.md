```yaml
title:
  zh-CN: 搜索框
  en-US: Search Input
```

## zh-CN

带有搜索按钮的输入框，用于内容检索。

---

## en-US

An input box with a search button for content retrieval.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-input-search :style="{ width: '320px' }" placeholder="Please enter something" />
    <sd-input-search
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      search-button
    />
  </sd-space>
</template>
```
