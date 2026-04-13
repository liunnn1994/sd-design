---
title: 'result'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 反馈
title: 结果页 Result
description: 用于反馈一系列操作任务的处理结果，当有重要操作需告知用户处理结果，且反馈内容较为复杂时使用。
```

## API

### `<result>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| status | 结果页显示的状态 | `'info' \| 'success' \| 'warning' \| 'error' \| '403' \| '404' \| '500' \| null` | `'info'` |
| title | 标题内容 | `string` | `-` |
| subtitle | 子标题内容 | `string` | `-` |

### `<result>` Slots

| 插槽名   |   描述   | 参数 | 版本  |
| -------- | :------: | ---- | :---- |
| icon     |   图标   | -    |       |
| title    |   标题   | -    |       |
| subtitle |  副标题  | -    |       |
| extra    |  操作区  | -    | 2.8.0 |
| default  | 默认插槽 | -    | 2.8.0 |

<script setup lang="ts">
import demo403Demo from '../../.vitepress/theme/generated/result/demo403.vue';
const demo403Source = "<template>\n  <a-result\n    status=\"403\"\n    subtitle=\"Access to this resource on the server is denied.\"\n  >\n    <template #extra>\n      <a-space>\n        <a-button type=\"primary\">Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>";
const demo403Title = "403.Md";
const demo403Description = "没有当前页面的访问权限。";
import demo404Demo from '../../.vitepress/theme/generated/result/demo404.vue';
const demo404Source = "<template>\n  <a-result status=\"404\" subtitle=\"Whoops, that page is gone.\">\n    <template #extra>\n      <a-space>\n        <a-button type=\"primary\">Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>";
const demo404Title = "404.Md";
const demo404Description = "页面未找到";
import demo500Demo from '../../.vitepress/theme/generated/result/demo500.vue';
const demo500Source = "<template>\n  <a-result status=\"500\" subtitle=\"This page isn’t working.\">\n    <template #extra>\n      <a-space>\n        <a-button type=\"primary\">Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>";
const demo500Title = "500.Md";
const demo500Description = "通常表示服务器错误";
import allDemo from '../../.vitepress/theme/generated/result/all.vue';
const allSource = "<template>\n  <a-result status=\"error\" title=\"No internet \">\n    <template #icon>\n      <IconFaceFrownFill />\n    <\/template>\n    <template #subtitle> DNS_PROBE_FINISHED_NO_INTERNET <\/template>\n\n    <template #extra>\n      <a-button type=\"primary\">Refresh<\/a-button>\n    <\/template>\n    <a-typography style=\"background: var(--color-fill-2); padding: 24px;\">\n      <a-typography-paragraph>Try:<\/a-typography-paragraph>\n      <ul>\n        <li> Checking the network cables, modem, and router <\/li>\n        <li> Reconnecting to Wi-Fi <\/li>\n      <\/ul>\n    <\/a-typography>\n  <\/a-result>\n<\/template>\n\n<script>\nimport { IconFaceFrownFill } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconFaceFrownFill\n  },\n}\n<\/script>";
const allTitle = "All.Md";
const allDescription = "完整功能";
import basicDemo from '../../.vitepress/theme/generated/result/basic.vue';
const basicSource = "<template>\n  <a-result title=\"This is title content\" subtitle=\"This is subtitle content\">\n    <template #extra>\n      <a-space>\n        <a-button type=\"secondary\">Again<\/a-button>\n        <a-button type=\"primary\">Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "展示结果状态。";
import customDemo from '../../.vitepress/theme/generated/result/custom.vue';
const customSource = "<template>\n  <a-result :status=\"null\" title=\"This is title content\" subtitle=\"This is subtitle content\">\n    <template #icon>\n      <IconFaceSmileFill />\n    <\/template>\n    <template #extra>\n      <a-space>\n        <a-button type=\"secondary\">Again<\/a-button>\n        <a-button type=\"primary\">Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>\n<script>\nimport { IconFaceSmileFill } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconFaceSmileFill\n  },\n}\n<\/script>";
const customTitle = "Custom.Md";
const customDescription = "自定义状态。需要传入指定的图标";
import errorDemo from '../../.vitepress/theme/generated/result/error.vue';
const errorSource = "<template>\n  <a-result status=\"error\" title=\"This is title content\">\n    <template #subtitle>\n      This is subtitle content\n    <\/template>\n\n    <template #extra>\n      <a-space>\n        <a-button type='primary'>Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>";
const errorTitle = "Error.Md";
const errorDescription = "展示错误状态。";
import successDemo from '../../.vitepress/theme/generated/result/success.vue';
const successSource = "<template>\n  <a-result status=\"success\" title=\"This is title content\" >\n    <template #subtitle>\n      This is subtitle content\n    <\/template>\n    <template #extra>\n      <a-space>\n        <a-button type='primary'>Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>";
const successTitle = "Success.Md";
const successDescription = "展示成功状态。";
import warningDemo from '../../.vitepress/theme/generated/result/warning.vue';
const warningSource = "<template>\n  <a-result status=\"warning\" title=\"This is title content\">\n    <template #subtitle>\n      This is subtitle content\n    <\/template>\n\n    <template #extra>\n      <a-space>\n        <a-button type='primary'>Back<\/a-button>\n      <\/a-space>\n    <\/template>\n  <\/a-result>\n<\/template>";
const warningTitle = "Warning.Md";
const warningDescription = "展示警告状态。";
</script>

## 示例

<DemoBlock :title="demo403Title" :description="demo403Description" :code="demo403Source"

>   <demo403Demo />
> </DemoBlock>

<DemoBlock :title="demo404Title" :description="demo404Description" :code="demo404Source"

>   <demo404Demo />
> </DemoBlock>

<DemoBlock :title="demo500Title" :description="demo500Description" :code="demo500Source"

>   <demo500Demo />
> </DemoBlock>

<DemoBlock :title="allTitle" :description="allDescription" :code="allSource"

>   <allDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="customTitle" :description="customDescription" :code="customSource"

>   <customDemo />
> </DemoBlock>

<DemoBlock :title="errorTitle" :description="errorDescription" :code="errorSource"

>   <errorDemo />
> </DemoBlock>

<DemoBlock :title="successTitle" :description="successDescription" :code="successSource"

>   <successDemo />
> </DemoBlock>

<DemoBlock :title="warningTitle" :description="warningDescription" :code="warningSource"

>   <warningDemo />
> </DemoBlock>
