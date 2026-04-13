---
title: "dropdown"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 导航
title: 下拉菜单 Dropdown
description: 页面上的命令过多时，可将备选命令收纳到向下展开的浮层容器中。
```









`<dropdown>` 组件继承 `<trigger>` 组件的全部属性

## API


### `<dropdown>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|popup-visible **(v-model)**|弹出框是否可见|`boolean`|`-`||
|default-popup-visible|弹出框默认是否可见（非受控模式）|`boolean`|`false`||
|trigger|触发方式|`'hover' \| 'click' \| 'focus' \| 'contextMenu'`|`'click'`||
|position|弹出位置|`'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br'`|`'bottom'`||
|popup-container|弹出框的挂载容器|`string \| HTMLElement`|`-`||
|popup-max-height|弹出框最大高度|`boolean\|number`|`true`|2.29.0|
|hide-on-select|是否在用户选择后隐藏弹出框|`boolean`|`true`|2.43.0|
### `<dropdown>` Events

|事件名|描述|参数|
|---|---|---|
|popup-visible-change|下拉框显示状态发生改变时触发|visible: `boolean`|
|select|用户选择时触发|value: `string \| number \| Record<string, any> \| undefined `<br>ev: `Event`|
### `<dropdown>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|content|内容|-||
|footer|页脚|-|2.10.0|




### `<doption>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|value|选项值|`string\|number\|object`|`-`|
|disabled|是否禁用|`boolean`|`false`|
### `<doption>` Events

|事件名|描述|参数|
|---|---|---|
|click|点击按钮时触发|ev: `MouseEvent`|
### `<doption>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|icon|图标|-|




### `<dgroup>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|title|分组标题|`string`|`-`|
### `<dgroup>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|title|分组标题|-|2.10.0|




### `<dsubmenu>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|value|选项值（2.16.0 版本后暂无用处）|`string\|number`|`-`||
|disabled|是否禁用|`boolean`|`false`|2.10.0|
|trigger|触发方式|`'hover' \| 'click'`|`'click'`|2.10.0|
|position|弹出位置|`'rt' \| 'lt'`|`'rt'`|2.10.0|
|popup-visible **(v-model)**|弹出框是否可见|`boolean`|`-`||
|default-popup-visible|弹出框默认是否可见（非受控模式）|`boolean`|`false`||
|option-props|自定义选项属性|`object`|`-`|2.29.0|
### `<dsubmenu>` Events

|事件名|描述|参数|
|---|---|---|
|popup-visible-change|下拉框显示状态发生改变时触发|visible: `boolean`|
### `<dsubmenu>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|icon|图标|-|2.29.0|
|content|子菜单内容|-||
|footer|页脚|-|2.10.0|




### `<dropdown-button>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|popup-visible **(v-model)**|弹出框是否可见|`boolean`|`-`|
|default-popup-visible|弹出框默认是否可见（非受控模式）|`boolean`|`false`|
|trigger|触发方式|`'hover' \| 'click' \| 'focus' \| 'contextMenu'`|`'click'`|
|position|弹出位置|`'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br'`|`'br'`|
|popup-container|弹出框的挂载容器|`string \| HTMLElement`|`-`|
|disabled|是否禁用|`boolean`|`false`|
|type|按钮类型|`string`|`-`|
|size|按钮大小|`string`|`-`|
|button-props|按钮属性|`ButtonProps`|`-`|
|hide-on-select|是否在用户选择后隐藏弹出框|`boolean`|`true`|
### `<dropdown-button>` Events

