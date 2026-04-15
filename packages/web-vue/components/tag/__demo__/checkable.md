```yaml
title:
  zh-CN: 可选中
  en-US: Checkable
```

## zh-CN

通过设置 `checkable` ，可以实现点击选中的效果。

---

## en-US

By setting `checkable`, the effect of selecting can be achieved.

---

```vue
<template>
  <sd-space>
    <sd-tag checkable>Awesome</sd-tag>
    <sd-tag checkable color="red" :default-checked="true">Toutiao</sd-tag>
    <sd-tag checkable color="sdblue" :default-checked="true">Lark</sd-tag>
  </sd-space>
</template>
```
