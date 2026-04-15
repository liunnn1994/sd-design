```yaml
title:
  zh-CN: 独立使用
  en-US: Standalone
```

## zh-CN

`default slot` 为空时，将会独立展示徽标。

---

## en-US

Used in standalone when `default slot` is empty.

---

```vue
<template>
  <sd-space :size="40">
    <sd-badge :count="2" />
    <sd-badge :count="2" :dotStyle="{ background: '#E5E6EB', color: '#86909C' }" />
    <sd-badge :count="16" />
    <sd-badge :count="1000" :max-count="99" />
  </sd-space>
</template>
```
