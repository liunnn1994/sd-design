---
title: "cascader"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 级联选择 Cascader
description: 指在选择器选项数量较多时，采用多级分类的方式将选项进行分隔。
```
















## API


### `<cascader>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|path-mode|绑定值是否为路径|`boolean`|`false`||
|multiple|是否为多选状态（多选模式默认开启搜索）|`boolean`|`false`||
|model-value **(v-model)**|绑定值|`string\| number\| Record<string, any>\| (    \| string    \| number    \| Record<string, any>    \| (string \| number \| Record<string, any>)[]  )[]\| undefined`|`-`||
|default-value|默认值（非受控状态）|`string\| number\| Record<string, any>\| (    \| string    \| number    \| Record<string, any>    \| (string \| number \| Record<string, any>)[]  )[]\| undefined`|`'' \| undefined \| []`||
|options|级联选择器的选项|`CascaderOption[]`|`[]`||
|disabled|是否禁用|`boolean`|`false`||
|error|是否为错误状态|`boolean`|`false`||
|size|选择框的大小|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`||
|allow-search|是否允许搜索|`boolean`|`false (single) \| true (multiple)`||
|allow-clear|是否允许清除|`boolean`|`false`||
|input-value **(v-model)**|输入框的值|`string`|`-`||
|default-input-value|输入框的默认值（非受控状态）|`string`|`''`||
|popup-visible **(v-model)**|是否显示下拉框|`boolean`|`-`||
|expand-trigger|展开下一级的触发方式|`'click' \| 'hover'`|`'click'`||
|default-popup-visible|是否默认显示下拉框（非受控状态）|`boolean`|`false`||
|placeholder|占位符|`string`|`-`||
|filter-option|自定义选项过滤方法|`(inputValue: string, option: CascaderOption) => boolean`|`-`||
|popup-container|弹出框的挂载容器|`string \| HTMLElement`|`-`||
|max-tag-count|多选模式下，最多显示的标签数量。0 表示不限制|`number`|`0`||
|format-label|格式化展示内容|`(options: CascaderOption[]) => string`|`-`||
|trigger-props|下拉菜单的触发器属性|`TriggerProps`|`-`||
|check-strictly|是否开启严格选择模式|`boolean`|`false`||
|load-more|数据懒加载函数，传入时开启懒加载功能|`(  option: CascaderOption,  done: (children?: CascaderOption[]) => void) => void`|`-`|2.13.0|
|loading|是否为加载中状态|`boolean`|`false`|2.15.0|
|search-option-only-label|搜索下拉菜单中的选项是否仅展示标签|`boolean`|`false`|2.18.0|
|search-delay|触发搜索事件的延迟时间|`number`|`500`|2.18.0|
|field-names|自定义 `CascaderOption` 中的字段|`CascaderFieldNames`|`-`|2.22.0|
|value-key|用于确定选项键值的属性名|`string`|`'value'`|2.29.0|
|fallback|自定义不存在选项的值的展示|`boolean\| ((    value:      \| string      \| number      \| Record<string, unknown>      \| (string \| number \| Record<string, unknown>)[]  ) => string)`|`true`|2.29.0|
|expand-child|是否展开子菜单|`boolean`|`false`|2.29.0|
|virtual-list-props|传递虚拟列表属性，传入此参数以开启虚拟滚动 [VirtualListProps](#VirtualListProps)|`VirtualListProps`|`-`|2.49.0|
|tag-nowrap|标签内容不换行|`boolean`|`false`|2.56.1|
### `<cascader>` Events

|事件名|描述|参数|
|---|---|---|
|change|选中值改变时触发|value: `string \| number \| (string \| number \| (string \| number)[])[] \| undefined`|
|input-value-change|输入值改变时触发|value: `string`|
|clear|点击清除按钮时触发|-|
|search|用户搜索时触发|value: `string`|
|popup-visible-change|下拉框的显示状态改变时触发|visible: `boolean`|
|focus|获得焦点时触发|ev: `FocusEvent`|
|blur|失去焦点时触发|ev: `FocusEvent`|
### `<cascader>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|label|选择框的显示内容|data: `CascaderOption`|2.18.0|
|prefix|前缀元素|-|2.23.0|
|arrow-icon|选择框的箭头图标|-|2.16.0|
|loading-icon|选择框的加载中图标|-|2.16.0|
|search-icon|选择框的搜索图标|-|2.16.0|
|empty|选项为空时的显示内容|-|2.23.0|
|option|选项内容|data: `CascaderOption`|2.18.0|




