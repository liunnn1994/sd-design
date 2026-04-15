```yaml
title:
  zh-CN: 链接的状态
  en-US: Status
```

## zh-CN

链接的状态分为 `normal` - **正常（默认）**、`success` - **成功**、`warning` - **警告**、`danger` - **危险**四种。

---

## en-US

The link status is divided into four types: `normal` (default), `success`, `warning` and `danger`.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-space>
      <sd-link href="link">Normal Link</sd-link>
      <sd-link href="link" disabled>Normal Link</sd-link>
    </sd-space>
    <sd-space>
      <sd-link href="link" status="success">Success Link</sd-link>
      <sd-link href="link" status="success" disabled>Success Link</sd-link>
    </sd-space>
    <sd-space>
      <sd-link href="link" status="warning">Warning Link</sd-link>
      <sd-link href="link" status="warning" disabled>Warning Link</sd-link>
    </sd-space>
    <sd-space>
      <sd-link href="link" status="danger">Danger Link</sd-link>
      <sd-link href="link" status="danger" disabled>Danger Link</sd-link>
    </sd-space>
  </sd-space>
</template>
```
