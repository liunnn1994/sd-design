```yaml
title:
  zh-CN: 不同状态
  en-US: Different status
```

## zh-CN

禁用状态、只读状态、错误状态。

---

## en-US

Disabled, readonly, error status.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-space>
      <sd-typography-text style="width: 80px">Disabled:</sd-typography-text>
      <sd-verification-code defaultValue="123456" style="width: 300px" disabled />
    </sd-space>
    <sd-space>
      <sd-typography-text style="width: 80px">Readonly:</sd-typography-text>
      <sd-verification-code defaultValue="123456" style="width: 300px" readonly />
    </sd-space>
    <sd-space>
      <sd-typography-text style="width: 80px">Error:</sd-typography-text>
      <sd-verification-code defaultValue="123456" style="width: 300px" error />
    </sd-space>
  </sd-space>
</template>
```