### `<cascader-panel>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|path-mode|绑定值是否为路径|`boolean`|`false`||
|multiple|是否为多选状态（多选模式默认开启搜索）|`boolean`|`false`||
|model-value **(v-model)**|绑定值|`string\| number\| Record<string, any>\| (    \| string    \| number    \| Record<string, any>    \| (string \| number \| Record<string, any>)[]  )[]\| undefined`|`-`||
|default-value|默认值（非受控状态）|`string\| number\| Record<string, any>\| (    \| string    \| number    \| Record<string, any>    \| (string \| number \| Record<string, any>)[]  )[]\| undefined`|`'' \| undefined \| []`||
|options|级联选择器的选项|`CascaderOption[]`|`[]`||
|expand-trigger|展开下一级的触发方式|`string`|`'click'`||
|check-strictly|是否开启严格选择模式|`boolean`|`false`||
|load-more|数据懒加载函数，传入时开启懒加载功能|`(  option: CascaderOption,  done: (children?: CascaderOption[]) => void) => void`|`-`|2.13.0|
|field-names|自定义 `CascaderOption` 中的字段|`CascaderFieldNames`|`-`|2.22.0|
|value-key|用于确定选项键值的属性名|`string`|`'value'`|2.29.0|
|expand-child|是否展开子菜单|`boolean`|`false`|2.29.0|
### `<cascader-panel>` Events

|事件名|描述|参数|
|---|---|---|
|change|选中值改变时触发|value: `string \| number \| (string \| number \| (string \| number)[])[] \| undefined`|
### `<cascader-panel>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|empty|选项为空时的显示内容|-|2.23.0|




