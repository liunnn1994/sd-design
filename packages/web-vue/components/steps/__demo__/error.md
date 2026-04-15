```yaml
title:
  zh-CN: 步骤错误
  en-US: Error Status
```

## zh-CN

通过设置 `status="error"` 来展示错误状态。

---

## en-US

Display the error status by setting `status="error"`.

---

```vue
<template>
  <sd-steps :current="2" status="error">
    <sd-step description="This is a description">Succeeded</sd-step>
    <sd-step description="This is a description">Error</sd-step>
    <sd-step description="This is a description">Pending</sd-step>
  </sd-steps>
</template>
```
