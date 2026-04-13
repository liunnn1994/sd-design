---
title: "config-provider"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 通用
title: 全局配置 ConfigProvider
description: 在应用的最外层进行配置，一次设置，全局生效。一般用于设置国际化语言等功能。
```




## API


### `<config-provider>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|prefix-cls|组件类名前缀|`string`|`'arco'`||
|locale|配置语言包|`ArcoLang`|`-`||
|size|大小|`Size`|`-`|2.14.0|
|global|是否全局生效|`boolean`|`false`|2.25.0|
|update-at-scroll|是否在容器滚动时更新弹出框的位置|`boolean`|`false`|2.25.0|
|scroll-to-close|是否在滚动时关闭弹出框|`boolean`|`false`|2.46.0|
|exchange-time|是否交换时间|`boolean`|`true`|2.48.0|
|rtl|视图的表现形式是从右开始向左结束|`boolean`|`false`||
### `<config-provider>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|loading|自定义加载中元素|-|2.28.0|
|empty|自定义空状态元素|component: `string`|2.28.0|




## FAQ

### 全局配置

`global` 属性设置为 `true` 时，会将配置内容注入到 Vue AppContext 中，一般用于解决使用 Modal、Message 组件的函数式调用方法时，配置内容无法生效的问题。

### 自定义空状态展示

