```yaml
title:
  zh-CN: 显示输入框
  en-US: Show Input
```

## zh-CN

当设置 `show-input` 时，将显示输入框。

---

## en-US

When `show-input` is set, the input will be displayed.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-slider :default-value="10" :style="{ width: '300px' }" show-input />
    <sd-slider :default-value="[10, 20]" :style="{ width: '380px' }" range show-input />
  </sd-space>
</template>
```
