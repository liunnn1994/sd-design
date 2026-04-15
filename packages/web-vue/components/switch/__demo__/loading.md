```yaml
title:
  zh-CN: 加载中状态
  en-US: Loading
```

## zh-CN

通过设置 `loading` 使开关处于加载中状态，此时开关不可点击。

---

## en-US

The switch is in the loading state by setting `loading`, and the switch cannot be clicked at this time.

---

```vue
<template>
  <sd-space size="large">
    <sd-switch loading />
    <sd-switch type="round" loading />
    <sd-switch type="line" loading />
  </sd-space>
</template>
```
