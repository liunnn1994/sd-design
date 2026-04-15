```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

输入框的基本用法。

---

## en-US

The basic usage of input

---

```vue
<template>
  <sd-space>
    <sd-input :style="{ width: '320px' }" placeholder="Please enter something" allow-clear />
    <sd-input
      :style="{ width: '320px' }"
      default-value="content"
      placeholder="Please enter something"
      allow-clear
    />
  </sd-space>
</template>
```
