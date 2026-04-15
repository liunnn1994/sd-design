```yaml
title:
  zh-CN: 自定义文案
  en-US: Custom Text
```

## zh-CN

自定义开关的打开/关闭状态的文字。

---

## en-US

Customize the text of the on/off state of the switch.

---

```vue
<template>
  <sd-space size="large">
    <sd-switch>
      <template #checked> ON </template>
      <template #unchecked> OFF </template>
    </sd-switch>
    <sd-switch type="round">
      <template #checked> ON </template>
      <template #unchecked> OFF </template>
    </sd-switch>
  </sd-space>
</template>
```
