---
title: "menu"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 导航
title: 菜单 Menu
description: 收纳、排列并展示一系列选项的列表。
```









## API


### `<menu>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|theme|菜单的主题|`'light' \| 'dark'`|`'light'`||
|mode|菜单的模式|`'vertical' \| 'horizontal' \| 'pop' \| 'popButton'`|`'vertical'`||
|level-indent|层级之间的缩进量|`number`|`-`||
|auto-open|默认展开所有多级菜单|`boolean`|`false`||
|collapsed **(v-model)**|是否折叠菜单|`boolean`|`-`||
|default-collapsed|默认是否折叠菜单|`boolean`|`false`||
|collapsed-width|折叠菜单宽度|`number`|`-`||
|accordion|开启手风琴效果|`boolean`|`false`||
|auto-scroll-into-view|是否自动滚动选中项目到可见区域|`boolean`|`false`||
|show-collapse-button|是否内置折叠按钮|`boolean`|`false`||
|selected-keys **(v-model)**|选中的菜单项 key 数组|`string[]`|`-`||
|default-selected-keys|默认选中的菜单项 key 数组|`string[]`|`[]`||
|open-keys **(v-model)**|展开的子菜单 key 数组|`string[]`|`-`||
|default-open-keys|默认展开的子菜单 key 数组|`string[]`|`[]`||
|scroll-config|滚动到可见区域的配置项，接收所有[scroll-into-view-if-needed](https://github.com/stipsan/scroll-into-view-if-needed)的参数|`{ [key: string]: any }`|`-`||
|trigger-props|弹出模式下可接受所有 `Trigger` 的 `Props`|`TriggerProps`|`-`||
|tooltip-props|弹出模式下可接受所有 `ToolTip` 的 `Props`|`object`|`-`||
|auto-open-selected|默认展开选中的菜单|`boolean`|`false`|2.8.0|
|breakpoint|响应式的断点, 详见[响应式栅格](/components/grid/)|`'xxl' \| 'xl' \| 'lg' \| 'md' \| 'sm' \| 'xs'`|`-`|2.18.0|
|popup-max-height|弹出框的最大高度|`boolean \| number`|`true`|2.23.0|
### `<menu>` Events

|事件名|描述|参数|
|---|---|---|
|collapse|折叠状态改变时触发|collapsed: `boolean`<br>type: `'clickTrigger'\|'responsive'`|
|menu-item-click|点击菜单项时触发|key: `string`|
|sub-menu-click|点击子菜单时触发|key: `string`<br>openKeys: `string[]`|
### `<menu>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|collapse-icon|折叠图标|collapsed: `boolean`|
|expand-icon-right|向右展开的图标|-|
|expand-icon-down|向下展开的图标|-|




### `<sub-menu>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|title|子菜单的标题|`string`|`-`||
|selectable|弹出模式下，是否将多级菜单头也作为一个菜单项，支持点击选中等状态|`boolean`|`false`||
|popup|是否强制使用弹出模式，`level` 表示当前子菜单的层级|`boolean \| ((level: number) => boolean)`|`false`||
|popup-max-height|弹出框的最大高度|`boolean \| number`|`true`|2.23.0|
### `<sub-menu>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|title|标题|-||
|expand-icon-right|向右展开的图标|-||
|expand-icon-down|向下展开的图标|-||
|icon|菜单的图标|-|2.11.0|




### `<menu-item-group>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|title|菜单组的标题|`string`|`-`|
### `<menu-item-group>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|title|标题|-|




### `<menu-item>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|disabled|是否禁用|`boolean`|`false`|
### `<menu-item>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|icon|菜单的图标|-|2.11.0|




## FAQ

### `<MenuItem>` 和 `<SubMenu>` 组件的 `key` 属性为必填
在 `<Menu>` 组件中使用 `<MenuItem>` 和 `<SubMenu>` 组件时，请传入唯一的 `key` 属性。
组件内部在进行计算时会依赖此值，如果没有赋值会导致部分场景下异常

<script setup lang="ts">
import breakpointDemo from '../../.vitepress/theme/generated/menu/breakpoint.vue';
const breakpointSource = "<template>\n  <div class=\"menu-demo\">\n    <a-menu\n      :style=\"{ width: '200px', height: '100%' }\"\n      :default-open-keys=\"['0']\"\n      :default-selected-keys=\"['0_2']\"\n      show-collapse-button\n      breakpoint=\"xl\"\n      @collapse=\"onCollapse\"\n    >\n      <a-sub-menu key=\"0\">\n        <template #icon><icon-apps><\/icon-apps><\/template>\n        <template #title>Navigation 1<\/template>\n        <a-menu-item key=\"0_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"0_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"0_2\">Menu 3<\/a-menu-item>\n        <a-menu-item key=\"0_3\">Menu 4<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"1\">\n        <template #icon><icon-bug><\/icon-bug><\/template>\n        <template #title>Navigation 2<\/template>\n        <a-menu-item key=\"1_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"1_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"1_2\">Menu 3<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"2\">\n        <template #icon><icon-bulb><\/icon-bulb><\/template>\n        <template #title>Navigation 3<\/template>\n        <a-menu-item key=\"2_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"2_1\">Menu 2<\/a-menu-item>\n        <a-sub-menu key=\"2_2\" title=\"Navigation 4\">\n          <a-menu-item key=\"2_2_0\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"2_2_1\">Menu 2<\/a-menu-item>\n        <\/a-sub-menu>\n      <\/a-sub-menu>\n    <\/a-menu>\n  <\/div>\n<\/template>\n<script>\nimport { ref } from 'vue';\nimport { Message } from '@arco-design/web-vue';\nimport {\n  IconMenuFold,\n  IconMenuUnfold,\n  IconApps,\n  IconBug,\n  IconBulb,\n} from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconMenuFold,\n    IconMenuUnfold,\n    IconApps,\n    IconBug,\n    IconBulb,\n  },\n  setup() {\n    return {\n      onCollapse(val, type) {\n        const content = type === 'responsive' ? '触发响应式收缩' : '点击触发收缩';\n        Message.info({\n          content,\n          duration: 2000,\n        });\n      }\n    };\n  }\n};\n<\/script>\n<style scoped>\n.menu-demo {\n  box-sizing: border-box;\n  width: 100%;\n  height: 600px;\n  padding: 40px;\n  background-color: var(--color-neutral-2);\n}\n<\/style>";
const breakpointTitle = "Breakpoint.Md";
const breakpointDescription = "设置 `breakpoint` 可触发响应式收缩。";
import collapseControlDemo from '../../.vitepress/theme/generated/menu/collapseControl.vue';
const collapseControlSource = "<template>\n  <div class=\"menu-demo\">\n    <a-button\n      :style=\"{ padding: '0 12px', height: '30px', lineHeight: '30px', marginBottom: '4px' }\"\n      type=\"primary\"\n      @click=\"toggleCollapse\"\n    >\n      <icon-menu-unfold v-if=\"collapsed\" />\n      <icon-menu-fold v-else />\n    <\/a-button>\n    <a-menu\n      :style=\"{ width: '200px', borderRadius: '4px' }\"\n      theme=\"dark\"\n      :collapsed=\"collapsed\"\n      :default-open-keys=\"['0']\"\n      :default-selected-keys=\"['0_2']\"\n    >\n      <a-sub-menu key=\"0\">\n        <template #icon><icon-apps><\/icon-apps><\/template>\n        <template #title>Navigation 1<\/template>\n        <a-menu-item key=\"0_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"0_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"0_2\">Menu 3<\/a-menu-item>\n        <a-menu-item key=\"0_3\">Menu 4<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"1\">\n        <template #icon><icon-bug><\/icon-bug><\/template>\n        <template #title>Navigation 2<\/template>\n        <a-menu-item key=\"1_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"1_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"1_2\">Menu 3<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"2\">\n        <template #icon><icon-bulb><\/icon-bulb><\/template>\n        <template #title>Navigation 3<\/template>\n        <a-menu-item key=\"2_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"2_1\">Menu 2<\/a-menu-item>\n        <a-sub-menu key=\"2_2\" title=\"Navigation 4\">\n          <a-menu-item key=\"2_2_0\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"2_2_1\">Menu 2<\/a-menu-item>\n        <\/a-sub-menu>\n      <\/a-sub-menu>\n    <\/a-menu>\n  <\/div>\n<\/template>\n<script>\nimport { ref } from 'vue';\nimport {\n  IconMenuFold,\n  IconMenuUnfold,\n  IconApps,\n  IconBug,\n  IconBulb,\n} from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconMenuFold,\n    IconMenuUnfold,\n    IconApps,\n    IconBug,\n    IconBulb,\n  },\n  setup() {\n    const collapsed = ref(false);\n    return {\n      collapsed,\n      toggleCollapse: () => { collapsed.value = !collapsed.value; },\n    }\n  }\n};\n<\/script>\n<style scoped>\n.menu-demo {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 40px;\n  background-color: var(--color-neutral-2);\n}\n<\/style>";
const collapseControlTitle = "Collapse Control.Md";
const collapseControlDescription = "通过 `collapsed` 来指定菜单收起。";
import darkHorizontalDemo from '../../.vitepress/theme/generated/menu/darkHorizontal.vue';
const darkHorizontalSource = "<template>\n  <div class=\"menu-demo\">\n    <a-menu mode=\"horizontal\" theme=\"dark\" :default-selected-keys=\"['1']\">\n      <a-menu-item key=\"0\" :style=\"{ padding: 0, marginRight: '38px' }\" disabled>\n        <div\n          :style=\"{\n            width: '80px',\n            height: '30px',\n            background: 'var(--color-fill-3)',\n            cursor: 'text',\n          }\"\n        />\n      <\/a-menu-item>\n      <a-menu-item key=\"1\">Home<\/a-menu-item>\n      <a-menu-item key=\"2\">Solution<\/a-menu-item>\n      <a-menu-item key=\"3\">Cloud Service<\/a-menu-item>\n      <a-menu-item key=\"4\">Cooperation<\/a-menu-item>\n    <\/a-menu>\n  <\/div>\n<\/template>\n<style scoped>\n.menu-demo {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 40px;\n  background-color: var(--color-neutral-2);\n}\n<\/style>";
const darkHorizontalTitle = "Dark Horizontal.Md";
const darkHorizontalDescription = "通过 `theme` 指定主题，分为 `light` 和 `dark` 两种。";
import horizontalDemo from '../../.vitepress/theme/generated/menu/horizontal.vue';
const horizontalSource = "<template>\n  <div class=\"menu-demo\">\n    <a-menu mode=\"horizontal\" :default-selected-keys=\"['1']\">\n      <a-menu-item key=\"0\" :style=\"{ padding: 0, marginRight: '38px' }\" disabled>\n        <div\n          :style=\"{\n            width: '80px',\n            height: '30px',\n            borderRadius: '2px',\n            background: 'var(--color-fill-3)',\n            cursor: 'text',\n          }\"\n        />\n      <\/a-menu-item>\n      <a-menu-item key=\"1\">Home<\/a-menu-item>\n      <a-menu-item key=\"2\">Solution<\/a-menu-item>\n      <a-menu-item key=\"3\">Cloud Service<\/a-menu-item>\n      <a-menu-item key=\"4\">Cooperation<\/a-menu-item>\n    <\/a-menu>\n  <\/div>\n<\/template>\n<style scoped>\n.menu-demo {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 40px;\n  background-color: var(--color-neutral-2);\n}\n<\/style>";
const horizontalTitle = "Horizontal.Md";
const horizontalDescription = "设置 `mode` 为 `horizontal` 时，使用水平菜单。";
import popButtonDemo from '../../.vitepress/theme/generated/menu/popButton.vue';
const popButtonSource = "<template>\n  <div class=\"menu-demo\">\n    <a-trigger\n      :trigger=\"['click', 'hover']\"\n      clickToClose\n      position=\"top\"\n      v-model:popupVisible=\"popupVisible1\"\n    >\n      <div :class=\"`button-trigger ${popupVisible1 ? 'button-trigger-active' : ''}`\">\n        <IconClose v-if=\"popupVisible1\" />\n        <IconMessage v-else />\n      <\/div>\n      <template #content>\n        <a-menu\n          :style=\"{ marginBottom: '-4px' }\"\n          mode=\"popButton\"\n          :tooltipProps=\"{ position: 'left' }\"\n          showCollapseButton\n        >\n          <a-menu-item key=\"1\">\n            <template #icon><IconBug><\/IconBug><\/template>\n            Bugs\n          <\/a-menu-item>\n          <a-menu-item key=\"2\">\n            <template #icon><IconBulb><\/IconBulb><\/template>\n            Ideas\n          <\/a-menu-item>\n        <\/a-menu>\n      <\/template>\n    <\/a-trigger>\n\n    <a-trigger\n      :trigger=\"['click', 'hover']\"\n      clickToClose\n      position=\"top\"\n      v-model:popupVisible=\"popupVisible2\"\n    >\n      <div :class=\"`button-trigger ${popupVisible2 ? 'button-trigger-active' : ''}`\">\n        <IconClose v-if=\"popupVisible2\" />\n        <IconMessage v-else />\n      <\/div>\n      <template #content>\n        <a-menu\n          :style=\"{ marginBottom: '-4px' }\"\n          mode=\"popButton\"\n          :tooltipProps=\"{ position: 'left' }\"\n          showCollapseButton\n        >\n          <a-menu-item key=\"1\">\n            <template #icon><IconBug><\/IconBug><\/template>\n            Bugs\n          <\/a-menu-item>\n          <a-menu-item key=\"2\">\n            <template #icon><IconBulb><\/IconBulb><\/template>\n            Ideas\n          <\/a-menu-item>\n        <\/a-menu>\n      <\/template>\n    <\/a-trigger>\n  <\/div>\n<\/template>\n<script>\nimport {\n  IconBug,\n  IconBulb,\n  IconClose,\n  IconMessage,\n} from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconBug,\n    IconBulb,\n    IconClose,\n    IconMessage,\n  },\n  data() {\n    return {\n      popupVisible1: false,\n      popupVisible2: false,\n    };\n  }\n};\n<\/script>\n<style scoped>\n.menu-demo {\n  box-sizing: border-box;\n  width: 660px;\n  height: 300px;\n  padding: 40px;\n  background-color: var(--color-fill-2);\n  position: relative;\n}\n.button-trigger {\n  position: absolute;\n  bottom: 80px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n  color: var(--color-white);\n  font-size: 14px;\n  border-radius: 50%;\n  cursor: pointer;\n  transition: all 0.1s;\n}\n/* button left */\n.button-trigger:nth-child(1) {\n  left: 150px;\n  background-color: var(--color-neutral-5);\n}\n.button-trigger:nth-child(1).button-trigger-active {\n  background-color: var(--color-neutral-4);\n}\n/* button right */\n.button-trigger:nth-child(2) {\n  left: 372px;\n  background-color: rgb(var(--arcoblue-6));\n}\n.button-trigger:nth-child(3).button-trigger-active {\n  background-color: var(--color-primary-light-4);\n}\n<\/style>";
const popButtonTitle = "Pop Button.Md";
const popButtonDescription = "指定 `mode` 为 `popButton` 使用按钮组样式的悬浮菜单。";
import popDemo from '../../.vitepress/theme/generated/menu/pop.vue';
const popSource = "<template>\n  <div class=\"menu-demo\">\n    <a-menu mode=\"pop\" showCollapseButton>\n      <a-menu-item key=\"1\">\n        <template #icon><icon-apps><\/icon-apps><\/template>\n        Navigation 1\n      <\/a-menu-item>\n      <a-sub-menu key=\"2\">\n        <template #icon><icon-bug><\/icon-bug><\/template>\n        <template #title>Navigation 2<\/template>\n        <a-menu-item key=\"2_0\">Beijing<\/a-menu-item>\n        <a-menu-item key=\"2_1\">Shanghai<\/a-menu-item>\n        <a-menu-item key=\"2_2\">Guangzhou<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"3\">\n        <template #icon><icon-bulb><\/icon-bulb><\/template>\n        <template #title>Navigation 3<\/template>\n        <a-menu-item key=\"3_0\">Wuhan<\/a-menu-item>\n        <a-menu-item key=\"3_1\">Chengdu<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-menu-item key=\"4\">\n        <template #icon><icon-safe><\/icon-safe><\/template>\n        Navigation 4\n      <\/a-menu-item>\n      <a-menu-item key=\"5\">\n        <template #icon><icon-fire><\/icon-fire><\/template>\n        Navigation 5\n      <\/a-menu-item>\n    <\/a-menu>\n  <\/div>\n<\/template>\n<script>\nimport {\n  IconApps,\n  IconBug,\n  IconBulb,\n} from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconApps,\n    IconBug,\n    IconBulb,\n  },\n};\n<\/script>\n<style scoped>\n.menu-demo {\n  width: 100%;\n  height: 600px;\n  padding: 40px;\n  box-sizing: border-box;\n  background-color: var(--color-neutral-2);\n}\n\n.menu-demo .arco-menu {\n  width: 200px;\n  height: 100%;\n  box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);\n}\n\n.menu-demo .arco-menu :deep(.arco-menu-collapse-button) {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n}\n\n.menu-demo .arco-menu:not(.arco-menu-collapsed) :deep(.arco-menu-collapse-button) {\n  right: 0;\n  bottom: 8px;\n  transform: translateX(50%);\n}\n\n.menu-demo .arco-menu:not(.arco-menu-collapsed)::before {\n  content: '';\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  width: 48px;\n  height: 48px;\n  background-color: inherit;\n  border-radius: 50%;\n  box-shadow: -4px 0 2px var(--color-bg-2), 0 0 1px rgba(0, 0, 0, 0.3);\n  transform: translateX(50%);\n}\n\n.menu-demo .arco-menu.arco-menu-collapsed {\n  width: 48px;\n  height: auto;\n  padding-top: 24px;\n  padding-bottom: 138px;\n  border-radius: 22px;\n}\n\n.menu-demo .arco-menu.arco-menu-collapsed :deep(.arco-menu-collapse-button) {\n  right: 8px;\n  bottom: 8px;\n}\n<\/style>";
const popTitle = "Pop.Md";
const popDescription = "指定 `mode` 为 `pop` 可以使用悬浮菜单。";
import sizeDemo from '../../.vitepress/theme/generated/menu/size.vue';
const sizeSource = "<template>\n  <div class=\"menu-demo\">\n    <a-slider\n      :style=\"{ width: '320px', marginBottom: '24px' }\"\n      v-model=\"width\"\n      :step=\"10\"\n      :min=\"160\"\n      :max=\"400\"\n    />\n    <a-menu\n      showCollapseButton\n      :default-open-keys=\"['0']\"\n      :default-selected-keys=\"['0_1']\"\n      :style=\"{ width: `${width}px`, height: 'calc(100% - 28px)' }\"\n    >\n      <a-sub-menu key=\"0\">\n        <template #icon><IconApps><\/IconApps><\/template>\n        <template #title>Navigation 1<\/template>\n        <a-menu-item key=\"0_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"0_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"0_2\" disabled>\n          Menu 3\n        <\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"1\">\n        <template #icon><IconBug><\/IconBug><\/template>\n        <template #title>Navigation 2<\/template>\n        <a-menu-item key=\"1_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"1_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"1_2\">Menu 3<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"2\">\n        <template #icon><IconBulb><\/IconBulb><\/template>\n        <template #title>Navigation 3<\/template>\n        <a-menu-item key=\"2_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"2_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"2_2\">Menu 3<\/a-menu-item>\n      <\/a-sub-menu>\n    <\/a-menu>\n  <\/div>\n<\/template>\n<script>\nimport {\n  IconMenuFold,\n  IconMenuUnfold,\n  IconApps,\n  IconBug,\n  IconBulb,\n} from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconMenuFold,\n    IconMenuUnfold,\n    IconApps,\n    IconBug,\n    IconBulb,\n  },\n  data() {\n    return {\n      width: 240\n    }\n  }\n};\n<\/script>\n<style scoped>\n.menu-demo {\n  box-sizing: border-box;\n  width: 100%;\n  height: 600px;\n  padding: 40px;\n  background-color: var(--color-neutral-2);\n}\n<\/style>";
const sizeTitle = "Size.Md";
const sizeDescription = "通过 `style` 自由指定菜单的宽度和菜单项的高度。";
import subMenuDemo from '../../.vitepress/theme/generated/menu/subMenu.vue';
const subMenuSource = "<template>\n  <div class=\"menu-demo\">\n    <a-menu\n      :style=\"{ width: '200px', height: '100%' }\"\n      :default-open-keys=\"['0']\"\n      :default-selected-keys=\"['0_1']\"\n      show-collapse-button\n    >\n    <a-menu-item key=\"0_0_0\" data-obj=\"1\">Menu 1<\/a-menu-item>\n      <a-sub-menu key=\"0\">\n        <template #icon><icon-apps><\/icon-apps><\/template>\n        <template #title>Navigation 1<\/template>\n        <a-menu-item key=\"0_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"0_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"0_2\" disabled>Menu 3<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"1\">\n        <template #icon><icon-bug><\/icon-bug><\/template>\n        <template #title>Navigation 2<\/template>\n        <a-menu-item key=\"1_0\">Menu 1<\/a-menu-item>\n        <a-menu-item key=\"1_1\">Menu 2<\/a-menu-item>\n        <a-menu-item key=\"1_2\">Menu 3<\/a-menu-item>\n      <\/a-sub-menu>\n      <a-sub-menu key=\"2\">\n        <template #icon><icon-bulb><\/icon-bulb><\/template>\n        <template #title>Navigation 3<\/template>\n        <a-menu-item-group title=\"Menu Group 1\">\n          <a-menu-item key=\"2_0\">Menu 1<\/a-menu-item>\n          <a-menu-item key=\"2_1\">Menu 2<\/a-menu-item>\n        <\/a-menu-item-group>\n        <a-menu-item-group title=\"Menu Group 2\">\n          <a-menu-item key=\"2_2\">Menu 3<\/a-menu-item>\n          <a-menu-item key=\"2_3\">Menu 4<\/a-menu-item>\n        <\/a-menu-item-group>\n      <\/a-sub-menu>\n    <\/a-menu>\n  <\/div>\n<\/template>\n<script>\nimport {\n  IconMenuFold,\n  IconMenuUnfold,\n  IconApps,\n  IconBug,\n  IconBulb,\n} from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconMenuFold,\n    IconMenuUnfold,\n    IconApps,\n    IconBug,\n    IconBulb,\n  },\n};\n<\/script>\n<style scoped>\n.menu-demo {\n  box-sizing: border-box;\n  width: 100%;\n  height: 600px;\n  padding: 40px;\n  background-color: var(--color-neutral-2);\n}\n<\/style>";
const subMenuTitle = "Sub Menu.Md";
const subMenuDescription = "菜单内可以嵌入多个子项，通过 `openKeys` 可以设置默认打开的子项。";
</script>

## 示例


<DemoBlock
  :title="breakpointTitle"
  :description="breakpointDescription"
  :code="breakpointSource"
>
  <breakpointDemo />
</DemoBlock>

<DemoBlock
  :title="collapseControlTitle"
  :description="collapseControlDescription"
  :code="collapseControlSource"
>
  <collapseControlDemo />
</DemoBlock>

<DemoBlock
  :title="darkHorizontalTitle"
  :description="darkHorizontalDescription"
  :code="darkHorizontalSource"
>
  <darkHorizontalDemo />
</DemoBlock>

<DemoBlock
  :title="horizontalTitle"
  :description="horizontalDescription"
  :code="horizontalSource"
>
  <horizontalDemo />
</DemoBlock>

<DemoBlock
  :title="popButtonTitle"
  :description="popButtonDescription"
  :code="popButtonSource"
>
  <popButtonDemo />
</DemoBlock>

<DemoBlock
  :title="popTitle"
  :description="popDescription"
  :code="popSource"
>
  <popDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="subMenuTitle"
  :description="subMenuDescription"
  :code="subMenuSource"
>
  <subMenuDemo />
</DemoBlock>
