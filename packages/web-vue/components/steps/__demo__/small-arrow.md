```yaml
title:
  zh-CN: 迷你箭头步骤条
  en-US: Small Arrow Steps
```

## zh-CN

指定 `type: 'arrow', small: true`， 可以使用迷你箭头类型的步骤条。

---

## en-US

By setting `type="arrow" & small=true`, you can use the small arrow type step bar.

---

```vue
<template>
  <div>
    <sd-steps type="arrow" :current="2" small style="margin-bottom: 20px;">
      <sd-step description="This is a description">Succeeded</sd-step>
      <sd-step description="This is a description">Processing</sd-step>
      <sd-step description="This is a description">Pending</sd-step>
    </sd-steps>
    <sd-steps type="arrow" :current="2" small status="error">
      <sd-step description="This is a description">Succeeded</sd-step>
      <sd-step description="This is a description">Processing</sd-step>
      <sd-step description="This is a description">Pending</sd-step>
    </sd-steps>
  </div>
</template>
```
