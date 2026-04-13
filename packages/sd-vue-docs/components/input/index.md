---
title: "input"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 输入框 Input
description: 基本表单组件，并在原生控件基础上进行了功能扩展，可以组合使用。
```












## API


### `<input>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|model-value **(v-model)**|绑定值|`string`|`-`||
|default-value|默认值（非受控状态）|`string`|`''`||
|size|输入框大小|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`||
|allow-clear|是否允许清空输入框|`boolean`|`false`||
|disabled|是否禁用|`boolean`|`false`||
|readonly|是否为只读状态|`boolean`|`false`||
|error|是否为错误状态|`boolean`|`false`||
|placeholder|提示文字|`string`|`-`||
|max-length|输入值的最大长度，errorOnly 属性在 2.12.0 版本添加|`number \| { length: number; errorOnly?: boolean }`|`0`||
|show-word-limit|是否显示字数统计|`boolean`|`false`||
|word-length|字符长度的计算方法|`(value: string) => number`|`-`||
|word-slice|字符截取方法，同 wordLength 一起使用|`(value: string, maxLength: number) => string`|`-`|2.12.0|
|input-attrs|内部 input 元素的属性|`object`|`-`|2.27.0|
|prepend|前置标签|`string`|`-`|2.57.0|
|append|后置标签|`string`|`-`|2.57.0|
### `<input>` Events

|事件名|描述|参数|
|---|---|---|
|input|用户输入时触发|value: `string`<br>ev: `Event`|
|change|仅在输入框失焦或按下回车时触发|value: `string`<br>ev: `Event`|
|press-enter|用户按下回车时触发|ev: `KeyboardEvent`|
|clear|用户点击清除按钮时触发|ev: `MouseEvent`|
|focus|输入框获取焦点时触发|ev: `FocusEvent`|
|blur|输入框失去焦点时触发|ev: `FocusEvent`|
### `<input>` Methods

|方法名|描述|参数|返回值|
|---|---|---|---|
|focus|使输入框获取焦点|-|-|
|blur|使输入框失去焦点|-|-|
### `<input>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|append|后置标签|-|
|prepend|前置标签|-|
|suffix|后缀元素|-|
|prefix|前缀元素|-|








### `<input-password>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|visibility **(v-model)**|是否可见，受控属性|`boolean`|`-`|
|default-visibility|默认是否可见，非受控|`boolean`|`true`|
|invisible-button|是否显示可见按钮|`boolean`|`true`|
### `<input-password>` Events

|事件名|描述|参数|
|---|---|---|
|visibility-change|visibility 改变时触发|visible: `boolean`|




