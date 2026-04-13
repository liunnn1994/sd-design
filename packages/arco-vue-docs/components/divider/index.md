---
title: "divider"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 布局
title: 分割线 Divider
description: 划分内容区域，对模块做分隔。
```




## API


### `<divider>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|direction|分割线的方向，是水平还是竖直|`'horizontal' \| 'vertical'`|`'horizontal'`||
|orientation|分割线文字的位置|`'left' \| 'center' \| 'right'`|`'center'`||
|type|分割线样式类型|`'solid' \| 'dashed' \| 'dotted' \| 'double'`|`-`|2.35.0|
|size|分割线宽度/高度|`number`|`-`|2.35.0|
|margin|分割线上下 margin (垂直方向时为左右 margin)|`number \| string`|`-`|2.35.0|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/divider/basic.vue';
const basicSource = "<template>\n  <div class=\"divider-demo\">\n    <p>A design is a plan or specification for the construction of an object.<\/p>\n    <a-divider />\n    <p>A design is a plan or specification for the construction of an object.<\/p>\n    <a-divider dashed />\n    <p>A design is a plan or specification for the construction of an object.<\/p>\n    <a-divider :size=\"2\" style=\"border-bottom-style: dotted\" />\n    <p>A design is a plan or specification for the construction of an object.<\/p>\n  <\/div>\n  <div class=\"divider-demo\" style=\"marginTop: 48px\">\n    <div class=\"flex-box\">\n      <span class=\"avatar\"><IconImage /><\/span>\n      <div class=\"content\">\n        <a-typography-title :heading=\"6\">Image<\/a-typography-title>\n        May 4, 2010\n      <\/div>\n    <\/div>\n    <a-divider class=\"half-divider\" />\n    <div class=\"flex-box\">\n      <span class=\"avatar\"><IconUser /><\/span>\n      <div class=\"content\">\n        <a-typography-title :heading=\"6\">Avatar<\/a-typography-title>\n        May 4, 2010\n      <\/div>\n    <\/div>\n    <a-divider class=\"half-divider\" />\n    <div class=\"flex-box\">\n      <span class=\"avatar\"><IconPen /><\/span>\n      <div class=\"content\">\n        <a-typography-title :heading=\"6\">Icon<\/a-typography-title>\n        May 4, 2010\n      <\/div>\n    <\/div>\n  <\/div>\n<\/template>\n\n<script>\nimport {\n  IconImage,\n  IconUser,\n  IconPen,\n} from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconImage,\n    IconUser,\n    IconPen,\n  },\n};\n<\/script>\n\n<style scoped>\n.divider-demo {\n  box-sizing: border-box;\n  width: 560px;\n  padding: 24px;\n  border: 30px solid rgb(var(--gray-2));\n}\n.half-divider {\n  left: 55px;\n  width: calc(100% - 55px);\n  min-width: auto;\n  margin: 16px 0;\n}\n.flex-box {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.flex-box .avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n  margin-right: 16px;\n  color: var(--color-text-2);\n  font-size: 16px;\n  background-color: var(--color-fill-3);\n  border-radius: 50%;\n}\n.flex-box .content {\n  flex: 1;\n  color: var(--color-text-2);\n  font-size: 12px;\n  line-height: 20px;\n}\n<\/style>";
const basicTitle = "Basic.Md";
const basicDescription = "对不同章节的文本段落进行分割，默认为水平分割线，可在中间加入文字。";
import verticalDemo from '../../.vitepress/theme/generated/divider/vertical.vue';
const verticalSource = "<template>\n  <div class=\"divider-demo\">\n    <span>Item 1<\/span>\n    <a-divider direction=\"vertical\" />\n    <span>Item 2<\/span>\n    <a-divider direction=\"vertical\" />\n    <span>Item 3<\/span>\n  <\/div>\n<\/template>\n\n<style scoped>\n.divider-demo {\n  box-sizing: border-box;\n  width: 560px;\n  padding: 24px;\n  border: 30px solid rgb(var(--gray-2));\n}\n<\/style>";
const verticalTitle = "Vertical.Md";
const verticalDescription = "指定 `direction` 为 `vertical` 即可使用竖直分割线。竖直分割线不能带文字。";
import withTextDemo from '../../.vitepress/theme/generated/divider/withText.vue';
const withTextSource = "<template>\n  <div class=\"divider-demo\">\n    <p>A design is a plan or specification for the construction of an object.<\/p>\n    <a-divider orientation=\"left\">Text<\/a-divider>\n    <p>A design is a plan or specification for the construction of an object.<\/p>\n    <a-divider orientation=\"center\">Text<\/a-divider>\n    <p>A design is a plan or specification for the construction of an object.<\/p>\n    <a-divider orientation=\"right\">Text<\/a-divider>\n    <a-divider :margin=\"10\"><icon-star /><\/a-divider>\n  <\/div>\n<\/template>\n\n<style scoped>\n.divider-demo {\n  box-sizing: border-box;\n  width: 560px;\n  padding: 24px;\n  border: 30px solid rgb(var(--gray-2));\n}\n<\/style>";
const withTextTitle = "With Text.Md";
const withTextDescription = "通过 `orientation` 为分割线添加描述文字。";
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
  :title="verticalTitle"
  :description="verticalDescription"
  :code="verticalSource"
>
  <verticalDemo />
</DemoBlock>

<DemoBlock
  :title="withTextTitle"
  :description="withTextDescription"
  :code="withTextSource"
>
  <withTextDemo />
</DemoBlock>
