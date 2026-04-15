```yaml
title:
  zh-CN: 标签放置位置
  en-US: Label Placement
```

## zh-CN

通过设置 `label-placement` 可以改变标签描述文字放置的位置。放置位置分为 `horizontal` - **放置在图标右侧（默认）**、`vertical` - **放置在图标下方**两种。

---

## en-US

The placement of label description text can be changed by setting `label-placement`. There are two types of placement: `horizontal` - **placed on the right side of the icon (default)** and `vertical` - **placed below the icon**.

---

```vue
<template>
  <sd-steps label-placement="vertical">
    <sd-step description="This is a description">Succeeded</sd-step>
    <sd-step description="This is a description">Processing</sd-step>
    <sd-step description="This is a description">Pending</sd-step>
  </sd-steps>
</template>
```
