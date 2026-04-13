---
title: 'affix'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 其他
title: 固钉 Affix
description: 将页面元素钉在可视范围。当内容区域比较长，需要滚动页面时，固钉可以将内容固定在屏幕上。常用于侧边菜单和按钮组合。
```

## API

### `<affix>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| offset-top | 距离窗口顶部达到指定偏移量后触发 | `number` | `0` |
| offset-bottom | 距离窗口底部达到指定偏移量后触发 | `number` | `-` |
| target | 滚动容器，默认是 `window` | `string \| HTMLElement \| Window` | `-` |
| target-container | `target`的外层滚动元素，默认是 `window`。`Affix `将会监听该元素的滚动事件，并实时更新固钉的位置。主要是为了解决 `target` 属性指定为非 `window` 元素时，如果外层元素滚动，可能会导致固钉跑出容器问题 | `string \| HTMLElement \| Window` | `-` |

### `<affix>` Events

| 事件名 | 描述                   | 参数             |
| ------ | ---------------------- | ---------------- |
| change | 固定状态发生改变时触发 | fixed: `boolean` |

### `<affix>` Methods

| 方法名         | 描述     | 参数 | 返回值 |
| -------------- | -------- | ---- | ------ |
| updatePosition | 更新位置 | -    | -      |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/affix/basic.vue';
const basicSource = "<template>\n  <a-affix>\n    <a-button type=\"primary\">Affix Top<\/a-button>\n  <\/a-affix>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "基本用法，不设置固定位置时，当页面滚动元素不可见时，元素固定在页面最顶部。";
import bottomDemo from '../../.vitepress/theme/generated/affix/bottom.vue';
const bottomSource = "<template>\n  <a-affix :offsetBottom=\"120\">\n    <a-button type=\"primary\">120px to affix bottom<\/a-button>\n  <\/a-affix>\n<\/template>";
const bottomTitle = "Bottom.Md";
const bottomDescription = "当页面滚动或浏览器窗口改变时，元素向下滚动到距底部一定距离时固定。";
import containerDemo from '../../.vitepress/theme/generated/affix/container.vue';
const containerSource = "<template>\n  <div\n    style=\"height: 200px; overflow: auto\"\n    ref=\"containerRef\"\n  >\n    <div style=\"height: 400px; background: #cccccc; overflow: hidden\">\n      <a-affix\n        :offsetTop=\"20\"\n        :target=\"containerRef\"\n        style=\"margin: 40px\"\n      >\n        <a-button type=\"primary\">Affix in scrolling container<\/a-button>\n      <\/a-affix>\n    <\/div>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const containerRef = ref();\n\n    return {\n      containerRef,\n    };\n  },\n}\n<\/script>";
const containerTitle = "Container.Md";
const containerDescription = "用 `target` 设置需要监听其滚动事件的元素，默认为 window。\n\n`target` 指定为非 window 容器时，可能会出现 `target`外层元素滚动，固钉元素跑出滚动容器的问题。这个时候可以通过传入`targetContainer`传入`target`外层的滚动元素。`Affix`\n会监听该元素的滚动事件来实时更新滚钉元素的位置。 当然您也可以在业务代码中自己监听target外层滚动元素的 `scroll` 事件，并调用 `updatePosition` 去更新固钉的位置。";
import fixChangeDemo from '../../.vitepress/theme/generated/affix/fixChange.vue';
const fixChangeSource = "<template>\n  <a-affix\n    :offsetBottom=\"80\"\n    @change=\"onChange\"\n  >\n    <a-button type=\"primary\">80px to affix bottom<\/a-button>\n  <\/a-affix>\n<\/template>\n<script>\nimport { defineComponent } from 'vue';\n\nexport default defineComponent({\n  setup() {\n    const onChange = (fixed) => {\n      console.log(`${fixed}`);\n    };\n    return {\n      onChange\n    };\n  }\n});\n<\/script>";
const fixChangeTitle = "Fix Change.Md";
const fixChangeDescription = "当固定状态发生改变时，会触发事件。";
import topDemo from '../../.vitepress/theme/generated/affix/top.vue';
const topSource = "<template>\n  <a-affix :offsetTop=\"80\">\n    <a-button type=\"primary\">80px to affix top<\/a-button>\n  <\/a-affix>\n<\/template>";
const topTitle = "Top.Md";
const topDescription = "当页面滚动或浏览器窗口改变时，元素向上滚动到距顶部一定距离时固定。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="bottomTitle" :description="bottomDescription" :code="bottomSource"

>   <bottomDemo />
> </DemoBlock>

<DemoBlock :title="containerTitle" :description="containerDescription" :code="containerSource"

>   <containerDemo />
> </DemoBlock>

<DemoBlock :title="fixChangeTitle" :description="fixChangeDescription" :code="fixChangeSource"

>   <fixChangeDemo />
> </DemoBlock>

<DemoBlock :title="topTitle" :description="topDescription" :code="topSource"

>   <topDemo />
> </DemoBlock>