可以在 `#empty` 中自定义组件库全局的空状态展示，如果在插槽中使用到了 `Empty` 组件，需要开启 `inConfigProvider` 属性。

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/config-provider/basic.vue';
const basicSource = "<template>\n  <a-config-provider :locale=\"locale\">\n    <a-radio-group\n      type=\"button\"\n      v-model=\"localeType\"\n      :options=\"localeOptions\"\n    ><\/a-radio-group>\n    <div>\n      <a-pagination\n        :total=\"50\"\n        show-total\n        show-jumper\n        show-page-size\n        style=\"margin-top: 20px; margin-bottom: 20px;\"\n      />\n    <\/div>\n    <a-space :size=\"20\" style=\"margin-bottom: 20px;\">\n      <a-range-picker style=\"width: 300px;\" />\n      <a-time-picker type=\"time-range\" style=\"width: 300px;\" />\n      <a-popconfirm content=\"Are you sure you want to delete?\">\n        <a-button type=\"primary\">Popconfirm<\/a-button>\n      <\/a-popconfirm>\n    <\/a-space>\n  <\/a-config-provider>\n<\/template>\n\n<script>\nimport { ref, computed } from 'vue';\nimport zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';\nimport enUS from '@arco-design/web-vue/es/locale/lang/en-us';\nimport esES from '@arco-design/web-vue/es/locale/lang/es-es';\nimport jaJP from '@arco-design/web-vue/es/locale/lang/ja-jp';\nimport idID from '@arco-design/web-vue/es/locale/lang/id-id';\nimport frFR from '@arco-design/web-vue/es/locale/lang/fr-fr';\nimport ptPT from '@arco-design/web-vue/es/locale/lang/pt-pt';\nimport deDE from '@arco-design/web-vue/es/locale/lang/de-de';\nimport koKR from '@arco-design/web-vue/es/locale/lang/ko-kr';\nimport itIT from '@arco-design/web-vue/es/locale/lang/it-it';\nimport thTH from '@arco-design/web-vue/es/locale/lang/th-th';\nimport viVN from '@arco-design/web-vue/es/locale/lang/vi-vn';\nimport nlNL from '@arco-design/web-vue/es/locale/lang/nl-nl';\n\nconst locales = {\n  'zh-CN': zhCN,\n  'en-US': enUS,\n  'es-ES': esES,\n  'ja-JP': jaJP,\n  'id-ID': idID,\n  'fr-FR': frFR,\n  'pt-PT': ptPT,\n  'de-DE': deDE,\n  'ko-KR': koKR,\n  'it-IT': itIT,\n  'th-TH': thTH,\n  'vi-VN': viVN,\n  'nl-NL': nlNL,\n};\n\nexport default {\n  setup() {\n    const localeType = ref('es-ES');\n    const locale = computed(() => {\n      return locales[localeType.value] || zhCN;\n    });\n\n    return {\n      localeType,\n      locale,\n      localeOptions: Object.keys(locales),\n    };\n  },\n};\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "设置国际化语言的基本用法。";
import emptyDemo from '../../.vitepress/theme/generated/config-provider/empty.vue';
const emptySource = "<template>\n  <a-config-provider>\n    <template #empty=\"scope\">\n      <a-empty v-if=\"scope?.component==='cascader'\" description=\"cascader no data!\" in-config-provider>\n      <\/a-empty>\n      <a-empty v-else-if=\"scope?.component==='select'\" description=\"select no data!\" in-config-provider><\/a-empty>\n      <a-empty v-else-if=\"scope?.component==='tree-select'\" description=\"tree-select no data!\" in-config-provider><\/a-empty>\n      <a-empty v-else-if=\"scope?.component==='list'\" description=\"list no data!\" in-config-provider><\/a-empty>\n      <a-empty v-else-if=\"scope?.component==='table'\" description=\"table no data!\" in-config-provider><\/a-empty>\n      <div v-else class=\"my-empty\">\n        <icon-trophy />\n      <\/div>\n    <\/template>\n    <a-space direction=\"vertical\" fill>\n      <a-cascader :options=\"[]\" placeholder=\"cascader\" allow-search />\n      <a-select placeholder=\"select\" allow-search />\n      <a-tree-select placeholder=\"tree-select\"/>\n      <a-list>\n        <template #header>\n          Empty List\n        <\/template>\n      <\/a-list>\n      <a-table :columns=\"columns\" :data=\"[]\" />\n      <a-empty><\/a-empty>\n    <\/a-space>\n  <\/a-config-provider>\n<\/template>\n\n<script>\nimport { IconTrophy } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconTrophy\n  },\n  setup() {\n    const columns = [\n      {\n        title: 'Name',\n        dataIndex: 'name',\n      },\n      {\n        title: 'Salary',\n        dataIndex: 'salary',\n      },\n      {\n        title: 'Address',\n        dataIndex: 'address',\n      },\n      {\n        title: 'Email',\n        dataIndex: 'email',\n      },\n    ];\n    return {\n      columns\n    }\n  }\n}\n<\/script>\n\n<style>\n.my-empty {\n  padding: 20px;\n  width: 100%;\n  text-align: center;\n  box-sizing: border-box;\n}\n<\/style>";
const emptyTitle = "Empty.Md";
const emptyDescription = "通过 `empty` 插槽可以全局自定义空状态元素。";
import rtlDemo from '../../.vitepress/theme/generated/config-provider/rtl.vue';
const rtlSource = "<template>\n  <div>\n    <a-switch v-model=\"rtlType\" style=\"margin-bottom: 20px;\">\n      <template #checked>\n        RTL\n      <\/template>\n      <template #unchecked>\n        LTR\n      <\/template>\n    <\/a-switch>\n    <a-config-provider :rtl=\"rtlType\">\n      <a-tabs :default-active-key=\"2\" style=\"margin-bottom: 20px;\">\n        <a-tab-pane\n          v-for=\"i in 36\"\n          :key=\"i\"\n          :title=\"`Tab ${i}`\"\n        >\n          Content of Tab Panel {{ i }}\n        <\/a-tab-pane>\n      <\/a-tabs>\n      <a-space :direction=\"'vertical'\" style=\"width: 100%;\">\n        <a-space :size=\"40\">\n          <a-badge :count=\"9\">\n            <a-avatar shape=\"square\" />\n          <\/a-badge>\n          <a-badge :count=\"9\" dot :dotStyle=\"{ width: '10px', height: '10px' }\">\n            <a-avatar shape=\"square\" />\n          <\/a-badge>\n          <a-badge :dotStyle=\"{ height: '16px', width: '16px', fontSize: '14px' }\">\n            <template #content>\n              <IconClockCircle\n                :style=\"{ verticalAlign: 'middle', color: 'var(--color-text-2)' }\"\n              />\n            <\/template>\n            <a-avatar shape=\"square\" />\n          <\/a-badge>\n          <a-tag :color=\"'red'\" closable>red<\/a-tag>\n          <a-tag :color=\"'blue'\" closable>blue<\/a-tag>\n          <a-tag :color=\"'green'\" closable>green<\/a-tag>\n        <\/a-space>\n      <\/a-space>\n    <\/a-config-provider>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const rtlType = ref(true);\n\n    return {\n      rtlType,\n    };\n  },\n};\n<\/script>";
const rtlTitle = "Rtl.Md";
const rtlDescription = "设置组件为从右向左阅读的视图。";
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
  :title="emptyTitle"
  :description="emptyDescription"
  :code="emptySource"
>
  <emptyDemo />
</DemoBlock>

<DemoBlock
  :title="rtlTitle"
  :description="rtlDescription"
  :code="rtlSource"
>
  <rtlDemo />
</DemoBlock>
