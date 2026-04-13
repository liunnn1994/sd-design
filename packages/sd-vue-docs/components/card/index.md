---
title: 'card'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 卡片 Card
description: 将信息分类后分标题、详情等区域聚合展现，一般作为简洁介绍或者信息的大盘和入口。
```

## API

### `<card>` Props

| 参数名       | 描述                 | 类型                  |    默认值    |
| ------------ | -------------------- | --------------------- | :----------: |
| bordered     | 是否有边框           | `boolean`             |    `true`    |
| loading      | 是否为加载中         | `boolean`             |   `false`    |
| hoverable    | 是否可悬浮           | `boolean`             |   `false`    |
| size         | 卡片尺寸             | `'medium' \| 'small'` |  `'medium'`  |
| header-style | 自定义标题区域样式   | `CSSProperties`       | `() => ({})` |
| body-style   | 内容区域自定义样式   | `CSSProperties`       | `() => ({})` |
| title        | 卡片标题             | `string`              |     `-`      |
| extra        | 卡片右上角的操作区域 | `string`              |     `-`      |

### `<card>` Slots

| 插槽名  |         描述         | 参数 |
| ------- | :------------------: | ---- |
| actions |   卡片底部的操作组   | -    |
| cover   |       卡片封面       | -    |
| extra   | 卡片右上角的操作区域 | -    |
| title   |       卡片标题       | -    |

### `<card-meta>` Props

| 参数名      | 描述 | 类型     | 默认值 |
| ----------- | ---- | -------- | :----: |
| title       | 标题 | `string` |  `-`   |
| description | 描述 | `string` |  `-`   |

### `<card-meta>` Slots

| 插槽名      | 描述 | 参数 |
| ----------- | :--: | ---- |
| description | 描述 | -    |
| title       | 标题 | -    |
| avatar      | 头像 | -    |

### `<card-grid>` Props

| 参数名    | 描述         | 类型      | 默认值  |
| --------- | ------------ | --------- | :-----: |
| hoverable | 是否可以悬浮 | `boolean` | `false` |

<script setup lang="ts">
import actionsDemo from '../../.vitepress/theme/generated/card/actions.vue';
const actionsSource = "<template>\n  <a-card :style=\"{ width: '360px' }\">\n    <template #actions>\n      <span class=\"icon-hover\"> <IconThumbUp /> <\/span>\n      <span class=\"icon-hover\"> <IconShareInternal /> <\/span>\n      <span class=\"icon-hover\"> <IconMore /> <\/span>\n    <\/template>\n    <template #cover>\n      <div\n        :style=\"{\n          height: '204px',\n          overflow: 'hidden',\n        }\"\n      >\n        <img\n          :style=\"{ width: '100%', transform: 'translateY(-20px)' }\"\n          alt=\"dessert\"\n          src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a20012a2d4d5b9db43dfc6a01fe508c0.png~tplv-uwbnlip3yd-webp.webp\"\n        />\n      <\/div>\n    <\/template>\n    <a-card-meta title=\"Card Title\" description=\"This is the description\">\n      <template #avatar>\n        <div\n          :style=\"{ display: 'flex', alignItems: 'center', color: '#1D2129' }\"\n        >\n          <a-avatar :size=\"24\" :style=\"{ marginRight: '8px' }\">\n            A\n          <\/a-avatar>\n          <a-typography-text>Username<\/a-typography-text>\n        <\/div>\n      <\/template>\n    <\/a-card-meta>\n  <\/a-card>\n<\/template>\n\n<script>\nimport {\n  IconThumbUp,\n  IconShareInternal,\n  IconMore,\n} from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: { IconThumbUp, IconShareInternal, IconMore },\n};\n<\/script>\n<style scoped>\n.icon-hover {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  transition: all 0.1s;\n}\n.icon-hover:hover {\n  background-color: rgb(var(--gray-2));\n}\n<\/style>";
const actionsTitle = "Actions.Md";
const actionsDescription = "`actions` slot 可以用于展示底部按钮组。";
import basicDemo from '../../.vitepress/theme/generated/card/basic.vue';
const basicSource = "<template>\n  <div :style=\"{ display: 'flex' }\">\n    <a-card :style=\"{ width: '360px' }\" title=\"SD Card\">\n      <template #extra>\n        <a-link>More<\/a-link>\n      <\/template>\n      ByteDance's core product, Toutiao (\"Headlines\"), is a content platform in\n      China and around the world. Toutiao started out as a news recommendation\n      engine and gradually evolved into a platform delivering content in various\n      formats.\n    <\/a-card>\n  <\/div>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "常规的内容容器，可承载文字、列表、图片、段落，常用于模块划分和内容概览。";
import borderedDemo from '../../.vitepress/theme/generated/card/bordered.vue';
const borderedSource = "<template>\n  <div\n    :style=\"{\n      display: 'flex',\n      width: '100%',\n      boxSizing: 'border-box',\n      padding: '40px',\n      backgroundColor: 'var(--color-fill-2)',\n    }\"\n  >\n    <a-card :style=\"{ width: '360px' }\" title=\"SD Card\" :bordered=\"false\">\n      <template #extra>\n        <a-link>More<\/a-link>\n      <\/template>\n      Card content\n      <br />\n      Card content\n    <\/a-card>\n    <a-card\n      :style=\"{ width: '360px', marginLeft: '24px' }\"\n      title=\"Hover me\"\n      hoverable\n      :bordered=\"false\"\n    >\n      <template #extra>\n        <a-link>More<\/a-link>\n      <\/template>\n      Card content\n      <br />\n      Card content\n    <\/a-card>\n  <\/div>\n<\/template>";
const borderedTitle = "Bordered.Md";
const borderedDescription = "设置 `bordered` 为 `false` 来使用无边框卡片。";
import contentDemo from '../../.vitepress/theme/generated/card/content.vue';
const contentSource = "<template>\n  <a-card hoverable :style=\"{ width: '360px', marginBottom: '20px' }\">\n    <div\n      :style=\"{\n        display: 'flex',\n        alignItems: 'center',\n        justifyContent: 'space-between',\n      }\"\n    >\n      <span\n        :style=\"{ display: 'flex', alignItems: 'center', color: '#1D2129' }\"\n      >\n        <a-avatar\n          :style=\"{ marginRight: '8px', backgroundColor: '#165DFF' }\"\n          :size=\"28\"\n        >\n          A\n        <\/a-avatar>\n        <a-typography-text>Username<\/a-typography-text>\n      <\/span>\n      <a-link>More<\/a-link>\n    <\/div>\n  <\/a-card>\n<\/template>";
const contentTitle = "Content.Md";
const contentDescription = "卡片可以只有内容区域。";
import gridDemo from '../../.vitepress/theme/generated/card/grid.vue';
const gridSource = "<template>\n  <a-card :bordered=\"false\" :style=\"{ width: '100%' }\">\n    <a-card-grid\n      v-for=\"(_, index) in new Array(7)\"\n      :key=\"index\"\n      :hoverable=\"index % 2 === 0\"\n      :style=\"{ width: '25%' }\"\n    >\n      <a-card\n        class=\"card-demo\"\n        title=\"SD Card\"\n        :bordered=\"false\"\n      >\n        <template #extra>\n          <a-link>More<\/a-link>\n        <\/template>\n        <p :style=\"{ margin: 0 }\">\n          {{ index % 2 === 0 ? 'Card allow to hover' : 'Card content' }}\n        <\/p>\n      <\/a-card>\n    <\/a-card-grid>\n  <\/a-card>\n<\/template>\n<style scoped>\n.card-demo {\n  width: 100%;\n}\n.card-demo :deep(.sd-card-header) {\n  border: none;\n}\n<\/style>";
const gridTitle = "Grid.Md";
const gridDescription = "通过 `Card.Grid` 来使用卡片内容区隔模式。";
import hoverableDemo from '../../.vitepress/theme/generated/card/hoverable.vue';
const hoverableSource = "<template>\n  <div :style=\"{ display: 'flex' }\">\n    <a-card :style=\"{ width: '360px' }\" title=\"SD Card\" hoverable>\n      <template #extra>\n        <a-link>More<\/a-link>\n      <\/template>\n      Card content <br />\n      Card content\n    <\/a-card>\n    <a-card\n      class=\"card-demo\"\n      title=\"Custom hover style\"\n      hoverable\n    >\n      <template #extra>\n        <a-link>More<\/a-link>\n      <\/template>\n      Card content <br />\n      Card content\n    <\/a-card>\n  <\/div>\n<\/template>\n<style scoped>\n.card-demo {\n  width: 360px;\n  margin-left: 24px;\n  transition-property: all;\n}\n.card-demo:hover {\n  transform: translateY(-4px);\n}\n<\/style>";
const hoverableTitle = "Hoverable.Md";
const hoverableDescription = "指定 `hoverable` 来为卡片添加鼠标悬浮样式，同时你可以通过样式覆盖来自定义悬浮样式。";
import innerDemo from '../../.vitepress/theme/generated/card/inner.vue';
const innerSource = "<template>\n  <a-card title=\"SD Card\">\n    <a-card :style=\"{ marginBottom: '20px' }\" title=\"Inner Card Title\">\n      <template #extra>\n        <a-link>More<\/a-link>\n      <\/template>\n      Inner Card Content\n    <\/a-card>\n    <a-card title=\"Inner Card Title\">\n      <template #extra>\n        <a-link>More<\/a-link>\n      <\/template>\n      Inner Card Content\n    <\/a-card>\n  <\/a-card>\n<\/template>";
const innerTitle = "Inner.Md";
const innerDescription = "卡片中可以嵌套其他卡片组件。";
import metaDemo from '../../.vitepress/theme/generated/card/meta.vue';
const metaSource = "<template>\n  <a-card hoverable :style=\"{ width: '360px' }\">\n    <template #cover>\n      <div\n        :style=\"{\n          height: '204px',\n          overflow: 'hidden',\n        }\"\n      >\n        <img\n          :style=\"{ width: '100%', transform: 'translateY(-20px)' }\"\n          alt=\"dessert\"\n          src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a20012a2d4d5b9db43dfc6a01fe508c0.png~tplv-uwbnlip3yd-webp.webp\"\n        />\n      <\/div>\n    <\/template>\n    <a-card-meta title=\"Card Title\">\n      <template #description>\n        Card content <br />\n        Card content\n      <\/template>\n    <\/a-card-meta>\n  <\/a-card>\n<\/template>";
const metaTitle = "Meta.Md";
const metaDescription = "使用 `Card.Meta` 支持更加灵活的内容（封面、头像、 标题、描述信息）";
import rowDemo from '../../.vitepress/theme/generated/card/row.vue';
const rowSource = "<template>\n  <div\n    :style=\"{\n      boxSizing: 'border-box',\n      width: '100%',\n      padding: '40px',\n      backgroundColor: 'var(--color-fill-2)',\n    }\"\n  >\n    <a-row :gutter=\"20\" :style=\"{ marginBottom: '20px' }\">\n      <a-col :span=\"8\">\n        <a-card title=\"SD Card\" :bordered=\"false\" :style=\"{ width: '100%' }\">\n          <template #extra>\n            <a-link>More<\/a-link>\n          <\/template>\n          Card content\n        <\/a-card>\n      <\/a-col>\n      <a-col :span=\"8\">\n        <a-card title=\"SD Card\" :bordered=\"false\" :style=\"{ width: '100%' }\">\n          <template #extra>\n            <a-link>More<\/a-link>\n          <\/template>\n          Card content\n        <\/a-card>\n      <\/a-col>\n      <a-col :span=\"8\">\n        <a-card title=\"SD Card\" :bordered=\"false\" :style=\"{ width: '100%' }\">\n          <template #extra>\n            <a-link>More<\/a-link>\n          <\/template>\n          Card content\n        <\/a-card>\n      <\/a-col>\n    <\/a-row>\n    <a-row :gutter=\"20\">\n      <a-col :span=\"16\">\n        <a-card title=\"SD Card\" :bordered=\"false\" :style=\"{ width: '100%' }\">\n          <template #extra>\n            <a-link>More<\/a-link>\n          <\/template>\n          Card content\n        <\/a-card>\n      <\/a-col>\n      <a-col :span=\"8\">\n        <a-card title=\"SD Card\" :bordered=\"false\" :style=\"{ width: '100%' }\">\n          <template #extra>\n            <a-link>More<\/a-link>\n          <\/template>\n          Card content\n        <\/a-card>\n      <\/a-col>\n    <\/a-row>\n  <\/div>\n<\/template>";
const rowTitle = "Row.Md";
const rowDescription = "在系统概览页面常常和栅格进行配合。";
</script>

## 示例

<DemoBlock :title="actionsTitle" :description="actionsDescription" :code="actionsSource"

>   <actionsDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="borderedTitle" :description="borderedDescription" :code="borderedSource"

>   <borderedDemo />
> </DemoBlock>

<DemoBlock :title="contentTitle" :description="contentDescription" :code="contentSource"

>   <contentDemo />
> </DemoBlock>

<DemoBlock :title="gridTitle" :description="gridDescription" :code="gridSource"

>   <gridDemo />
> </DemoBlock>

<DemoBlock :title="hoverableTitle" :description="hoverableDescription" :code="hoverableSource"

>   <hoverableDemo />
> </DemoBlock>

<DemoBlock :title="innerTitle" :description="innerDescription" :code="innerSource"

>   <innerDemo />
> </DemoBlock>

<DemoBlock :title="metaTitle" :description="metaDescription" :code="metaSource"

>   <metaDemo />
> </DemoBlock>

<DemoBlock :title="rowTitle" :description="rowDescription" :code="rowSource"

>   <rowDemo />
> </DemoBlock>
