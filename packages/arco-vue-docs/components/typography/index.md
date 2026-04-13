---
title: "typography"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 通用
title: 排版 Typography
description: 用于展示标题、段落、文本内容。
```







## API






### `Common` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|type|文本类型|`'primary' \| 'secondary' \| 'success' \| 'danger' \| 'warning'`|`-`||
|bold|粗体|`boolean`|`false`||
|mark|添加标记样式|`boolean \| { color: string }`|`false`||
|underline|下划线样式|`boolean`|`false`||
|delete|删除线样式|`boolean`|`false`||
|code|代码块样式|`boolean`|`false`||
|disabled|禁用状态|`boolean`|`false`||
|editable|开启可编辑功能|`boolean`|`false`||
|editing **(v-model)**|是否在编辑状态|`boolean`|`-`||
|default-editing|默认的编辑状态|`boolean`|`false`||
|edit-text **(v-model)**|编辑的文字|`string`|`-`||
|copyable|开启复制功能|`boolean`|`false`||
|copy-text|复制的文字|`string`|`-`||
|copy-delay|复制成功后，复制按钮恢复到可点击状态的延迟时间，单位是毫秒|`number`|`3000`|2.16.0|
|ellipsis|自动溢出省略，具体参数配置看 [EllipsisConfig](#EllipsisConfig)|`boolean \| EllipsisConfig`|`false`||
|edit-tooltip-props|编辑按钮问题提示配置|`object`|`-`|2.32.0|
|copy-tooltip-props|拷贝按钮问题提示配置|`object`|`-`|2.32.0|
### `Common` Events

|事件名|描述|参数|
|---|---|---|
|edit-start|开始编辑|-|
|change|编辑内容变化|text: `string`|
|edit-end|编辑结束|-|
|copy|复制|text: `string`|
|ellipsis|省略变化事件|isEllipsis: `boolean`|
|expand|展开收起事件|expanded: `boolean`|
### `Common` Slots

|插槽名|描述|参数|
|---|:---:|---|
|expand-node|自定义展开和折叠按钮|expanded: `boolean`|
|copy-icon|自定义复制按钮图标|copied: `boolean`|
|copy-tooltip|自定义复制按钮的 tooltip 内容|copied: `boolean`|




### `<typography-title>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|heading|标题级别，相当于 `h1` `h2` `h3` `h4` `h5` `h6`|`'1' \| '2' \| '3' \| '4' \| '5' \| '6'`|`1`|




### `<typography-paragraph>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|blockquote|长引用|`boolean`|`false`|
|spacing|段落的的行高，长文本(大于5行)的时候推荐使用默认行高，短文本(小于等于3行)推荐使用 `close` 紧密的行高。|`'default' \| 'close'`|`'default'`|








