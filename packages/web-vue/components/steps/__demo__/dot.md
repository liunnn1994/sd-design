```yaml
title:
  zh-CN: 点状步骤条
  en-US: Dot Steps
```

## zh-CN

通过设置 `type="dot"` ， 可以使用点状的步骤条。此模式没有 small 尺寸。

---

## en-US

By setting `type="dot"`, you can use a dotted step bar. There is no small size for this mode.

---

```vue
<template>
  <sd-steps type="dot">
    <sd-step>Succeeded</sd-step>
    <sd-step>Processing</sd-step>
    <sd-step>Pending</sd-step>
  </sd-steps>
</template>
```
