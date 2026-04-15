```yaml
title:
  zh-CN: Grid 布局
  en-US: Grid Layout
```

## zh-CN

基于 CSS 的 Grid 布局实现的布局组件，支持折叠，并且可以设置后缀节点，后缀节点会显示在一行的结尾。

---

## en-US

A layout component implemented by CSS-based Grid layout, supports folding, and can set suffix nodes, which will always be displayed at the end of a line.

---

```vue
<template>
  <div style="margin-bottom: 20px;">
    <sd-typography-text>折叠：</sd-typography-text>
    <sd-switch :checked="collapsed" @click="collapsed = !collapsed" />
  </div>
  <sd-grid :cols="3" :colGap="12" :rowGap="16" class="grid-demo-grid" :collapsed="collapsed">
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item" :offset="1">item | offset - 1</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item" :span="3">item | span - 3</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item" suffix #="{ overflow }">
      suffix | overflow: {{ overflow }}
    </sd-grid-item>
  </sd-grid>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const collapsed = ref(false);

      return {
        collapsed,
      };
    },
  };
</script>

<style scoped>
  .grid-demo-grid .demo-item,
  .grid-demo-grid .demo-suffix {
    height: 48px;
    line-height: 48px;
    color: var(--color-white);
    text-align: center;
  }

  .grid-demo-grid .demo-item:nth-child(2n) {
    background-color: rgba(var(--sdblue-6), 0.9);
  }

  .grid-demo-grid .demo-item:nth-child(2n + 1) {
    background-color: var(--color-primary-light-4);
  }
</style>
```
