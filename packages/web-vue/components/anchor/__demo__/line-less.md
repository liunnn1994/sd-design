```yaml
title:
  zh-CN: 无轴线模式
  en-US: Line Less
```

## zh-CN

设置 `line-less` 时，可以使用无左侧轴线的锚点样式。

---

## en-US

When setting `line-less`, you can use an anchor style without a left axis.

---

```vue
<template>
  <sd-anchor line-less>
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
