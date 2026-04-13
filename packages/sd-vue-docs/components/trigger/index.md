---
title: 'trigger'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 其他
title: 触发器 Trigger
description: 用于对元素添加 hover, click, focus 等事件，并且弹出下拉框。
```

## API

### `<trigger>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| popup-visible **(v-model)** | 弹出框是否可见 | `boolean` | `-` |  |
| default-popup-visible | 弹出框默认是否可见（非受控模式） | `boolean` | `false` |  |
| trigger | 触发方式 | `'hover' \| 'click' \| 'focus' \| 'contextMenu'` | `'hover'` |  |
| position | 弹出位置 | `'top' \| 'tl' \| 'tr' \| 'bottom' \| 'bl' \| 'br' \| 'left' \| 'lt' \| 'lb' \| 'right' \| 'rt' \| 'rb'` | `'bottom'` |  |
| disabled | 触发器是否禁用 | `boolean` | `false` |  |
| popup-offset | 弹出框的偏移量（弹出框距离触发器的偏移距离） | `number` | `0` |  |
| popup-translate | 弹出框的移动距离 | `TriggerPopupTranslate` | `-` |  |
| show-arrow | 弹出框是否显示箭头 | `boolean` | `false` |  |
| align-point | 弹出框是否跟随鼠标 | `boolean` | `false` |  |
| popup-hover-stay | 是否在移出触发器，并移入弹出框时保持弹出框显示 | `boolean` | `true` |  |
| blur-to-close | 是否在触发器失去焦点时关闭弹出框 | `boolean` | `true` |  |
| click-to-close | 是否在点击触发器时关闭弹出框 | `boolean` | `true` |  |
| click-outside-to-close | 是否在点击外部区域时关闭弹出框 | `boolean` | `true` |  |
| unmount-on-close | 是否在关闭时卸载弹出框节点 | `boolean` | `true` |  |
| content-class | 弹出框内容的类名 | `string\|array\|object` | `-` |  |
| content-style | 弹出框内容的样式 | `CSSProperties` | `-` |  |
| arrow-class | 弹出框箭头的类名 | `string\|array\|object` | `-` |  |
| arrow-style | 弹出框箭头的样式 | `CSSProperties` | `-` |  |
| popup-style | 弹出框的样式 | `CSSProperties` | `-` |  |
| animation-name | 弹出动画的name | `string` | `'fade-in'` |  |
| duration | 弹出动画的持续时间 | `number\| {    enter: number;    leave: number;  }` | `-` |  |
| mouse-enter-delay | mouseenter事件延时触发的时间（毫秒） | `number` | `100` |  |
| mouse-leave-delay | mouseleave事件延时触发的时间（毫秒） | `number` | `100` |  |
| focus-delay | focus事件延时触发的时间（毫秒） | `number` | `0` |  |
| auto-fit-popup-width | 是否将弹出框宽度设置为触发器宽度 | `boolean` | `false` |  |
| auto-fit-popup-min-width | 是否将弹出框的最小宽度设置为触发器宽度 | `boolean` | `false` |  |
| auto-fix-position | 当触发器的尺寸发生变化时，是否重新计算弹出框位置 | `boolean` | `true` |  |
| popup-container | 弹出框的挂载容器 | `string \| HTMLElement` | `-` |  |
| update-at-scroll | 是否在容器滚动时更新弹出框的位置 | `boolean` | `false` |  |
| auto-fit-position | 是否自动调整弹出框位置，以适应窗口大小 | `boolean` | `true` |  |
| render-to-body | 是否挂载在 `body` 元素下 | `boolean` | `true` |  |
| prevent-focus | 是否阻止弹出层中的元素点击时获取焦点 | `boolean` | `false` |  |
| scroll-to-close | 是否在滚动时关闭弹出框 | `boolean` | `false` | 2.46.0 |
| scroll-to-close-distance | 滚动阈值，当滚动距离超过该值时触发关闭 | `number` | `0` |  |

### `<trigger>` Events

| 事件名               | 描述                         | 参数               | 版本   |
| -------------------- | ---------------------------- | ------------------ | :----- |
| popup-visible-change | 弹出框显示状态改变时触发     | visible: `boolean` |        |
| show                 | 弹出框显示后（动画结束）触发 | -                  | 2.18.0 |
| hide                 | 弹出框隐藏后（动画结束）触发 | -                  | 2.18.0 |

### `<trigger>` Slots

| 插槽名  |    描述    | 参数 |
| ------- | :--------: | ---- |
| content | 弹出框内容 | -    |

