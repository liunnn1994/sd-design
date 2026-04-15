```yaml
title:
  zh-CN: 小型步骤条
  en-US: small steps
```

## zh-CN

通过 `small` 可以设置展示小型步骤条

---

## en-US

small steps

---

```vue
<template>
  <div>
    <sd-steps :current="2" small>
      <sd-step>Succeeded</sd-step>
      <sd-step>Processing</sd-step>
      <sd-step>Pending</sd-step>
    </sd-steps>
    <sd-divider />
    <div style="line-height: 140px; text-align: center; color: #C9CDD4; "> Step 2 Content </div>
  </div>
</template>
```
