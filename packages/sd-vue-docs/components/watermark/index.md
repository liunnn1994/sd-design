---
title: "watermark"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 其他
title: 水印 Watermark
description: 用于给页面的指定区域加上水印。
```





## API


### `<watermark>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|content|水印文字内容|`string \| string[]`|`-`|
|image|图片源，建议使用 2 倍或 3 倍图|`string`|`-`|
|width|水印宽度（默认为内容宽度）|`number`|`-`|
|height|水印高度（默认为内容高度）|`number`|`-`|
|gap|水印间的间距|`[number, number]`|`() => [90, 90]`|
|offset|距离容器左上角的偏移量，默认为水印间距的一半|`[number, number]`|`[gap[0]/2, gap[1]/2]`|
|rotate|旋转角度|`number`|`-22`|
|font|水印字体样式，具体参数配置看 [WatermarkFont](#WatermarkFont)|`WatermarkFont`|`-`|
|z-index|水印层级|`number`|`6`|
|alpha|透明度|`number`|`1`|
|anti-tamper|水印防篡改|`boolean`|`true`|
|grayscale|灰阶水印|`boolean`|`false`|
|repeat|是否重复水印|`boolean`|`true`|
|staggered|是否错开排列|`boolean`|`true`|




### WatermarkFont

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|color|字体颜色|`string`|`rgba(0, 0, 0, 0.15)`|
|fontSize|字体大小|`number`|`16`|
|fontFamily|字体类型|`string`|`sans-serif`|
|fontStyle|字体样式|`'none' \| 'normal' \| 'italic' \| 'oblique'`|`normal`|
|textAlign|字体对齐方式|`'start' \| 'end' \| 'left' \| 'right' \| 'center'`|`center`|
|fontWeight|字体粗细|`'normal' \| 'bold' \| 'bolder' \| 'lighter' \| number`|`normal`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/watermark/basic.vue';
const basicSource = "<template>\n  <a-watermark content=\"sd.design\">\n    <div style=\"width: 100%; height: 350px;\" />\n  <\/a-watermark>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "水印的基本用法。";
import customDemo from '../../.vitepress/theme/generated/watermark/custom.vue';
const customSource = "<template>\n  <a-form size=\"small\" :model=\"form\" auto-label-width>\n    <a-row :gutter=\"16\">\n      <a-col :span=\"24\">\n        <a-form-item field=\"rotate\" label=\"rotate\">\n          <a-slider v-model=\"form.rotate\" :min=\"-180\" :max=\"180\" />\n        <\/a-form-item>\n      <\/a-col>\n      <a-col :span=\"12\">\n        <a-form-item label=\"gap\">\n          <a-input-group>\n            <a-input-number\n              v-model=\"form.gap[0]\"\n              placeholder=\"gap[x]\"\n              :min=\"0\"\n            />\n            <a-input-number\n              v-model=\"form.gap[1]\"\n              placeholder=\"gap[y]\"\n              :min=\"0\"\n            />\n          <\/a-input-group>\n        <\/a-form-item>\n      <\/a-col>\n      <a-col :span=\"12\">\n        <a-form-item label=\"offset\">\n          <a-input-group>\n            <a-input-number v-model=\"form.offset[0]\" placeholder=\"offsetLeft\" />\n            <a-input-number v-model=\"form.offset[1]\" placeholder=\"offsetTop\" />\n          <\/a-input-group>\n        <\/a-form-item>\n      <\/a-col>\n      <a-col :span=\"12\">\n        <a-form-item label=\"fontSize\">\n          <a-input-number v-model=\"form.font.fontSize\" mode=\"button\" />\n        <\/a-form-item>\n      <\/a-col>\n      <a-col :span=\"12\">\n        <a-form-item label=\"zIndex\">\n          <a-input-number v-model=\"form.zIndex\" mode=\"button\" />\n        <\/a-form-item>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <a-form-item label=\"repeat\">\n          <a-switch v-model=\"form.repeat\" />\n        <\/a-form-item>\n      <\/a-col>\n      <a-col :span=\"6\">\n        <a-form-item label=\"staggered\">\n          <a-switch v-model=\"form.staggered\" />\n        <\/a-form-item>\n      <\/a-col>\n    <\/a-row>\n  <\/a-form>\n  <a-watermark content=\"sd.design\" v-bind=\"form\">\n    <div style=\"width: 100%; border: 1px solid #e5e6eb; box-sizing: border-box\">\n      <a-typography-title :heading=\"5\"> Design system <\/a-typography-title>\n      <a-typography>\n        <a-typography-paragraph>\n          A design is a plan or specification for the construction of an object\n          or system or for the implementation of an activity or process, or the\n          result of that plan or specification in the form of a prototype,\n          product or process. The verb to design expresses the process of\n          developing a design.\n        <\/a-typography-paragraph>\n        <a-typography-paragraph>\n          A design is a plan or specification for the construction of an object\n          or system or for the implementation of an activity or process, or the\n          result of that plan or specification in the form of a prototype,\n          product or process. The verb to design expresses the process of\n          developing a design.\n        <\/a-typography-paragraph>\n      <\/a-typography>\n      <img\n        style=\"position: relative; z-index: 7\"\n        src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/24e0dd27418d2291b65db1b21aa62254.png~tplv-uwbnlip3yd-webp.webp\"\n      />\n    <\/div>\n  <\/a-watermark>\n<\/template>\n\n<script>\nimport { reactive } from 'vue';\n\nexport default {\n  setup() {\n    const form = reactive({\n      rotate: 0,\n      gap: [50, 50],\n      offset: [],\n      font: { fontSize: 16 },\n      zIndex: 6,\n      repeat: true,\n      staggered: true,\n    });\n    return {\n      form,\n    };\n  },\n};\n<\/script>";
const customTitle = "Custom.Md";
const customDescription = "通过自定义参数以实现更多的水印效果。";
import imageDemo from '../../.vitepress/theme/generated/watermark/image.vue';
const imageSource = "<template>\n  <a-watermark content=\"acro.design\" grayscale image=\"\">\n    <div style=\"width: 100%; height: 300px;\" />\n  <\/a-watermark>\n<\/template>";
const imageTitle = "Image.Md";
const imageDescription = "通过 image 设置图片水印。建议使用 2 倍或 3 倍图（支持Base64）。";
import multilineDemo from '../../.vitepress/theme/generated/watermark/multiline.vue';
const multilineSource = "<template>\n  <a-watermark :content=\"['sd.design',dayjs().format('YYYY-MM-DD')]\">\n    <div style=\"width: 100%; height: 300px;\" />\n  <\/a-watermark>\n<\/template>\n<script>\nimport dayjs from 'dayjs';\n\nexport default {\n  setup() {\n    return {\n      dayjs,\n    }\n  }\n}\n<\/script>";
const multilineTitle = "Multiline.Md";
const multilineDescription = "通过 content 设置字符串数组可指定多行文字水印内容。";
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
  :title="customTitle"
  :description="customDescription"
  :code="customSource"
>
  <customDemo />
</DemoBlock>

<DemoBlock
  :title="imageTitle"
  :description="imageDescription"
  :code="imageSource"
>
  <imageDemo />
</DemoBlock>

<DemoBlock
  :title="multilineTitle"
  :description="multilineDescription"
  :code="multilineSource"
>
  <multilineDemo />
</DemoBlock>
