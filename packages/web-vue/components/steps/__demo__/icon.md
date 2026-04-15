```yaml
title:
  zh-CN: 自定义图标
  en-US: Custom Icon
```

## zh-CN

通过 `#icon` 插槽可以自定义节点图标。

---

## en-US

The node icon can be customized through the `#icon` slot.

---

```vue
<template>
  <sd-steps>
    <sd-step description="This is a description">
      Succeeded
      <template #icon>
        <icon-home />
      </template>
    </sd-step>
    <sd-step description="This is a description">
      Processing
      <template #icon>
        <icon-loading />
      </template>
    </sd-step>
    <sd-step description="This is a description">
      Pending
      <template #icon>
        <icon-thumb-up />
      </template>
    </sd-step>
  </sd-steps>
</template>
```
