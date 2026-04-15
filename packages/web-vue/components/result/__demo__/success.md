```yaml
title:
  zh-CN: 成功状态
  en-US: Success
```

## zh-CN

展示成功状态。

---

## en-US

Show success status.

---

```vue
<template>
  <sd-result status="success" title="This is title content">
    <template #subtitle> This is subtitle content </template>
    <template #extra>
      <sd-space>
        <sd-button type="primary">Back</sd-button>
      </sd-space>
    </template>
  </sd-result>
</template>
```