|事件名|描述|参数|
|---|---|---|
|popup-visible-change|下拉框显示状态发生改变时触发|visible: `boolean`|
|click|点击按钮时触发|ev: `MouseEvent`|
|select|用户选择时触发|value: `string \| number \| Record<string, any> \| undefined`<br>ev: `Event`|
### `<dropdown-button>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|icon|按钮图标|popupVisible: `boolean`|
|content|内容|-|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/dropdown/basic.vue';
const basicSource = "<template>\n  <a-space size=\"large\">\n    <a-dropdown @select=\"handleSelect\">\n      <a-button>Click Me<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption disabled>Option 2<\/a-doption>\n        <a-doption :value=\"{ value: 'Option3' }\">Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown @select=\"handleSelect\" disabled>\n      <a-button disabled>Click Me<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption disabled>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown @select=\"handleSelect\" :popup-max-height=\"false\">\n      <a-button>No Max Height <icon-down/><\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption disabled>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n        <a-doption>Option 4<\/a-doption>\n        <a-doption>Option 5<\/a-doption>\n        <a-doption>Option 6<\/a-doption>\n        <a-doption>Option 7<\/a-doption>\n        <a-doption>Option 8<\/a-doption>\n        <a-doption>Option 9<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const handleSelect = (v) => {\n      console.log(v)\n    };\n\n    return {\n      handleSelect\n    }\n  },\n}\n<\/script>\n\n<style>\n.arco-dropdown-open .arco-icon-down {\n  transform: rotate(180deg);\n}\n<\/style>";
const basicTitle = "Basic.Md";
const basicDescription = "下拉菜单的基本用法。下拉菜单开启后会为触发元素添加 `arco-dropdown-open` 类名。";
import buttonDemo from '../../.vitepress/theme/generated/dropdown/button.vue';
const buttonSource = "<template>\n  <a-space size=\"large\">\n    <a-dropdown-button>\n      Publish\n      <template #content>\n        <a-doption>Save now<\/a-doption>\n        <a-doption>Save and Publish<\/a-doption>\n      <\/template>\n    <\/a-dropdown-button>\n    <a-dropdown-button disabled>\n      Disabled\n      <template #content>\n        <a-doption>Save now<\/a-doption>\n        <a-doption>Save and Publish<\/a-doption>\n      <\/template>\n    <\/a-dropdown-button>\n    <a-dropdown-button>\n      Publish\n      <template #icon>\n        <icon-down />\n      <\/template>\n      <template #content>\n        <a-doption>Save now<\/a-doption>\n        <a-doption>Save and Publish<\/a-doption>\n      <\/template>\n    <\/a-dropdown-button>\n  <\/a-space>\n\n<\/template>\n\n<style>\n.arco-dropdown-open .arco-icon-down {\n  transform: rotate(180deg);\n}\n<\/style>";
const buttonTitle = "Button.Md";
const buttonDescription = "可以使用 `<dropdown-button>` 组件用来展示右边是额外相关功能菜单的按钮。\n`2.16.0` 版本添加支持。";
import contextMenuDemo from '../../.vitepress/theme/generated/dropdown/contextMenu.vue';
const contextMenuSource = "<template>\n  <a-dropdown trigger=\"contextMenu\" alignPoint :style=\"{display:'block'}\">\n    <div :style=\"{display:'flex',alignItems:'center',justifyContent:'center', height:'300px',backgroundColor:'var(--color-fill-2)'}\">\n      <div>Click Me<\/div>\n    <\/div>\n    <template #content>\n      <a-doption>Option 1<\/a-doption>\n      <a-doption>Option 2<\/a-doption>\n      <a-doption>Option 3<\/a-doption>\n    <\/template>\n  <\/a-dropdown>\n<\/template>";
const contextMenuTitle = "Context Menu.Md";
const contextMenuDescription = "移入区域后，可点击鼠标右键触发。";
import groupDemo from '../../.vitepress/theme/generated/dropdown/group.vue';
const groupSource = "<template>\n  <a-dropdown>\n    <a-button>Click Me<\/a-button>\n    <template #content>\n      <a-dgroup title=\"Group 1\">\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/a-dgroup>\n      <a-dgroup title=\"Group 2\">\n        <a-doption>Option 4<\/a-doption>\n        <a-doption>Option 5<\/a-doption>\n        <a-doption>Option 6<\/a-doption>\n      <\/a-dgroup>\n    <\/template>\n  <\/a-dropdown>\n<\/template>";
const groupTitle = "Group.Md";
const groupDescription = "通过 `<dgroup>` 组件使用分组选项。";
import iconDemo from '../../.vitepress/theme/generated/dropdown/icon.vue';
const iconSource = "<template>\n  <a-dropdown>\n    <a-button>Click Me<\/a-button>\n    <template #content>\n      <a-doption>\n        <template #icon>\n          <icon-location />\n        <\/template>\n        <template #default>Option 1<\/template>\n      <\/a-doption>\n      <a-doption>\n        <template #icon>\n          <icon-location />\n        <\/template>\n        <template #default>Option 2<\/template>\n      <\/a-doption>\n      <a-doption>\n        <template #icon>\n          <icon-location />\n        <\/template>\n        <template #default>Option 3<\/template>\n      <\/a-doption>\n    <\/template>\n  <\/a-dropdown>\n<\/template>";
const iconTitle = "Icon.Md";
const iconDescription = "通过 `icon` 插槽在选项前添加图标。";
import positionDemo from '../../.vitepress/theme/generated/dropdown/position.vue';
const positionSource = "<template>\n  <a-space>\n    <a-dropdown position=\"bl\">\n      <a-button>Bottom Left<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown position=\"bottom\">\n      <a-button>Bottom<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown position=\"br\">\n      <a-button>Bottom Right<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown position=\"tl\">\n      <a-button>Top Left<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown position=\"top\">\n      <a-button>Top<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown position=\"tr\">\n      <a-button>Top Right<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n  <\/a-space>\n<\/template>";
const positionTitle = "Position.Md";
const positionDescription = "通过 `position` 支持指定 6 种弹出方位，分别是：top: 向上, tl: 左上, tr: 右上, bottom: 下方(默认), bl: 左下, br: 右下。";
import submenuDemo from '../../.vitepress/theme/generated/dropdown/submenu.vue';
const submenuSource = "<template>\n  <a-dropdown>\n    <a-button>Click Me<\/a-button>\n    <template #content>\n      <a-doption>Option 1<\/a-doption>\n      <a-dsubmenu value=\"option-1\">\n        <template #default>Option 2<\/template>\n        <template #content>\n          <a-doption>Option 2-1<\/a-doption>\n          <a-dsubmenu value=\"option-2-2\" trigger=\"hover\">\n            <template #default>Option 2-2<\/template>\n            <template #content>\n              <a-doption>Option 2-1<\/a-doption>\n              <a-doption>Option 2-2<\/a-doption>\n              <a-doption>Option 2-3<\/a-doption>\n            <\/template>\n            <template #footer>\n              <div style=\"padding: 6px; text-align: center;\">\n                <a-button>Click<\/a-button>\n              <\/div>\n            <\/template>\n          <\/a-dsubmenu>\n          <a-doption>Option 2-3<\/a-doption>\n        <\/template>\n      <\/a-dsubmenu>\n      <a-doption>Option 3<\/a-doption>\n    <\/template>\n  <\/a-dropdown>\n<\/template>";
const submenuTitle = "Submenu.Md";
const submenuDescription = "带有多级菜单的下拉框。";
import triggerDemo from '../../.vitepress/theme/generated/dropdown/trigger.vue';
const triggerSource = "<template>\n  <a-space size=\"large\">\n    <a-dropdown>\n      <a-button>Click Me<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n    <a-dropdown trigger=\"hover\">\n      <a-button>Hover Me<\/a-button>\n      <template #content>\n        <a-doption>Option 1<\/a-doption>\n        <a-doption>Option 2<\/a-doption>\n        <a-doption>Option 3<\/a-doption>\n      <\/template>\n    <\/a-dropdown>\n  <\/a-space>\n<\/template>";
const triggerTitle = "Trigger.Md";
const triggerDescription = "通过 `trigger` 指定触发方式。";
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
  :title="buttonTitle"
  :description="buttonDescription"
  :code="buttonSource"
>
  <buttonDemo />
</DemoBlock>

<DemoBlock
  :title="contextMenuTitle"
  :description="contextMenuDescription"
  :code="contextMenuSource"
>
  <contextMenuDemo />
</DemoBlock>

<DemoBlock
  :title="groupTitle"
  :description="groupDescription"
  :code="groupSource"
>
  <groupDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="positionTitle"
  :description="positionDescription"
  :code="positionSource"
>
  <positionDemo />
</DemoBlock>

<DemoBlock
  :title="submenuTitle"
  :description="submenuDescription"
  :code="submenuSource"
>
  <submenuDemo />
</DemoBlock>

<DemoBlock
  :title="triggerTitle"
  :description="triggerDescription"
  :code="triggerSource"
>
  <triggerDemo />
</DemoBlock>
