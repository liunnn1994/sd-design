```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

基本用法。只需指定 `count`或者 `content slot`，即可显示徽标。

---

## en-US

Basic usage. Just specify `count` or `content slot` to display the badge.

---

```vue
<template>
  <sd-space :size="40">
    <sd-badge :count="9">
      <sd-avatar shape="square" />
    </sd-badge>
    <sd-badge :count="9" dot :dotStyle="{ width: '10px', height: '10px' }">
      <sd-avatar shape="square" />
    </sd-badge>
    <sd-badge :dotStyle="{ height: '16px', width: '16px', fontSize: '14px' }">
      <template #content>
        <IconClockCircle :style="{ verticalAlign: 'middle', color: 'var(--color-text-2)' }" />
      </template>
      <sd-avatar shape="square" />
    </sd-badge>
  </sd-space>
</template>

<script>
  import { IconClockCircle } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconClockCircle },
  };
</script>
```
