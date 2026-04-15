```yaml
title:
  zh-CN: 基本使用
  en-US: Basic Usage
```

## zh-CN

基本用法

---

## en-US

Basic usage

---

```vue
<template>
  <sd-space>
    <sd-color-picker v-model="value" />
    <sd-color-picker defaultValue="#165DFF" showText disabledAlpha />
  </sd-space>
</template>

<script setup>
  import { ref } from 'vue';
  const value = ref('#165DFF');
</script>
```
