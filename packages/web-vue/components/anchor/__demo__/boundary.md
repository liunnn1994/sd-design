```yaml
title:
  zh-CN: 锚点滚动偏移量
  en-US: boundary
```

## zh-CN

可以设置 `boundary` 来定制锚点滚动偏移量。

---

## en-US

You can set `boundary` to customize the anchor point scroll offset.

---

```vue
<template>
  <sd-anchor boundary="center">
    <sd-anchor-link href="#basic">Basic</sd-anchor-link>
    <sd-anchor-link href="#line-less">LineLess Mode</sd-anchor-link>
    <sd-anchor-link href="#affix">
      Affix
      <template #sublist>
        <sd-anchor-link href="#boundary">Scroll Boundary</sd-anchor-link>
        <sd-anchor-link href="#hash">Hash mode</sd-anchor-link>
      </template>
    </sd-anchor-link>
  </sd-anchor>
</template>
```
