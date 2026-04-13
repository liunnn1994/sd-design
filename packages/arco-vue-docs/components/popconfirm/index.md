---
title: "popconfirm"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 反馈
title: 气泡确认框 Popconfirm
description: 点击元素，弹出气泡式的确认框。
```





`<popconfirm>` 组件继承 `<trigger>` 组件的全部属性

## API


### `<popconfirm>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|content|内容|`string`|`-`|
|position|弹出位置|`'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br' \| 'left' \| 'lt' \| 'lb' \| 'right' \| 'rt' \| 'rb'`|`'top'`|
|popup-visible **(v-model)**|气泡确认框是否可见|`boolean`|`-`|
|default-popup-visible|气泡确认框默认是否可见（非受控模式）|`boolean`|`false`|
|type|气泡确认框的类型|`'info' \| 'success' \| 'warning' \| 'error'`|`'info'`|
|ok-text|确认按钮的内容|`string`|`-`|
|cancel-text|取消按钮的内容|`string`|`-`|
|ok-loading|确认按钮是否为加载中状态|`boolean`|`false`|
|ok-button-props|确认按钮的Props|`ButtonProps`|`-`|
|cancel-button-props|取消按钮的Props|`ButtonProps`|`-`|
|content-class|弹出框内容的类名|`ClassName`|`-`|
|content-style|弹出框内容的样式|`CSSProperties`|`-`|
|arrow-class|弹出框箭头的类名|`ClassName`|`-`|
|arrow-style|弹出框箭头的样式|`CSSProperties`|`-`|
|popup-container|弹出框的挂载点|`string \| HTMLElement`|`-`|
|on-before-ok|触发 ok 事件前的回调函数。如果返回 false 则不会触发后续事件，也可使用 done 进行异步关闭。|`(  done: (closed: boolean) => void) => void \| boolean \| Promise<void \| boolean>`|`-`|
|on-before-cancel|触发 cancel 事件前的回调函数。如果返回 false 则不会触发后续事件。|`() => boolean`|`-`|
### `<popconfirm>` Events

|事件名|描述|参数|
|---|---|---|
|popup-visible-change|气泡确认框的显隐状态改变时触发|visible: `boolean`|
|ok|点击确认按钮时触发|-|
|cancel|点击取消按钮时触发|-|
### `<popconfirm>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|icon|图标|-|
|content|内容|-|

<script setup lang="ts">
import asyncDemo from '../../.vitepress/theme/generated/popconfirm/async.vue';
const asyncSource = "<template>\n  <a-popconfirm @before-ok=\"handleBeforeOk\">\n    <a-button>Click To Show<\/a-button>\n    <template #content>\n      <a-form>\n        <a-form-item label=\"Name\">\n          <a-input/>\n        <\/a-form-item>\n        <a-form-item label=\"Post\">\n          <a-input/>\n        <\/a-form-item>\n      <\/a-form>\n    <\/template>\n  <\/a-popconfirm>\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst visible = ref(false)\n\nconst handleClick = () => {\n  visible.value = true;\n}\n\nconst handleBeforeOk = (done) => {\n  window.setTimeout(() => {\n    done()\n  }, 3000)\n}\n\nconst handleCancel = () => {\n  visible.value = false;\n}\n<\/script>";
const asyncTitle = "Async.Md";
const asyncDescription = "可以通过 on-before-ok 更简洁的实现异步关闭功能";
import basicDemo from '../../.vitepress/theme/generated/popconfirm/basic.vue';
const basicSource = "<template>\n  <a-popconfirm content=\"Are you sure you want to delete?\">\n    <a-button>Click To Delete<\/a-button>\n  <\/a-popconfirm>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "气泡确认框的基本用法。";
import customDemo from '../../.vitepress/theme/generated/popconfirm/custom.vue';
const customSource = "<template>\n  <a-popconfirm content=\"Do you want to discard the draft?\" okText=\"Discard\" cancelText=\"No\">\n    <a-button>Discard<\/a-button>\n  <\/a-popconfirm>\n<\/template>";
const customTitle = "Custom.Md";
const customDescription = "自定义按钮的文字或图标。";
import positionDemo from '../../.vitepress/theme/generated/popconfirm/position.vue';
const positionSource = "<template>\n  <div :style=\"{position: 'relative', width: '440px', height: '280px'}\">\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"tl\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'70px'}\">TL<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"top\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'180px'}\">TOP<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"tr\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'0',left:'290px'}\">TR<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"bl\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'70px'}\">BL<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"bottom\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'180px'}\">BOTTOM<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"br\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'240px',left:'290px'}\">BR<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"lt\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'60px',left:'10px'}\">LT<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"left\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'120px',left:'10px'}\">LEFT<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"lb\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'180px',left:'10px'}\">LB<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"rt\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'60px',left:'350px'}\">RT<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"right\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'120px',left:'350px'}\">RIGHT<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"This is a Popconfirm\" position=\"rb\">\n      <a-button class=\"button\" :style=\"{position: 'absolute',top:'180px',left:'350px'}\">RB<\/a-button>\n    <\/a-popconfirm>\n  <\/div>\n<\/template>\n\n<style scoped lang=\"less\">\n.button{\n  width: 100px;\n}\n<\/style>";
const positionTitle = "Position.Md";
const positionDescription = "`popconfirm` 支持 12 个不同的方位。分别为：`上左` `上` `上右` `下左` `下` `下右` `左上` `左` `左下` `右上` `右` `右下`。";
import typeDemo from '../../.vitepress/theme/generated/popconfirm/type.vue';
const typeSource = "<template>\n  <a-space>\n    <a-popconfirm content=\"Are you sure you want to delete?\" type=\"info\">\n      <a-button>Click To Delete<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"Are you sure you want to delete?\" type=\"success\">\n      <a-button>Click To Delete<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"Are you sure you want to delete?\" type=\"warning\">\n      <a-button>Click To Delete<\/a-button>\n    <\/a-popconfirm>\n    <a-popconfirm content=\"Are you sure you want to delete?\" type=\"error\">\n      <a-button>Click To Delete<\/a-button>\n    <\/a-popconfirm>\n  <\/a-space>\n<\/template>";
const typeTitle = "Type.Md";
const typeDescription = "通过 `type` 属性可以设置确认框类型。";
</script>

## 示例


<DemoBlock
  :title="asyncTitle"
  :description="asyncDescription"
  :code="asyncSource"
>
  <asyncDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="customTitle"
  :description="customDescription"
  :code="customSource"
>
  <customDemo />
</DemoBlock>

<DemoBlock
  :title="positionTitle"
  :description="positionDescription"
  :code="positionSource"
>
  <positionDemo />
</DemoBlock>

<DemoBlock
  :title="typeTitle"
  :description="typeDescription"
  :code="typeSource"
>
  <typeDemo />
</DemoBlock>
