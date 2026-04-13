---
title: 'verification-code'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 验证码输入 VerificationCode
description: 验证码输入组件
```

## API

### `<verification-code>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| model-value **(v-model)** | 绑定值 | `string` | `-` |
| default-value | 默认值（非受控状态） | `string` | `''` |
| length | 验证码的长度，根据长度渲染对应个数的输入框 | `number` | `6` |
| size | 输入框大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |
| disabled | 是否禁用 | `boolean` | `false` |
| masked | 是否密码模式 | `boolean` | `false` |
| readonly | 只读 | `boolean` | `false` |
| error | 是否为错误状态 | `boolean` | `false` |
| separator | 分隔符。可在不同索引的输入框后自定义渲染分隔符 | `(index: number, character: string) => VNode` | `-` |
| formatter | 格式化函数，当用户输入值改变时触发 | `(inputValue: string, index: number, value: string) => string \| boolean` | `-` |

### `<verification-code>` Events

| 事件名 | 描述             | 参数                                                   |
| ------ | ---------------- | ------------------------------------------------------ |
| change | 值发生改变时触发 | value: `string`                                        |
| finish | 填充完成时触发   | value: `string`                                        |
| input  | 输入时触发       | inputValue: `string`<br>index: `number`<br>ev: `Event` |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/verification-code/basic.vue';
const basicSource = "<template>\n  <a-verification-code v-model=\"value\" style=\"width: 300px\" @finish=\"onFinish\" />\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\nimport { Message} from '@sdata/web-vue';\n\nconst value = ref('654321');\nconst onFinish = (value) => Message.info(`Verification code: ${value}`);\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "验证码输入框的基本用法。";
import formDemo from '../../.vitepress/theme/generated/verification-code/form.vue';
const formSource = "<template>\n  <a-form ref=\"formRef\" :model=\"form\" style=\"width: 300px\">\n    <a-form-item\n      field=\"code\"\n      label=\"code\"\n      :rules=\"[\n        {required:true,message:'Verification code is required'},\n        {minLength:6, message:'Verification code is incomplete'},\n        { match: /^\\d+$/, message: 'Must be numeric' },\n      ]\"\n    >\n      <a-verification-code v-model=\"form.code\" style=\"width: 300px\" @finish=\"onFinish\" />\n    <\/a-form-item>\n    <a-form-item>\n      <a-button style=\"width: 60px\" type='primary' size='large' htmlType='submit'>Submit<\/a-button>\n    <\/a-form-item>\n  <\/a-form>\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\nimport { Message} from '@sdata/web-vue';\n\nconst value = ref('654321');\nconst formRef = ref(null);\nconst form = ref({\n  code: '',\n})\nconst onFinish = (value) => Message.info(`Verification code: ${value}`);\n<\/script>";
const formTitle = "Form.Md";
const formDescription = "配合表单使用实现校验。";
import formatterDemo from '../../.vitepress/theme/generated/verification-code/formatter.vue';
const formatterSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-verification-code\n      defaultValue='123456'\n      style=\"width: 300px\"\n      :formatter=\"(inputValue) =>  /^\\d*$/.test(inputValue) ? inputValue : false\"\n    />\n    <a-verification-code\n      defaultValue='abcdef'\n      style=\"width: 300px\"\n      :formatter=\"(inputValue) => /^[a-zA-Z]*$/.test(inputValue) ? inputValue.toUpperCase() : ''\"\n    />\n  <\/a-space>\n<\/template>";
const formatterTitle = "Formatter.Md";
const formatterDescription = "通过 `formatter` 校验输入。此外，可以返回非布尔类型来将用户输入的字符串为特定的格式。";
import maskedDemo from '../../.vitepress/theme/generated/verification-code/masked.vue';
const maskedSource = "<template>\n  <a-verification-code defaultValue=\"123\" style=\"width: 300px\"  masked @finish=\"onFinish\" />\n<\/template>\n\n<script setup>\nimport { Message} from '@sdata/web-vue';\n\nconst onFinish = (value) => Message.info(`Verification code: ${value}`);\n<\/script>";
const maskedTitle = "Masked.Md";
const maskedDescription = "指定 `masked = true`可开启密码模式";
import separatorDemo from '../../.vitepress/theme/generated/verification-code/separator.vue';
const separatorSource = "<template>\n  <a-verification-code\n    style=\"width: 400px\"\n    :length=\"9\"\n    :separator=\"(index) => (index + 1) % 3 || index > 7 ? null : '-'\"\n    @finish=\"(value) => Message.info(`Verification code: ${value}`)\"\n  />\n<\/template>\n\n<script setup>\nimport { Message} from '@sdata/web-vue';\n<\/script>";
const separatorTitle = "Separator.Md";
const separatorDescription = "指定 `separator` 可以自定义渲染分隔符。";
import statusDemo from '../../.vitepress/theme/generated/verification-code/status.vue';
const statusSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-space>\n      <a-typography-text style=\"width: 80px\">Disabled:<\/a-typography-text>\n      <a-verification-code defaultValue=\"123456\" style=\"width: 300px\" disabled />\n    <\/a-space>\n    <a-space>\n      <a-typography-text  style=\"width: 80px\">Readonly:<\/a-typography-text>\n      <a-verification-code defaultValue=\"123456\" style=\"width: 300px\" readonly />\n    <\/a-space>\n    <a-space>\n      <a-typography-text style=\"width: 80px\">Error:<\/a-typography-text>\n      <a-verification-code defaultValue=\"123456\" style=\"width: 300px\" error />\n    <\/a-space>\n  <\/a-space>\n<\/template>";
const statusTitle = "Status.Md";
const statusDescription = "禁用状态、只读状态、错误状态。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="formTitle" :description="formDescription" :code="formSource"

>   <formDemo />
> </DemoBlock>

<DemoBlock :title="formatterTitle" :description="formatterDescription" :code="formatterSource"

>   <formatterDemo />
> </DemoBlock>

<DemoBlock :title="maskedTitle" :description="maskedDescription" :code="maskedSource"

>   <maskedDemo />
> </DemoBlock>

<DemoBlock :title="separatorTitle" :description="separatorDescription" :code="separatorSource"

>   <separatorDemo />
> </DemoBlock>

<DemoBlock :title="statusTitle" :description="statusDescription" :code="statusSource"

>   <statusDemo />
> </DemoBlock>