### `<input-search>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|search-button|是否为后置按钮模式|`boolean`|`false`||
|loading|是否为加载中状态|`boolean`|`false`||
|disabled|是否禁用|`boolean`|`false`||
|size|输入框大小|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`||
|button-text|搜索按钮的文字，使用后会替换原本的图标|`string`|`-`|2.16.0|
|button-props|搜索按钮的属性|`ButtonProps`|`-`||
### `<input-search>` Events

|事件名|描述|参数|
|---|---|---|
|search|单击搜索按钮时触发|value: `string`<br>ev: `MouseEvent`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/input/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear />\n    <a-input :style=\"{width:'320px'}\" default-value=\"content\" placeholder=\"Please enter something\" allow-clear />\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "输入框的基本用法。";
import groupDemo from '../../.vitepress/theme/generated/input/group.vue';
const groupSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-group>\n      <a-input :style=\"{width:'160px'}\" placeholder=\"first\" />\n      <a-input :style=\"{width:'160px'}\" placeholder=\"second\" />\n    <\/a-input-group>\n    <a-input-group>\n      <a-select :options=\"['Option1','Option2','Option3']\" :style=\"{width:'160px'}\" placeholder=\"first\" />\n      <a-input :style=\"{width:'160px'}\" placeholder=\"second\" />\n    <\/a-input-group>\n  <\/a-space>\n<\/template>";
const groupTitle = "Group.Md";
const groupDescription = "通过 `input-group` 可以组合使用输入框。";
import passwordDemo from '../../.vitepress/theme/generated/input/password.vue';
const passwordSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-switch v-model=\"visibility\" />\n    <a-input-password\n      v-model:visibility=\"visibility\"\n      placeholder=\"Please enter something\"\n      :style=\"{width:'320px'}\"\n      :defaultVisibility=\"false\"\n      allow-clear\n    />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const visibility = ref(true);\n\n    return {\n      visibility\n    }\n  },\n}\n<\/script>";
const passwordTitle = "Password.Md";
const passwordDescription = "用于输入密码。";
import prefixDemo from '../../.vitepress/theme/generated/input/prefix.vue';
const prefixSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear>\n      <template #prefix>\n        <icon-user />\n      <\/template>\n    <\/a-input>\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear>\n      <template #suffix>\n        <icon-info-circle />\n      <\/template>\n    <\/a-input>\n  <\/a-space>\n<\/template>";
const prefixTitle = "Prefix.Md";
const prefixDescription = "通过指定 `prefix` 和 `suffix` 插槽来在输入框内添加前缀和后缀。";
import prependDemo from '../../.vitepress/theme/generated/input/prepend.vue';
const prependSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear>\n      <template #prepend>\n        +86\n      <\/template>\n    <\/a-input>\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear>\n      <template #append>\n        RMB\n      <\/template>\n    <\/a-input>\n\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear prepend=\"+86\">\n    <\/a-input>\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear append=\"RMB\">\n    <\/a-input>\n  <\/a-space>\n<\/template>";
const prependTitle = "Prepend.Md";
const prependDescription = "通过指定 `prepend` 和 `append` 插槽在输入框前后添加元素。";
import searchButtonDemo from '../../.vitepress/theme/generated/input/searchButton.vue';
const searchButtonSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-search :style=\"{width:'320px'}\" placeholder=\"Please enter something\" button-text=\"Search\" search-button/>\n    <a-input-search :style=\"{width:'320px'}\" placeholder=\"Please enter something\" search-button>\n      <template #button-icon>\n        <icon-search/>\n      <\/template>\n      <template #button-default>\n        Search\n      <\/template>\n    <\/a-input-search>\n  <\/a-space>\n<\/template>";
const searchButtonTitle = "Search Button.Md";
const searchButtonDescription = "自定义搜索按钮的内容";
import searchLoadingDemo from '../../.vitepress/theme/generated/input/searchLoading.vue';
const searchLoadingSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-search :style=\"{width:'320px'}\" placeholder=\"Please enter something\" loading />\n    <a-input-search :style=\"{width:'320px'}\" placeholder=\"Please enter something\" search-button loading />\n  <\/a-space>\n<\/template>";
const searchLoadingTitle = "Search Loading.Md";
const searchLoadingDescription = "通过 `loading` 属性可以让搜索框展示加载中状态。";
import searchDemo from '../../.vitepress/theme/generated/input/search.vue';
const searchSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-search :style=\"{width:'320px'}\" placeholder=\"Please enter something\"/>\n    <a-input-search :style=\"{width:'320px'}\" placeholder=\"Please enter something\" search-button/>\n  <\/a-space>\n<\/template>";
const searchTitle = "Search.Md";
const searchDescription = "带有搜索按钮的输入框，用于内容检索。";
import sizeDemo from '../../.vitepress/theme/generated/input/size.vue';
const sizeSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group type=\"button\" v-model=\"size\">\n      <a-radio value=\"mini\">mini<\/a-radio>\n      <a-radio value=\"small\">small<\/a-radio>\n      <a-radio value=\"medium\">medium<\/a-radio>\n      <a-radio value=\"large\">large<\/a-radio>\n    <\/a-radio-group>\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" :size=\"size\" allow-clear />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const size = ref('medium');\n\n    return {\n      size\n    }\n  },\n}\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "输入框定义了四种默认尺寸 `mini, small, medium, large` ，分别为 `24px, 28px, 32px, 36px` 。";
import statusDemo from '../../.vitepress/theme/generated/input/status.vue';
const statusSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Disabled status\" disabled/>\n    <a-input :style=\"{width:'320px'}\" default-value=\"Disabled\" placeholder=\"Disabled status\" disabled/>\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Error status\" error/>\n  <\/a-space>\n<\/template>";
const statusTitle = "Status.Md";
const statusDescription = "输入框可以设置禁用和错误状态。";
import wordLimitDemo from '../../.vitepress/theme/generated/input/wordLimit.vue';
const wordLimitSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\" fill>\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" :max-length=\"10\" allow-clear show-word-limit />\n    <a-input :style=\"{width:'320px'}\" placeholder=\"Please enter something\" :max-length=\"{length:10,errorOnly:true}\" allow-clear show-word-limit />\n  <\/a-space>\n<\/template>";
const wordLimitTitle = "Word Limit.Md";
const wordLimitDescription = "设置 `max-length` 可以限制最大字数，配合 `show-word-limit` 可以显示字数统计。";
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
  :title="groupTitle"
  :description="groupDescription"
  :code="groupSource"
>
  <groupDemo />
</DemoBlock>

<DemoBlock
  :title="passwordTitle"
  :description="passwordDescription"
  :code="passwordSource"
>
  <passwordDemo />
</DemoBlock>

<DemoBlock
  :title="prefixTitle"
  :description="prefixDescription"
  :code="prefixSource"
>
  <prefixDemo />
</DemoBlock>

<DemoBlock
  :title="prependTitle"
  :description="prependDescription"
  :code="prependSource"
>
  <prependDemo />
</DemoBlock>

<DemoBlock
  :title="searchButtonTitle"
  :description="searchButtonDescription"
  :code="searchButtonSource"
>
  <searchButtonDemo />
</DemoBlock>

<DemoBlock
  :title="searchLoadingTitle"
  :description="searchLoadingDescription"
  :code="searchLoadingSource"
>
  <searchLoadingDemo />
</DemoBlock>

<DemoBlock
  :title="searchTitle"
  :description="searchDescription"
  :code="searchSource"
>
  <searchDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="statusTitle"
  :description="statusDescription"
  :code="statusSource"
>
  <statusDemo />
</DemoBlock>

<DemoBlock
  :title="wordLimitTitle"
  :description="wordLimitDescription"
  :code="wordLimitSource"
>
  <wordLimitDemo />
</DemoBlock>
