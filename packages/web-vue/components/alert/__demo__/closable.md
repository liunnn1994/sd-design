```yaml
title:
  zh-CN: 可关闭
  en-US: Closable
```

## zh-CN

通过设置 `closable`，可开启关闭按钮。

---

## en-US

By setting `closable`, the close button can be turned on.

---

```vue
<template>
  <sd-row :gutter="[40, 20]">
    <sd-col :span="12">
      <sd-alert closable>This is an info alert.</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="success" closable>This is an success alert.</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="warning" closable>
        <template #title> Warning </template>
        This is an warning alert.
      </sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="error" closable>
        <template #title> Error </template>
        This is an error alert.
      </sd-alert>
    </sd-col>
  </sd-row>
</template>
```
