```yaml
title:
  zh-CN: 状态点
  en-US: Status
```

## zh-CN

设置 `status`，可以得到不同的状态点。`normal - 正常` `processing - 进行中` `success - 成功` `warning - 提醒` `danger - 危险`。

---

## en-US

Different status.

---

```vue
<template>
  <sd-space size="large" direction="vertical">
    <sd-space size="large">
      <sd-badge status="normal" />
      <sd-badge status="processing" />
      <sd-badge status="success" />
      <sd-badge status="warning" />
      <sd-badge status="danger" />
    </sd-space>
    <sd-space size="large">
      <sd-badge status="normal" text="Normal" />
      <sd-badge status="processing" text="Processing" />
      <sd-badge status="success" text="Success" />
      <sd-badge status="warning" text="Warning" />
      <sd-badge status="danger" text="Danger" />
    </sd-space>
  </sd-space>
</template>
```
