---
title: 'textarea'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 文本域 Textarea
description: 多行纯文本编辑控件，适用于评论或反馈表单中的一段意见。
```

## API

### `<textarea>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| model-value **(v-model)** | 绑定值 | `string` | `-` |  |
| default-value | 默认值（非受控状态） | `string` | `''` |  |
| placeholder | 提示文字 | `string` | `-` |  |
| disabled | 是否禁用 | `boolean` | `false` |  |
| error | 是否为错误状态 | `boolean` | `false` |  |
| max-length | 输入值的最大长度，errorOnly 属性在 2.12.0 版本添加 | `number \| { length: number; errorOnly?: boolean }` | `0` |  |
| show-word-limit | 是否显示字数统计 | `boolean` | `false` |  |
| allow-clear | 是否允许清空文本域 | `boolean` | `false` |  |
| auto-size | 是否让文本框自适应内容高度 | `boolean \| { minRows?: number; maxRows?: number }` | `false` |  |
| word-length | 字符长度的计算方法 | `(value: string) => number` | `-` |  |
| word-slice | 字符截取方法，同 wordLength 一起使用 | `(value: string, maxLength: number) => string` | `-` | 2.12.0 |
| textarea-attrs | 透传给 textarea 的属性 | `Record<string, any>` | `-` |  |

### `<textarea>` Events

| 事件名 | 描述                 | 参数                           |
| ------ | -------------------- | ------------------------------ |
| input  | 用户输入时触发       | value: `string`<br>ev: `Event` |
| change | 仅在文本框失焦时触发 | value: `string`<br>ev: `Event` |
| clear  | 点击清除按钮时触发   | ev: `MouseEvent`               |
| focus  | 文本框获取焦点时触发 | ev: `FocusEvent`               |
| blur   | 文本框失去焦点时触发 | ev: `FocusEvent`               |

### `<textarea>` Methods

| 方法名 | 描述             | 参数 | 返回值 | 版本   |
| ------ | ---------------- | ---- | ------ | :----- |
| focus  | 使输入框获取焦点 | -    | -      | 2.24.0 |
| blur   | 使输入框失去焦点 | -    | -      | 2.24.0 |

<script setup lang="ts">
import autoSizeDemo from '../../.vitepress/theme/generated/textarea/autoSize.vue';
const autoSizeSource = "<template>\n  <a-textarea default-value=\"This is the contents of the textarea. This is the contents of the textarea. This is the contents of the textarea.\" auto-size />\n  <a-textarea default-value=\"This is the contents of the textarea. This is the contents of the textarea. This is the contents of the textarea.\" :auto-size=\"{\n    minRows:2,\n    maxRows:5\n  }\" style=\"margin-top: 20px\"/>\n<\/template>";
const autoSizeTitle = "Auto Size.Md";
const autoSizeDescription = "通过设置 `auto-size`，可以让文本框自适应输入内容。";
import basicDemo from '../../.vitepress/theme/generated/textarea/basic.vue';
const basicSource = "<template>\n  <a-textarea placeholder=\"Please enter something\" allow-clear/>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "可以用于多行输入。";
import statusDemo from '../../.vitepress/theme/generated/textarea/status.vue';
const statusSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\" style=\"width: 100%\">\n    <a-textarea placeholder=\"Disabled status\" disabled/>\n    <a-textarea placeholder=\"Error status\" error/>\n  <\/a-space>\n<\/template>";
const statusTitle = "Status.Md";
const statusDescription = "文本域可以设置禁用和错误状态。";
import wordLimitDemo from '../../.vitepress/theme/generated/textarea/wordLimit.vue';
const wordLimitSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\" fill>\n    <a-textarea placeholder=\"Please enter something\" :max-length=\"10\" allow-clear show-word-limit />\n    <a-textarea placeholder=\"Please enter something\" :max-length=\"{length:10,errorOnly:true}\" allow-clear\n                show-word-limit />\n  <\/a-space>\n<\/template>";
const wordLimitTitle = "Word Limit.Md";
const wordLimitDescription = "设置 `max-length` 可以限制最大字数，配合 `show-word-limit` 可以显示字数统计。";
</script>

## 示例

<DemoBlock :title="autoSizeTitle" :description="autoSizeDescription" :code="autoSizeSource"

>   <autoSizeDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="statusTitle" :description="statusDescription" :code="statusSource"

>   <statusDemo />
> </DemoBlock>

<DemoBlock :title="wordLimitTitle" :description="wordLimitDescription" :code="wordLimitSource"

>   <wordLimitDemo />
> </DemoBlock>
