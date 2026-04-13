---
title: "layout"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 布局
title: 布局 Layout
description: 页面的基础布局框架，常与组件嵌套使用，构建页面整体布局。
```






## API


### `<layout>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|has-sider|表示子元素里有 Sider，一般不用指定。可用于服务端渲染时避免样式闪动|`boolean`|`false`|




### `<layout-header>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|default|内容|-|




### `<layout-content>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|default|内容|-|




### `<layout-footer>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|default|内容|-|




### `<layout-sider>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|theme|主题颜色|`'dark' \| 'light'`|`'light'`|
|collapsed|当前收起状态|`boolean`|`-`|
|default-collapsed|默认的收起状态|`boolean`|`false`|
|collapsible|是否可收起|`boolean`|`false`|
|width|宽度|`number`|`200`|
|collapsed-width|收缩宽度|`number`|`48`|
|reverse-arrow|翻转折叠提示箭头的方向，当 Sider 在右边时可以使用|`boolean`|`false`|
|breakpoint|触发响应式布局的断点, 详见[响应式栅格](/components/grid/)|`'xxl' \| 'xl' \| 'lg' \| 'md' \| 'sm' \| 'xs'`|`-`|
|resize-directions|可以用 ResizeBox 替换原生的 `aside` 标签，这个参数即 ResizeBox的 `directions` 参数。详情请看 [ResizeBox](/components/resize-box/)。|`Array<'left' \| 'right' \| 'top' \| 'bottom'>`|`-`|
|hide-trigger|隐藏底部折叠触发器|`boolean`|`false`|
### `<layout-sider>` Events

