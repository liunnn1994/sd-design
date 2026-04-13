---
title: "time-picker"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 时间选择器 TimePicker
description: 在弹出面板上选择时间，以便捷完成时间输入的控件。
```













## API


### `<time-picker>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|选择器类型|`'time' \| 'time-range'`|`'time'`|
|model-value **(v-model)**|绑定值|`string \| number \| Date \| Array<string \| number \| Date>`|`-`|
|default-value|默认值|`string \| number \| Date \| Array<string \| number \| Date>`|`-`|
|disabled|是否禁用|`boolean`|`false`|
|allow-clear|是否允许清除|`boolean`|`true`|
|readonly|是否为只读模式|`boolean`|`false`|
|error|是否为错误状态|`boolean`|`false`|
|format|展示日期的格式，参考[字符串解析格式](#字符串解析格式)|`string`|`'HH:mm:ss'`|
|placeholder|提示文案|`string \| string[]`|`-`|
|size|输入框尺寸|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`|
|popup-container|弹出框的挂载容器|`string \| HTMLElement`|`-`|
|use12-hours|12 小时制|`boolean`|`false`|
|step|设置 时 / 分 / 秒 的选择间隔|`{  hour?: number;  minute?: number;  second?: number;}`|`-`|
|disabled-hours|禁用的部分小时选项|`() => number[]`|`-`|
|disabled-minutes|禁用的部分分钟选项|`(selectedHour?: number) => number[]`|`-`|
|disabled-seconds|禁用的部分秒数选项|`(selectedHour?: number, selectedMinute?: number) => number[]`|`-`|
|hide-disabled-options|隐藏禁止选择的选项|`boolean`|`false`|
|disable-confirm|禁用确认步骤，开启后直接点选时间不需要点击确认按钮|`boolean`|`false`|
|position|弹出的位置|`'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br'`|`'bl'`|
|popup-visible **(v-model)**|控制弹出框打开或者关闭|`boolean`|`-`|
|default-popup-visible|弹出框默认打开或者关闭|`boolean`|`false`|
|trigger-props|可以传入 `Trigger` 组件的参数|`TriggerProps`|`-`|
|unmount-on-close|是否在关闭后销毁 dom 结构|`boolean`|`false`|
### `<time-picker>` Events

|事件名|描述|参数|
|---|---|---|
|change|组件值发生改变|timeString: `string \| Array<string \| undefined> \| undefined`<br>time: `date \| Array<date \| undefined> \| undefined`|
|select|选择时间但未触发组件值变化|timeString: `string \| Array<string \| undefined>`<br>time: `Date \| Array<Date \| undefined>`|
|clear|点击清除按钮|-|
|popup-visible-change|弹出框展开和收起|visible: `boolean`|
### `<time-picker>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|prefix|输入框前缀|-|2.41.0|
|suffix-icon|输入框后缀图标|-||
|extra|额外的页脚|-||



### 字符串解析格式

格式|输出|描述
---|---|---:
`YY`|21|两位数的年份
`YYYY`|2021|四位数年份
`M`|1-12|月份，从 1 开始
`MM`|01-12|月份，两位数
`MMM`|Jan-Dec|缩写的月份名称
`MMMM`|January-December|完整的月份名称
`D`|1-31|月份里的一天
`DD`|01-31|月份里的一天，两位数
`d`|0-6|一周中的一天，星期天是 0
`dd`|Su-Sa|最简写的一周中一天的名称
`ddd`|Sun-Sat|简写的一周中一天的名称
`dddd`|Sunday-Saturday|一周中一天的名称
`H`|0-23|小时
`HH`|00-23|小时，两位数
`h`|1-12|小时, 12 小时制
`hh`|01-12|小时, 12 小时制, 两位数
`m`|0-59|分钟
`mm`|00-59|分钟，两位数
`s`|0-59|秒
`ss`|00-59|秒，两位数
`S`|0-9|数百毫秒，一位数
`SS`|00-99|几十毫秒，两位数
`SSS`|000-999|毫秒，三位数字
`Z`|-5:00|UTC 的偏移量
`ZZ`|-0500|UTC 的偏移量，数字前面加上 0
`A`|AM PM|-
`a`|am pm|-
`Do`|1st... 3st|带序号的月份中的某天
`X`|1410715640.579|Unix 时间戳
`x`|1410715640579|Unix 毫秒时间戳

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/time-picker/basic.vue';
const basicSource = "<template>\n  <a-time-picker style=\"width: 194px;\" />\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "时间输入器的基础用法。";
import controlDemo from '../../.vitepress/theme/generated/time-picker/control.vue';
const controlSource = "<template>\n  <a-time-picker\n    style=\"width: 194px\"\n    v-model=\"value\"\n  />\n<\/template>\n<script>\n  export default {\n    data() {\n      return {\n        value: null\n      }\n    }\n  }\n<\/script>";
const controlTitle = "Control.Md";
const controlDescription = "支持 `v-model` 进行数据的双向绑定。";
import defaultValueDemo from '../../.vitepress/theme/generated/time-picker/defaultValue.vue';
const defaultValueSource = "<template>\n  <a-time-picker\n    defaultValue=\"18:24:23\"\n    style=\"width: 194px; marginRight: 24px; marginBottom: 24px\"\n  />\n  <a-time-picker\n    type=\"time-range\"\n    :defaultValue=\"['09:24:53', '18:44:33']\"\n    style=\"width: 252px; marginBottom: 24px\"\n  />\n<\/template>";
const defaultValueTitle = "Default Value.Md";
const defaultValueDescription = "只有默认值的情况，可通过 `defaultValue` 传递。";
import disableConfirmDemo from '../../.vitepress/theme/generated/time-picker/disableConfirm.vue';
const disableConfirmSource = "<template>\n  <a-time-picker\n    disableConfirm\n    style=\"width: 194px; margin: 0 24px 24px 0;\"\n  />\n  <a-time-picker\n    type=\"time-range\"\n    disableConfirm\n    style=\"width: 252px; margin: 0 24px 24px 0;\"\n  />\n<\/template>";
const disableConfirmTitle = "Disable Confirm.Md";
const disableConfirmDescription = "跳过确认步骤，直接点击选择时间。";
import disabledTimeDemo from '../../.vitepress/theme/generated/time-picker/disabledTime.vue';
const disabledTimeSource = "<template>\n  <a-time-picker\n    style=\"width: 194px; margin: 0 24px 24px 0;\"\n    :disabledHours=\"() => [1, 2, 4, 14]\"\n    :disabledMinutes=\"() => [1, 2, 3, 4, 14, 15, 16, 20, 50]\"\n    :disabledSeconds=\"() => [1, 2, 3, 4, 5, 6, 7, 10, 14, 60]\"\n  />\n  <a-time-picker\n    type=\"time-range\"\n    style=\"width: 252px; margin: 0 24px 24px 0;\"\n    :disabledHours=\"() => [1, 2, 4, 14]\"\n    :disabledMinutes=\"() => [1, 2, 3, 4, 14, 15, 16, 20, 50]\"\n    :disabledSeconds=\"() => [1, 2, 3, 4, 5, 6, 7, 10, 14, 60]\"\n  />\n<\/template>";
const disabledTimeTitle = "Disabled Time.Md";
const disabledTimeDescription = "通过设置 `disabledHours` `disabledMinutes` `disabledSeconds`，可以禁用 时 / 分 / 秒的部分选项。";
import disabledDemo from '../../.vitepress/theme/generated/time-picker/disabled.vue';
const disabledSource = "<template>\n  <a-time-picker disabled style=\"margin: 0 24px 24px 0;\" />\n  <a-time-picker type=\"time-range\" disabled style=\"width: 252px; margin: 0 24px 24px 0;\" />\n<\/template>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "禁用状态。";
import extraDemo from '../../.vitepress/theme/generated/time-picker/extra.vue';
const extraSource = "<template>\n  <a-time-picker style=\"width: 194px;\">\n    <template #extra>\n      Extra Footer\n    <\/template>\n  <\/a-time-picker>\n<\/template>";
const extraTitle = "Extra.Md";
const extraDescription = "选择框底部显示自定义的内容。";
import formatDemo from '../../.vitepress/theme/generated/time-picker/format.vue';
const formatSource = "<template>\n  <a-time-picker format=\"HH:mm\" :defaultValue=\"defaultValue\" style=\"width: 130px;\" />\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      defaultValue: '09:24'\n    }\n  }\n}\n<\/script>";
const formatTitle = "Format.Md";
const formatDescription = "通过设置 `format`，可以定制需要显示的时、分、秒。";
import prefixDemo from '../../.vitepress/theme/generated/time-picker/prefix.vue';
const prefixSource = "<template>\n  <div>\n    <div>\n      <a-time-picker style=\"width: 194px;\">\n        <template #prefix>\n          <IconInfoCircle />\n        <\/template> <\/a-time-picker\n    ><\/div>\n    <div>\n      <a-time-picker type=\"time-range\" style=\"width: 252px; margin-top: 20px\">\n        <template #prefix>\n          <IconInfoCircle />\n        <\/template>\n      <\/a-time-picker>\n    <\/div>\n  <\/div>\n<\/template>\n\n<script>\nimport { IconInfoCircle } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: { IconInfoCircle },\n};\n<\/script>";
const prefixTitle = "Prefix.Md";
const prefixDescription = "通过 `prefix` 插槽可以设置输入框前缀";
import rangepickerDemo from '../../.vitepress/theme/generated/time-picker/rangepicker.vue';
const rangepickerSource = "<template>\n  <a-time-picker\n    type=\"time-range\"\n    @select=\"(valueString, value) => print('onSelect:', valueString, value)\"\n    @change=\"(valueString, value) => print('onChange:', valueString, value)\"\n    style=\"width: 252px;\" />\n<\/template>\n<script>\n  export default {\n    methods: {\n      print(...arg) {\n        console.log(...arg);\n      }\n    }\n  }\n<\/script>";
const rangepickerTitle = "Rangepicker.Md";
const rangepickerDescription = "时间输入器的范围选择器。";
import sizeDemo from '../../.vitepress/theme/generated/time-picker/size.vue';
const sizeSource = "<template>\n  <div style=\"marginBottom: 20px\">\n    <a-radio-group v-model=\"size\" type='button'>\n      <a-radio value=\"mini\">mini<\/a-radio>\n      <a-radio value=\"small\">small<\/a-radio>\n      <a-radio value=\"medium\">medium<\/a-radio>\n      <a-radio value=\"large\">large<\/a-radio>\n    <\/a-radio-group>\n  <\/div>\n  <a-time-picker style=\"width: 194px;\" :size=\"size\" />\n<\/template>\n<script>\n  export default {\n    data() {\n      return {\n        size: 'small'\n      }\n    }\n  }\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "有四种尺寸可供选择。";
import stepDemo from '../../.vitepress/theme/generated/time-picker/step.vue';
const stepSource = "<template>\n  <a-time-picker\n    defaultValue=\"10:25:30\"\n    :step=\"{\n      hour: 2,\n      minute: 5,\n      second: 10,\n    }\"\n    style=\"width: 194px;\" />\n<\/template>";
const stepTitle = "Step.Md";
const stepDescription = "通过设置 `step`，可以定制需要显示的时、分、秒的步长。";
import use12HoursDemo from '../../.vitepress/theme/generated/time-picker/use12Hours.vue';
const use12HoursSource = "<template>\n  <a-time-picker\n    use12Hours\n    defaultValue=\"12:20:20 AM\"\n    format=\"hh:mm:ss A\"\n    style=\"width: 194px; margin: 0 24px 24px 0;\"\n  />\n  <a-time-picker\n    use12Hours\n    defaultValue=\"09:20:20 pm\"\n    format=\"hh:mm:ss a\"\n    style=\"width: 194px; margin: 0 24px 24px 0;\"\n  />\n  <a-time-picker\n    use12Hours\n    defaultValue=\"2:20 AM\"\n    format=\"h:mm A\"\n    style=\"width: 194px; margin: 0 24px 24px 0;\"\n  />\n  <a-time-picker\n    type=\"time-range\"\n    use12Hours\n    :defaultValue=\"['12:20:20 AM', '08:30:30 PM']\"\n    format=\"hh:mm:ss A\"\n    style=\"width: 300px; margin: 0 24px 24px 0;\"\n  />\n<\/template>";
const use12HoursTitle = "Use 12 Hours.Md";
const use12HoursDescription = "通过设置 `use12Hours`，可以定制需要显示的时、分、秒。";
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
  :title="controlTitle"
  :description="controlDescription"
  :code="controlSource"
>
  <controlDemo />
</DemoBlock>

<DemoBlock
  :title="defaultValueTitle"
  :description="defaultValueDescription"
  :code="defaultValueSource"
>
  <defaultValueDemo />
</DemoBlock>

<DemoBlock
  :title="disableConfirmTitle"
  :description="disableConfirmDescription"
  :code="disableConfirmSource"
>
  <disableConfirmDemo />
</DemoBlock>

<DemoBlock
  :title="disabledTimeTitle"
  :description="disabledTimeDescription"
  :code="disabledTimeSource"
>
  <disabledTimeDemo />
</DemoBlock>

<DemoBlock
  :title="disabledTitle"
  :description="disabledDescription"
  :code="disabledSource"
>
  <disabledDemo />
</DemoBlock>

<DemoBlock
  :title="extraTitle"
  :description="extraDescription"
  :code="extraSource"
>
  <extraDemo />
</DemoBlock>

<DemoBlock
  :title="formatTitle"
  :description="formatDescription"
  :code="formatSource"
>
  <formatDemo />
</DemoBlock>

<DemoBlock
  :title="prefixTitle"
  :description="prefixDescription"
  :code="prefixSource"
>
  <prefixDemo />
</DemoBlock>

<DemoBlock
  :title="rangepickerTitle"
  :description="rangepickerDescription"
  :code="rangepickerSource"
>
  <rangepickerDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="stepTitle"
  :description="stepDescription"
  :code="stepSource"
>
  <stepDemo />
</DemoBlock>

<DemoBlock
  :title="use12HoursTitle"
  :description="use12HoursDescription"
  :code="use12HoursSource"
>
  <use12HoursDemo />
</DemoBlock>
