```yaml
title:
  zh-CN: 弹窗偏移量
  en-US: Popup Translate
```

## zh-CN

通过`popup-translate`属性，可以设置弹窗在原本位置的基础上进行额外的位置调整。

---

## en-US

---

```vue
<template>
  <sd-space>
    <sd-trigger>
      <sd-button>BOTTOM</sd-button>
      <template #content>
        <div class="trigger-demo-translate">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger :popup-translate="[100, 20]">
      <sd-button>BOTTOM OFFSET[100, 20]</sd-button>
      <template #content>
        <div class="trigger-demo-translate">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger :popup-translate="[-100, 20]">
      <sd-button>BOTTOM OFFSET[-100, 20]</sd-button>
      <template #content>
        <div class="trigger-demo-translate">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
  </sd-space>
</template>

<style scoped>
  .trigger-demo-translate {
    padding: 10px;
    width: 200px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }
</style>
```
