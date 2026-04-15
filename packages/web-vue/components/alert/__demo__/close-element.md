```yaml
title:
  zh-CN: 自定义关闭元素
  en-US: Custom close element
```

## zh-CN

指定 `close-element` slot，自定义关闭元素。

---

## en-US

Specify `close-element` slot, custom close element.

---

```vue
<template>
  <sd-row :gutter="[40, 20]">
    <sd-col :span="12">
      <sd-alert closable>
        <template #close-element>
          <icon-close-circle />
        </template>
        This is an info alert.
      </sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert closable>
        <template #close-element> Close </template>
        This is an info alert.
      </sd-alert>
    </sd-col>
  </sd-row>
</template>
```
