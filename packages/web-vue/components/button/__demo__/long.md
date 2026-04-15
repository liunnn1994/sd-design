```yaml
title:
  zh-CN: 长按钮
  en-US: Long Button
```

## zh-CN

通过设置 `long` 属性，使按钮的宽度跟随容器的宽度。

---

## en-US

By setting the `long` property, the width of the button follows the width of the container.

---

```vue
<template>
  <sd-space class="wrapper" direction="vertical">
    <sd-button type="primary" long>Primary</sd-button>
    <sd-button long>Default</sd-button>
    <sd-button type="dashed" long>Dashed</sd-button>
    <sd-button type="outline" long>Outline</sd-button>
    <sd-button type="text" long>Text</sd-button>
  </sd-space>
</template>

<style scoped lang="less">
  .wrapper {
    width: 400px;
    padding: 20px;
    border: 1px solid var(~'--color-border');
    border-radius: 4px;
  }
</style>
```
