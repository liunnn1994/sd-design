---
title: 'tooltip'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 文字气泡 Tooltip
description: 鼠标悬停、聚焦或点击在某个组件时，弹出的文字提示。
```

`<tooltip>` 组件继承 `<trigger>` 组件的全部属性

## API

### `<tooltip>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| popup-visible **(v-model)** | 文字气泡是否可见 | `boolean` | `-` |
| default-popup-visible | 文字气泡默认是否可见（非受控模式） | `boolean` | `false` |
| disabled | 文字气泡是否禁用 | `boolean` | `false` |
| content | 文字气泡内容 | `string` | `-` |
| position | 弹出位置 | `'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br' \| 'left' \| 'lt' \| 'lb' \| 'right' \| 'rt' \| 'rb'` | `'top'` |
| mini | 是否展示为迷你尺寸 | `boolean` | `false` |
| background-color | 弹出框的背景颜色 | `string` | `-` |
| content-class | 弹出框内容的类名 | `ClassName` | `-` |
| content-style | 弹出框内容的样式 | `CSSProperties` | `-` |
| arrow-class | 弹出框箭头的类名 | `ClassName` | `-` |
| arrow-style | 弹出框箭头的样式 | `CSSProperties` | `-` |
| popup-container | 弹出框的挂载容器 | `string \| HTMLElement` | `-` |

### `<tooltip>` Events

| 事件名               | 描述                       | 参数               |
| -------------------- | -------------------------- | ------------------ |
| popup-visible-change | 文字气泡显示状态改变时触发 | visible: `boolean` |

### `<tooltip>` Slots

| 插槽名  | 描述 | 参数 |
| ------- | :--: | ---- |
| content | 内容 | -    |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/tooltip/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-tooltip content=\"This is tooltip content\">\n      <a-button>Mouse over to display tooltip<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a two-line tooltip content.This is a two-line tooltip content.\">\n      <a-button>Mouse over to display tooltip<\/a-button>\n    <\/a-tooltip>\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "鼠标移入，气泡出现，鼠标移出，气泡消失。";
import colorDemo from '../../.vitepress/theme/generated/tooltip/color.vue';
const colorSource = "<template>\n  <a-space>\n    <a-tooltip content=\"This is tooltip content\" background-color=\"#3491FA\">\n      <a-button>#3491FA<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is tooltip content\" background-color=\"#165DFF\">\n      <a-button>#165DFF<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is tooltip content\" background-color=\"#722ED1\">\n      <a-button>#722ED1<\/a-button>\n    <\/a-tooltip>\n  <\/a-space>\n<\/template>";
const colorTitle = "Color.Md";
const colorDescription = "通过 `background-color` 属性自定义背景颜色。";
import miniDemo from '../../.vitepress/theme/generated/tooltip/mini.vue';
const miniSource = "<template>\n  <a-tooltip content=\"1234\" position=\"top\" mini>\n    <a-button>Mouse over to display tooltip<\/a-button>\n  <\/a-tooltip>\n<\/template>";
const miniTitle = "Mini.Md";
const miniDescription = "适用于小场景或数字气泡样式。";
import positionDemo from '../../.vitepress/theme/generated/tooltip/position.vue';
const positionSource = "<template>\n  <div :style=\"{position: 'relative', width: '440px', height: '280px'}\">\n    <a-tooltip content=\"This is a Tooltip\" position=\"tl\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'70px'}\">TL<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"top\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'180px'}\">TOP<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"tr\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'290px'}\">TR<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"bl\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'70px'}\">BL<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"bottom\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'180px'}\">BOTTOM<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"br\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'290px'}\">BR<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"lt\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'60px',left:'10px'}\">LT<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"left\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'120px',left:'10px'}\">LEFT<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"lb\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'180px',left:'10px'}\">LB<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"rt\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'60px',left:'350px'}\">RT<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"right\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'120px',left:'350px'}\">RIGHT<\/a-button>\n    <\/a-tooltip>\n    <a-tooltip content=\"This is a Tooltip\" position=\"rb\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'180px',left:'350px'}\">RB<\/a-button>\n    <\/a-tooltip>\n  <\/div>\n<\/template>\n\n<style scoped>\n.button {\n  width: 100px;\n}\n<\/style>";
const positionTitle = "Position.Md";
const positionDescription = "文字气泡支持 12 个不同的方位。分别为：`上左`、`上`、`上右`、`下左`、`下`、`下右`、`左上`、`左`、`左下`、`右上`、`右`、`右下`。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="colorTitle" :description="colorDescription" :code="colorSource"

>   <colorDemo />
> </DemoBlock>

<DemoBlock :title="miniTitle" :description="miniDescription" :code="miniSource"

>   <miniDemo />
> </DemoBlock>

<DemoBlock :title="positionTitle" :description="positionDescription" :code="positionSource"

>   <positionDemo />
> </DemoBlock>
