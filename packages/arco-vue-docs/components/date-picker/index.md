---
title: "date-picker"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 日期选择器 DatePicker
description: 选择日期。支持年、月、周、日类型，支持范围选择等。
```





















## API


### `Common` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|locale|国际化配置，用于覆盖locale中的 `datePicker` 字段|`Record<string, any>`|`-`||
|hide-trigger|没有触发元素，只显示选择面板|`boolean`|`false`||
|allow-clear|是否允许清除|`boolean`|`true`||
|readonly|是否为只读|`boolean`|`false`||
|error|是否为错误状态|`boolean`|`false`||
|size|日期选择器的尺寸|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`||
|shortcuts|预设时间范围快捷选择|`ShortcutType[]`|`[]`||
|shortcuts-position|预设范围在面板上的位置，默认放在下方，侧边一般用于大量预设时间的场景|`'left' \| 'bottom' \| 'right'`|`'bottom'`||
|position|弹出的框的位置|`'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br'`|`'bl'`||
|popup-visible|控制弹出框的打开或者关闭状态|`boolean`|`-`||
|default-popup-visible|默认弹出框是打开或者关闭|`boolean`|`false`||
|trigger-props|可以传入 `Trigger` 组件的参数|`TriggerProps`|`-`||
|unmount-on-close|是否在隐藏的时候销毁DOM结构|`boolean`|`false`||
|placeholder|提示文案|`string`|`-`||
|disabled|是否禁用|`boolean`|`false`||
|disabled-date|不可选取的日期|`(current?: Date) => boolean`|`-`||
|disabled-time|不可选取的时间|`(current: Date) => DisabledTimeProps`|`-`||
|picker-value **(v-model)**|面板显示的日期|`Date \| string \| number`|`-`||
|default-picker-value|面板默认显示的日期|`Date \| string \| number`|`-`||
|popup-container|弹出框的挂载容器|`string \| HTMLElement`|`-`||
|value-format|值的格式，对 `value` `defaultValue` `pickerValue` `defaultPickerValue` 以及事件中的返回值生效，支持设置为时间戳，Date 和字符串（参考[字符串解析格式](#字符串解析格式)）。如果没有指定，将格式化为字符串，格式同 `format`。|`'timestamp' \| 'Date' \| string`|`-`|2.16.0|
|preview-shortcut|是否要预览快捷选择的结果|`boolean`|`true`|2.28.0|
|show-confirm-btn|是否显示确认按钮，`showTime = true` 的时候始终显示。|`boolean`|`false`|2.29.0|
|disabled-input|是否禁止键盘输入日期|`boolean`|`false`|2.43.0|
|abbreviation|是否启用缩写|`boolean`|`true`|2.45.0|
### `Common` Events

|事件名|描述|参数|
|---|---|---|
|change|组件值发生改变|value: `Date \| string \| number \| undefined`<br>date: `Date \| undefined`<br>dateString: `string \| undefined`|
|select|选中日期发生改变但组件值未改变|value: `Date \| string \| number`<br>date: `Date`<br>dateString: `string`|
|popup-visible-change|打开或关闭弹出框|visible: `boolean`|
|ok|点击确认按钮|value: `Date \| string \| number`<br>date: `Date`<br>dateString: `string`|
|clear|点击清除按钮|-|
|select-shortcut|点击快捷选项|shortcut: `ShortcutType`|
|picker-value-change|面板日期改变|value: `Date \| string \| number`<br>date: `Date`<br>dateString: `string`|
### `Common` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|prefix|输入框前缀|-|2.41.0|
|suffix-icon|输入框后缀图标|-||
|icon-next-double|双箭头往后翻页图标|-||
|icon-prev-double|双箭头往前翻页图标|-||
|icon-next|单箭头往后翻页图标|-||
|icon-prev|单箭头往前翻页图标|-||
|cell|自定义日期单元格的内容|date: `Date`||
|extra|额外的页脚|-||




### `<date-picker>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|model-value **(v-model)**|绑定值|`Date \| string \| number`|`-`||
|default-value|默认值|`Date \| string \| number`|`-`||
|format|展示日期的格式，参考[字符串解析格式](#字符串解析格式)|`string \| ((current: Date) => string)`|`-`||
|day-start-of-week|每周的第一天开始于周几，0 - 周日，1 - 周一，以此类推。|`0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`|`0`|2-6 from 2.21.0|
|show-time|是否增加时间选择|`boolean`|`false`||
|time-picker-props|时间显示的参数，参考 [TimePickerProps](/components/time-picker/)|`Partial<TimePickerProps>`|`-`||
|disabled|是否禁用|`boolean`|`false`||
|disabled-date|不可选取的日期|`(current?: Date) => boolean`|`-`||
|disabled-time|不可选取的时间|`(current: Date) => DisabledTimeProps`|`-`||
|show-now-btn|是否显示 `showTime` 时，选择当前时间的按钮|`boolean`|`true`||




### `<month-picker>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|model-value **(v-model)**|绑定值|`Date \| string \| number`|`-`|
|default-value|默认值|`Date \| string \| number`|`-`|
|format|展示日期的格式，参考[字符串解析格式](#字符串解析格式)|`string`|`'YYYY-MM'`|




### `<year-picker>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|model-value **(v-model)**|绑定值|`Date \| string \| number`|`-`|
|default-value|默认值|`Date \| string \| number`|`-`|
|format|展示日期的格式，参考[字符串解析格式](#字符串解析格式)|`string`|`'YYYY'`|




### `<quarter-picker>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|model-value **(v-model)**|绑定值|`Date \| string \| number`|`-`||
|default-value|默认值|`Date \| string \| number`|`-`||
|format|展示日期的格式，参考[字符串解析格式](#字符串解析格式)|`string`|`'YYYY-[Q]Q'`||
|value-format|值的格式，对 `value` `defaultValue` `pickerValue` `defaultPickerValue` 以及事件中的返回值生效，支持设置为时间戳，Date 和字符串（参考[字符串解析格式](#字符串解析格式)）。|`string`|`'YYYY-MM'`|2.16.0|




### `<week-picker>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|model-value **(v-model)**|绑定值|`Date \| string \| number`|`-`||
|default-value|默认值|`Date \| string \| number`|`-`||
|format|展示日期的格式，参考[字符串解析格式](#字符串解析格式)|`string`|`'gggg-wo'`||
|value-format|值的格式，对 `value` `defaultValue` `pickerValue` `defaultPickerValue` 以及事件中的返回值生效，支持设置为时间戳，Date 和字符串（参考[字符串解析格式](#字符串解析格式)）。|`string`|`'YYYY-MM-DD'`|2.16.0|
|day-start-of-week|每周的第一天开始于周几，0 - 周日，1 - 周一，以此类推。|`0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`|`0`|2-6 from 2.21.0|




### `<range-picker>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|mode|范围选择器的类型|`'date' \| 'year' \| 'quarter' \| 'month' \| 'week'`|`'date'`||
|model-value **(v-model)**|绑定值|`(Date \| string \| number)[]`|`-`||
|default-value|默认值|`(Date \| string \| number)[]`|`-`||
|picker-value|默认面板显示的日期|`(Date \| string \| number)[]`|`-`||
|default-picker-value|面板显示的日期|`(Date \| string \| number)[]`|`-`||
|disabled|是否禁用|`boolean \| boolean[]`|`false`||
|day-start-of-week|每周的第一天开始于周几，0 - 周日，1 - 周一，以此类推。|`0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`|`0`|2-6 from 2.21.0|
|format|展示日期的格式，参考[字符串解析格式](#字符串解析格式)|`string`|`-`||
|value-format|值的格式，对 `value` `defaultValue` `pickerValue` `defaultPickerValue` 以及事件中的返回值生效，支持设置为时间戳，Date 和字符串（参考[字符串解析格式](#字符串解析格式)）。如果没有指定，将格式化为字符串，格式同 `format`。|`'timestamp' \| 'Date' \| string`|`-`|2.16.0|
|show-time|是否增加时间选择|`boolean`|`false`||
|time-picker-props|时间显示的参数，参考 [TimePickerProps](/components/time-picker/)|`Partial<TimePickerProps>`|`-`||
|placeholder|提示文案|`string[]`|`-`||
|disabled-date|不可选的日期|`(current: Date, type: 'start' \| 'end') => boolean`|`-`||
|disabled-time|不可选取的时间|`(current: Date, type: 'start' \| 'end') => DisabledTimeProps`|`-`||
|separator|范围选择器输入框内的分割符号|`string`|`-`||
|exchange-time|时间是否会交换，默认情况下时间会影响和参与开始和结束值的排序，如果要固定时间顺序，可将其关闭。|`boolean`|`true`|2.25.0|
|disabled-input|是否禁止键盘输入日期|`boolean`|`false`|2.43.0|
|abbreviation|是否启用缩写|`boolean`|`true`||
### `<range-picker>` Events

|事件名|描述|参数|
|---|---|---|
|change|组件值发生改变|value: `(Date \| string \| number \| undefined)[] \| undefined`<br>date: `(Date \| undefined)[] \| undefined`<br>dateString: `(string \| undefined)[] \| undefined`|
|select|选中日期发生改变但组件值未改变|value: `(Date \| string \| number \| undefined)[]`<br>date: `(Date \| undefined)[]`<br>dateString: `(string \| undefined)[]`|
|popup-visible-change|打开或关闭弹出框|visible: `boolean`|
|ok|点击确认按钮|value: `Date \| string \| number[]`<br>date: `Date[]`<br>dateString: `string[]`|
|clear|点击清除按钮|-|
|select-shortcut|点击快捷选项|shortcut: `ShortcutType`|
|picker-value-change|面板日期改变|value: `Date \| string \| number[]`<br>date: `Date[]`<br>dateString: `string[]`|




### ShortcutType

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|label|选项的内容|`string \| number \| (() => VNode)`|`-`|
|value|选项值|`(Date \| string \| number)    \| (Date \| string \| number)[]    \| (() => (Date \| string \| number) \| (Date \| string \| number)[])`|`-`|
|format|解析值所使用的格式，参考[字符串解析格式](#字符串解析格式)|`string`|`-`|



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

## FAQ

### 关于 `locale` 字段
可以使用组件库提供的语言包配置 `locale` 字段。

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/date-picker/basic.vue';
const basicSource = "<template>\n  <a-date-picker style=\"width: 200px;\" />\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "日期输入器的基础使用。";
import controlDemo from '../../.vitepress/theme/generated/date-picker/control.vue';
const controlSource = "<template>\n  <a-space>\n    <a-date-picker v-model=\"value\" style=\"width: 200px;\" />\n    <a-range-picker v-model=\"rangeValue\" style=\"width: 300px;\" />\n  <\/a-space>\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      value: Date.now(),\n      rangeValue: [Date.now(), Date.now()],\n    }\n  }\n}\n<\/script>";
const controlTitle = "Control.Md";
const controlDescription = "通过 `v-model` 实现值的双向绑定";
import dateRenderDemo from '../../.vitepress/theme/generated/date-picker/dateRender.vue';
const dateRenderSource = "<template>\n  <a-date-picker>\n    <template #cell=\"{ date }\">\n      <div class=\"arco-picker-date\">\n        <div class=\"arco-picker-date-value\" :style=\"getCellStyle(date)\">\n          {{ date.getDate() }}\n        <\/div>\n      <\/div>\n    <\/template>\n  <\/a-date-picker>\n<\/template>\n<script>\nexport default {\n  setup() {\n    const highlightDates = [6, 14, 22];\n    const highlightStyle = {\n      border: '1px solid rgb(var(--arcoblue-6))',\n    };\n    return {\n      getCellStyle(date) {\n        return highlightDates.includes(date.getDate()) ? highlightStyle : {}\n      }\n    }\n  }\n}\n<\/script>";
const dateRenderTitle = "Date Render.Md";
const dateRenderDescription = "利用具名插槽  `cell` 可以定制日期单元格。";
import defaultValueDemo from '../../.vitepress/theme/generated/date-picker/defaultValue.vue';
const defaultValueSource = "<template>\n  <a-date-picker\n    defaultValue=\"2019-06-03\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    :style=\"style\"\n  />\n  <a-date-picker\n    defaultValue=\"2019-06-03\"\n    :format=\"(value) => `custom format: ${dayjs(value).format('YYYY-MM-DD')}`\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    :style=\"{ ...style, width: '240px' }\"\n  />\n  <a-date-picker\n    showTime\n    defaultValue=\"2019-06-03 08:00:00\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    :style=\"style\"\n  />\n  <a-year-picker\n    defaultValue=\"2019\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    :style=\"style\"\n  />\n  <a-month-picker\n    defaultValue=\"2019-06\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    :style=\"style\"\n  />\n  <a-week-picker\n    :defaultValue=\"dayjs('2019-08-02')\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    :style=\"style\"\n  />\n  <a-range-picker\n    showTime\n    :defaultValue=\"['2019-08-08 00:00:00', '2019-08-18 00:00:00']\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    :style=\"{ ...style, width: '360px' }\"\n  />\n  <a-range-picker\n    mode=\"month\"\n    :defaultValue=\"['2019-08', '2020-06']\"\n    @select=\"onSelect\"\n    @change=\"onChange\"\n    style=\"width: 300px; marginBottom: 24px;\"\n  />\n<\/template>\n<script>\nimport dayjs from 'dayjs';\n\nexport default {\n  setup() {\n    return {\n      dayjs,\n      onSelect(dateString, date) {\n        console.log('onSelect', dateString, date);\n      },\n      onChange(dateString, date) {\n        console.log('onChange: ', dateString, date);\n      },\n      style: { width: '200px', marginBottom: '24px', marginRight: '24px' }\n    }\n  }\n}\n<\/script>";
const defaultValueTitle = "Default Value.Md";
const defaultValueDescription = "日期输入器有默认值的情况。";
import disabledDateAdvanceDemo from '../../.vitepress/theme/generated/date-picker/disabledDateAdvance.vue';
const disabledDateAdvanceSource = "<template>\n  <a-range-picker\n      style=\"width: 300px;\"\n      @select=\"onSelect\"\n      @popupVisibleChange=\"onPopupVisibleChange\"\n      :disabledDate=\"disabledDate\"\n    />\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      dates: [],\n    }\n  },\n  methods: {\n    onSelect(valueString, value) {\n      this.dates = value;\n    },\n    onPopupVisibleChange(visible) {\n      if (!visible) {\n        this.dates = []\n      }\n    },\n    disabledDate(current) {\n      const dates = this.dates;\n      if (dates && dates.length) {\n        const tooLate = dates[0] && Math.abs((new Date(current) - dates[0]) / (24 * 60 * 60 * 1000)) > 7;\n        const tooEarly = dates[1] && Math.abs((new Date(current) - dates[1]) / (24 * 60 * 60 * 1000)) > 7;\n        return tooEarly || tooLate;\n      }\n      return false;\n    }\n  }\n}\n<\/script>";
const disabledDateAdvanceTitle = "Disabled Date Advance.Md";
const disabledDateAdvanceDescription = "根据选择的值来控制选取的范围，使用 `onSelect` 配合 `disabledDate` 来实现。";
import disabledDateDemo from '../../.vitepress/theme/generated/date-picker/disabledDate.vue';
const disabledDateSource = "<template>\n  <div>\n    <a-date-picker\n      style=\"width: 200px; margin-right: 24px; margin-bottom: 24px;\"\n      :disabledDate=\"(current) => dayjs(current).isBefore(dayjs())\"\n    />\n    <a-range-picker\n      style=\"width: 360px; margin-right: 24px; margin-bottom: 24px;\"\n      :disabledDate=\"(current) => dayjs(current).isBefore(dayjs())\"\n    />\n    <a-date-picker\n      style=\"width: 200px; margin-right: 24px; margin-bottom: 24px;\"\n      show-time\n      :disabledDate=\"(current) => dayjs(current).isBefore(dayjs())\"\n      :disabledTime=\"getDisabledTime\"\n    />\n    <a-range-picker\n      style=\"width: 360px; margin-bottom: 24px;\"\n      show-time\n      :timePickerProps=\"{hideDisabledOptions: true}\"\n      :disabledDate=\"(current) => dayjs(current).isBefore(dayjs())\"\n      :disabledTime=\"getDisabledRangeTime\"\n    />\n  <\/div>\n<\/template>\n<script>\nimport dayjs from 'dayjs';\n\nfunction range(start, end) {\n  const result = [];\n  for (let i = start; i < end; i++) {\n    result.push(i);\n  }\n  return result;\n}\n\nfunction getDisabledTime(date) {\n  return {\n    disabledHours: () => range(6, 24),\n    disabledMinutes: () => range(30, 60),\n    disabledSeconds: () => range(30, 60),\n  };\n}\n\nfunction getDisabledRangeTime(date, type) {\n  return {\n    disabledHours: () => type === 'start' ? range(0, 6): range(6, 24),\n    disabledMinutes: () => type === 'end' ? range(0, 30) : [31, 60],\n    disabledSeconds: () => range(30, 60),\n  };\n}\n\nexport default {\n  setup() {\n    return {\n      dayjs,\n      getDisabledTime,\n      getDisabledRangeTime,\n    }\n  }\n}\n<\/script>";
const disabledDateTitle = "Disabled Date.Md";
const disabledDateDescription = "使用 `disabledDate` 可以禁用某些日期。使用 `disabledTime` 可以禁用时间，需要配合 `showTime` 使用。";
import disabledDemo from '../../.vitepress/theme/generated/date-picker/disabled.vue';
const disabledSource = "<template>\n  <a-date-picker\n    defaultValue=\"2020-08-08\"\n    disabled\n    style=\"width: 200px; margin-bottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    :defaultValue=\"['2020-08-08', '2020-08-18']\"\n    disabled\n    style=\"width: 300px; margin-bottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    :defaultValue=\"['2020-08-08']\"\n    :disabled=\"[true, false]\"\n    :disabledDate=\"(current) => dayjs(current).isBefore(dayjs('2020-08-08'))\"\n    style=\"width: 300px; margin-bottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    showTime\n    :defaultValue=\"['2020-08-08 02:02:02']\"\n    :disabled=\"[true, false]\"\n    style=\"width: 380px;\"\n  />\n<\/template>\n<script>\nimport dayjs from 'dayjs';\nexport default {\n  setup() {\n    return {\n      dayjs\n    };\n  }\n}\n<\/script>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "禁用状态。";
import extraDemo from '../../.vitepress/theme/generated/date-picker/extra.vue';
const extraSource = "<template>\n  <a-date-picker style=\"width: 200px; margin-bottom: 20px\">\n    <template #extra>Extra footer<\/template>\n  <\/a-date-picker>\n  <br />\n  <a-range-picker showTime style=\"width: 360px;\">\n    <template #extra>Extra footer<\/template>\n  <\/a-range-picker>\n<\/template>";
const extraTitle = "Extra.Md";
const extraDescription = "在浮层中加入额外的页脚，以满足某些定制信息的需求。";
import monthDemo from '../../.vitepress/theme/generated/date-picker/month.vue';
const monthSource = "<template>\n  <a-month-picker style=\"width: 200px;\" />\n<\/template>";
const monthTitle = "Month.Md";
const monthDescription = "月份输入器的基础使用。";
import panelOnlyDemo from '../../.vitepress/theme/generated/date-picker/panelOnly.vue';
const panelOnlySource = "<template>\n  <div>\n    <a-date-picker\n      default-value=\"2019-06-03\"\n      v-model:pickerValue=\"pickerValue\"\n      hide-trigger\n      style=\"width: 268px;\"\n    />\n    <a-range-picker\n      :default-value=\"['2019-08-01', '2020-06-01']\"\n      v-model:pickerValue=\"rangePickerValue\"\n      hide-trigger\n      style=\"width: 560px; margin-top: 20px;\"\n    />\n  <\/div>\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      pickerValue: null,\n      rangePickerValue: null,\n    };\n  }\n};\n<\/script>";
const panelOnlyTitle = "Panel Only.Md";
const panelOnlyDescription = "只用选择面板，不显示输入框。";
import prefixDemo from '../../.vitepress/theme/generated/date-picker/prefix.vue';
const prefixSource = "<template>\n  <div>\n    <div>\n      <a-date-picker style=\"width: 300px;\">\n        <template #prefix>\n          <IconInfoCircle />\n        <\/template>\n      <\/a-date-picker>\n    <\/div>\n    <a-range-picker\n      showTime\n      :defaultValue=\"['2019-08-08 00:00:00', '2019-08-18 00:00:00']\"\n      @select=\"onSelect\"\n      @change=\"onChange\"\n      :style=\"{ width: '400px', marginTop: '20px' }\"\n    >\n      <template #prefix>\n        <IconInfoCircle />\n      <\/template>\n    <\/a-range-picker>\n  <\/div>\n<\/template>\n\n<script>\nimport { IconInfoCircle } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: { IconInfoCircle },\n};\n<\/script>";
const prefixTitle = "Prefix.Md";
const prefixDescription = "通过 `prefix` 插槽可以设置输入框前缀";
import quarterDemo from '../../.vitepress/theme/generated/date-picker/quarter.vue';
const quarterSource = "<template>\n  <a-quarter-picker style=\"width: 200px;\" />\n<\/template>";
const quarterTitle = "Quarter.Md";
const quarterDescription = "季度选择器的使用。";
import rangeDemo from '../../.vitepress/theme/generated/date-picker/range.vue';
const rangeSource = "<template>\n  <a-range-picker\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    style=\"width: 254px; marginBottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    mode=\"week\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    style=\"width: 254px; marginBottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    mode=\"month\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    style=\"width: 254px; marginBottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    mode=\"year\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    style=\"width: 254px; marginBottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    mode=\"quarter\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    style=\"width: 254px; marginBottom: 20px;\"\n  />\n  <br />\n  <a-range-picker\n    showTime\n    :time-picker-props=\"{\n    defaultValue:['00:00:00','00:00:00']\n    }\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    style=\" width: 380px; \"\n  />\n<\/template>\n<script>\nexport default {\n  setup() {\n    return {\n      onSelect(dateString, date) {\n        console.log('onSelect', dateString, date);\n      },\n      onChange(dateString, date) {\n        console.log('onChange: ', dateString, date);\n      },\n    };\n  },\n}\n<\/script>";
const rangeTitle = "Range.Md";
const rangeDescription = "范围输入器的基础使用。";
import shortcutsPositionDemo from '../../.vitepress/theme/generated/date-picker/shortcutsPosition.vue';
const shortcutsPositionSource = "<template>\n  <a-date-picker\n    style=\"width: 254px; margin-bottom: 20px; margin-right: 24px;\"\n    shortcuts-position=\"left\"\n    :shortcuts=\"shortcuts\"\n  />\n  <a-range-picker\n    style=\"width: 300px; margin-bottom: 20px;\"\n    shortcuts-position=\"left\"\n    :shortcuts=\"rangeShortcuts\"\n  />\n  <br />\n  <a-date-picker\n    style=\"width: 254px; margin-right: 24px;\"\n    shortcuts-position=\"right\"\n    :shortcuts=\"shortcuts\"\n  />\n  <a-range-picker\n    style=\"width: 300px;\"\n    shortcuts-position=\"right\"\n    :shortcuts=\"rangeShortcuts\"\n  />\n<\/template>\n<script>\nimport dayjs from 'dayjs';\nexport default {\n  setup() {\n    return {\n      dayjs,\n      shortcuts: [\n        {\n          label: 'yesterday',\n          value: () => dayjs().subtract(1, 'day')\n        },\n        {\n          label: 'today',\n          value: () => dayjs(),\n        },\n        {\n          label: 'a week later',\n          value: () => dayjs().add(1, 'week'),\n        },\n        {\n          label: 'a month later',\n          value: () => dayjs().add(1, 'month'),\n        },\n        {\n          label: '2 months later',\n          value: () => dayjs().add(2, 'month'),\n        }\n      ],\n      rangeShortcuts: [\n        {\n          label: 'next 2 days',\n          value: () => [dayjs(), dayjs().add(2, 'day')],\n        },\n        {\n          label: 'next 7 days',\n          value: () => [dayjs(), dayjs().add(1, 'week')],\n        },\n        {\n          label: 'next 30 days',\n          value: () => [dayjs(), dayjs().add(1, 'month')],\n        },\n        {\n          label: 'next 6 months',\n          value: () => [dayjs(), dayjs().add(6, 'month')],\n        },\n        {\n          label: 'next 12 months',\n          value: () => [dayjs(), dayjs().add(1, 'year')],\n        },\n        {\n          label: 'next 10 years',\n          value: () => [dayjs(), dayjs().add(10, 'year')],\n        }\n      ]\n    }\n  }\n}\n<\/script>";
const shortcutsPositionTitle = "Shortcuts Position.Md";
const shortcutsPositionDescription = "使用 `shortcutsPosition` 可以将预设时间快捷选择放到左边、右边或者底部。";
import shortcutsDemo from '../../.vitepress/theme/generated/date-picker/shortcuts.vue';
const shortcutsSource = "<template>\n  <a-date-picker\n    style=\"width: 300px; margin-bottom: 24px; margin-right: 24px;\"\n    :shortcuts=\"[\n      {\n        label: '2 hours later',\n        value: () => dayjs().add(2, 'hour')\n      },\n      {\n        label: 'a week later',\n        value: () => dayjs().add(1, 'week'),\n      },\n      {\n        label: 'a month later',\n        value: () => dayjs().add(1, 'month'),\n      },\n    ]\"\n    show-time\n  />\n  <a-month-picker\n    style=\"width: 300px; margin-bottom: 24px; margin-right: 24px;\"\n    :shortcuts=\"[\n      {\n        label: 'last month',\n        value: () => dayjs().subtract(1, 'month'),\n      },\n      {\n        label: 'six months later',\n        value: () => dayjs().add(6, 'month'),\n      },\n      {\n        label: 'two years later',\n        value: () => dayjs().add(2, 'year'),\n      },\n    ]\"\n  />\n  <a-range-picker\n    style=\"width: 400px; margin-bottom: 24px; margin-right: 24px;\"\n    :shortcuts=\"[\n      {\n        label: 'next 7 days',\n        value: () => [dayjs(), dayjs().add(1, 'week')],\n      },\n      {\n        label: 'next 30 days',\n        value: () => [dayjs(), dayjs().add(1, 'month')],\n      },\n      {\n        label: 'next 365 days',\n        value: () => [dayjs(), dayjs().add(1, 'year')],\n      },\n    ]\"\n  />\n  <a-range-picker\n    mode=\"month\"\n    style=\"width: 300px; margin-bottom: 24px;\"\n    :shortcuts=\"[\n      {\n        label: 'next 6 months',\n        value: () => [dayjs(), dayjs().add(6, 'month')],\n      },\n      {\n        label: 'next 12 months',\n        value: () => [dayjs(), dayjs().add(1, 'year')],\n      },\n      {\n        label: 'next 10 years',\n        value: () => [dayjs(), dayjs().add(10, 'year')],\n      },\n    ]\"\n  />\n<\/template>\n<script>\nimport dayjs from 'dayjs';\nexport default {\n  setup() {\n    return {\n      dayjs\n    }\n  }\n}\n<\/script>";
const shortcutsTitle = "Shortcuts.Md";
const shortcutsDescription = "使用 `shortcuts` 可以预设时间快捷选择。";
import showtimeDemo from '../../.vitepress/theme/generated/date-picker/showtime.vue';
const showtimeSource = "<template>\n  <a-date-picker\n    style=\"width: 220px; margin: 0 24px 24px 0;\"\n    show-time\n    :time-picker-props=\"{ defaultValue: '09:09:06' }\"\n    format=\"YYYY-MM-DD HH:mm:ss\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    @ok=\"onOk\"\n  />\n  <a-date-picker\n    style=\"width: 220px; margin: 0 24px 24px 0;\"\n    show-time\n    format=\"YYYY-MM-DD hh:mm\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    @ok=\"onOk\"\n  />\n  <a-range-picker\n    style=\"width: 360px; margin: 0 24px 24px 0;\"\n    show-time\n    :time-picker-props=\"{ defaultValue: ['00:00:00', '09:09:06'] }\"\n    format=\"YYYY-MM-DD HH:mm\"\n    @change=\"onChange\"\n    @select=\"onSelect\"\n    @ok=\"onOk\"\n  />\n<\/template>\n<script>\nexport default {\n  setup() {\n    function onSelect(dateString, date) {\n      console.log('onSelect', dateString, date);\n    }\n\n    function onChange(dateString, date) {\n      console.log('onChange: ', dateString, date);\n    }\n\n    function onOk(dateString, date) {\n      console.log('onOk: ', dateString, date);\n    }\n    return {\n      onSelect,\n      onChange,\n      onOk,\n    };\n  }\n}\n<\/script>";
const showtimeTitle = "Showtime.Md";
const showtimeDescription = "使用 `showTime` 可以使用带时间的日期选择。";
import sizeDemo from '../../.vitepress/theme/generated/date-picker/size.vue';
const sizeSource = "<template>\n  <div style=\"margin-bottom: 20px;\">\n    <a-radio-group v-model=\"size\" type='button'>\n      <a-radio value=\"mini\">mini<\/a-radio>\n      <a-radio value=\"small\">small<\/a-radio>\n      <a-radio value=\"medium\">medium<\/a-radio>\n      <a-radio value=\"large\">large<\/a-radio>\n    <\/a-radio-group>\n  <\/div>\n  <a-date-picker\n    :size=\"size\"\n    style=\"width: 254px;\"\n  />\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      size: 'small'\n    }\n  }\n}\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "设置 `size` 可以使用四种尺寸（`mini` `small` `medium` `large`）的输入框。高度分别对应 24px、28px、32px、36px。";
import triggerElementDemo from '../../.vitepress/theme/generated/date-picker/triggerElement.vue';
const triggerElementSource = "<template>\n  <a-space>\n    <a-date-picker\n      style=\"width: 268px;\"\n      v-model=\"value\"\n    >\n      <a-button>{{ value || '请选择日期' }}<\/a-button>\n    <\/a-date-picker>\n    <a-range-picker\n      style=\"width: 268px;\"\n      v-model=\"rangeValue\"\n    >\n      <a-button>{{ rangeValue && rangeValue.join(' - ') || '请选择日期范围' }}<\/a-button>\n    <\/a-range-picker>\n  <\/a-space>\n<\/template>\n<script>\nimport { ref } from 'vue';\nexport default {\n  setup() {\n    const value = ref();\n    const rangeValue = ref();\n    return {\n      value,\n      rangeValue,\n    }\n  }\n}\n<\/script>";
const triggerElementTitle = "Trigger Element.Md";
const triggerElementDescription = "自定义触发元素。";
import weekDemo from '../../.vitepress/theme/generated/date-picker/week.vue';
const weekSource = "<template>\n  <a-week-picker style=\"width: 200px; margin: 0 24px 24px 0;\" />\n  <a-week-picker\n    style=\"width: 200px; margin: 0 24px 24px 0;\"\n    day-start-of-week=\"1\"\n  />\n<\/template>";
const weekTitle = "Week.Md";
const weekDescription = "周选择器提供了一种选择星期的简单方法。也可以指定一周的起始日。";
import yearDemo from '../../.vitepress/theme/generated/date-picker/year.vue';
const yearSource = "<template>\n  <a-year-picker style=\"width: 200px;\" />\n<\/template>";
const yearTitle = "Year.Md";
const yearDescription = "年份输入器的基础使用。";
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
  :title="dateRenderTitle"
  :description="dateRenderDescription"
  :code="dateRenderSource"
>
  <dateRenderDemo />
</DemoBlock>

<DemoBlock
  :title="defaultValueTitle"
  :description="defaultValueDescription"
  :code="defaultValueSource"
>
  <defaultValueDemo />
</DemoBlock>

<DemoBlock
  :title="disabledDateAdvanceTitle"
  :description="disabledDateAdvanceDescription"
  :code="disabledDateAdvanceSource"
>
  <disabledDateAdvanceDemo />
</DemoBlock>

<DemoBlock
  :title="disabledDateTitle"
  :description="disabledDateDescription"
  :code="disabledDateSource"
>
  <disabledDateDemo />
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
  :title="monthTitle"
  :description="monthDescription"
  :code="monthSource"
>
  <monthDemo />
</DemoBlock>

<DemoBlock
  :title="panelOnlyTitle"
  :description="panelOnlyDescription"
  :code="panelOnlySource"
>
  <panelOnlyDemo />
</DemoBlock>

<DemoBlock
  :title="prefixTitle"
  :description="prefixDescription"
  :code="prefixSource"
>
  <prefixDemo />
</DemoBlock>

<DemoBlock
  :title="quarterTitle"
  :description="quarterDescription"
  :code="quarterSource"
>
  <quarterDemo />
</DemoBlock>

<DemoBlock
  :title="rangeTitle"
  :description="rangeDescription"
  :code="rangeSource"
>
  <rangeDemo />
</DemoBlock>

<DemoBlock
  :title="shortcutsPositionTitle"
  :description="shortcutsPositionDescription"
  :code="shortcutsPositionSource"
>
  <shortcutsPositionDemo />
</DemoBlock>

<DemoBlock
  :title="shortcutsTitle"
  :description="shortcutsDescription"
  :code="shortcutsSource"
>
  <shortcutsDemo />
</DemoBlock>

<DemoBlock
  :title="showtimeTitle"
  :description="showtimeDescription"
  :code="showtimeSource"
>
  <showtimeDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="triggerElementTitle"
  :description="triggerElementDescription"
  :code="triggerElementSource"
>
  <triggerElementDemo />
</DemoBlock>

<DemoBlock
  :title="weekTitle"
  :description="weekDescription"
  :code="weekSource"
>
  <weekDemo />
</DemoBlock>

<DemoBlock
  :title="yearTitle"
  :description="yearDescription"
  :code="yearSource"
>
  <yearDemo />
</DemoBlock>
