---
title: "checkbox"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 复选框 Checkbox
description: 在一组数据中，用户可通过复选框选择一个或多个数据。
```










## API


### `<checkbox>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|model-value **(v-model)**|绑定值|`boolean \| Array<string \| number \| boolean>`|`-`|
|default-checked|默认是否选中（非受控状态）|`boolean`|`false`|
|value|选项的 `value`|`string\|number\|boolean`|`-`|
|disabled|是否禁用|`boolean`|`false`|
|indeterminate|是否为半选状态|`boolean`|`false`|
### `<checkbox>` Events

|事件名|描述|参数|
|---|---|---|
|change|值改变时触发|value: ` boolean \| (string \| number \| boolean)[] `<br>ev: `Event`|
### `<checkbox>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|checkbox|自定义复选框|checked: `boolean`<br>disabled: `boolean`|2.18.0|




### `<checkbox-group>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|model-value **(v-model)**|绑定值|`Array<string \| number \| boolean>`|`-`||
|default-value|默认值（非受控状态）|`Array<string \| number \| boolean>`|`[]`||
|max|支持最多选中的数量|`number`|`-`|2.36.0|
|options|选项|`Array<string \| number \| CheckboxOption>`|`-`|2.27.0|
|direction|复选框的排列方向|`Direction`|`'horizontal'`||
|disabled|是否禁用|`boolean`|`false`||
### `<checkbox-group>` Events

|事件名|描述|参数|
|---|---|---|
|change|值改变时触发|value: `(string \| number \| boolean)[]`<br>ev: `Event`|
### `<checkbox-group>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|checkbox|自定义复选框|checked: `boolean`<br>disabled: `boolean`|2.27.0|
|label|checkbox 文案内容|data: `CheckboxOption`|2.27.0|




### CheckboxOption

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|label|文案|`RenderContent`|`-`|
|value|选项的 `value`|`string \| number`|`-`|
|disabled|是否禁用|`boolean`|`false`|
|indeterminate|是否为半选状态|`boolean`|`false`|

