```yaml
title:
  zh-CN: 悬浮状态底色
  en-US: hoverable
```

## zh-CN

可以通过 hoverable 属性设置是否在悬浮状态时隐藏底色。

---

## en-US

You can use the hoverable property to set whether to hide the background color of the Link component when it is hovering.

---

```vue
<template>
  <sd-space>
    <sd-link href="link" :hoverable="false">Link</sd-link>
    <sd-link href="link" status="danger" :hoverable="false">Link</sd-link>
  </sd-space>
</template>
```
