---
title: 'collapse'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 折叠面板 Collapse
description: 可以折叠 / 展开的内容区域。
```

## API

### `<collapse>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| active-key **(v-model)** | 当前展开的面板的 `key` | `(string \| number)[]` | `-` |  |
| default-active-key | 默认展开的面板的 `key` （非受控模式） | `(string \| number)[]` | `[]` |  |
| accordion | 是否开启手风琴模式 | `boolean` | `false` |  |
| show-expand-icon | 是否显示展开图标 | `boolean` | `-` | 2.33.0 |
| expand-icon-position | 展开图标显示的位置 | `'left' \| 'right'` | `'left'` |  |
| bordered | 是否显示边框 | `boolean` | `true` |  |
| destroy-on-hide | 是否在隐藏时销毁内容 | `boolean` | `false` | 2.27.0 |

### `<collapse>` Events

| 事件名 | 描述                     | 参数                                             |
| ------ | ------------------------ | ------------------------------------------------ |
| change | 展开的面板发生改变时触发 | activeKey: `(string \| number)[]`<br>ev: `Event` |

### `<collapse-item>` Props

| 参数名           | 描述                 | 类型      | 默认值  | 版本   |
| ---------------- | -------------------- | --------- | :-----: | :----- |
| header           | 面板的标题           | `string`  |   `-`   |        |
| disabled         | 是否禁用             | `boolean` | `false` |        |
| show-expand-icon | 是否显示展开图标     | `boolean` | `true`  |        |
| destroy-on-hide  | 是否在隐藏时销毁内容 | `boolean` | `false` | 2.27.0 |

### `<collapse-item>` Slots

| 插槽名 | 描述 | 参数 | 版本 |
| --- | :-: | --- | :-- |
| extra | 额外内容 | - |  |
| expand-icon | 展开图标 | active: `boolean`<br>disabled: `boolean`<br>position: `'left' \| 'right'` | 2.33.0 |
| header | 面板的标题 | - |  |

## FAQ

### `<CollapseItem>` 组件的 `key` 属性为必填

在 `<Collapse>` 组件中每个 `<CollapseItem>` 都需要指定唯一的 `key` 属性，`key` 对应 `activeKey` 中的值。

