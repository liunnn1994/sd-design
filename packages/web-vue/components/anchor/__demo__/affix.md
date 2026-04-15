```yaml
title:
  zh-CN: 固钉位置
  en-US: Affix Position
```

## zh-CN

使用 `affix` 组件可以让锚点固定在页面之内。

---

## en-US

Use the `affix` component to fix the anchor point within the page.

---

```vue
<template>
  <sd-affix :offsetTop="80">
    <sd-anchor :style="{ backgroundColor: 'var(--color-bg-1)' }">
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
  </sd-affix>
</template>
```
