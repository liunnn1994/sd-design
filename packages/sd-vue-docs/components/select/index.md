---
title: 'select'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 选择器 Select
description: 当用户需要从一组同类数据中选择一个或多个时，可以使用下拉选择器，点击后选择对应项。
```

## API

### `<select>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| multiple | 是否开启多选模式（多选模式默认开启搜索） | `boolean` | `false` |  |
| model-value **(v-model)** | 绑定值 | `string\| number\| boolean\| Record<string, any>\| (string \| number \| boolean \| Record<string, any>)[]` | `-` |  |
| default-value | 默认值（非受控模式） | `string\| number\| boolean\| Record<string, unknown>\| (string \| number \| boolean \| Record<string, unknown>)[]` | `'' \| []` |  |
| input-value **(v-model)** | 输入框的值 | `string` | `-` |  |
| default-input-value | 输入框的默认值（非受控模式） | `string` | `''` |  |
| size | 选择框的大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |  |
| placeholder | 占位符 | `string` | `-` |  |
| loading | 是否为加载中状态 | `boolean` | `false` |  |
| disabled | 是否禁用 | `boolean` | `false` |  |
| error | 是否为错误状态 | `boolean` | `false` |  |
| allow-clear | 是否允许清空 | `boolean` | `false` |  |
| allow-search | 是否允许搜索 | `boolean \| { retainInputValue?: boolean }` | `false (single) \| true (multiple)` |  |
| allow-create | 是否允许创建 | `boolean` | `false` |  |
| max-tag-count | 多选模式下，最多显示的标签数量。0 表示不限制 | `number` | `0` |  |
| popup-container | 弹出框的挂载容器 | `string \| HTMLElement` | `-` |  |
| bordered | 是否显示输入框的边框 | `boolean` | `true` |  |
| default-active-first-option | 是否在无值时默认选择第一个选项 | `boolean` | `true` | 2.43.0 |
| popup-visible **(v-model)** | 是否显示下拉菜单 | `boolean` | `-` |  |
| default-popup-visible | 弹出框默认是否可见（非受控模式） | `boolean` | `false` |  |
| unmount-on-close | 是否在下拉菜单关闭时销毁元素 | `boolean` | `false` |  |
| filter-option | 是否过滤选项 | `boolean \| ((inputValue: string, option: SelectOptionData) => boolean)` | `true` |  |
| options | 选项数据 | `(string \| number \| boolean \| SelectOptionData \| SelectOptionGroup)[]` | `[]` |  |
| virtual-list-props | 传递虚拟列表属性，传入此参数以开启虚拟滚动 [VirtualListProps](#VirtualListProps) | `VirtualListProps` | `-` |  |
| trigger-props | 下拉菜单的触发器属性 | `TriggerProps` | `-` |  |
| format-label | 格式化显示内容 | `(data: SelectOptionData) => string` | `-` |  |
| fallback-option | 自定义值中不存在的选项 | `boolean\| ((    value: string \| number \| boolean \| Record<string, unknown>  ) => SelectOptionData)` | `true` | 2.10.0 |
| show-extra-options | 是否在下拉菜单中显示额外选项 | `boolean` | `true` | 2.10.0 |
| value-key | 用于确定选项键值的属性名 | `string` | `'value'` | 2.18.0 |
| search-delay | 触发搜索事件的延迟时间 | `number` | `500` | 2.18.0 |
| limit | 多选时最多的选择个数 | `number` | `0` | 2.18.0 |
| field-names | 自定义 `SelectOptionData` 中的字段 | `SelectFieldNames` | `-` | 2.22.0 |
| scrollbar | 是否开启虚拟滚动条 | `boolean \| ScrollbarProps` | `true` | 2.38.0 |
| show-header-on-empty | 空状态时是否显示header | `boolean` | `false` |  |
| show-footer-on-empty | 空状态时是否显示footer | `boolean` | `false` |  |
| tag-nowrap | 标签内容不换行 | `boolean` | `false` | 2.56.1 |

### `<select>` Events

| 事件名 | 描述 | 参数 | 版本 |
| --- | --- | --- | :-- |
| change | 值发生改变时触发 | value: `string \| number \| boolean \| Record<string, any> \| (string \| number \| boolean \| Record<string, any>)[]` |  |
| input-value-change | 输入框的值发生改变时触发 | inputValue: `string` |  |
| popup-visible-change | 下拉框的显示状态改变时触发 | visible: `boolean` |  |
| clear | 点击清除按钮时触发 | - |  |
| remove | 点击标签的删除按钮时触发 | removed: `string \| number \| boolean \| Record<string, any> \| undefined` |  |
| search | 用户搜索时触发 | inputValue: `string` |  |
| dropdown-scroll | 下拉菜单发生滚动时触发 | - |  |
| dropdown-reach-bottom | 下拉菜单滚动到底部时触发 | - |  |
| exceed-limit | 多选超出限制时触发 | value: `string \| number \| boolean \| Record<string, any> \| undefined`<br>ev: `Event` | 2.18.0 |

### `<select>` Slots

| 插槽名       |         描述         | 参数                     | 版本   |
| ------------ | :------------------: | ------------------------ | :----- |
| trigger      |    自定义触发元素    | -                        | 2.22.0 |
| prefix       |       前缀元素       | -                        | 2.22.0 |
| search-icon  |   选择框的搜索图标   | -                        | 2.16.0 |
| loading-icon |  选择框的加载中图标  | -                        | 2.16.0 |
| arrow-icon   |   选择框的箭头图标   | -                        | 2.16.0 |
| footer       |     下拉框的页脚     | -                        |        |
| header       |     下拉框的页头     | -                        | 2.43.0 |
| label        |   选择框的显示内容   | data: `SelectOptionData` |        |
| option       |       选项内容       | data: `SelectOptionData` |        |
| empty        | 选项为空时的显示内容 | -                        |        |

### `<option>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| value | 选项值（如不填，会从内容中获取） | `string\|number\|boolean\|object` | `-` |  |
| label | 选项标签（如不填，会从内容中获取） | `string` | `-` |  |
| disabled | 是否禁用 | `boolean` | `false` |  |
| tag-props | 展示的标签属性 | `TagProps` | `-` | 2.8.0 |
| extra | 额外数据。2.18.0 版本废弃，可使用对象形式的 value 扩展数据 | `object` | `-` | 2.10.0 |
| index | 用于手动指定选项的 index | `number` | `-` | 2.20.0 |

### `<optgroup>` Props

| 参数名 | 描述         | 类型     | 默认值 |
| ------ | ------------ | -------- | :----: |
| label  | 选项组的标题 | `string` |  `-`   |

### `<optgroup>` Slots

| 插槽名 |     描述     | 参数 | 版本   |
| ------ | :----------: | ---- | :----- |
| label  | 选项组的标题 | -    | 2.10.0 |

### Type

```ts
/**
 * @zh 选项
 * @en Option
 */
type Option = string | number | SelectOptionData | SelectOptionGroup;

/**
 * @zh 筛选
 * @en Filter
 */
type FilterOption = boolean | ((inputValue: string, option: SelectOptionData) => boolean);
```

### SelectOptionData

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| value | 选项值 | `string \| number \| boolean \| Record<string, unknown>` | `-` |
| label | 选项内容 | `string` | `-` |
| disabled | 是否禁用 | `boolean` | `false` |
| tagProps | 选项对应的多选标签的属性 | `any` | `-` |
| render | 自定义渲染 | `RenderFunction` | `-` |

### SelectOptionGroup

| 参数名  | 描述           | 类型             | 默认值 |
| ------- | -------------- | ---------------- | :----: |
| isGroup | 是否为选项组   | `true`           |  `-`   |
| label   | 选项组标题     | `string`         |  `-`   |
| options | 选项组中的选项 | `SelectOption[]` |  `-`   |

### VirtualListProps

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| height | 可视区域高度 | `number \| string` | `-` |  |
| threshold | 开启虚拟滚动的元素数量阈值，当数据数量小于阈值时不会开启虚拟滚动。 | `number` | `-` |  |
| isStaticItemHeight | （已废除）元素高度是否是固定的。2.34.1 版本废除，请使用 `fixedSize` | `boolean` | `false` |  |
| fixedSize | 元素高度是否是固定的。 | `boolean` | `false` | 2.34.1 |
| estimatedSize | 元素高度不固定时的预估高度。 | `number` | `-` | 2.34.1 |
| buffer | 视口边界外提前挂载的元素数量。 | `number` | `10` | 2.34.1 |

## FAQ

### 使用 `Object` 格式作为选项的值

当使用 `Object` 格式作为选项的值时，需要通过 `value-key` 属性为选择器指定获取唯一标识的字段名，默认值为 `value`. 此外 `value` 的对象值需要在 `setup` 中定义好，不能够在模版中创建对象，这样会导致 `Option` 组件的重复渲染。

例如当我需要指定 `key` 为唯一标识时：

```vue
<template>
  <a-select
    v-model="value"
    :style="{ width: '320px' }"
    placeholder="Please select ..."
    value-key="key"
  >
    <a-option v-for="item of data" :value="item" :label="item.label" />
  </a-select>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref();
      const data = [
        {
          value: 'beijing',
          label: 'Beijing',
          key: 'extra1',
        },
        {
          value: 'shanghai',
          label: 'Shanghai',
          key: 'extra2',
        },
        {
          value: 'guangzhou',
          label: 'Guangzhou',
          key: 'extra3',
        },
        {
          value: 'chengdu',
          label: 'Chengdu',
          key: 'extra4',
        },
      ];

      return {
        value,
        data,
      };
    },
  };
</script>
```

### 滚动容器中的下拉菜单分离问题

`Select` 组件默认没有开启容器滚动的事件监听功能，如果遇到在滚动容器中下拉菜单分离的问题，可以手动开启内部 `Trigger` 组件的 `updateAtScroll` 功能。如果是在全局环境中存在此种情况，可以使用 `ConfigProvider` 组件默认开启此属性。

```vue
<a-select :trigger-props="{ updateAtScroll: true }"></a-select>
```

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/select/basic.vue';
const basicSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n    <\/a-select>\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\">\n      <a-option :value=\"true\">是<\/a-option>\n      <a-option :value=\"false\">否<\/a-option>\n    <\/a-select>\n    <a-select defaultValue=\"Beijing\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" disabled>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n    <\/a-select>\n    <a-select v-model=\"value\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\">\n      <a-option v-for=\"item of data\" :value=\"item\" :label=\"item.label\" />\n    <\/a-select>\n    <div>Select Value: {{ value }}<\/div>\n    <a-select :style=\"{width:'160px'}\" placeholder=\"Select\" :trigger-props=\"{ autoFitPopupMinWidth: true }\">\n      <a-option>Beijing-Beijing-Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n    <\/a-select>\n    \n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref();\n    const data = [{\n      value: 'beijing',\n      label: 'Beijing',\n      other: 'extra'\n    }, {\n      value: 'shanghai',\n      label: 'Shanghai',\n      other: 'extra'\n    }, {\n      value: 'guangzhou',\n      label: 'Guangzhou',\n      other: 'extra'\n    }, {\n      value: 'chengdu',\n      label: 'Chengdu',\n      other: 'extra'\n    }]\n\n    return {\n      value,\n      data\n    }\n  },\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "选择器的基本用法。\n通过 `trigger-props` 属性自定义下拉框的属性，比如可以让下拉框自动适应最小宽度。";
import borderDemo from '../../.vitepress/theme/generated/select/border.vue';
const borderSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-select :style=\"{width:'100%'}\" placeholder=\"Please select ...\" :bordered=\"false\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n    <\/a-select>\n    <a-select :default-value=\"['Beijing','Shanghai']\" :style=\"{width:'360px'}\" placeholder=\"Please select ...\" multiple :bordered=\"false\">\n      <a-option>Beijing<\/a-option>\n      <a-option :tag-props=\"{color:'red'}\">Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n  <\/a-space>\n<\/template>";
const borderTitle = "Border.Md";
const borderDescription = "设置 `bordered=\"false\"` 开启无边框模式，常用于沉浸式使用。";
import clearDemo from '../../.vitepress/theme/generated/select/clear.vue';
const clearSource = "<template>\n  <a-select :style=\"{width:'320px'}\" v-model=\"value\" placeholder=\"Please select ...\" allow-clear>\n    <a-option>Beijing<\/a-option>\n    <a-option>Shanghai<\/a-option>\n    <a-option>Guangzhou<\/a-option>\n    <a-option disabled>Disabled<\/a-option>\n  <\/a-select>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref('Shanghai');\n    return {\n      value\n    }\n  },\n}\n<\/script>";
const clearTitle = "Clear.Md";
const clearDescription = "通过设置 `allow-clear` ，显示清除按钮。";
import createDemo from '../../.vitepress/theme/generated/select/create.vue';
const createSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\" allow-create>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Chengdu<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\" multiple allow-create>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Chengdu<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n  <\/a-space>\n<\/template>";
const createTitle = "Create.Md";
const createDescription = "通过设置 `allow-create` ，让选择器可以创建选项中不存在的条目。";
import fallbackDemo from '../../.vitepress/theme/generated/select/fallback.vue';
const fallbackSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-select defaultValue=\"Shanxi\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" :fallback-option=\"fallback\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n    <\/a-select>\n    <a-select defaultValue=\"Shanxi\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" :fallback-option=\"fallback\" :show-extra-options=\"false\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n    <\/a-select>\n    <a-select :default-value=\"['Shanxi','Nanjing','Hangzhou']\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" multiple :fallback-option=\"fallback\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Chengdu<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const fallback = (value) => {\n      return {\n        value,\n        label: `++${value}++`\n      }\n    };\n    return {\n      fallback\n    }\n  },\n}\n<\/script>";
const fallbackTitle = "Fallback.Md";
const fallbackDescription = "使用 `fallback-option` 自定义选项中不存在的值，默认会在输入框中展示不存在的选项值。可能用于选项还没有获取完，或者远程搜索时选项改变了。";
import fieldNamesDemo from '../../.vitepress/theme/generated/select/fieldNames.vue';
const fieldNamesSource = "<template>\n  <a-select v-model=\"value\" :options=\"options\" :field-names=\"fieldNames\" :style=\"{width:'320px'}\"\n            placeholder=\"Please select ...\" />\n<\/template>\n\n<script>\nimport { reactive, ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref('bj');\n    const fieldNames = {value: 'city', label: 'text'}\n    const options = reactive([\n      {\n        city: 'bj',\n        text: 'Beijing'\n      },\n      {\n        city: 'sh',\n        text: 'Shanghai'\n      },\n      {\n        city: 'gz',\n        text: 'Guangzhou'\n      },\n      {\n        city: 'cd',\n        text: 'Chengdu'\n      },\n    ]);\n\n    return {\n      value,\n      fieldNames,\n      options\n    }\n  }\n}\n<\/script>";
const fieldNamesTitle = "Field Names.Md";
const fieldNamesDescription = "可以通过 `field-names` 属性自定义 `options` 中数据的格式。";
import footerDemo from '../../.vitepress/theme/generated/select/footer.vue';
const footerSource = "<template>\n  <a-space>\n    <a-select :default-value=\"'Beijing'\" :style=\"{width:'360px'}\" placeholder=\"Please select ...\" allow-search>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Wuhan<\/a-option>\n      <template #footer>\n        <div style=\"padding: 6px 0; text-align: center;\">\n          <a-button>Click Me<\/a-button>\n        <\/div>\n      <\/template>\n    <\/a-select>\n    <a-select :default-value=\"'Beijing'\" :style=\"{width:'360px'}\" placeholder=\"Please select ...\" allow-search show-footer-on-empty>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Wuhan<\/a-option>\n      <template #footer>\n        <div style=\"padding: 6px 0; text-align: center;\">\n          <a-button>Click Me<\/a-button>\n        <\/div>\n      <\/template>\n    <\/a-select>\n  <\/a-space>\n<\/template>";
const footerTitle = "Footer.Md";
const footerDescription = "自定义下拉菜单的页脚";
import groupDemo from '../../.vitepress/theme/generated/select/group.vue';
const groupSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\">\n      <a-optgroup label=\"Group-1\">\n        <a-option>Beijing<\/a-option>\n        <a-option>Shanghai<\/a-option>\n      <\/a-optgroup>\n      <a-optgroup label=\"Group-2\">\n        <a-option>Guangzhou<\/a-option>\n        <a-option disabled>Disabled<\/a-option>\n        <a-option>Shenzhen<\/a-option>\n      <\/a-optgroup>\n      <a-optgroup label=\"Group-3\">\n        <a-option>Chengdu<\/a-option>\n        <a-option>Wuhan<\/a-option>\n      <\/a-optgroup>\n    <\/a-select>\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\" multiple>\n      <a-optgroup label=\"Group-1\">\n        <a-option>Beijing<\/a-option>\n        <a-option>Shanghai<\/a-option>\n      <\/a-optgroup>\n      <a-optgroup label=\"Group-2\">\n        <a-option>Guangzhou<\/a-option>\n        <a-option disabled>Disabled<\/a-option>\n        <a-option>Shenzhen<\/a-option>\n      <\/a-optgroup>\n      <a-optgroup label=\"Group-3\">\n        <a-option>Chengdu<\/a-option>\n        <a-option>Wuhan<\/a-option>\n      <\/a-optgroup>\n    <\/a-select>\n  <\/a-space>\n<\/template>";
const groupTitle = "Group.Md";
const groupDescription = "使用 `optgroup` 组件添加分组选项。";
import headerDemo from '../../.vitepress/theme/generated/select/header.vue';
const headerSource = "<template>\n  <a-space>\n    <a-select :default-value=\"'Beijing'\" :style=\"{width:'360px'}\" placeholder=\"Please select ...\" multiple>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Wuhan<\/a-option>\n      <template #header>\n        <div style=\"padding: 6px 12px;\" >\n          <a-checkbox value=\"1\">全选<\/a-checkbox>\n        <\/div>\n      <\/template>\n    <\/a-select>\n\n    <a-select :default-value=\"'Beijing'\" :style=\"{width:'360px'}\" placeholder=\"Please select ...\" multiple show-header-on-empty>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Wuhan<\/a-option>\n      <template #header>\n        <div style=\"padding: 6px 12px;\" >\n          <a-checkbox value=\"1\">全选<\/a-checkbox>\n        <\/div>\n      <\/template>\n    <\/a-select>\n  <\/a-space>\n<\/template>";
const headerTitle = "Header.Md";
const headerDescription = "自定义下拉菜单的页头";
import labelDemo from '../../.vitepress/theme/generated/select/label.vue';
const labelSource = "<template>\n  <a-select default-value=\"Beijing\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\">\n    <template #label=\"{ data }\">\n      <span><icon-plus/>{{data?.label}}<\/span>\n    <\/template>\n    <a-option>Beijing<\/a-option>\n    <a-option>Shanghai<\/a-option>\n    <a-option>Guangzhou<\/a-option>\n    <a-option disabled>Disabled<\/a-option>\n  <\/a-select>\n<\/template>\n\n<script>\nimport { IconPlus } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: { IconPlus }\n};\n<\/script>";
const labelTitle = "Label.Md";
const labelDescription = "通过 `#label` 插槽可以自定义选择框展示内容。";
import linkageDemo from '../../.vitepress/theme/generated/select/linkage.vue';
const linkageSource = "<template>\n  <a-space>\n    <a-select :style=\"{width:'200px'}\" v-model=\"province\">\n      <a-option v-for=\"value of Object.keys(data)\">{{value}}<\/a-option>\n    <\/a-select>\n    <a-select :style=\"{width:'200px'}\" :options=\"data[province] || []\" v-model=\"city\" />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref, watch } from 'vue';\n\nexport default {\n  setup() {\n    const province = ref('Sichuan');\n    const city = ref('Chengdu');\n    const data = {\n      Beijing: ['Haidian', 'Chaoyang', 'Changping'],\n      Sichuan: ['Chengdu', 'Mianyang', 'Aba'],\n      Guangdong: ['Guangzhou', 'Shenzhen', 'Shantou']\n    };\n\n    watch(province, () => {\n      city.value = ''\n    })\n\n    return {\n      province,\n      city,\n      data\n    }\n  },\n}\n<\/script>";
const linkageTitle = "Linkage.Md";
const linkageDescription = "展示联动选择框的实现方法。";
import loadingDemo from '../../.vitepress/theme/generated/select/loading.vue';
const loadingSource = "<template>\n  <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\" loading>\n    <a-option>Beijing<\/a-option>\n    <a-option>Shanghai<\/a-option>\n    <a-option>Guangzhou<\/a-option>\n    <a-option disabled>Disabled<\/a-option>\n  <\/a-select>\n<\/template>";
const loadingTitle = "Loading.Md";
const loadingDescription = "选择框和下拉菜单显示加载中状态。";
import multipleDemo from '../../.vitepress/theme/generated/select/multiple.vue';
const multipleSource = "<template>\n  <div style=\"margin-bottom: 10px\">\n    <a-switch v-model=\"scrollbar\" />\n    Virtual Scrollbar\n  <\/div>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-select :default-value=\"['Beijing','Shanghai']\" :style=\"{width:'360px'}\" placeholder=\"Please select ...\" multiple\n              :scrollbar=\"scrollbar\">\n      <a-option>Beijing<\/a-option>\n      <a-option :tag-props=\"{color:'red'}\">Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n    <a-select :default-value=\"['Beijing','Shanghai','Guangzhou']\" :style=\"{width:'360px'}\"\n              placeholder=\"Please select ...\" multiple :max-tag-count=\"2\" allow-clear :scrollbar=\"scrollbar\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Chengdu<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n    <a-select :default-value=\"['Beijing','Shanghai']\" :style=\"{width:'360px'}\" placeholder=\"Please select ...\" multiple\n              :limit=\"2\" :scrollbar=\"scrollbar\">\n      <a-option>Beijing<\/a-option>\n      <a-option :tag-props=\"{color:'red'}\">Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue'\n\nexport default {\n  setup() {\n    const scrollbar = ref(true);\n\n    return {\n      scrollbar\n    }\n  }\n}\n<\/script>";
const multipleTitle = "Multiple.Md";
const multipleDescription = "通过设置 `multiple` ，可以让选择器支持多选。此外通过 `max-tag-count` 可以设置最多显示的标签个数。";
import remoteDemo from '../../.vitepress/theme/generated/select/remote.vue';
const remoteSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <div>Show selections after search options<\/div>\n    <a-select :style=\"{width:'320px'}\" :loading=\"loading\" placeholder=\"Please select ...\" multiple\n              @search=\"handleSearch\" :filter-option=\"false\">\n      <a-option v-for=\"item of options\" :value=\"item\">{{item}}<\/a-option>\n    <\/a-select>\n    <div>Hide selections after search options<\/div>\n    <a-select :options=\"options\" :style=\"{width:'320px'}\" :loading=\"loading\" placeholder=\"Please select ...\" multiple\n              @search=\"handleSearch\" :filter-option=\"false\" :show-extra-options=\"false\" />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const options = ref(['Option1', 'Option2', 'Option3']);\n    const loading = ref(false);\n\n    const handleSearch = (value) => {\n      if (value) {\n        loading.value = true;\n        window.setTimeout(() => {\n          options.value = [`${value}-Option1`, `${value}-Option2`, `${value}-Option3`]\n          loading.value = false;\n        }, 2000)\n      } else {\n        options.value = []\n      }\n    };\n\n    return {\n      options,\n      loading,\n      handleSearch\n    }\n  },\n}\n<\/script>";
const remoteTitle = "Remote.Md";
const remoteDescription = "使用 `search` 事件进行远程搜索，并改变选项。";
import scrollDemo from '../../.vitepress/theme/generated/select/scroll.vue';
const scrollSource = "<template>\n  <a-select\n    :style=\"{width:'320px'}\"\n    default-value=\"Beijing\"\n    placeholder=\"Please select ...\"\n    @dropdown-scroll=\"handleScroll\"\n    @dropdown-reach-bottom=\"handleReachBottom\"\n  >\n    <a-option>Beijing<\/a-option>\n    <a-option>Shanghai<\/a-option>\n    <a-option>Guangzhou<\/a-option>\n    <a-option disabled>Disabled<\/a-option>\n    <a-option>Shenzhen<\/a-option>\n    <a-option>Chengdu<\/a-option>\n    <a-option>Wuhan<\/a-option>\n  <\/a-select>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const handleScroll = (ev) => {\n      console.log('scroll', ev)\n    }\n    const handleReachBottom = (ev) => {\n      console.log('reach the bottom', ev)\n    }\n\n    return {\n      handleScroll,\n      handleReachBottom\n    }\n  },\n}\n<\/script>";
const scrollTitle = "Scroll.Md";
const scrollDescription = "可以通过 `dropdown-scroll` 监听下拉菜单的滚动事件。或者通过 `dropdown-reach-bottom` 监听下拉菜单滚动到底部的事件。";
import searchDemo from '../../.vitepress/theme/generated/select/search.vue';
const searchSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\" allow-search>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Chengdu<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n    <a-select :style=\"{width:'320px'}\" placeholder=\"Please select ...\" :allow-search=\"{ retainInputValue: true }\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Chengdu<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n    <a-select :options=\"options\" :style=\"{width:'320px'}\" :loading=\"loading\" placeholder=\"Please select ...\" multiple\n              @search=\"handleSearch\" />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const options = ref(['Option1', 'Option2', 'Option3']);\n    const loading = ref(false);\n\n    const handleSearch = (value) => {\n      if (value) {\n        loading.value = true;\n        window.setTimeout(() => {\n          options.value = [`${value}-Option1`, `${value}-Option2`, `${value}-Option3`]\n          loading.value = false;\n        }, 2000)\n      } else {\n        options.value = []\n      }\n    };\n\n    return {\n      options,\n      loading,\n      handleSearch\n    }\n  },\n}\n<\/script>";
const searchTitle = "Search.Md";
const searchDescription = "通过设置 `allow-search` ，可以让选择器支持对选项的搜索，配合 `filter-option` 可以自定义搜索。";
import sizeDemo from '../../.vitepress/theme/generated/select/size.vue';
const sizeSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group type=\"button\" v-model=\"size\">\n      <a-radio value=\"mini\">Mini<\/a-radio>\n      <a-radio value=\"small\">Small<\/a-radio>\n      <a-radio value=\"medium\">Medium<\/a-radio>\n      <a-radio value=\"large\">Large<\/a-radio>\n    <\/a-radio-group>\n    <a-select default-value=\"Beijing\" :style=\"{width:'320px'}\" :size=\"size\" placeholder=\"Please select ...\">\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n    <\/a-select>\n    <a-select :default-value=\"['Beijing','Shanghai']\" :style=\"{width:'320px'}\" :size=\"size\"\n              placeholder=\"Please select ...\" multiple>\n      <a-option>Beijing<\/a-option>\n      <a-option>Shanghai<\/a-option>\n      <a-option>Guangzhou<\/a-option>\n      <a-option disabled>Disabled<\/a-option>\n      <a-option>Shenzhen<\/a-option>\n      <a-option>Chengdu<\/a-option>\n      <a-option>Wuhan<\/a-option>\n    <\/a-select>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const size = ref('medium');\n\n    return {\n      size\n    }\n  },\n}\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "选择框分为 `mini`、`small`、`medium`、`large` 四种尺寸。";
import virtualListDemo from '../../.vitepress/theme/generated/select/virtualList.vue';
const virtualListSource = "<template>\n  <a-select :style=\"{width:'320px'}\" :options=\"options\" placeholder=\"Please select ...\" :virtual-list-props=\"{height:200}\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = Array(1000).fill(null).map((_, index) => `Option ${index}`);\n\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const virtualListTitle = "Virtual List.Md";
const virtualListDescription = "虚拟列表的使用方法。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="borderTitle" :description="borderDescription" :code="borderSource"

>   <borderDemo />
> </DemoBlock>

<DemoBlock :title="clearTitle" :description="clearDescription" :code="clearSource"

>   <clearDemo />
> </DemoBlock>

<DemoBlock :title="createTitle" :description="createDescription" :code="createSource"

>   <createDemo />
> </DemoBlock>

<DemoBlock :title="fallbackTitle" :description="fallbackDescription" :code="fallbackSource"

>   <fallbackDemo />
> </DemoBlock>

<DemoBlock :title="fieldNamesTitle" :description="fieldNamesDescription" :code="fieldNamesSource"

>   <fieldNamesDemo />
> </DemoBlock>

<DemoBlock :title="footerTitle" :description="footerDescription" :code="footerSource"

>   <footerDemo />
> </DemoBlock>

<DemoBlock :title="groupTitle" :description="groupDescription" :code="groupSource"

>   <groupDemo />
> </DemoBlock>

<DemoBlock :title="headerTitle" :description="headerDescription" :code="headerSource"

>   <headerDemo />
> </DemoBlock>

<DemoBlock :title="labelTitle" :description="labelDescription" :code="labelSource"

>   <labelDemo />
> </DemoBlock>

<DemoBlock :title="linkageTitle" :description="linkageDescription" :code="linkageSource"

>   <linkageDemo />
> </DemoBlock>

<DemoBlock :title="loadingTitle" :description="loadingDescription" :code="loadingSource"

>   <loadingDemo />
> </DemoBlock>

<DemoBlock :title="multipleTitle" :description="multipleDescription" :code="multipleSource"

>   <multipleDemo />
> </DemoBlock>

<DemoBlock :title="remoteTitle" :description="remoteDescription" :code="remoteSource"

>   <remoteDemo />
> </DemoBlock>

<DemoBlock :title="scrollTitle" :description="scrollDescription" :code="scrollSource"

>   <scrollDemo />
> </DemoBlock>

<DemoBlock :title="searchTitle" :description="searchDescription" :code="searchSource"

>   <searchDemo />
> </DemoBlock>

<DemoBlock :title="sizeTitle" :description="sizeDescription" :code="sizeSource"

>   <sizeDemo />
> </DemoBlock>

<DemoBlock :title="virtualListTitle" :description="virtualListDescription" :code="virtualListSource"

>   <virtualListDemo />
> </DemoBlock>
