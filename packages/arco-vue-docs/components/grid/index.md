---
title: "grid"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 布局
title: 栅格 Grid
description: 栅格可以有效的保证页面的一致性、逻辑性、加强团队协作和统一。
```












## API


### `<row>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|gutter|栅格间隔，单位是`px` 栅格间隔。可传入响应式对象写法 { xs: 4, sm: 6, md: 12}，传入数组 [ 水平间距， 垂直间距 ] 来设置两个方向。|`number\| ResponsiveValue\| [number \| ResponsiveValue, number \| ResponsiveValue]`|`0`||
|justify|水平对齐方式 (`justify-content`)|`'start' \| 'center' \| 'end' \| 'space-around' \| 'space-between'`|`'start'`||
|align|竖直对齐方式 ( `align-items` )|`'start' \| 'center' \| 'end' \| 'stretch'`|`'start'`||
|div|开启这个选项`Row`和`Col`都会被当作div而不会附带任何Grid相关的类和样式|`boolean`|`false`||
|wrap|`Col` 是否支持换行|`boolean`|`true`|2.13.0|




### `<col>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|span|栅格占位格数|`number`|`24`||
|offset|栅格左侧的间隔格数，间隔内不可以有栅格|`number`|`-`||
|order|对元素进行排序|`number`|`-`||
|xs|< 576px 响应式栅格|`number \| { [key: string]: any }`|`-`||
|sm|>= 576px 响应式栅格|`number \| { [key: string]: any }`|`-`||
|md|>= 768px 响应式栅格|`number \| { [key: string]: any }`|`-`||
|lg|>= 992px 响应式栅格|`number \| { [key: string]: any }`|`-`||
|xl|>= 1200px 响应式栅格|`number \| { [key: string]: any }`|`-`||
|xxl|>= 1600px 响应式栅格|`number \| { [key: string]: any }`|`-`||
|flex|设置 flex 布局属性|`number \| string \| 'initial' \| 'auto' \| 'none'`|`-`|2.10.0|