### EllipsisConfig

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|rows|显示省略的行数|`number`|`1`||
|expandable|是否支持展开/折叠|`boolean`|`false`||
|ellipsisStr|省略号|`string`|`'...'`||
|suffix|后缀|`string`|`-`||
|showTooltip|配置省略时的弹出框|`boolean    \| { type: 'tooltip' \| 'popover'; props: Record<string, any> }`|`false`||
|css|是否使用 CSS 省略（此模式暂不支持展开、自定义省略号和后缀）|`boolean`|`false`|2.37.0|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/typography/basic.vue';
const basicSource = "<template>\n  <a-typography :style=\"{ marginTop: '-40px' }\">\n    <a-typography-title>\n      Design system\n    <\/a-typography-title>\n    <a-typography-paragraph>\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design.\n    <\/a-typography-paragraph>\n    <a-typography-paragraph>\n      In some cases, the direct construction of an object without an explicit prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be considered <a-typography-text bold>to be a design activity.<\/a-typography-text>\n    <\/a-typography-paragraph>\n    <a-typography-title :heading=\"2\">ArcoDesign<\/a-typography-title>\n    <a-typography-paragraph>\n      The ArcoDesign component library defines a set of default particle variables, and a custom theme is to <a-typography-text mark>customize<\/a-typography-text> and <a-typography-text underline>overwrite<\/a-typography-text> this variable list.\n    <\/a-typography-paragraph>\n    <a-typography-paragraph blockquote>\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a <a-typography-text code>prototype<\/a-typography-text>, <a-typography-text code>product<\/a-typography-text> or <a-typography-text code>process<\/a-typography-text>. The verb to design expresses the process of developing a design.\n    <\/a-typography-paragraph>\n    <a-typography-paragraph mark underline delete>A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process.<\/a-typography-paragraph>\n    <a-typography-paragraph>\n      <ul>\n        <li>\n          Architectural blueprints\n          <ul>\n            <li>Architectural blueprints<\/li>\n          <\/ul>\n        <\/li>\n        <li>Engineering drawings<\/li>\n        <li>Business processes<\/li>\n      <\/ul>\n    <\/a-typography-paragraph>\n    <a-typography-paragraph>\n      <ol>\n        <li>Architectural blueprints<\/li>\n        <li>Engineering drawings<\/li>\n        <li>Business processes<\/li>\n      <\/ol>\n    <\/a-typography-paragraph>\n  <\/a-typography>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "排版组件用于展示标题、段落、文本内容，这里展示了排版的组合使用。";
import ellipsisDemo from '../../.vitepress/theme/generated/typography/ellipsis.vue';
const ellipsisSource = "<template>\n  <div>\n    <a-typography-title :heading=\"4\" ellipsis>\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process.\n    <\/a-typography-title>\n    <a-typography-paragraph\n      :ellipsis=\"{\n        rows: 2,\n        showTooltip: true,\n      }\"\n    >\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.\n    <\/a-typography-paragraph>\n    <a-typography-paragraph\n      :ellipsis=\"{\n        rows: 2,\n        showTooltip: true,\n        css: true\n      }\"\n    >\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.\n    <\/a-typography-paragraph>\n    <a-typography-paragraph\n      :ellipsis=\"{\n        suffix: '--Arco Design',\n        rows: 2,\n        expandable: true,\n        showTooltip: {\n          type: 'popover',\n          props: {\n            style: { maxWidth: `500px` }\n          }\n        },\n      }\"\n    >\n      <template #expand-node=\"{expanded}\">\n        {{ expanded ? '' : 'More' }}\n      <\/template>\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.\n    <\/a-typography-paragraph>\n    <a-typography-paragraph\n      :ellipsis=\"{\n        suffix: '--Arco Design',\n        rows: 3,\n        expandable: true,\n      }\"\n    >\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. The verb to design expresses the process of developing a design.\n    <\/a-typography-paragraph>\n  <\/div>\n<\/template>";
const ellipsisTitle = "Ellipsis.Md";
const ellipsisDescription = "在空间不足时省略多行文本内容。";
import operationsDemo from '../../.vitepress/theme/generated/typography/operations.vue';
const operationsSource = "<template>\n  <a-typography>\n    <a-typography-paragraph copyable>\n      Click the icon to copy this text.\n    <\/a-typography-paragraph>\n    <a-typography-paragraph\n      editable\n      v-model:editText=\"str\"\n    >\n      {{str}}\n    <\/a-typography-paragraph>\n  <\/a-typography>\n<\/template>\n<script>\nimport { defineComponent, ref } from 'vue';\nexport default defineComponent({\n  setup() {\n    const str = ref('Click the icon to edit this text.');\n    return {\n      str,\n    }\n  }\n});\n<\/script>";
const operationsTitle = "Operations.Md";
const operationsDescription = "提供复制、编辑文本等功能。";
import paragraphDemo from '../../.vitepress/theme/generated/typography/paragraph.vue';
const paragraphSource = "<template>\n  <a-typography>\n    <a-typography-title :heading=\"5\">Default<\/a-typography-title>\n    <a-typography-paragraph>\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. In some cases, the direct construction of an object without an explicit prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be considered to be a design activity.\n    <\/a-typography-paragraph>\n    <a-typography-title :heading=\"5\">Secondary<\/a-typography-title>\n    <a-typography-paragraph type=\"secondary\">\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. In some cases, the direct construction of an object without an explicit prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be considered to be a design activity.\n    <\/a-typography-paragraph>\n    <a-typography-title :heading=\"5\">Spacing default<\/a-typography-title>\n    <a-typography-paragraph>\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design. In some cases, the direct construction of an object without an explicit prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be considered to be a design activity.\n    <\/a-typography-paragraph>\n    <a-typography-title :heading=\"5\">Spacing close<\/a-typography-title>\n    <a-typography-paragraph type=\"secondary\" spacing=\"close\">\n      A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process. The verb to design expresses the process of developing a design.\n    <\/a-typography-paragraph>\n  <\/a-typography>\n<\/template>";
const paragraphTitle = "Paragraph.Md";
const paragraphDescription = "文本段落样式。";
import textDemo from '../../.vitepress/theme/generated/typography/text.vue';
const textSource = "<template>\n<a-space direction=\"vertical\" :size=\"10\">\n    <a-typography-text>\n      Arco Design\n    <\/a-typography-text>\n    <a-typography-text type=\"secondary\">\n      Secondary\n    <\/a-typography-text>\n    <a-typography-text type=\"primary\">\n      Primary\n    <\/a-typography-text>\n    <a-typography-text type=\"success\">\n      Success\n    <\/a-typography-text>\n    <a-typography-text type=\"warning\">\n      Warning\n    <\/a-typography-text>\n    <a-typography-text type=\"danger\">\n      Danger\n    <\/a-typography-text>\n    <a-typography-text bold>\n      Bold\n    <\/a-typography-text>\n    <a-typography-text disabled>\n      Disabled\n    <\/a-typography-text>\n    <a-typography-text mark>\n      Mark\n    <\/a-typography-text>\n    <a-typography-text underline>\n      Underline\n    <\/a-typography-text>\n    <a-typography-text delete>\n      Line through\n    <\/a-typography-text>\n    <a-typography-text code>\n      Code snippet\n    <\/a-typography-text>\n  <\/a-space>\n<\/template>";
const textTitle = "Text.Md";
const textDescription = "不同样式的文本以及超链接组件。";
import titleDemo from '../../.vitepress/theme/generated/typography/title.vue';
const titleSource = "<template>\n  <a-typography>\n    <a-typography-title>\n      H1. The Pragmatic Romanticism\n    <\/a-typography-title>\n    <a-typography-title :heading=\"2\">\n      H2. The Pragmatic Romanticism\n    <\/a-typography-title>\n    <a-typography-title :heading=\"3\">\n      H3. The Pragmatic Romanticism\n    <\/a-typography-title>\n    <a-typography-title :heading=\"4\">\n      H4. The Pragmatic Romanticism\n    <\/a-typography-title>\n    <a-typography-title :heading=\"5\">\n      H5. The Pragmatic Romanticism\n    <\/a-typography-title>\n    <a-typography-title :heading=\"6\">\n      H6. The Pragmatic Romanticism\n    <\/a-typography-title>\n  <\/a-typography>\n<\/template>";
const titleTitle = "Title.Md";
const titleDescription = "展示不同级别的标题。";
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
  :title="ellipsisTitle"
  :description="ellipsisDescription"
  :code="ellipsisSource"
>
  <ellipsisDemo />
</DemoBlock>

<DemoBlock
  :title="operationsTitle"
  :description="operationsDescription"
  :code="operationsSource"
>
  <operationsDemo />
</DemoBlock>

<DemoBlock
  :title="paragraphTitle"
  :description="paragraphDescription"
  :code="paragraphSource"
>
  <paragraphDemo />
</DemoBlock>

<DemoBlock
  :title="textTitle"
  :description="textDescription"
  :code="textSource"
>
  <textDemo />
</DemoBlock>

<DemoBlock
  :title="titleTitle"
  :description="titleDescription"
  :code="titleSource"
>
  <titleDemo />
</DemoBlock>
