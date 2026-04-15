```yaml
title:
  zh-CN: 隐藏连接线
  en-US: Line Less
```

## zh-CN

通过设置 `line-less` 可以使用无连接线模式。

---

## en-US

You can use the connectionless mode by setting `line-less`.

---

```vue
<template>
  <sd-steps :current="2" line-less>
    <sd-step description="This is a description">Succeeded</sd-step>
    <sd-step description="This is a description">Processing</sd-step>
    <sd-step description="This is a description">Pending</sd-step>
  </sd-steps>
</template>
```
