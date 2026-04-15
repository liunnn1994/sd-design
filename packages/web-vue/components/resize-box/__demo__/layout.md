```yaml
title:
  zh-CN: 在布局中使用
  en-US: Use in Layout
```

## zh-CN

[Layout](/react/components/ResizeBox) 组件中集成了 `ResizeBox` 组件，可以在 Layout 中使用可伸缩的侧边栏。

---

## en-US

The `ResizeBox` component is integrated in the [Layout](/react/components/ResizeBox) component, so a scalable sidebar can be used in the layout.

---

```vue
<template>
  <div class="layout-demo">
    <sd-layout>
      <sd-layout-header>Header</sd-layout-header>
      <sd-layout>
        <sd-layout-sider :resize-directions="['right']"> Sider </sd-layout-sider>
        <sd-layout-content>Content</sd-layout-content>
      </sd-layout>
      <sd-layout-footer>Footer</sd-layout-footer>
    </sd-layout>
  </div>
</template>

<style scoped>
  .layout-demo :deep(.sd-layout-header),
  .layout-demo :deep(.sd-layout-footer),
  .layout-demo :deep(.sd-layout-sider-children),
  .layout-demo :deep(.sd-layout-content) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-white);
    font-size: 16px;
    font-stretch: condensed;
    text-align: center;
  }

  .layout-demo :deep(.sd-layout-header),
  .layout-demo :deep(.sd-layout-footer) {
    height: 64px;
    background-color: var(--color-primary-light-4);
  }

  .layout-demo :deep(.sd-layout-sider) {
    width: 206px;
    background-color: var(--color-primary-light-3);
    min-width: 150px;
    max-width: 500px;
    height: 200px;
  }

  .layout-demo :deep(.sd-layout-content) {
    background-color: rgb(var(--sdblue-6));
  }
</style>
```
