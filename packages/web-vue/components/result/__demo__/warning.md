```yaml
title:
  zh-CN: 警告状态
  en-US: Warning
```

## zh-CN

展示警告状态。

---

## en-US

Show warning status.

---

```vue
<template>
  <sd-result status="warning" title="This is title content">
    <template #subtitle> This is subtitle content </template>

    <template #extra>
      <sd-space>
        <sd-button type="primary">Back</sd-button>
      </sd-space>
    </template>
  </sd-result>
</template>
```
