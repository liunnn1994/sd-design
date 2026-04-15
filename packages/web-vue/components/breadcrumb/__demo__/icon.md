```yaml
title:
  zh-CN: 自定义图标
  en-US: Custom Icon
```

## zh-CN

可以在内容中使用自定义图标。

---

## en-US

You can use custom icons in the content.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-breadcrumb>
      <sd-breadcrumb-item>
        <icon-home />
      </sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb>
      <sd-breadcrumb-item>
        <icon-home />
      </sd-breadcrumb-item>
      <sd-breadcrumb-item>
        <icon-at />
        Channel
      </sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
```
