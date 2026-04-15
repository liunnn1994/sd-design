```yaml
title:
  zh-CN: 自定义按钮 Icon
  en-US: Customize Button Icon
```

## zh-CN

通过设置 `Menu.Sider` 的 `trigger` 属性，实现自定义收起按钮的图标。

---

## en-US

By setting the `trigger` property of `Menu.Sider`, the icon of the collapse button can be customized.

---

```vue
<template>
  <sd-layout class="layout-demo">
    <sd-layout-sider collapsible breakpoint="xl">
      <div class="logo" />
      <sd-menu
        :default-open-keys="['1']"
        :default-selected-keys="['0_3']"
        :style="{ width: '100%' }"
        @menu-item-click="onClickMenuItem"
      >
        <sd-menu-item key="0_1" disabled>
          <IconHome></IconHome>
          Menu 1
        </sd-menu-item>
        <sd-menu-item key="0_2">
          <IconCalendar></IconCalendar>
          Menu 2
        </sd-menu-item>
        <sd-menu-item key="0_3">
          <IconCalendar></IconCalendar>
          Menu 3
        </sd-menu-item>
        <sd-sub-menu key="1">
          <template #title> <IconCalendar></IconCalendar> Navigation 1 </template>
          <sd-menu-item key="1_1">Menu 1</sd-menu-item>
          <sd-menu-item key="1_2">Menu 2</sd-menu-item>
          <sd-sub-menu key="2" title="Navigation 2">
            <sd-menu-item key="2_1">Menu 1</sd-menu-item>
            <sd-menu-item key="2_2">Menu 2</sd-menu-item>
          </sd-sub-menu>
          <sd-sub-menu key="3" title="Navigation 3">
            <sd-menu-item key="3_1">Menu 1</sd-menu-item>
            <sd-menu-item key="3_2">Menu 2</sd-menu-item>
            <sd-menu-item key="3_3">Menu 3</sd-menu-item>
          </sd-sub-menu>
        </sd-sub-menu>
        <sd-sub-menu key="4">
          <template #title> <IconCalendar></IconCalendar> Navigation 4 </template>
          <sd-menu-item key="4_1">Menu 1</sd-menu-item>
          <sd-menu-item key="4_2">Menu 2</sd-menu-item>
          <sd-menu-item key="4_3">Menu 3</sd-menu-item>
        </sd-sub-menu>
      </sd-menu>
      <!-- trigger -->
      <template #trigger="{ collapsed }">
        <IconCaretRight v-if="collapsed"></IconCaretRight>
        <IconCaretLeft v-else></IconCaretLeft>
      </template>
    </sd-layout-sider>
    <sd-layout>
      <sd-layout-header style="padding-left: 20px;"> Header </sd-layout-header>
      <sd-layout style="padding: 0 24px;">
        <sd-breadcrumb :style="{ margin: '16px 0' }">
          <sd-breadcrumb-item>Home</sd-breadcrumb-item>
          <sd-breadcrumb-item>List</sd-breadcrumb-item>
          <sd-breadcrumb-item>App</sd-breadcrumb-item>
        </sd-breadcrumb>
        <sd-layout-content>Content</sd-layout-content>
        <sd-layout-footer>Footer</sd-layout-footer>
      </sd-layout>
    </sd-layout>
  </sd-layout>
</template>
<script>
  import { defineComponent } from 'vue';
  import { Message } from '@sdata/web-vue';
  import { IconCaretRight, IconCaretLeft, IconHome, IconCalendar } from '@sdata/web-vue/es/icon';

  export default defineComponent({
    components: {
      IconCaretRight,
      IconCaretLeft,
      IconHome,
      IconCalendar,
    },
    methods: {
      onClickMenuItem(key) {
        Message.info({ content: `You select ${key}`, showIcon: true });
      },
    },
  });
</script>
<style scoped>
  .layout-demo {
    height: 500px;
    background: var(--color-fill-2);
    border: 1px solid var(--color-border);
  }
  .layout-demo :deep(.sd-layout-sider) .logo {
    height: 32px;
    margin: 12px 8px;
    background: rgba(255, 255, 255, 0.2);
  }
  .layout-demo :deep(.sd-layout-sider-light) .logo {
    background: var(--color-fill-2);
  }
  .layout-demo :deep(.sd-layout-header) {
    height: 64px;
    line-height: 64px;
    background: var(--color-bg-3);
  }
  .layout-demo :deep(.sd-layout-footer) {
    height: 48px;
    color: var(--color-text-2);
    font-weight: 400;
    font-size: 14px;
    line-height: 48px;
  }
  .layout-demo :deep(.sd-layout-content) {
    color: var(--color-text-2);
    font-weight: 400;
    font-size: 14px;
    background: var(--color-bg-3);
  }
  .layout-demo :deep(.sd-layout-footer),
  .layout-demo :deep(.sd-layout-content) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-white);
    font-size: 16px;
    font-stretch: condensed;
    text-align: center;
  }
</style>
```
