---
title: "popover"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 气泡卡片 Popover
description: 鼠标悬停、聚焦或点击在某个组件时，弹出的气泡式的卡片浮层。可以对卡片上的元素进行操作。
```




`<popover>` 组件继承 `<trigger>` 组件的全部属性

## API


### `<popover>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|popup-visible **(v-model)**|文字气泡是否可见|`boolean`|`-`|
|default-popup-visible|文字气泡默认是否可见（非受控模式）|`boolean`|`false`|
|title|标题|`string`|`-`|
|content|内容|`string`|`-`|
|trigger|触发方式|`'hover' \| 'click' \| 'focus' \| 'contextMenu'`|`'hover'`|
|position|弹出位置|`'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br' \| 'left' \| 'lt' \| 'lb' \| 'right' \| 'rt' \| 'rb'`|`'top'`|
|content-class|弹出框内容的类名|`ClassName`|`-`|
|content-style|弹出框内容的样式|`CSSProperties`|`-`|
|arrow-class|弹出框箭头的类名|`ClassName`|`-`|
|arrow-style|弹出框箭头的样式|`CSSProperties`|`-`|
|popup-container|弹出框的挂载容器|`string \| HTMLElement`|`-`|
### `<popover>` Events

|事件名|描述|参数|
|---|---|---|
|popup-visible-change|文字气泡显示状态改变时触发|visible: `boolean`|
### `<popover>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|title|标题|-|
|content|内容|-|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/popover/basic.vue';
const basicSource = "<template>\n  <a-popover title=\"Title\">\n    <a-button>Hover<\/a-button>\n    <template #content>\n      <p>Here is the text content<\/p>\n      <p>Here is the text content<\/p>\n    <\/template>\n  <\/a-popover>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "鼠标移入或点击，弹出气泡，可对浮层上元素进行操作，承载复杂内容和操作。";
import positionDemo from '../../.vitepress/theme/generated/popover/position.vue';
const positionSource = "<template>\n  <div :style=\"{position: 'relative', width: '440px', height: '280px'}\">\n    <a-popover position=\"tl\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'70px'}\">TL<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"top\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'180px'}\">TOP<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"tr\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'290px'}\">TR<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"bl\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'70px'}\">BL<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"bottom\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'180px'}\">BOTTOM<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"br\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'290px'}\">BR<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"lt\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'60px',left:'10px'}\">LT<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"left\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'120px',left:'10px'}\">LEFT<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"lb\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'180px',left:'10px'}\">LB<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"rt\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'60px',left:'350px'}\">RT<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"right\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'120px',left:'350px'}\">RIGHT<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover position=\"rb\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'180px',left:'350px'}\">RB<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n  <\/div>\n<\/template>\n\n<style scoped lang=\"less\">\n.button{\n  width: 100px;\n}\n<\/style>";
const positionTitle = "Position.Md";
const positionDescription = "`Popover`支持 12 个不同的方位。分别为：`上左` `上` `上右` `下左` `下` `下右` `左上` `左` `左下` `右上` `右` `右下`。";
import triggerDemo from '../../.vitepress/theme/generated/popover/trigger.vue';
const triggerSource = "<template>\n  <a-space>\n    <a-popover title=\"Title\">\n      <a-button>Hover Me<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n    <a-popover title=\"Title\" trigger=\"click\">\n      <a-button>Click Me<\/a-button>\n      <template #content>\n        <p>Here is the text content<\/p>\n        <p>Here is the text content<\/p>\n      <\/template>\n    <\/a-popover>\n  <\/a-space>\n<\/template>";
const triggerTitle = "Trigger.Md";
const triggerDescription = "通过设置 `trigger`，可以指定不同的触发方式。";
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
  :title="positionTitle"
  :description="positionDescription"
  :code="positionSource"
>
  <positionDemo />
</DemoBlock>

<DemoBlock
  :title="triggerTitle"
  :description="triggerDescription"
  :code="triggerSource"
>
  <triggerDemo />
</DemoBlock>