<script setup lang="ts">
import accordionDemo from '../../.vitepress/theme/generated/collapse/accordion.vue';
const accordionSource = "<template>\n  <a-collapse :default-active-key=\"[1]\" accordion>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"2\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>";
const accordionTitle = "Accordion.Md";
const accordionDescription = "通过 `accordion` 开启手风琴模式，同时只能打开一个面板。";
import basicDemo from '../../.vitepress/theme/generated/collapse/basic.vue';
const basicSource = "<template>\n  <a-collapse :default-active-key=\"['1', 2]\">\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :key=\"2\" disabled>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "用于将复杂的内容区域分组和隐藏，可折叠或展开。默认可以展开多个面板。";
import borderLessDemo from '../../.vitepress/theme/generated/collapse/borderLess.vue';
const borderLessSource = "<template>\n  <a-collapse :default-active-key=\"['1']\" :bordered=\"false\">\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"2\" disabled>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>";
const borderLessTitle = "Border Less.Md";
const borderLessDescription = "通过设置 `bordered=\"false\"` 隐藏边框。";
import customDemo from '../../.vitepress/theme/generated/collapse/custom.vue';
const customSource = "<template>\n  <a-collapse :default-active-key=\"['1', 2]\" :bordered=\"false\">\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :style=\"customStyle\" key=\"1\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :style=\"customStyle\" :key=\"2\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :style=\"customStyle\" key=\"3\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const customStyle = {\n      borderRadius: '6px',\n      marginBottom: '18px',\n      border: 'none',\n      overflow: 'hidden',\n    }\n\n    return {\n      customStyle\n    }\n  }\n}\n<\/script>";
const customTitle = "Custom.Md";
const customDescription = "自定义面板样式。";
import destroyDemo from '../../.vitepress/theme/generated/collapse/destroy.vue';
const destroySource = "<template>\n  <a-collapse :default-active-key=\"['1', 2]\" destroy-on-hide>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :key=\"2\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\" :show-expand-icon=\"false\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>";
const destroyTitle = "Destroy.Md";
const destroyDescription = "通过设置 `destroy-on-hide` 可以让面板内容在隐藏时销毁。";
import expandIconDemo from '../../.vitepress/theme/generated/collapse/expandIcon.vue';
const expandIconSource = "<template>\n  <a-collapse :default-active-key=\"['1', 2]\">\n    <template #expand-icon=\"{ active }\">\n      <icon-face-smile-fill v-if=\"active\"/>\n      <icon-face-frown-fill v-else/>\n    <\/template>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n      <template #expand-icon=\"{ active }\">\n        <icon-double-down v-if=\"active\"/>\n        <icon-double-right v-else/>\n      <\/template>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :key=\"2\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>";
const expandIconTitle = "Expand Icon.Md";
const expandIconDescription = "为展开项自定义展开图标";
import extraDemo from '../../.vitepress/theme/generated/collapse/extra.vue';
const extraSource = "<template>\n  <a-collapse>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n      <template #extra>\n        <icon-copy />\n      <\/template>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :key=\"2\">\n      <template #extra>\n        <a-button type=\"primary\" size=\"mini\" @click.stop=\"sayHello\">hello<\/a-button>\n      <\/template>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\">\n      <template #extra>\n        <a-tag size=\"small\">city<\/a-tag>\n      <\/template>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>\n\n<script>\nimport { Message } from '@sdata/web-vue';\n\nexport default {\n  setup() {\n    const sayHello = () => {\n      Message.info('hello');\n    };\n\n    return {\n      sayHello,\n    };\n  },\n};\n<\/script>";
const extraTitle = "Extra.Md";
const extraDescription = "通过 `extra` 可以设置额外节点。`extra` 单击可以以设置 `stop` 修饰符，以阻止当前项目展开。";
import iconPositionDemo from '../../.vitepress/theme/generated/collapse/iconPosition.vue';
const iconPositionSource = "<template>\n  <a-space direction=\"vertical\" :style=\"{ width: '100%' }\">\n    <a-space>\n      <a-radio-group type=\"button\" v-model=\"position\">\n        <a-radio value=\"left\">Left<\/a-radio>\n        <a-radio value=\"right\">Right<\/a-radio>\n      <\/a-radio-group>\n      <a-checkbox v-model=\"hideIcon\">Hide Expand Icon<\/a-checkbox>\n    <\/a-space>\n    <a-collapse\n      :default-active-key=\"['1']\"\n      :expand-icon-position=\"position\"\n      :show-expand-icon=\"!hideIcon\"\n    >\n      <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n        <template #expand-icon>\n          <icon-plus />\n        <\/template>\n        <template #extra>\n          <a-tag size=\"small\">city<\/a-tag>\n        <\/template>\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <\/a-collapse-item>\n      <a-collapse-item\n        header=\"Beijing Toutiao Technology Co., Ltd.\"\n        key=\"2\"\n        disabled\n      >\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <\/a-collapse-item>\n      <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\">\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n      <\/a-collapse-item>\n    <\/a-collapse>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const position = ref('left');\n    const hideIcon = ref(false);\n\n    return {\n      position,\n      hideIcon,\n    };\n  },\n};\n<\/script>";
const iconPositionTitle = "Icon Position.Md";
const iconPositionDescription = "通过 `expand-icon-position` 属性设置展开图标的位置。";
import nestedDemo from '../../.vitepress/theme/generated/collapse/nested.vue';
const nestedSource = "<template>\n  <a-collapse :default-active-key=\"['1', 2]\" destroy-on-hide>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1\">\n      <a-collapse :default-active-key=\"['1.1']\" destroy-on-hide>\n        <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1.1\">\n          <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <\/a-collapse-item>\n        <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"1.2\">\n          <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n        <\/a-collapse-item>\n      <\/a-collapse>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" :key=\"2\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n    <a-collapse-item header=\"Beijing Toutiao Technology Co., Ltd.\" key=\"3\">\n      <div>Beijing Toutiao Technology Co., Ltd.<\/div>\n    <\/a-collapse-item>\n  <\/a-collapse>\n<\/template>";
const nestedTitle = "Nested.Md";
const nestedDescription = "面板多层嵌套。";
</script>

## 示例

<DemoBlock :title="accordionTitle" :description="accordionDescription" :code="accordionSource"

>   <accordionDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="borderLessTitle" :description="borderLessDescription" :code="borderLessSource"

>   <borderLessDemo />
> </DemoBlock>

<DemoBlock :title="customTitle" :description="customDescription" :code="customSource"

>   <customDemo />
> </DemoBlock>

<DemoBlock :title="destroyTitle" :description="destroyDescription" :code="destroySource"

>   <destroyDemo />
> </DemoBlock>

<DemoBlock :title="expandIconTitle" :description="expandIconDescription" :code="expandIconSource"

>   <expandIconDemo />
> </DemoBlock>

<DemoBlock :title="extraTitle" :description="extraDescription" :code="extraSource"

>   <extraDemo />
> </DemoBlock>

<DemoBlock :title="iconPositionTitle" :description="iconPositionDescription" :code="iconPositionSource"

>   <iconPositionDemo />
> </DemoBlock>

<DemoBlock :title="nestedTitle" :description="nestedDescription" :code="nestedSource"

>   <nestedDemo />
> </DemoBlock>
