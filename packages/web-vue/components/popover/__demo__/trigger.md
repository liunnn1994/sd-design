```yaml
title:
  zh-CN: 触发方式
  en-US: Trigger
```

## zh-CN

通过设置 `trigger`，可以指定不同的触发方式。

---

## en-US

By setting `trigger`, you can specify different trigger methods.

---

```vue
<template>
  <sd-space>
    <sd-popover title="Title">
      <sd-button>Hover Me</sd-button>
      <template #content>
        <p>Here is the text content</p>
        <p>Here is the text content</p>
      </template>
    </sd-popover>
    <sd-popover title="Title" trigger="click">
      <sd-button>Click Me</sd-button>
      <template #content>
        <p>Here is the text content</p>
        <p>Here is the text content</p>
      </template>
    </sd-popover>
  </sd-space>
</template>
```
