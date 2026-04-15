```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

锚点的基础用法

---

## en-US

Basic usage of anchors

---

```vue
<template>
  <sd-anchor>
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
