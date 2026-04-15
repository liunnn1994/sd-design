```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

展示结果状态。

---

## en-US

Show the result status.

---

```vue
<template>
  <sd-result title="This is title content" subtitle="This is subtitle content">
    <template #extra>
      <sd-space>
        <sd-button type="secondary">Again</sd-button>
        <sd-button type="primary">Back</sd-button>
      </sd-space>
    </template>
  </sd-result>
</template>
```
