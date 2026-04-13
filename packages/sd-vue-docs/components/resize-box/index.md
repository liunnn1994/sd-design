---
title: "resize-box"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 其他
title: 伸缩框 ResizeBox
description: 伸缩框组件。
```





## API


### `<resize-box>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|width **(v-model)**|宽度|`number`|`-`|
|height **(v-model)**|高度|`number`|`-`|
|component|伸缩框的 html 标签|`string`|`'div'`|
|directions|可以进行伸缩的边，有上、下、左、右可以使用|`('left' \| 'right' \| 'top' \| 'bottom')[]`|`['right']`|
### `<resize-box>` Events

|事件名|描述|参数|
|---|---|---|
|moving-start|拖拽开始时触发|ev: `MouseEvent`|
|moving|拖拽时触发|size: `{ width: number; height: number; }`<br>ev: `MouseEvent`|
|moving-end|拖拽结束时触发|ev: `MouseEvent`|
### `<resize-box>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|resize-trigger|伸缩杆的内容|direction: `'left' \| 'right' \| 'top' \| 'bottom'`|
|resize-trigger-icon|伸缩杆的图标|direction: `'left' \| 'right' \| 'top' \| 'bottom'`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/resize-box/basic.vue';
const basicSource = "<template>\n  <div>\n    <a-resize-box\n      :directions=\"['right', 'bottom']\"\n      :style=\"{ width: '500px', minWidth: '100px', maxWidth: '100%', height: '200px', textAlign: 'center' }\"\n    >\n      <a-typography-paragraph>We are building the future of content discovery and creation.<\/a-typography-paragraph>\n      <a-divider />\n      <a-typography-paragraph>\n        ByteDance's content platforms enable people to enjoy content powered by AI technology. We\n        inform, entertain, and inspire people across language, culture and geography.\n      <\/a-typography-paragraph>\n      <a-divider>ByteDance<\/a-divider>\n      <a-typography-paragraph>Yiming Zhang is the founder and CEO of ByteDance.<\/a-typography-paragraph>\n    <\/a-resize-box>\n  <\/div>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "`ResizeBox` 伸缩框组件的基础使用。通过设置 `directions`，可以指定四条边中的哪几条边可以进行伸缩。";
import controlledDemo from '../../.vitepress/theme/generated/resize-box/controlled.vue';
const controlledSource = "<template>\n<div>\n  <a-resize-box\n    :directions=\"['right', 'bottom']\"\n    :style=\"{ minWidth: '100px', maxWidth: '100%', textAlign: 'center' }\"\n    v-model:width=\"width\"\n    v-model:height=\"height\"\n  >\n    <a-typography-paragraph>We are building the future of content discovery and creation.<\/a-typography-paragraph>\n    <a-divider />\n    <a-typography-paragraph>\n      ByteDance's content platforms enable people to enjoy content powered by AI technology. We\n      inform, entertain, and inspire people across language, culture and geography.\n    <\/a-typography-paragraph>\n    <a-divider>ByteDance<\/a-divider>\n    <a-typography-paragraph>Yiming Zhang is the founder and CEO of ByteDance.<\/a-typography-paragraph>\n  <\/a-resize-box>\n<\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const width = ref(500);\n    const height = ref(200);\n    return {\n      width,\n      height,\n    };\n  }\n};\n<\/script>";
const controlledTitle = "Controlled.Md";
const controlledDescription = "`ResizeBox` 的 `width` 和 `height` 都支持 `v-model`。";
import customTriggersDemo from '../../.vitepress/theme/generated/resize-box/customTriggers.vue';
const customTriggersSource = "<template>\n  <a-resize-box\n    :directions=\"['right', 'bottom']\"\n    style=\"width: 500px; min-width: 100px; max-width: 100%; height: 200px; text-align: center;\"\n  >\n    <template #resize-trigger=\"{ direction }\">\n      <div\n        :class=\"[\n          `resizebox-demo`,\n          `resizebox-demo-${direction === 'right' ? 'vertical' : 'horizontal'}`\n        ]\"\n      >\n        <div class=\"resizebox-demo-line\"/>\n      <\/div>\n    <\/template>\n    <a-typography-paragraph>We are building the future of content discovery and creation.<\/a-typography-paragraph>\n    <a-divider />\n    <a-typography-paragraph>\n      ByteDance's content platforms enable people to enjoy content powered by AI technology. We\n      inform, entertain, and inspire people across language, culture and geography.\n    <\/a-typography-paragraph>\n    <a-divider>ByteDance<\/a-divider>\n    <a-typography-paragraph>Yiming Zhang is the founder and CEO of ByteDance.<\/a-typography-paragraph>\n  <\/a-resize-box>\n<\/template>\n\n<style scoped>\n  .resizebox-demo {\n    position: relative;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 100%;\n    height: 100%;\n    background-color: var(--color-bg-2);\n  }\n  .resizebox-demo::before,\n  .resizebox-demo::after {\n    width: 6px;\n    height: 6px;\n    border: 1px solid rgb(var(--sdblue-6));\n    content: '';\n}\n  .resizebox-demo-line {\n    flex: 1;\n    background-color: rgb(var(--sdblue-6));\n  }\n  .resizebox-demo-vertical {\n    flex-direction: column;\n  }\n  .resizebox-demo-vertical .resizebox-demo-line {\n    width: 1px;\n    height: 100%;\n  }\n  .resizebox-demo-horizontal .resizebox-demo-line {\n    height: 1px;\n  }\n<\/style>";
const customTriggersTitle = "Custom Triggers.Md";
const customTriggersDescription = "可通过插槽 `resize-trigger` 定制各个方向的伸缩杆的内容。";
import layoutDemo from '../../.vitepress/theme/generated/resize-box/layout.vue';
const layoutSource = "<template>\n<div class=\"layout-demo\">\n  <a-layout>\n    <a-layout-header>Header<\/a-layout-header>\n    <a-layout>\n      <a-layout-sider :resize-directions=\"['right']\">\n        Sider\n      <\/a-layout-sider>\n      <a-layout-content>Content<\/a-layout-content>\n    <\/a-layout>\n    <a-layout-footer>Footer<\/a-layout-footer>\n  <\/a-layout>\n<\/div>\n<\/template>\n\n<style scoped>\n.layout-demo :deep(.sd-layout-header),\n.layout-demo :deep(.sd-layout-footer),\n.layout-demo :deep(.sd-layout-sider-children),\n.layout-demo :deep(.sd-layout-content) {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: var(--color-white);\n  font-size: 16px;\n  font-stretch: condensed;\n  text-align: center;\n}\n\n\n.layout-demo :deep(.sd-layout-header),\n.layout-demo :deep(.sd-layout-footer) {\n  height: 64px;\n  background-color: var(--color-primary-light-4);\n}\n\n.layout-demo :deep(.sd-layout-sider) {\n  width: 206px;\n  background-color: var(--color-primary-light-3);\n  min-width: 150px;\n  max-width: 500px;\n  height: 200px;\n}\n\n.layout-demo :deep(.sd-layout-content) {\n  background-color: rgb(var(--sdblue-6));\n}\n<\/style>";
const layoutTitle = "Layout.Md";
const layoutDescription = "[Layout](/react/components/ResizeBox) 组件中集成了 `ResizeBox` 组件，可以在 Layout 中使用可伸缩的侧边栏。";
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
  :title="controlledTitle"
  :description="controlledDescription"
  :code="controlledSource"
>
  <controlledDemo />
</DemoBlock>

<DemoBlock
  :title="customTriggersTitle"
  :description="customTriggersDescription"
  :code="customTriggersSource"
>
  <customTriggersDemo />
</DemoBlock>

<DemoBlock
  :title="layoutTitle"
  :description="layoutDescription"
  :code="layoutSource"
>
  <layoutDemo />
</DemoBlock>