<script setup lang="ts">
import allDemo from '../../.vitepress/theme/generated/checkbox/all.vue';
const allSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-checkbox :model-value=\"checkedAll\" :indeterminate=\"indeterminate\" @change=\"handleChangeAll\">Check All\n    <\/a-checkbox>\n    <a-checkbox-group v-model=\"data\" @change=\"handleChange\">\n      <a-checkbox value=\"1\">Option 1<\/a-checkbox>\n      <a-checkbox value=\"2\">Option 2<\/a-checkbox>\n      <a-checkbox value=\"3\">Option 3<\/a-checkbox>\n    <\/a-checkbox-group>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const indeterminate = ref(false)\n    const checkedAll = ref(false)\n    const data = ref([])\n\n    const handleChangeAll = (value) => {\n      indeterminate.value = false;\n      if (value) {\n        checkedAll.value = true;\n        data.value = ['1', '2', '3']\n      } else {\n        checkedAll.value = false;\n        data.value = []\n      }\n    }\n\n    const handleChange = (values) => {\n      if (values.length === 3) {\n        checkedAll.value = true\n        indeterminate.value = false;\n      } else if (values.length === 0) {\n        checkedAll.value = false\n        indeterminate.value = false;\n      } else {\n        checkedAll.value = false\n        indeterminate.value = true;\n      }\n    }\n\n    return {\n      indeterminate,\n      checkedAll,\n      data,\n      handleChangeAll,\n      handleChange\n    }\n  },\n}\n<\/script>";
const allTitle = "All.Md";
const allDescription = "在实现全选的功能时，可以通过 `indeterminate` 属性展示半选效果。";
import basicDemo from '../../.vitepress/theme/generated/checkbox/basic.vue';
const basicSource = "<template>\n  <a-checkbox value=\"1\">Option 1<\/a-checkbox>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "复选框的基本用法。";
import controlDemo from '../../.vitepress/theme/generated/checkbox/control.vue';
const controlSource = "<template>\n  <a-space size=\"large\">\n    <a-checkbox v-model=\"checked1\">v-model<\/a-checkbox>\n    <a-checkbox :model-value=\"true\">binding value<\/a-checkbox>\n    <a-checkbox :model-value=\"checked2\">binding value2<\/a-checkbox>\n    <a-checkbox :default-checked=\"true\">uncontrolled state<\/a-checkbox>\n  <\/a-space>\n  <div :style=\"{ marginTop: '20px' }\">\n    <a-button type=\"primary\" @click=\"handleSetCheck\">\n      {{ checked2 ? 'uncheck' : 'check' }} value2\n    <\/a-button>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const checked1 = ref(false);\n    const checked2 = ref(false);\n\n    const handleSetCheck = () => {\n      checked2.value = !checked2.value;\n    };\n\n    return {\n      checked1,\n      checked2,\n      handleSetCheck,\n    };\n  },\n};\n<\/script>";
const controlTitle = "Control.Md";
const controlDescription = "通过 `v-model` (`model-value`) 属性控制是否选中";
import customDemo from '../../.vitepress/theme/generated/checkbox/custom.vue';
const customSource = "<template>\n  <a-checkbox-group :default-value=\"['1']\">\n    <a-checkbox value=\"1\">\n      <template #checkbox=\"{ checked }\">\n        <a-tag :checked=\"checked\" checkable>This is a tag checkbox 1<\/a-tag>\n      <\/template>\n    <\/a-checkbox>\n    <a-checkbox value=\"2\">\n      <template #checkbox=\"{ checked }\">\n        <a-tag :checked=\"checked\" checkable>This is a tag checkbox 2<\/a-tag>\n      <\/template>\n    <\/a-checkbox>\n    <a-checkbox value=\"3\">\n      <template #checkbox=\"{ checked }\">\n        <a-tag :checked=\"checked\" checkable>This is a tag checkbox 3<\/a-tag>\n      <\/template>\n    <\/a-checkbox>\n  <\/a-checkbox-group>\n\n  <div :style=\"{ marginTop: '20px' }\">\n    <a-checkbox-group :default-value=\"[1]\">\n      <template v-for=\"item in 2\" :key=\"item\">\n        <a-checkbox :value=\"item\">\n          <template #checkbox=\"{ checked }\">\n            <a-space\n              align=\"start\"\n              class=\"custom-checkbox-card\"\n              :class=\"{ 'custom-checkbox-card-checked': checked }\"\n            >\n              <div className=\"custom-checkbox-card-mask\">\n                <div className=\"custom-checkbox-card-mask-dot\" />\n              <\/div>\n              <div>\n                <div className=\"custom-checkbox-card-title\">\n                  Checkbox Card {{ item }}\n                <\/div>\n                <a-typography-text type=\"secondary\">\n                  this is a text\n                <\/a-typography-text>\n              <\/div>\n            <\/a-space>\n          <\/template>\n        <\/a-checkbox>\n      <\/template>\n    <\/a-checkbox-group>\n  <\/div>\n<\/template>\n\n<style scoped>\n.custom-checkbox-card {\n  padding: 10px 16px;\n  border: 1px solid var(--color-border-2);\n  border-radius: 4px;\n  width: 250px;\n  box-sizing: border-box;\n}\n\n.custom-checkbox-card-mask {\n  height: 14px;\n  width: 14px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 2px;\n  border: 1px solid var(--color-border-2);\n  box-sizing: border-box;\n}\n\n.custom-checkbox-card-mask-dot {\n  width: 8px;\n  height: 8px;\n  border-radius: 2px;\n}\n\n.custom-checkbox-card-title {\n  color: var(--color-text-1);\n  font-size: 14px;\n  font-weight: bold;\n  margin-bottom: 8px;\n}\n\n.custom-checkbox-card:hover,\n.custom-checkbox-card-checked,\n.custom-checkbox-card:hover .custom-checkbox-card-mask,\n.custom-checkbox-card-checked .custom-checkbox-card-mask {\n  border-color: rgb(var(--primary-6));\n}\n\n.custom-checkbox-card-checked {\n  background-color: var(--color-primary-light-1);\n}\n\n.custom-checkbox-card:hover .custom-checkbox-card-title,\n.custom-checkbox-card-checked .custom-checkbox-card-title {\n  color: rgb(var(--primary-6));\n}\n\n.custom-checkbox-card-checked .custom-checkbox-card-mask-dot {\n  background-color: rgb(var(--primary-6));\n}\n<\/style>";
const customTitle = "Custom.Md";
const customDescription = "使用 #checkbox 插槽自定义复选框的展示";
import disabledDemo from '../../.vitepress/theme/generated/checkbox/disabled.vue';
const disabledSource = "<template>\n  <a-space size=\"large\">\n    <a-checkbox value=\"1\" disabled>Disabled Option 1<\/a-checkbox>\n    <a-checkbox :default-checked=\"true\" disabled>Disabled Option 2<\/a-checkbox>\n  <\/a-space>\n<\/template>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "禁用复选框。";
import groupDemo from '../../.vitepress/theme/generated/checkbox/group.vue';
const groupSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-checkbox-group :default-value=\"['1']\">\n      <a-checkbox value=\"1\">Option 1<\/a-checkbox>\n      <a-checkbox value=\"2\">Option 2<\/a-checkbox>\n      <a-checkbox value=\"3\">Option 3<\/a-checkbox>\n    <\/a-checkbox-group>\n    <a-checkbox-group direction=\"vertical\">\n      <a-checkbox value=\"1\">Option 1<\/a-checkbox>\n      <a-checkbox value=\"2\">Option 2<\/a-checkbox>\n      <a-checkbox value=\"3\">Option 3<\/a-checkbox>\n    <\/a-checkbox-group>\n  <\/a-space>\n<\/template>";
const groupTitle = "Group.Md";
const groupDescription = "通过 `<a-checkbox-group>` 组件展示复选框组。设置 `direction=\"vertical\"` 可以展示竖向的复选框组。";
import layoutDemo from '../../.vitepress/theme/generated/checkbox/layout.vue';
const layoutSource = "<template>\n  <a-checkbox-group v-model=\"checkedValue\">\n    <a-grid :cols=\"3\" :colGap=\"24\" :rowGap=\"16\">\n      <a-grid-item>\n        <a-checkbox value=\"1\">Option 1<\/a-checkbox>\n      <\/a-grid-item>\n      <a-grid-item>\n        <a-checkbox value=\"2\" disabled>Option 2<\/a-checkbox>\n      <\/a-grid-item>\n      <a-grid-item>\n        <a-checkbox value=\"3\">Option 3<\/a-checkbox>\n      <\/a-grid-item>\n      <a-grid-item>\n        <a-checkbox value=\"4\">Option 4<\/a-checkbox>\n      <\/a-grid-item>\n      <a-grid-item>\n        <a-checkbox value=\"5\">Option 5<\/a-checkbox>\n      <\/a-grid-item>\n    <\/a-grid>\n  <\/a-checkbox-group>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const checkedValue = ref(['1', '2']);\n\n    return {\n      checkedValue,\n    };\n  },\n};\n<\/script>";
const layoutTitle = "Layout.Md";
const layoutDescription = "使用 `<a-checkbox-group>` 传入 `<a-checkbox>`，配合 `<a-grid>` 组件实现灵活的布局。";
import limitDemo from '../../.vitepress/theme/generated/checkbox/limit.vue';
const limitSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-checkbox-group :max=\"2\" v-model=\"value1\" :options=\"plainOptions\" />\n    <a-checkbox-group :max=\"2\" :default-value=\"['1']\">\n      <a-checkbox value=\"1\" disabled>Option 1<\/a-checkbox>\n      <a-checkbox value=\"2\">Option 2<\/a-checkbox>\n      <a-checkbox value=\"3\">Option 3<\/a-checkbox>\n      <a-checkbox value=\"4\">Option 4<\/a-checkbox>\n    <\/a-checkbox-group>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value1 = ref(['Plain 1']);\n    const plainOptions = ['Plain 1', 'Plain 2', 'Plain 3', 'Plain 4'];\n\n    return {\n      plainOptions,\n      value1,\n    };\n  },\n};\n<\/script>";
const limitTitle = "Limit.Md";
const limitDescription = "通过设置 `max` 限制最多可被勾选的项目数。";
import optionsDemo from '../../.vitepress/theme/generated/checkbox/options.vue';
const optionsSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-checkbox-group v-model=\"value1\" :options=\"plainOptions\" />\n    <a-checkbox-group v-model=\"value2\" :options=\"options\" />\n    <a-checkbox-group v-model=\"value2\" :options=\"options\">\n      <template #label=\"{ data }\">\n        <a-tag>{{ data.label }}<\/a-tag>\n      <\/template>\n    <\/a-checkbox-group>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value1 = ref(['Plain 1']);\n    const plainOptions = ['Plain 1', 'Plain 2', 'Plain 3'];\n\n    const value2 = ref(['1']);\n    const options = [\n      { label: 'Option 1', value: '1' },\n      { label: 'Option 2', value: '2' },\n      { label: 'Option 3', value: '3', disabled: true },\n    ];\n\n    return {\n      plainOptions,\n      options,\n      value1,\n      value2,\n    };\n  },\n};\n<\/script>";
const optionsTitle = "Options.Md";
const optionsDescription = "`a-checkbox-group` 通过 `options` 属性设置子元素";
</script>

## 示例


<DemoBlock
  :title="allTitle"
  :description="allDescription"
  :code="allSource"
>
  <allDemo />
</DemoBlock>

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
  :title="customTitle"
  :description="customDescription"
  :code="customSource"
>
  <customDemo />
</DemoBlock>

<DemoBlock
  :title="disabledTitle"
  :description="disabledDescription"
  :code="disabledSource"
>
  <disabledDemo />
</DemoBlock>

<DemoBlock
  :title="groupTitle"
  :description="groupDescription"
  :code="groupSource"
>
  <groupDemo />
</DemoBlock>

<DemoBlock
  :title="layoutTitle"
  :description="layoutDescription"
  :code="layoutSource"
>
  <layoutDemo />
</DemoBlock>

<DemoBlock
  :title="limitTitle"
  :description="limitDescription"
  :code="limitSource"
>
  <limitDemo />
</DemoBlock>

<DemoBlock
  :title="optionsTitle"
  :description="optionsDescription"
  :code="optionsSource"
>
  <optionsDemo />
</DemoBlock>
