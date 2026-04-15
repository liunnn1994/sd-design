```yaml
title:
  zh-CN: 箭头步骤条
  en-US: Arrow Steps
```

## zh-CN

通过设置 `type="arrow"`，可以使用箭头类型的步骤条。**注意**：仅支持水平步骤条。

---

## en-US

By setting `type="arrow"`, you can use the arrow type step bar. **Note**: Only horizontal step bars are supported.

---

```vue
<template>
  <sd-steps type="arrow" :current="2">
    <sd-step description="This is a description">Succeeded</sd-step>
    <sd-step description="This is a description">Processing</sd-step>
    <sd-step description="This is a description">Pending</sd-step>
  </sd-steps>
</template>
```
