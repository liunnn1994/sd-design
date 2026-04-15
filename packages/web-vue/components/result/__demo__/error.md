```yaml
title:
  zh-CN: 错误状态
  en-US: Error
```

## zh-CN

展示错误状态。

---

## en-US

Show error status.

---

```vue
<template>
  <sd-result status="error" title="This is title content">
    <template #subtitle> This is subtitle content </template>

    <template #extra>
      <sd-space>
        <sd-button type="primary">Back</sd-button>
      </sd-space>
    </template>
  </sd-result>
</template>
```
