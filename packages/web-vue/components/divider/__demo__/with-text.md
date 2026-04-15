```yaml
title:
  zh-CN: 带有文字的分割线
  en-US: With Text
```

## zh-CN

通过 `orientation` 为分割线添加描述文字。

---

## en-US

Use `orientation` to add descriptive text to Divider.

---

```vue
<template>
  <div class="divider-demo">
    <p>A design is a plan or specification for the construction of an object.</p>
    <sd-divider orientation="left">Text</sd-divider>
    <p>A design is a plan or specification for the construction of an object.</p>
    <sd-divider orientation="center">Text</sd-divider>
    <p>A design is a plan or specification for the construction of an object.</p>
    <sd-divider orientation="right">Text</sd-divider>
    <sd-divider :margin="10"><icon-star /></sd-divider>
  </div>
</template>

<style scoped>
  .divider-demo {
    box-sizing: border-box;
    width: 560px;
    padding: 24px;
    border: 30px solid rgb(var(--gray-2));
  }
</style>
```