### `<grid>` Props (2.15.0)
响应式配置从 `2.18.0` 开始支持，具体配置 [ResponsiveValue](#responsivevalue)

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|cols|每一行展示的列数|`number \| ResponsiveValue`|`24`|
|row-gap|行与行之间的间距|`number \| ResponsiveValue`|`0`|
|col-gap|列与列之间的间距|`number \| ResponsiveValue`|`0`|
|collapsed|是否折叠|`boolean`|`false`|
|collapsed-rows|折叠时显示的行数|`number`|`1`|




### `<grid-item>` Props (2.15.0)
响应式配置从 `2.18.0` 开始支持，具体配置 [ResponsiveValue](#responsivevalue)

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|span|跨越的格数|`number \| ResponsiveValue`|`1`|
|offset|左侧的间隔格数|`number \| ResponsiveValue`|`0`|
|suffix|是否是后缀元素|`boolean`|`false`|




### ResponsiveValue

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|xxl|>= 1600px 响应式配置|`number`|`-`|
|xl|>= 1200px 响应式配置|`number`|`-`|
|lg|>= 992px 响应式配置|`number`|`-`|
|md|>= 768px 响应式配置|`number`|`-`|
|sm|>= 576px 响应式配置|`number`|`-`|
|xs|< 576px 响应式配置|`number`|`-`|

<script setup lang="ts">
import adaptationObjectDemo from '../../.vitepress/theme/generated/grid/adaptationObject.vue';
const adaptationObjectSource = "<template>\n  <div>\n    <a-row class=\"grid-demo\">\n      <a-col :xs=\"{span: 5, offset: 1}\" :lg=\"{span: 6, offset: 2}\">\n        Col\n      <\/a-col>\n      <a-col :xs=\"{span: 11, offset: 1}\" :lg=\"{span: 6, offset: 2}\">\n        Col\n      <\/a-col>\n      <a-col :xs=\"{span: 5, offset: 1}\" :lg=\"{span: 6, offset: 2}\">\n        Col\n      <\/a-col>\n    <\/a-row>\n  <\/div>\n<\/template>\n\n<style scoped>\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const adaptationObjectTitle = "Adaptation Object.Md";
const adaptationObjectDescription = "`span`, `offset`, `order` 属性可以内嵌到 `xs`, `sm`, `md`, `lg`, `xl`, `xxl` 对象中使用。\n比如 `:xs=\"8\"` 相当于 `:xs=\"{ span: 8 }\"`。";
import adaptationDemo from '../../.vitepress/theme/generated/grid/adaptation.vue';
const adaptationSource = "<template>\n  <a-row class=\"grid-demo\">\n    <a-col :xs=\"2\" :sm=\"4\" :md=\"6\" :lg=\"8\" :xl=\"10\" :xxl=\"8\">\n      Col\n    <\/a-col>\n    <a-col :xs=\"20\" :sm=\"16\" :md=\"12\" :lg=\"8\" :xl=\"4\" :xxl=\"8\">\n      Col\n    <\/a-col>\n    <a-col :xs=\"2\" :sm=\"4\" :md=\"6\" :lg=\"8\" :xl=\"10\" :xxl=\"8\">\n      Col\n    <\/a-col>\n  <\/a-row>\n<\/template>\n\n<style scoped>\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const adaptationTitle = "Adaptation.Md";
const adaptationDescription = "预置六种响应尺寸, 分别为 `xs`, `sm`, `md`, `lg`, `xl`, `xxl`。";
import basicDemo from '../../.vitepress/theme/generated/grid/basic.vue';
const basicSource = "<template>\n  <div class=\"grid-demo-background\">\n    <a-space direction=\"vertical\" :size=\"16\" style=\"display: block;\">\n      <a-row class=\"grid-demo\">\n        <a-col :span=\"24\">\n          <div>24 - 100%<\/div>\n        <\/a-col>\n      <\/a-row>\n      <a-row class=\"grid-demo\">\n        <a-col :span=\"12\">\n          <div>12 - 50%<\/div>\n        <\/a-col>\n        <a-col :span=\"12\">\n          <div>12 - 50%<\/div>\n        <\/a-col>\n      <\/a-row>\n      <a-row class=\"grid-demo\">\n        <a-col :span=\"8\">\n          <div>8 - 33.33%<\/div>\n        <\/a-col>\n        <a-col :span=\"8\">\n          <div>8 - 33.33%<\/div>\n        <\/a-col>\n        <a-col :span=\"8\">\n          <div>8 - 33.33%<\/div>\n        <\/a-col>\n      <\/a-row>\n      <a-row class=\"grid-demo\">\n        <a-col :span=\"6\">\n          <div>6 - 25%<\/div>\n        <\/a-col>\n        <a-col :span=\"6\">\n          <div>6 - 25%<\/div>\n        <\/a-col>\n        <a-col :span=\"6\">\n          <div>6 - 25%<\/div>\n        <\/a-col>\n        <a-col :span=\"6\">\n          <div>6 - 25%<\/div>\n        <\/a-col>\n      <\/a-row>\n      <a-row class=\"grid-demo\">\n        <a-col :span=\"4\">\n          <div>4 - 16.66%<\/div>\n        <\/a-col>\n        <a-col :span=\"4\">\n          <div>4 - 16.66%<\/div>\n        <\/a-col>\n        <a-col :span=\"4\">\n          <div>4 - 16.66%<\/div>\n        <\/a-col>\n        <a-col :span=\"4\">\n          <div>4 - 16.66%<\/div>\n        <\/a-col>\n        <a-col :span=\"4\">\n          <div>4 - 16.66%<\/div>\n        <\/a-col>\n        <a-col :span=\"4\">\n          <div>4 - 16.66%<\/div>\n        <\/a-col>\n      <\/a-row>\n    <\/a-space>\n  <\/div>\n<\/template>\n\n<style scoped>\n.grid-demo-background {\n  background-image: linear-gradient(\n    90deg,\n    var(--color-fill-2) 4.16666667%,\n    transparent 4.16666667%,\n    transparent 8.33333333%,\n    var(--color-fill-2) 8.33333333%,\n    var(--color-fill-2) 12.5%,\n    transparent 12.5%,\n    transparent 16.66666667%,\n    var(--color-fill-2) 16.66666667%,\n    var(--color-fill-2) 20.83333333%,\n    transparent 20.83333333%,\n    transparent 25%,\n    var(--color-fill-2) 25%,\n    var(--color-fill-2) 29.16666667%,\n    transparent 29.16666667%,\n    transparent 33.33333333%,\n    var(--color-fill-2) 33.33333333%,\n    var(--color-fill-2) 37.5%,\n    transparent 37.5%,\n    transparent 41.66666667%,\n    var(--color-fill-2) 41.66666667%,\n    var(--color-fill-2) 45.83333333%,\n    transparent 45.83333333%,\n    transparent 50%,\n    var(--color-fill-2) 50%,\n    var(--color-fill-2) 54.16666667%,\n    transparent 54.16666667%,\n    transparent 58.33333333%,\n    var(--color-fill-2) 58.33333333%,\n    var(--color-fill-2) 62.5%,\n    transparent 62.5%,\n    transparent 66.66666667%,\n    var(--color-fill-2) 66.66666667%,\n    var(--color-fill-2) 70.83333333%,\n    transparent 70.83333333%,\n    transparent 75%,\n    var(--color-fill-2) 75%,\n    var(--color-fill-2) 79.16666667%,\n    transparent 79.16666667%,\n    transparent 83.33333333%,\n    var(--color-fill-2) 83.33333333%,\n    var(--color-fill-2) 87.5%,\n    transparent 87.5%,\n    transparent 91.66666667%,\n    var(--color-fill-2) 91.66666667%,\n    var(--color-fill-2) 95.83333333%,\n    transparent 95.83333333%\n  );\n}\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const basicTitle = "Basic.Md";
const basicDescription = "展示了最基本的 24 等分应用。";
import flexAlignDemo from '../../.vitepress/theme/generated/grid/flexAlign.vue';
const flexAlignSource = "<template>\n  <div>\n    <p>Arrange top<\/p>\n    <a-row class=\"grid-demo\" align=\"start\">\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Arrange center<\/p>\n    <a-row class=\"grid-demo\" align=\"center\">\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Arrange bottom<\/p>\n    <a-row class=\"grid-demo\" align=\"end\">\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n    <\/a-row>\n  <\/div>\n<\/template>\n\n<style scoped>\n.grid-demo {\n  background-color: var(--color-fill-2);\n  margin-bottom: 40px;\n}\n.grid-demo:last-child {\n  margin-bottom: 0px;\n}\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo .arco-col:nth-of-type(1) {\n  height: 90px;\n  line-height: 90px;\n}\n.grid-demo .arco-col:nth-of-type(2) {\n  height: 48px;\n  line-height: 48px;\n}\n.grid-demo .arco-col:nth-of-type(3) {\n  height: 120px;\n  line-height: 120px;\n}\n.grid-demo .arco-col:nth-of-type(4) {\n  height: 60px;\n  line-height: 60px;\n}\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const flexAlignTitle = "Flex Align.Md";
const flexAlignDescription = "通过 `align` 来进行垂直布局。";
import flexJustifyDemo from '../../.vitepress/theme/generated/grid/flexJustify.vue';
const flexJustifySource = "<template>\n  <div>\n    <p>Arrange left<\/p>\n    <a-row class=\"grid-demo\" justify=\"start\">\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Arrange center<\/p>\n    <a-row class=\"grid-demo\" justify=\"center\">\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Arrange right<\/p>\n    <a-row class=\"grid-demo\" justify=\"end\">\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Space around<\/p>\n    <a-row class=\"grid-demo\" justify=\"space-around\">\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Space between<\/p>\n    <a-row class=\"grid-demo\" justify=\"space-between\">\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n      <a-col :span=\"4\">\n        <div>col - 4<\/div>\n      <\/a-col>\n    <\/a-row>\n  <\/div>\n<\/template>\n\n<style scoped>\n.grid-demo {\n  background-color: var(--color-fill-2);\n  margin-bottom: 40px;\n}\n.grid-demo:last-child {\n  margin-bottom: 0px;\n}\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const flexJustifyTitle = "Flex Justify.Md";
const flexJustifyDescription = "通过 `justify` 来进行水平布局。";
import flexDemo from '../../.vitepress/theme/generated/grid/flex.vue';
const flexSource = "<template>\n  <a-row class=\"grid-demo\" style=\"margin-bottom: 16px;\">\n    <a-col flex=\"100px\">\n      <div>100px<\/div>\n    <\/a-col>\n    <a-col flex=\"auto\">\n      <div>auto<\/div>\n    <\/a-col>\n  <\/a-row>\n  <a-row class=\"grid-demo\" style=\"margin-bottom: 16px;\">\n    <a-col flex=\"100px\">\n      <div>100px<\/div>\n    <\/a-col>\n    <a-col flex=\"auto\">\n      <div>auto<\/div>\n    <\/a-col>\n    <a-col flex=\"100px\">\n      <div>100px<\/div>\n    <\/a-col>\n  <\/a-row>\n  <a-row class=\"grid-demo\" style=\"margin-bottom: 16px;\">\n    <a-col :flex=\"3\">\n      <div>3 / 12<\/div>\n    <\/a-col>\n    <a-col :flex=\"4\">\n      <div>4 / 12<\/div>\n    <\/a-col>\n    <a-col :flex=\"5\">\n      <div>5 / 12<\/div>\n    <\/a-col>\n  <\/a-row>\n<\/template>\n\n<style scoped>\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n<\/style>";
const flexTitle = "Flex.Md";
const flexDescription = "通过设置 `Col` 组件的 `flex` 属性，可以任意配置 flex 布局。";
import gridResponsiveDemo from '../../.vitepress/theme/generated/grid/gridResponsive.vue';
const gridResponsiveSource = "<template>\n  <a-grid :cols=\"{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }\" :colGap=\"12\" :rowGap=\"16\" class=\"grid-demo-grid\">\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\" :span=\"{ xl: 4, xxl: 6 }\" suffix>\n      suffix\n    <\/a-grid-item>\n  <\/a-grid>\n<\/template>\n\n<style scoped>\n.grid-demo-grid .demo-item,\n.grid-demo-grid .demo-suffix {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo-grid .demo-item:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo-grid .demo-item:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const gridResponsiveTitle = "Grid Responsive.Md";
const gridResponsiveDescription = "Grid 组件的响应式配置格式为 `{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }`。";
import gridDemo from '../../.vitepress/theme/generated/grid/grid.vue';
const gridSource = "<template>\n  <div style=\"margin-bottom: 20px;\">\n    <a-typography-text>折叠：<\/a-typography-text>\n    <a-switch :checked=\"collapsed\" @click=\"collapsed = !collapsed\" />\n  <\/div>\n  <a-grid :cols=\"3\" :colGap=\"12\" :rowGap=\"16\" class=\"grid-demo-grid\" :collapsed=\"collapsed\">\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\" :offset=\"1\">item | offset - 1<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\" :span=\"3\">item | span - 3<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\">item<\/a-grid-item>\n    <a-grid-item class=\"demo-item\" suffix #=\"{ overflow }\">\n      suffix | overflow: {{ overflow }}\n    <\/a-grid-item>\n  <\/a-grid>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const collapsed = ref(false);\n\n    return {\n      collapsed\n    }\n  },\n}\n<\/script>\n\n<style scoped>\n.grid-demo-grid .demo-item,\n.grid-demo-grid .demo-suffix {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n\n.grid-demo-grid .demo-item:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n\n.grid-demo-grid .demo-item:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const gridTitle = "Grid.Md";
const gridDescription = "基于 CSS 的 Grid 布局实现的布局组件，支持折叠，并且可以设置后缀节点，后缀节点会显示在一行的结尾。";
import gutterDemo from '../../.vitepress/theme/generated/grid/gutter.vue';
const gutterSource = "<template>\n  <div>\n    <p>Horizontal<\/p>\n    <a-row class=\"grid-demo\" :gutter=\"24\">\n      <a-col :span=\"12\">\n        <div>col - 12<\/div>\n      <\/a-col>\n      <a-col :span=\"12\">\n        <div>col - 12<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Responsive<\/p>\n    <a-row class=\"grid-demo\" :gutter=\"{ md: 8, lg: 24, xl: 32 }\">\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n    <\/a-row>\n    <p>Horizontal and Vertical<\/p>\n    <a-row class=\"grid-demo\" :gutter=\"[24, 12]\">\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <div>col - 6<\/div>\n      <\/a-col>\n    <\/a-row>\n  <\/div>\n<\/template>\n\n<style scoped>\n.grid-demo .arco-col {\n  height: 48px;\n  color: var(--color-white);\n}\n.grid-demo .arco-col > div {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n}\n.grid-demo .arco-col:nth-child(2n) > div {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) > div {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const gutterTitle = "Gutter.Md";
const gutterDescription = "通过在 `Row` 上指定 `gutter` 可以增加栅格的区域间隔。";
import offsetDemo from '../../.vitepress/theme/generated/grid/offset.vue';
const offsetSource = "<template>\n  <div>\n    <a-row class=\"grid-demo\" style=\"marginBottom: 16px; backgroundColor: var(--color-fill-2);\">\n      <a-col :span=\"8\">col - 8<\/a-col>\n      <a-col :span=\"8\" :offset=\"8\">\n        col - 8 | offset - 8\n      <\/a-col>\n    <\/a-row>\n    <a-row class=\"grid-demo\" style=\"marginBottom: 16px; backgroundColor: var(--color-fill-2);\">\n      <a-col :span=\"6\" :offset=\"8\">\n        col - 6 | offset - 8\n      <\/a-col>\n      <a-col :span=\"6\" :offset=\"4\">\n        col - 6 | offset - 4\n      <\/a-col>\n    <\/a-row>\n    <a-row class=\"grid-demo\" style=\"backgroundColor: var(--color-fill-2)\">\n      <a-col :span=\"12\" :offset=\"8\">\n        col - 12 | offset - 8\n      <\/a-col>\n    <\/a-row>\n  <\/div>\n<\/template>\n\n<style scoped>\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const offsetTitle = "Offset.Md";
const offsetDescription = "指定 `offset` 可以对栅格进行平移操作。";
import orderDemo from '../../.vitepress/theme/generated/grid/order.vue';
const orderSource = "<template>\n  <div>\n    <a-row class=\"grid-demo\">\n      <a-col :span=\"6\" :order=\"4\">\n        <div>1 col-order-4<\/div>\n      <\/a-col>\n      <a-col :span=\"6\" :order=\"3\">\n        <div>2 col-order-3<\/div>\n      <\/a-col>\n      <a-col :span=\"6\" :order=\"2\">\n        <div>3 col-order-2<\/div>\n      <\/a-col>\n      <a-col :span=\"6\" :order=\"1\">\n        <div>4 col-order-1<\/div>\n      <\/a-col>\n    <\/a-row>\n  <\/div>\n<\/template>\n\n<style scoped>\n.grid-demo .arco-col {\n  height: 48px;\n  line-height: 48px;\n  color: var(--color-white);\n  text-align: center;\n}\n.grid-demo .arco-col:nth-child(2n) {\n  background-color: rgba(var(--arcoblue-6), 0.9);\n}\n.grid-demo .arco-col:nth-child(2n + 1) {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const orderTitle = "Order.Md";
const orderDescription = "通过 `order` 来进行元素排序。";
</script>

## 示例


<DemoBlock
  :title="adaptationObjectTitle"
  :description="adaptationObjectDescription"
  :code="adaptationObjectSource"
>
  <adaptationObjectDemo />
</DemoBlock>

<DemoBlock
  :title="adaptationTitle"
  :description="adaptationDescription"
  :code="adaptationSource"
>
  <adaptationDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="flexAlignTitle"
  :description="flexAlignDescription"
  :code="flexAlignSource"
>
  <flexAlignDemo />
</DemoBlock>

<DemoBlock
  :title="flexJustifyTitle"
  :description="flexJustifyDescription"
  :code="flexJustifySource"
>
  <flexJustifyDemo />
</DemoBlock>

<DemoBlock
  :title="flexTitle"
  :description="flexDescription"
  :code="flexSource"
>
  <flexDemo />
</DemoBlock>

<DemoBlock
  :title="gridResponsiveTitle"
  :description="gridResponsiveDescription"
  :code="gridResponsiveSource"
>
  <gridResponsiveDemo />
</DemoBlock>

<DemoBlock
  :title="gridTitle"
  :description="gridDescription"
  :code="gridSource"
>
  <gridDemo />
</DemoBlock>

<DemoBlock
  :title="gutterTitle"
  :description="gutterDescription"
  :code="gutterSource"
>
  <gutterDemo />
</DemoBlock>

<DemoBlock
  :title="offsetTitle"
  :description="offsetDescription"
  :code="offsetSource"
>
  <offsetDemo />
</DemoBlock>

<DemoBlock
  :title="orderTitle"
  :description="orderDescription"
  :code="orderSource"
>
  <orderDemo />
</DemoBlock>
