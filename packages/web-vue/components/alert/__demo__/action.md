```yaml
title:
  zh-CN: 操作项
  en-US: Action
```

## zh-CN

通过 `#action` 插槽自定义操作按钮

---

## en-US

Customize action buttons via `#action` slot

---

```vue
<template>
  <sd-space direction="vertical" size="large" style="width: 100%;">
    <sd-alert closable>
      This is an info alert.
      <template #action>
        <sd-button size="small" type="primary">Detail</sd-button>
      </template>
    </sd-alert>
    <sd-alert title="Example" closable>
      This is an info alert.
      <template #action>
        <sd-button size="small" type="primary">Detail</sd-button>
      </template>
    </sd-alert>
  </sd-space>
</template>
```