### CascaderOption

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|value|选项值，2.29.0 版本支持对象|`string \| number \| Record<string, any>`|`-`||
|label|选项文本|`string`|`-`||
|render|自定义渲染|`RenderFunction`|`-`||
|disabled|是否禁用|`boolean`|`false`||
|tagProps|展示的标签属性|`TagProps`|`-`|2.8.0|
|children|下一级选项|`CascaderOption[]`|`-`||
|isLeaf|是否是叶子节点|`boolean`|`false`||

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/cascader/basic.vue';
const basicSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-cascader :options=\"options\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" />\n    <a-cascader :options=\"options\" default-value=\"datunli\" expand-trigger=\"hover\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" />\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "级联选择器的基本用法。";
import checkStrictlyDemo from '../../.vitepress/theme/generated/cascader/checkStrictly.vue';
const checkStrictlySource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-cascader :options=\"options\" default-value=\"beijing\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" check-strictly />\n    <a-cascader :options=\"options\" :default-value=\"['beijing']\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" multiple check-strictly />\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n            disabled: true\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const checkStrictlyTitle = "Check Strictly.Md";
const checkStrictlyDescription = "设置属性 `check-strictly`，开启严格选择模式，点击任何结点都可以选择。多选时将会解除父子节点的关联。";
import clearDemo from '../../.vitepress/theme/generated/cascader/clear.vue';
const clearSource = "<template>\n  <a-cascader :options=\"options\" v-model=\"value\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\"\n              allow-clear />\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref('datunli');\n\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      value,\n      options\n    }\n  },\n}\n<\/script>";
const clearTitle = "Clear.Md";
const clearDescription = "允许清除。";
import disabledDemo from '../../.vitepress/theme/generated/cascader/disabled.vue';
const disabledSource = "<template>\n  <a-cascader :options=\"options\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n            disabled: true\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n                disabled: true\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "指定 `option` 的 `disabled` 为 `true`，可以禁用该选项。";
import expandDemo from '../../.vitepress/theme/generated/cascader/expand.vue';
const expandSource = "<template>\n  <a-cascader :options=\"options\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" expand-child/>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const expandTitle = "Expand.Md";
const expandDescription = "通过设置 `expand-child` 可以在选择时展开第一个子菜单";
import fallbackDemo from '../../.vitepress/theme/generated/cascader/fallback.vue';
const fallbackSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-cascader :options=\"options\" v-model=\"value\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" multiple />\n    <a-cascader :options=\"options\" v-model=\"value2\" :style=\"{width:'320px'}\"\n                placeholder=\"Please select ...\" path-mode multiple :fallback=\"fallback\" />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref(['datunli', 'wuhou']);\n    const value2 = ref([['beijing', 'chaoyang', 'datunli'], ['sichuan', 'chengdu', 'wuhou']]);\n    const fallback = (value) => {\n      return value.map(item => item.toUpperCase()).join('-')\n    }\n\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options,\n      value,\n      value2,\n      fallback\n    }\n  },\n}\n<\/script>";
const fallbackTitle = "Fallback.Md";
const fallbackDescription = "组件默认会展示在选项中不存在的值，可通过 `fallback` 自定义展示或者关闭";
import fieldNamesDemo from '../../.vitepress/theme/generated/cascader/fieldNames.vue';
const fieldNamesSource = "<template>\n  <a-cascader :options=\"options\" :field-names=\"fieldNames\" :style=\"{width:'320px'}\"\n            placeholder=\"Please select ...\" />\n<\/template>\n\n<script>\nimport { reactive } from 'vue';\n\nexport default {\n  setup() {\n    const fieldNames = {value: 'city', label: 'text'}\n    const options = reactive([\n      {\n        city: 'beijing',\n        text: 'Beijing',\n        children: [\n          {\n            city: 'chaoyang',\n            text: 'ChaoYang',\n            children: [\n              {\n                city: 'datunli',\n                text: 'Datunli',\n              },\n            ],\n          },\n          {\n            city: 'haidian',\n            text: 'Haidian',\n          },\n          {\n            city: 'dongcheng',\n            text: 'Dongcheng',\n          },\n          {\n            city: 'xicheng',\n            text: 'Xicheng',\n            children: [\n              {\n                city: 'jinrongjie',\n                text: 'Jinrongjie',\n              },\n              {\n                city: 'tianqiao',\n                text: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        city: 'shanghai',\n        text: 'Shanghai',\n        children: [\n          {\n            city: 'huangpu',\n            text: 'Huangpu',\n          },\n        ],\n      },\n    ]);\n\n    return {\n      fieldNames,\n      options\n    }\n  }\n}\n<\/script>";
const fieldNamesTitle = "Field Names.Md";
const fieldNamesDescription = "可以通过 `field-names` 属性自定义 `options` 中数据的格式。";
import formatDemo from '../../.vitepress/theme/generated/cascader/format.vue';
const formatSource = "<template>\n  <a-cascader :options=\"options\" default-value=\"datunli\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" :format-label=\"format\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n\n    const format = (options) => {\n      const labels = options.map(option => option.label)\n      return labels.join('-')\n    }\n\n    return {\n      options,\n      format\n    }\n  },\n}\n<\/script>";
const formatTitle = "Format.Md";
const formatDescription = "利用 `formatLabel` 对显示的内容进行自定义处理。";
import lazyLoadDemo from '../../.vitepress/theme/generated/cascader/lazyLoad.vue';
const lazyLoadSource = "<template>\n  <a-space>\n    <a-cascader :options=\"options\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" :load-more=\"loadMore\"/>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n            isLeaf: true\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n            isLeaf: true\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n            isLeaf: true\n          },\n        ],\n      },\n    ];\n    const loadMore = (option, done) => {\n      window.setTimeout(() => {\n        const nodes = [{\n          value: `${option.value}-option1`,\n          label: `${option.label}-Option1`,\n          isLeaf: true\n        }, {\n          value: `${option.value}-option2`,\n          label: `${option.label}-Option2`,\n          isLeaf: true\n        }]\n        done(nodes)\n      }, 2000)\n    };\n\n    return {\n      options,\n      loadMore\n    }\n  },\n}\n<\/script>";
const lazyLoadTitle = "Lazy Load.Md";
const lazyLoadDescription = "通过 `load-more` 属性可以开启数据懒加载功能。\n开启数据懒加载功能后，需要在叶子节点标注 `isLeaf: true`，没有标注且没有 `children` 属性的节点会认为需要懒加载处理。\n`load-more` 属性有提供 `done` 函数进行回调，可以在回调中传入懒加载的子数据。如果 `done` 函数没有传入数据会认为懒加载失败，此节点可以再次触发懒加载。";
import loadingDemo from '../../.vitepress/theme/generated/cascader/loading.vue';
const loadingSource = "<template>\n  <a-cascader :options=\"[]\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" loading />\n<\/template>";
const loadingTitle = "Loading.Md";
const loadingDescription = "选择框和下拉菜单显示加载中状态。";
import multipleDemo from '../../.vitepress/theme/generated/cascader/multiple.vue';
const multipleSource = "<template>\n  <a-cascader :options=\"options\" :default-value=\"['datunli']\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" multiple/>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const multipleTitle = "Multiple.Md";
const multipleDescription = "通过设置 `multiple` 开启多选模式。";
import panelDemo from '../../.vitepress/theme/generated/cascader/panel.vue';
const panelSource = "<template>\n  <a-cascader-panel :options=\"options\" v-model=\"value\" expand-child/>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref('');\n\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      value,\n      options\n    }\n  },\n}\n<\/script>";
const panelTitle = "Panel.Md";
const panelDescription = "级联菜单可以单独使用，此时为 `数据展示` 组件";
import pathDemo from '../../.vitepress/theme/generated/cascader/path.vue';
const pathSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-cascader :options=\"options\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" path-mode\n                @change=\"handleChange\" />\n    <a-cascader :options=\"options\"\n                :default-value=\"[['beijing','chaoyang','datunli']]\"\n                :style=\"{width:'320px'}\"\n                placeholder=\"Please select ...\"\n                path-mode\n                @change=\"handleChange\" />\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const handleChange = (path) => {\n      console.log(path)\n    }\n\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options,\n      handleChange\n    }\n  },\n}\n<\/script>";
const pathTitle = "Path.Md";
const pathDescription = "`modelValue` 使用路径作为值。";
import searchDemo from '../../.vitepress/theme/generated/cascader/search.vue';
const searchSource = "<template>\n  <a-cascader :options=\"options\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\" allow-search/>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: [\n          {\n            value: 'huangpu',\n            label: 'Huangpu',\n          },\n        ],\n      },\n    ];\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const searchTitle = "Search.Md";
const searchDescription = "通过设置 `allow-search` 让输入框支持搜索功能。";
import virtualDemo from '../../.vitepress/theme/generated/cascader/virtual.vue';
const virtualSource = "<template>\n  <a-cascader :options=\"options\" :style=\"{width:'320px'}\" placeholder=\"Please select ...\"\n              :virtual-list-props=\"{height:200}\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const options = [\n      {\n        value: 'beijing',\n        label: 'Beijing',\n        children: [\n          {\n            value: 'chaoyang',\n            label: 'ChaoYang',\n            children: [\n              {\n                value: 'datunli',\n                label: 'Datunli',\n              },\n            ],\n          },\n          {\n            value: 'haidian',\n            label: 'Haidian',\n          },\n          {\n            value: 'dongcheng',\n            label: 'Dongcheng',\n          },\n          {\n            value: 'xicheng',\n            label: 'Xicheng',\n            children: [\n              {\n                value: 'jinrongjie',\n                label: 'Jinrongjie',\n              },\n              {\n                value: 'tianqiao',\n                label: 'Tianqiao',\n              },\n            ],\n          },\n        ],\n      },\n      {\n        value: 'shanghai',\n        label: 'Shanghai',\n        children: Array(1000).fill(null).map((_, index) => {\n          return {\n            value: `Option ${index}`,\n            label: `Option ${index}`\n          }\n        })\n      },\n    ];\n\n    return {\n      options\n    }\n  },\n}\n<\/script>";
const virtualTitle = "Virtual.Md";
const virtualDescription = "虚拟列表的使用方法。";
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
  :title="checkStrictlyTitle"
  :description="checkStrictlyDescription"
  :code="checkStrictlySource"