## Type

```ts
type TriggerPopupTranslate = [number, number] | { [key in TriggerPosition]?: [number, number] };
```

## FAQ

### 关于弹出框的挂载位置

弹出框默认是挂载到 `body` 元素上的，如果想要修改挂载元素，可以使用 `popup-container` 属性进行指定，同时需要注意保证挂载元素的位置可以被准确定位到，一般可以为挂载元素增加 `position: relative` 样式。

在微前端项目中，需要保证子应用的挂载位置准确，可以将子应用的 `body` 样式添加 `position: relative`

### 滚动触发容器

组件默认仅监听了 `window` 的滚动事件，对于内部 `div` 的滚动没有进行监听，类似 `scroll-to-close` 功能也仅会对 `window` 滚动生效。可以通过开启 `update-at-scroll` 属性支持对父级 `div` 元素的滚动事件监听。

<script setup lang="ts">
import alignPointDemo from '../../.vitepress/theme/generated/trigger/alignPoint.vue';
const alignPointSource = "<template>\n  <a-trigger trigger=\"click\" align-point>\n    <div class=\"demo-point-trigger\">\n      <div>Click Me<\/div>\n    <\/div>\n    <template #content>\n      <div class=\"demo-point\">\n        <a-empty />\n      <\/div>\n    <\/template>\n  <\/a-trigger>\n<\/template>\n\n<style scoped>\n.demo-point-trigger {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 300px;\n  background-color: var(--color-fill-2)\n}\n\n.demo-point {\n  padding: 10px;\n  width: 200px;\n  background-color: var(--color-bg-popup);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);\n}\n\n.demo-point-wrapper {\n  display: block;\n}\n<\/style>";
const alignPointTitle = "Align Point.Md";
const alignPointDescription = "设置`align-point`属性，可以使弹出层出现在鼠标位置。";
import arrowDemo from '../../.vitepress/theme/generated/trigger/arrow.vue';
const arrowSource = "<template>\n  <a-space>\n    <a-trigger trigger=\"click\">\n      <a-button>Click Me<\/a-button>\n      <template #content>\n        <div class=\"demo-arrow\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n    <a-trigger trigger=\"click\" show-arrow>\n      <a-button>Click Me (Arrow)<\/a-button>\n      <template #content>\n        <div class=\"demo-arrow\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n  <\/a-space>\n<\/template>\n\n<style scoped>\n.demo-arrow {\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);\n  padding: 10px;\n  width: 200px;\n  background-color: var(--color-bg-popup);\n  border-radius: 4px;\n}\n<\/style>";
const arrowTitle = "Arrow.Md";
const arrowDescription = "通过`show-arrow`属性，可以展示默认的箭头元素。也可以通过`arrow-class`或`arrow-style`进行定制。";
import basicDemo from '../../.vitepress/theme/generated/trigger/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-trigger position=\"top\" auto-fit-position :unmount-on-close=\"false\">\n      <span>Hover Me<\/span>\n      <template #content>\n        <div class=\"demo-basic\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n    <a-trigger trigger=\"click\" :unmount-on-close=\"false\">\n      <a-button>Click Me<\/a-button>\n      <template #content>\n        <div class=\"demo-basic\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n    <a-trigger trigger=\"focus\">\n      <a-input placeholder=\"Focus on me\" />\n      <template #content>\n        <div class=\"demo-basic\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n  <\/a-space>\n<\/template>\n\n<style scoped>\n.demo-basic {\n  padding: 10px;\n  width: 200px;\n  background-color: var(--color-bg-popup);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);\n}\n<\/style>";
const basicTitle = "Basic.Md";
const basicDescription = "这个例子展示了触发器的最基础的使用。触发器默认是没有弹出框的样式的。以下示例均为官网添加的样式。";
import nestDemo from '../../.vitepress/theme/generated/trigger/nest.vue';
const nestSource = "<template>\n  <a-trigger trigger=\"click\">\n    <a-button>Click Me<\/a-button>\n    <template #content>\n      <div class=\"trigger-demo-nest\">\n        <a-empty />\n        <a-trigger position=\"right\">\n          <a-button>Hover Me<\/a-button>\n          <template #content>\n            <div class=\"trigger-demo-nest\">\n              <a-empty />\n              <a-trigger trigger=\"click\" position=\"right\">\n                <a-button>Click Me<\/a-button>\n                <template #content>\n                  <div class=\"trigger-demo-nest\">\n                    <a-empty />\n                    <a-trigger position=\"right\">\n                      <a-button>Hover Me<\/a-button>\n                      <template #content>\n                        <a-empty class=\"trigger-demo-nest\" />\n                      <\/template>\n                    <\/a-trigger>\n                  <\/div>\n                <\/template>\n              <\/a-trigger>\n            <\/div>\n          <\/template>\n        <\/a-trigger>\n      <\/div>\n    <\/template>\n  <\/a-trigger>\n<\/template>\n\n<style scoped>\n.trigger-demo-nest {\n  padding: 10px;\n  width: 200px;\n  background-color: var(--color-bg-popup);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);\n}\n\n.trigger-demo-nest-popup-content {\n  text-align: right;\n}\n<\/style>";
const nestTitle = "Nest.Md";
const nestDescription = "弹出层可以嵌套在另一个弹出层内。";
import scrollDemo from '../../.vitepress/theme/generated/trigger/scroll.vue';
const scrollSource = "<template>\n  <div :style=\"{height:'100px',overflowY:'scroll'}\">\n    <div :style=\"{height:'200px'}\">\n      <a-trigger trigger=\"click\" update-at-scroll>\n        <a-button :style=\"{marginTop:'80px'}\">Click Me<\/a-button>\n        <template #content>\n          <div class=\"demo-basic\">\n            <a-empty />\n          <\/div>\n        <\/template>\n      <\/a-trigger>\n    <\/div>\n  <\/div>\n<\/template>\n\n<style scoped>\n.demo-basic {\n  padding: 10px;\n  width: 200px;\n  background-color: var(--color-bg-popup);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);\n}\n<\/style>";
const scrollTitle = "Scroll.Md";
const scrollDescription = "通过设置 `update-at-scroll` 监听容器的滚动。";
import translateDemo from '../../.vitepress/theme/generated/trigger/translate.vue';
const translateSource = "<template>\n  <a-space>\n    <a-trigger>\n      <a-button>BOTTOM<\/a-button>\n      <template #content>\n        <div class=\"trigger-demo-translate\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n    <a-trigger :popup-translate=\"[100, 20]\">\n      <a-button>BOTTOM OFFSET[100, 20]<\/a-button>\n      <template #content>\n        <div class=\"trigger-demo-translate\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n    <a-trigger :popup-translate=\"[-100, 20]\">\n      <a-button>BOTTOM OFFSET[-100, 20]<\/a-button>\n      <template #content>\n        <div class=\"trigger-demo-translate\">\n          <a-empty />\n        <\/div>\n      <\/template>\n    <\/a-trigger>\n  <\/a-space>\n<\/template>\n\n<style scoped>\n.trigger-demo-translate {\n  padding: 10px;\n  width: 200px;\n  background-color: var(--color-bg-popup);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);\n}\n<\/style>";
const translateTitle = "Translate.Md";
const translateDescription = "通过`popup-translate`属性，可以设置弹窗在原本位置的基础上进行额外的位置调整。";
import triggersDemo from '../../.vitepress/theme/generated/trigger/triggers.vue';
const triggersSource = "<template>\n  <a-trigger :trigger=\"['click','hover','focus']\">\n    <a-input placeholder=\"Click/Hover/Focus on me\" />\n    <template #content>\n      <div class=\"demo-trigger\">\n        <a-empty />\n      <\/div>\n    <\/template>\n  <\/a-trigger>\n<\/template>\n\n<style scoped>\n.demo-trigger {\n  padding: 10px;\n  width: 200px;\n  background-color: var(--color-bg-popup);\n  border-radius: 4px;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);\n}\n<\/style>";
const triggersTitle = "Triggers.Md";
const triggersDescription = "通过`trigger`传入数组，可以设置多个触发方式。";
</script>

## 示例

<DemoBlock :title="alignPointTitle" :description="alignPointDescription" :code="alignPointSource"

>   <alignPointDemo />
> </DemoBlock>

<DemoBlock :title="arrowTitle" :description="arrowDescription" :code="arrowSource"

>   <arrowDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="nestTitle" :description="nestDescription" :code="nestSource"

>   <nestDemo />
> </DemoBlock>

<DemoBlock :title="scrollTitle" :description="scrollDescription" :code="scrollSource"

>   <scrollDemo />
> </DemoBlock>

<DemoBlock :title="translateTitle" :description="translateDescription" :code="translateSource"

>   <translateDemo />
> </DemoBlock>

<DemoBlock :title="triggersTitle" :description="triggersDescription" :code="triggersSource"

>   <triggersDemo />
> </DemoBlock>
