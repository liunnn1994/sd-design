```yaml
title:
  zh-CN: 是否改变hash
  en-US: Hash
```

## zh-CN

可以设置点击锚点而不改变浏览器历史。

---

## en-US

You can set the click anchor without changing the browser history.

---

```vue
<template>
  <sd-anchor :change-hash="false">
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