>
  <checkStrictlyDemo />
</DemoBlock>

<DemoBlock
  :title="clearTitle"
  :description="clearDescription"
  :code="clearSource"
>
  <clearDemo />
</DemoBlock>

<DemoBlock
  :title="disabledTitle"
  :description="disabledDescription"
  :code="disabledSource"
>
  <disabledDemo />
</DemoBlock>

<DemoBlock
  :title="expandTitle"
  :description="expandDescription"
  :code="expandSource"
>
  <expandDemo />
</DemoBlock>

<DemoBlock
  :title="fallbackTitle"
  :description="fallbackDescription"
  :code="fallbackSource"
>
  <fallbackDemo />
</DemoBlock>

<DemoBlock
  :title="fieldNamesTitle"
  :description="fieldNamesDescription"
  :code="fieldNamesSource"
>
  <fieldNamesDemo />
</DemoBlock>

<DemoBlock
  :title="formatTitle"
  :description="formatDescription"
  :code="formatSource"
>
  <formatDemo />
</DemoBlock>

<DemoBlock
  :title="lazyLoadTitle"
  :description="lazyLoadDescription"
  :code="lazyLoadSource"
>
  <lazyLoadDemo />
</DemoBlock>

<DemoBlock
  :title="loadingTitle"
  :description="loadingDescription"
  :code="loadingSource"
>
  <loadingDemo />
</DemoBlock>

<DemoBlock
  :title="multipleTitle"
  :description="multipleDescription"
  :code="multipleSource"
>
  <multipleDemo />
</DemoBlock>

<DemoBlock
  :title="panelTitle"
  :description="panelDescription"
  :code="panelSource"
>
  <panelDemo />
</DemoBlock>

<DemoBlock
  :title="pathTitle"
  :description="pathDescription"
  :code="pathSource"
>
  <pathDemo />
</DemoBlock>

<DemoBlock
  :title="searchTitle"
  :description="searchDescription"
  :code="searchSource"
>
  <searchDemo />
</DemoBlock>

<DemoBlock
  :title="virtualTitle"
  :description="virtualDescription"
  :code="virtualSource"
>
  <virtualDemo />
</DemoBlock>
