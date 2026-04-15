```yaml
title:
  zh-CN: 显示箭头元素
  en-US: Show Arrow
```

## zh-CN

通过`show-arrow`属性，可以展示默认的箭头元素。也可以通过`arrow-class`或`arrow-style`进行定制。

---

## en-US

---

```vue
<template>
  <sd-space>
    <sd-trigger trigger="click">
      <sd-button>Click Me</sd-button>
      <template #content>
        <div class="demo-arrow">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger trigger="click" show-arrow>
      <sd-button>Click Me (Arrow)</sd-button>
      <template #content>
        <div class="demo-arrow">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
  </sd-space>
</template>

<style scoped>
  .demo-arrow {
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
    padding: 10px;
    width: 200px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
  }
</style>
```
