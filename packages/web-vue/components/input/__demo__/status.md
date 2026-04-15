```yaml
title:
  zh-CN: 输入框状态
  en-US: Status
```

## zh-CN

输入框可以设置禁用和错误状态。

---

## en-US

The input box can be set to disable and error status.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-input :style="{ width: '320px' }" placeholder="Disabled status" disabled />
    <sd-input
      :style="{ width: '320px' }"
      default-value="Disabled"
      placeholder="Disabled status"
      disabled
    />
    <sd-input :style="{ width: '320px' }" placeholder="Error status" error />
  </sd-space>
</template>
```
