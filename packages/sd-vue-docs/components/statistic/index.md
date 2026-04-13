---
title: "statistic"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 数值显示 Statistic
description: 突出展示某个或某组数字、带描述的统计类数据。
```





## API


### `<statistic>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|title|数值显示的标题|`string`|`-`||
|value|数值显示的值|`number \| Date`|`-`||
|format|数值显示的格式 [dayjs](https://day.js.org/docs/en/display/format)（日期模式使用）|`string`|`'HH:mm:ss'`||
|extra|额外的显示内容|`string`|`-`||
|start|是否开始动画|`boolean`|`true`||
|precision|小数保留位数（数字模式使用）|`number`|`0`||
|separator|进位分隔符（数字模式使用）|`string`|`-`||
|show-group-separator|是否展示进位分隔符（数字模式使用）|`boolean`|`false`||
|animation|是否开启动画|`boolean`|`false`||
|animation-duration|动画的过度时间|`number`|`2000`||
|value-from|动画的起始值|`number`|`-`||
|placeholder|提示文字（当 value 为 undefined 时显示）|`string`|`-`|2.28.0|
|value-style|自定义显示值的样式|`CSSProperties`|`-`|2.32.0|
### `<statistic>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|title|标题|-|
|prefix|前缀|-|
|suffix|后缀|-|
|extra|额外内容|-|




### `<countdown>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|title|倒计时的标题|`string`|`-`||
|value|倒计时的值|`number`|`() => Date.now() + 300000`||
|now|用于修正初始化时间显示不正确|`number`|`() => Date.now()`||
|format|倒计时的展示格式 [dayjs](https://day.js.org/docs/en/display/format)|`string`|`'HH:mm:ss'`||
|start|是否开始倒计时|`boolean`|`true`||
|value-style|自定义显示值的样式|`CSSProperties`|`-`|2.32.0|
### `<countdown>` Events

|事件名|描述|参数|
|---|---|---|
|finish|倒计时完成后触发的回调|-|
### `<countdown>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|title|标题|-|

<script setup lang="ts">
import animationDemo from '../../.vitepress/theme/generated/statistic/animation.vue';
const animationSource = "<template>\n  <a-statistic title=\"User Growth Rate\" :value=\"50.52\" :precision=\"2\" :value-from=\"0\" :start=\"start\" animation>\n    <template #prefix>\n      <icon-arrow-rise />\n    <\/template>\n    <template #suffix>%<\/template>\n  <\/a-statistic>\n  <a-button @click=\"start=true\">Start<\/a-button>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const start = ref(false);\n\n    return {\n      start\n    }\n  },\n}\n<\/script>";
const animationTitle = "Animation.Md";
const animationDescription = "通过 `animation` 可以开启数值动画。";
import basicDemo from '../../.vitepress/theme/generated/statistic/basic.vue';
const basicSource = "<template>\n  <a-space size=\"large\">\n    <a-statistic title=\"Downloads\" :value=\"125670\" show-group-separator />\n    <a-statistic extra=\"Comments\" :value=\"40509\" :precision=\"2\" />\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "当需要突出某个或某组数字或展示带描述的统计类数据时使用。";
import countdownDemo from '../../.vitepress/theme/generated/statistic/countdown.vue';
const countdownSource = "<template>\n  <a-row>\n    <a-col :flex=\"1\">\n      <a-countdown\n        title=\"Countdown\"\n        :value=\"now + 1000 * 60 * 60 * 2\"\n        :now=\"now\"\n      />\n    <\/a-col>\n    <a-col :flex=\"1\">\n      <a-countdown\n        title=\"Milliseconds\"\n        :value=\"now + 1000 * 60 * 60 * 2\"\n        :now=\"now\"\n        format=\"HH:mm:ss.SSS\"\n      />\n    <\/a-col>\n    <a-col :flex=\"1\">\n      <a-countdown\n        title=\"Days\"\n        :value=\"now + 1000 * 60 * 60 * 24 * 4\"\n        :now=\"now\"\n        format=\"D 天 H 时 m 分 s 秒\"\n      />\n    <\/a-col>\n  <\/a-row>\n  <a-space direction=\"vertical\" style=\"margin-top: 10px\">\n    <a-countdown\n      title=\"Trigger on finish\"\n      :value=\"Date.now() + 5 * 1000\"\n      format=\"mm:ss.SSS\"\n      :now=\"Date.now()\"\n      :start=\"start\"\n      @finish=\"handleFinish\"\n    />\n    <a-button @click=\"start = true\" type=\"primary\">Start<\/a-button>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\nimport { Message } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const now = Date.now();\n    const start = ref(false);\n\n    const handleFinish = () => {\n      Message.info('Finish');\n    };\n\n    return {\n      now,\n      start,\n      handleFinish,\n    };\n  },\n};\n<\/script>";
const countdownTitle = "Countdown.Md";
const countdownDescription = "倒计时组件 `countdown` 的基本使用方法。";
import prefixDemo from '../../.vitepress/theme/generated/statistic/prefix.vue';
const prefixSource = "<template>\n  <a-space size=\"large\">\n    <a-statistic title=\"New Users\" :value=\"125670\" show-group-separator >\n      <template #suffix>\n        <icon-arrow-rise />\n      <\/template>\n    <\/a-statistic>\n    <a-statistic title=\"User Growth Rate\" :value=\"50.52\" :precision=\"2\" :value-style=\"{ color: '#0fbf60' }\">\n      <template #prefix>\n        <icon-arrow-rise />\n      <\/template>\n      <template #suffix>%<\/template>\n    <\/a-statistic>\n  <\/a-space>\n<\/template>";
const prefixTitle = "Prefix.Md";
const prefixDescription = "通过 `prefix` 和 `suffix` 插槽可以添加前后缀。";
</script>

## 示例


<DemoBlock
  :title="animationTitle"
  :description="animationDescription"
  :code="animationSource"
>
  <animationDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="countdownTitle"
  :description="countdownDescription"
  :code="countdownSource"
>
  <countdownDemo />
</DemoBlock>

<DemoBlock
  :title="prefixTitle"
  :description="prefixDescription"
  :code="prefixSource"
>
  <prefixDemo />
</DemoBlock>