|事件名|描述|参数|
|---|---|---|
|collapse|展开-收起时的事件，有点击 trigger 以及响应式反馈两种方式可以触发|collapsed: `boolean`<br>type: `'clickTrigger'\|'responsive'`|
|breakpoint|触发响应式布局断点时的事件|collapsed: `boolean`|
### `<layout-sider>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|trigger|自定义底部折叠触发器|collapsed: `boolean`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/layout/basic.vue';
const basicSource = "<template>\n  <div class=\"layout-demo\">\n    <a-layout style=\"height: 400px;\">\n      <a-layout-header>Header<\/a-layout-header>\n      <a-layout-content>Content<\/a-layout-content>\n      <a-layout-footer>Footer<\/a-layout-footer>\n    <\/a-layout>\n    <br />\n    <a-layout style=\"height: 400px;\">\n      <a-layout-header>Header<\/a-layout-header>\n      <a-layout>\n        <a-layout-sider theme=\"dark\">Sider<\/a-layout-sider>\n        <a-layout-content>Content<\/a-layout-content>\n      <\/a-layout>\n      <a-layout-footer>Footer<\/a-layout-footer>\n    <\/a-layout>\n    <br />\n    <a-layout style=\"height: 400px;\">\n      <a-layout-header>Header<\/a-layout-header>\n      <a-layout>\n        <a-layout-content>Content<\/a-layout-content>\n        <a-layout-sider>Sider<\/a-layout-sider>\n      <\/a-layout>\n      <a-layout-footer>Footer<\/a-layout-footer>\n    <\/a-layout>\n    <br />\n    <a-layout style=\"height: 400px;\">\n      <a-layout-header>Header<\/a-layout-header>\n      <a-layout>\n        <a-layout-sider style=\"width: 64px;\">Sider<\/a-layout-sider>\n        <a-layout-sider style=\"width: 206px; margin-left: 1px;\">Sider<\/a-layout-sider>\n        <a-layout-content>Content<\/a-layout-content>\n      <\/a-layout>\n      <a-layout-footer>Footer<\/a-layout-footer>\n    <\/a-layout>\n  <\/div>\n<\/template>\n<style scoped>\n.layout-demo :deep(.arco-layout-header),\n.layout-demo :deep(.arco-layout-footer),\n.layout-demo :deep(.arco-layout-sider-children),\n.layout-demo :deep(.arco-layout-content) {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: var(--color-white);\n  font-size: 16px;\n  font-stretch: condensed;\n  text-align: center;\n}\n\n\n.layout-demo :deep(.arco-layout-header),\n.layout-demo :deep(.arco-layout-footer) {\n  height: 64px;\n  background-color: var(--color-primary-light-4);\n}\n\n.layout-demo :deep(.arco-layout-sider) {\n  width: 206px;\n  background-color: var(--color-primary-light-3);\n}\n\n.layout-demo :deep(.arco-layout-content) {\n  background-color: rgb(var(--arcoblue-6));\n}\n<\/style>";
const basicTitle = "Basic.Md";
const basicDescription = "典型的页面布局。";
import breakpointDemo from '../../.vitepress/theme/generated/layout/breakpoint.vue';
const breakpointSource = "<template>\n  <a-layout class=\"layout-demo\">\n    <a-layout-sider\n      theme=\"dark\"\n      breakpoint=\"lg\"\n      :width=\"220\"\n      collapsible\n      :collapsed=\"collapsed\"\n      @collapse=\"onCollapse\"\n    >\n      <div class=\"logo\" />\n      <a-menu\n        :defaultOpenKeys=\"['1']\"\n        :defaultSelectedKeys=\"['0_2']\"\n        @menuItemClick=\"onClickMenuItem\"\n      >\n        <a-menu-item key=\"0_1\" disabled>\n          <IconHome />\n          Menu 1\n        <\/a-menu-item>\n        <a-menu-item key=\"0_2\">\n          <IconCalendar />\n          Menu 2\n        <\/a-menu-item>\n        <a-sub-menu key=\"1\">\n          <template #title>\n            <span><IconCalendar />Navigation 1<\/span>\n          <\/template>\n          <a-menu-item key=\"1_1\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"1_2\">Menu 2<\/a-menu-item>\n          <a-sub-menu key=\"2\" title=\"Navigation 2\">\n            <a-menu-item key=\"2_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"2_2\">Menu 2<\/a-menu-item>\n          <\/a-sub-menu>\n          <a-sub-menu key=\"3\" title=\"Navigation 3\">\n            <a-menu-item key=\"3_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"3_2\">Menu 2<\/a-menu-item>\n            <a-menu-item key=\"3_3\">Menu 3<\/a-menu-item>\n          <\/a-sub-menu>\n        <\/a-sub-menu>\n        <a-sub-menu key=\"4\">\n          <template #title>\n            <span><IconCalendar />Navigation 4<\/span>\n          <\/template>\n          <a-menu-item key=\"4_1\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"4_2\">Menu 2<\/a-menu-item>\n          <a-menu-item key=\"4_3\">Menu 3<\/a-menu-item>\n        <\/a-sub-menu>\n      <\/a-menu>\n    <\/a-layout-sider>\n    <a-layout>\n      <a-layout-header>\n        <a-menu\n          :openKeys=\"['1']\"\n          :selectedKeys=\"['0_2']\"\n          mode='horizontal'\n        >\n          <a-menu-item key=\"0_1\" disabled>\n            <IconHome />\n            Menu 1\n          <\/a-menu-item>\n          <a-menu-item key=\"0_2\">\n            <IconCalendar />\n            Menu 2\n          <\/a-menu-item>\n          <a-sub-menu key=\"1\">\n            <template #title>\n              <span><IconCalendar />Navigation 1<\/span>\n            <\/template>\n            <a-menu-item key=\"1_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"1_2\">Menu 2<\/a-menu-item>\n            <a-sub-menu key=\"2\" title=\"Navigation 2\">\n              <a-menu-item key=\"2_1\">Menu 1<\/a-menu-item>\n              <a-menu-item key=\"2_2\">Menu 2<\/a-menu-item>\n            <\/a-sub-menu>\n            <a-sub-menu key=\"3\" title=\"Navigation 3\">\n              <a-menu-item key=\"3_1\">Menu 1<\/a-menu-item>\n              <a-menu-item key=\"3_2\">Menu 2<\/a-menu-item>\n              <a-menu-item key=\"3_3\">Menu 3<\/a-menu-item>\n            <\/a-sub-menu>\n          <\/a-sub-menu>\n          <a-sub-menu key=\"4\">\n            <template #title>\n              <span><IconCalendar />Navigation 4<\/span>\n            <\/template>\n            <a-menu-item key=\"4_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"4_2\">Menu 2<\/a-menu-item>\n            <a-menu-item key=\"4_3\">Menu 3<\/a-menu-item>\n          <\/a-sub-menu>\n        <\/a-menu>\n      <\/a-layout-header>\n      <a-layout style=\"padding: 0 24px\">\n        <a-breadcrumb :style=\"{ margin: '16px 0' }\">\n          <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n          <a-breadcrumb-item>List<\/a-breadcrumb-item>\n          <a-breadcrumb-item>App<\/a-breadcrumb-item>\n        <\/a-breadcrumb>\n        <a-layout-content>Content<\/a-layout-content>\n        <a-layout-footer>Footer<\/a-layout-footer>\n      <\/a-layout>\n    <\/a-layout>\n  <\/a-layout>\n<\/template>\n<script>\nimport { defineComponent, ref } from 'vue';\nimport { Message } from '@arco-design/web-vue';\nimport {\n  IconHome,\n  IconCalendar,\n} from '@arco-design/web-vue/es/icon';\n\nexport default defineComponent({\n  components: {\n    IconHome,\n    IconCalendar,\n  },\n  setup() {\n    const collapsed = ref(false);\n    const onCollapse = (val, type) => {\n      const content = type === 'responsive' ? '触发响应式收缩' : '点击触发收缩';\n      Message.info({\n        content,\n        duration: 2000,\n      });\n      collapsed.value = val;\n    }\n    return {\n      collapsed,\n      onCollapse,\n      onClickMenuItem(key) {\n        Message.info({ content: `You select ${key}`, showIcon: true });\n      }\n    };\n  }\n});\n<\/script>\n<style scoped>\n.layout-demo {\n  height: 500px;\n  background: var(--color-fill-2);\n  border: 1px solid var(--color-border);\n}\n.layout-demo :deep(.arco-layout-sider) .logo {\n  height: 32px;\n  margin: 12px 8px;\n  background: rgba(255, 255, 255, 0.2);\n}\n.layout-demo :deep(.arco-layout-sider-light) .logo{\n  background: var(--color-fill-2);\n}\n.layout-demo :deep(.arco-layout-header)  {\n  height: 64px;\n  line-height: 64px;\n  background: var(--color-bg-3);\n}\n.layout-demo :deep(.arco-layout-footer) {\n  height: 48px;\n  color: var(--color-text-2);\n  font-weight: 400;\n  font-size: 14px;\n  line-height: 48px;\n}\n.layout-demo :deep(.arco-layout-content) {\n  color: var(--color-text-2);\n  font-weight: 400;\n  font-size: 14px;\n  background: var(--color-bg-3);\n}\n.layout-demo :deep(.arco-layout-footer),\n.layout-demo :deep(.arco-layout-content)  {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: var(--color-white);\n  font-size: 16px;\n  font-stretch: condensed;\n  text-align: center;\n}\n<\/style>";
const breakpointTitle = "Breakpoint.Md";
const breakpointDescription = "左侧 Slider 可以结合 Menu 设置为展开/收起状态, 设置`breakpoint`可触发响应式收缩。";
import collapsedDemo from '../../.vitepress/theme/generated/layout/collapsed.vue';
const collapsedSource = "<template>\n  <a-layout class=\"layout-demo\">\n    <a-layout-sider\n      hide-trigger\n      collapsible\n      :collapsed=\"collapsed\"\n    >\n      <div class=\"logo\" />\n      <a-menu\n        :defaultOpenKeys=\"['1']\"\n        :defaultSelectedKeys=\"['0_3']\"\n        :style=\"{ width: '100%' }\"\n        @menuItemClick=\"onClickMenuItem\"\n      >\n        <a-menu-item key=\"0_1\" disabled>\n          <IconHome />\n          Menu 1\n        <\/a-menu-item>\n        <a-menu-item key=\"0_2\">\n          <IconCalendar />\n          Menu 2\n        <\/a-menu-item>\n        <a-menu-item key=\"0_3\">\n          <IconCalendar />\n          Menu 3\n        <\/a-menu-item>\n        <a-sub-menu key=\"1\">\n          <template #title>\n            <span><IconCalendar />Navigation 1<\/span>\n          <\/template>\n          <a-menu-item key=\"1_1\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"1_2\">Menu 2<\/a-menu-item>\n          <a-sub-menu key=\"2\" title=\"Navigation 2\">\n            <a-menu-item key=\"2_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"2_2\">Menu 2<\/a-menu-item>\n          <\/a-sub-menu>\n          <a-sub-menu key=\"3\" title=\"Navigation 3\">\n            <a-menu-item key=\"3_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"3_2\">Menu 2<\/a-menu-item>\n            <a-menu-item key=\"3_3\">Menu 3<\/a-menu-item>\n          <\/a-sub-menu>\n        <\/a-sub-menu>\n        <a-sub-menu key=\"4\">\n          <template #title>\n            <span><IconCalendar />Navigation 4<\/span>\n          <\/template>\n          <a-menu-item key=\"4_1\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"4_2\">Menu 2<\/a-menu-item>\n          <a-menu-item key=\"4_3\">Menu 3<\/a-menu-item>\n        <\/a-sub-menu>\n      <\/a-menu>\n    <\/a-layout-sider>\n    <a-layout>\n      <a-layout-header style=\"padding-left: 20px;\">\n        <a-button shape=\"round\" @click=\"onCollapse\">\n          <IconCaretRight v-if=\"collapsed\" />\n          <IconCaretLeft v-else />\n        <\/a-button>\n      <\/a-layout-header>\n      <a-layout style=\"padding: 0 24px;\">\n        <a-breadcrumb :style=\"{ margin: '16px 0' }\">\n          <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n          <a-breadcrumb-item>List<\/a-breadcrumb-item>\n          <a-breadcrumb-item>App<\/a-breadcrumb-item>\n        <\/a-breadcrumb>\n        <a-layout-content>Content<\/a-layout-content>\n        <a-layout-footer>Footer<\/a-layout-footer>\n      <\/a-layout>\n    <\/a-layout>\n  <\/a-layout>\n<\/template>\n<script>\nimport { defineComponent, ref } from 'vue';\nimport { Message} from '@arco-design/web-vue';\nimport {\n  IconCaretRight,\n  IconCaretLeft,\n  IconHome,\n  IconCalendar,\n} from '@arco-design/web-vue/es/icon';\n\nexport default defineComponent({\n  components: {\n    IconCaretRight,\n    IconCaretLeft,\n    IconHome,\n    IconCalendar,\n  },\n  setup() {\n    const collapsed = ref(false);\n    const onCollapse = () => {\n      collapsed.value = !collapsed.value;\n    };\n    return {\n      collapsed,\n      onCollapse,\n      onClickMenuItem(key) {\n        Message.info({ content: `You select ${key}`, showIcon: true });\n      }\n    };\n  },\n});\n<\/script>\n<style scoped>\n.layout-demo {\n  height: 500px;\n  background: var(--color-fill-2);\n  border: 1px solid var(--color-border);\n}\n.layout-demo :deep(.arco-layout-sider) .logo {\n  height: 32px;\n  margin: 12px 8px;\n  background: rgba(255, 255, 255, 0.2);\n}\n.layout-demo :deep(.arco-layout-sider-light) .logo{\n  background: var(--color-fill-2);\n}\n.layout-demo :deep(.arco-layout-header)  {\n  height: 64px;\n  line-height: 64px;\n  background: var(--color-bg-3);\n}\n.layout-demo :deep(.arco-layout-footer) {\n  height: 48px;\n  color: var(--color-text-2);\n  font-weight: 400;\n  font-size: 14px;\n  line-height: 48px;\n}\n.layout-demo :deep(.arco-layout-content) {\n  color: var(--color-text-2);\n  font-weight: 400;\n  font-size: 14px;\n  background: var(--color-bg-3);\n}\n.layout-demo :deep(.arco-layout-footer),\n.layout-demo :deep(.arco-layout-content)  {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: var(--color-white);\n  font-size: 16px;\n  font-stretch: condensed;\n  text-align: center;\n}\n<\/style>";
const collapsedTitle = "Collapsed.Md";
const collapsedDescription = "设置`Menu.Sider` 的`hide-trigger`属性为`true`后，`Sider` 内置的缩起按钮不会显示。此时可自定义收起按钮。";
import customIconDemo from '../../.vitepress/theme/generated/layout/customIcon.vue';
const customIconSource = "<template>\n  <a-layout class=\"layout-demo\">\n    <a-layout-sider collapsible breakpoint=\"xl\">\n      <div class=\"logo\" />\n      <a-menu\n        :default-open-keys=\"['1']\"\n        :default-selected-keys=\"['0_3']\"\n        :style=\"{ width: '100%' }\"\n        @menu-item-click=\"onClickMenuItem\"\n      >\n        <a-menu-item key=\"0_1\" disabled>\n          <IconHome><\/IconHome>\n          Menu 1\n        <\/a-menu-item>\n        <a-menu-item key=\"0_2\">\n          <IconCalendar><\/IconCalendar>\n          Menu 2\n        <\/a-menu-item>\n        <a-menu-item key=\"0_3\">\n          <IconCalendar><\/IconCalendar>\n          Menu 3\n        <\/a-menu-item>\n        <a-sub-menu key=\"1\">\n          <template #title>\n            <IconCalendar><\/IconCalendar> Navigation 1\n          <\/template>\n          <a-menu-item key=\"1_1\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"1_2\">Menu 2<\/a-menu-item>\n          <a-sub-menu key=\"2\" title=\"Navigation 2\">\n            <a-menu-item key=\"2_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"2_2\">Menu 2<\/a-menu-item>\n          <\/a-sub-menu>\n          <a-sub-menu key=\"3\" title=\"Navigation 3\">\n            <a-menu-item key=\"3_1\">Menu 1<\/a-menu-item>\n            <a-menu-item key=\"3_2\">Menu 2<\/a-menu-item>\n            <a-menu-item key=\"3_3\">Menu 3<\/a-menu-item>\n          <\/a-sub-menu>\n        <\/a-sub-menu>\n        <a-sub-menu key=\"4\">\n          <template #title>\n            <IconCalendar><\/IconCalendar> Navigation 4\n          <\/template>\n          <a-menu-item key=\"4_1\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"4_2\">Menu 2<\/a-menu-item>\n          <a-menu-item key=\"4_3\">Menu 3<\/a-menu-item>\n        <\/a-sub-menu>\n      <\/a-menu>\n      <\!-- trigger -->\n      <template #trigger=\"{ collapsed }\">\n        <IconCaretRight v-if=\"collapsed\"><\/IconCaretRight>\n        <IconCaretLeft v-else><\/IconCaretLeft>\n      <\/template>\n    <\/a-layout-sider>\n    <a-layout>\n      <a-layout-header style=\"padding-left: 20px;\">\n        Header\n      <\/a-layout-header >\n      <a-layout style=\"padding: 0 24px;\">\n        <a-breadcrumb :style=\"{ margin: '16px 0' }\">\n          <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n          <a-breadcrumb-item>List<\/a-breadcrumb-item>\n          <a-breadcrumb-item>App<\/a-breadcrumb-item>\n        <\/a-breadcrumb>\n        <a-layout-content>Content<\/a-layout-content>\n        <a-layout-footer>Footer<\/a-layout-footer>\n      <\/a-layout>\n    <\/a-layout>\n  <\/a-layout>\n<\/template>\n<script>\nimport { defineComponent } from 'vue';\nimport { Message} from '@arco-design/web-vue';\nimport {\n  IconCaretRight,\n  IconCaretLeft,\n  IconHome,\n  IconCalendar,\n} from '@arco-design/web-vue/es/icon';\n\nexport default defineComponent({\n  components: {\n    IconCaretRight,\n    IconCaretLeft,\n    IconHome,\n    IconCalendar,\n  },\n  methods: {\n    onClickMenuItem(key) {\n      Message.info({ content: `You select ${key}`, showIcon: true });\n    }\n  }\n});\n<\/script>\n<style scoped>\n.layout-demo {\n  height: 500px;\n  background: var(--color-fill-2);\n  border: 1px solid var(--color-border);\n}\n.layout-demo :deep(.arco-layout-sider) .logo {\n  height: 32px;\n  margin: 12px 8px;\n  background: rgba(255, 255, 255, 0.2);\n}\n.layout-demo :deep(.arco-layout-sider-light) .logo{\n  background: var(--color-fill-2);\n}\n.layout-demo :deep(.arco-layout-header)  {\n  height: 64px;\n  line-height: 64px;\n  background: var(--color-bg-3);\n}\n.layout-demo :deep(.arco-layout-footer) {\n  height: 48px;\n  color: var(--color-text-2);\n  font-weight: 400;\n  font-size: 14px;\n  line-height: 48px;\n}\n.layout-demo :deep(.arco-layout-content) {\n  color: var(--color-text-2);\n  font-weight: 400;\n  font-size: 14px;\n  background: var(--color-bg-3);\n}\n.layout-demo :deep(.arco-layout-footer),\n.layout-demo :deep(.arco-layout-content)  {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: var(--color-white);\n  font-size: 16px;\n  font-stretch: condensed;\n  text-align: center;\n}\n<\/style>";
const customIconTitle = "Custom Icon.Md";
const customIconDescription = "通过设置 `Menu.Sider` 的 `trigger` 属性，实现自定义收起按钮的图标。";
import resizeDemo from '../../.vitepress/theme/generated/layout/resize.vue';
const resizeSource = "<template>\n  <div class=\"layout-demo\">\n    <a-layout>\n      <a-layout-header>Header<\/a-layout-header>\n      <a-layout>\n        <a-layout-sider :resize-directions=\"['right']\">\n          Sider\n        <\/a-layout-sider>\n        <a-layout-content>Content<\/a-layout-content>\n      <\/a-layout>\n      <a-layout-footer>Footer<\/a-layout-footer>\n    <\/a-layout>\n  <\/div>\n<\/template>\n<style scoped>\n.layout-demo :deep(.arco-layout-header),\n.layout-demo :deep(.arco-layout-footer),\n.layout-demo :deep(.arco-layout-sider-children),\n.layout-demo :deep(.arco-layout-content) {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: var(--color-white);\n  font-size: 16px;\n  font-stretch: condensed;\n  text-align: center;\n}\n\n\n.layout-demo :deep(.arco-layout-header),\n.layout-demo :deep(.arco-layout-footer) {\n  height: 64px;\n  background-color: var(--color-primary-light-4);\n}\n\n.layout-demo :deep(.arco-layout-sider) {\n  width: 206px;\n  background-color: var(--color-primary-light-3);\n  min-width: 150px;\n  max-width: 500px;\n  height: 200px;\n}\n\n.layout-demo :deep(.arco-layout-content) {\n  background-color: rgb(var(--arcoblue-6));\n}\n<\/style>";
const resizeTitle = "Resize.Md";
const resizeDescription = "可以用鼠标进行拖拽放大缩小的侧边栏，需要用到的参数：`resizeDirections`。";
</script>

## 示例


<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="breakpointTitle"
  :description="breakpointDescription"
  :code="breakpointSource"
>
  <breakpointDemo />
</DemoBlock>

<DemoBlock
  :title="collapsedTitle"
  :description="collapsedDescription"
  :code="collapsedSource"
>
  <collapsedDemo />
</DemoBlock>

<DemoBlock
  :title="customIconTitle"
  :description="customIconDescription"
  :code="customIconSource"
>
  <customIconDemo />
</DemoBlock>

<DemoBlock
  :title="resizeTitle"
  :description="resizeDescription"
  :code="resizeSource"
>
  <resizeDemo />
</DemoBlock>
