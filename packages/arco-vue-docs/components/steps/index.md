---
title: "steps"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 导航
title: 步骤条 Steps
description: 明示任务流程和当前完成程度，引导用户按照步骤完成任务。
```












## API


### `<steps>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|步骤条的类型|`'default' \| 'arrow' \| 'dot' \| 'navigation'`|`'default'`|
|direction|步骤条的显示方向|`'horizontal' \| 'vertical'`|`'horizontal'`|
|label-placement|标签描述文字放置的位置|`'horizontal' \| 'vertical'`|`'horizontal'`|
|current **(v-model)**|当前步骤数|`number`|`-`|
|default-current|默认的步骤数（非受控状态）|`number`|`1`|
|status|当前步骤的状态|`'wait' \| 'process' \| 'finish' \| 'error'`|`'process'`|
|line-less|是否使用无连接线样式|`boolean`|`false`|
|small|是否使用小型步骤条|`boolean`|`false`|
|changeable|是否可以点击切换|`boolean`|`false`|
### `<steps>` Events

|事件名|描述|参数|
|---|---|---|
|change|步骤数发生改变时触发|step: `number`<br>ev: `Event`|




### `<step>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|title|步骤的标题|`string`|`-`|
|description|步骤的描述信息|`string`|`-`|
|status|步骤的状态|`'wait' \| 'process' \| 'finish' \| 'error'`|`-`|
|disabled|是否禁用|`boolean`|`false`|
### `<step>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|node|节点|step: `number`<br>status: `string`|
|icon|图标|step: `number`<br>status: `string`|
|description|描述内容|-|

<script setup lang="ts">
import arrowDemo from '../../.vitepress/theme/generated/steps/arrow.vue';
const arrowSource = "<template>\n  <a-steps type=\"arrow\" :current=\"2\">\n    <a-step description=\"This is a description\">Succeeded<\/a-step>\n    <a-step description=\"This is a description\">Processing<\/a-step>\n    <a-step description=\"This is a description\">Pending<\/a-step>\n  <\/a-steps>\n<\/template>";
const arrowTitle = "Arrow.Md";
const arrowDescription = "通过设置 `type=\"arrow\"`，可以使用箭头类型的步骤条。**注意**：仅支持水平步骤条。";
import basicDemo from '../../.vitepress/theme/generated/steps/basic.vue';
const basicSource = "<template>\n  <div>\n    <a-steps :current=\"2\">\n      <a-step>Succeeded<\/a-step>\n      <a-step>Processing<\/a-step>\n      <a-step>Pending<\/a-step>\n    <\/a-steps>\n    <a-divider/>\n    <div style=\"line-height: 140px; text-align: center; color: #C9CDD4; \">\n      Step 2 Content\n    <\/div>\n  <\/div>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "步骤条的基本用法。";
import changeableDemo from '../../.vitepress/theme/generated/steps/changeable.vue';
const changeableSource = "<template>\n  <div>\n    <a-steps changeable :current=\"current\" @change=\"setCurrent\">\n      <a-step description=\"This is a description\">Succeeded<\/a-step>\n      <a-step description=\"This is a description\">Processing<\/a-step>\n      <a-step description=\"This is a description\">Pending<\/a-step>\n    <\/a-steps>\n    <div :style=\"{\n          width: '100%',\n          height: '200px',\n          textAlign: 'center',\n          background: 'var(--color-bg-2)',\n          color: '#C2C7CC',\n        }\">\n      <div style=\"line-height: 160px;\">Step{{current}} Content<\/div>\n      <a-space size=\"large\">\n        <a-button type=\"secondary\" :disabled=\"current <= 1\" @click=\"onPrev\">\n          <IconLeft/> Back\n        <\/a-button>\n        <a-button type=\"primary\" :disabled=\"current >= 3\" @click=\"onNext\">\n          Next <IconRight/>\n        <\/a-button>\n      <\/a-space>\n    <\/div>\n  <\/div>\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      current: 1,\n    };\n  },\n  methods: {\n    onPrev() {\n      this.current = Math.max(1, this.current - 1)\n    },\n\n    onNext() {\n      this.current = Math.min(3, this.current + 1)\n    },\n\n    setCurrent(current) {\n      this.current = current\n    }\n  }\n};\n<\/script>";
const changeableTitle = "Changeable.Md";
const changeableDescription = "设置 `changeable` 开启点击切换步骤。";
import customNodeDemo from '../../.vitepress/theme/generated/steps/customNode.vue';
const customNodeSource = "<template>\n  <div>\n    <a-steps\n      changeable\n      label-placement=\"vertical\"\n      :current=\"current\"\n      @change=\"setCurrent\"\n    >\n      <a-step description=\"This is a description\">\n        Succeeded\n        <template v-slot:node=\"slotProps\">\n          <a-popover content=\"step tip\" :popup-visible=\"current === 1\">\n            <span>{{ slotProps.step }}<\/span>\n          <\/a-popover>\n        <\/template>\n      <\/a-step>\n      <a-step description=\"This is a description\">\n        Processing Succeeded\n        <template v-slot:node=\"slotProps\">\n          <a-popover content=\"step tip\" :popup-visible=\"current === 2\">\n            <span>{{ slotProps.step }}<\/span>\n          <\/a-popover>\n        <\/template>\n      <\/a-step>\n      <a-step description=\"This is a description\"\n      >Pending\n        <template v-slot:node=\"slotProps\">\n          <a-popover content=\"step tip\" :popup-visible=\"current === 3\">\n            <span>{{ slotProps.step }}<\/span>\n          <\/a-popover>\n        <\/template>\n      <\/a-step>\n    <\/a-steps>\n    <div style=\"margin-top: 20px; text-align: center;\">\n      <a-space size=\"large\">\n        <a-button type=\"secondary\" :disabled=\"current <= 1\" @click=\"onPrev\">\n          <IconLeft />\n          Back\n        <\/a-button>\n        <a-button type=\"primary\" :disabled=\"current >= 3\" @click=\"onNext\">\n          Next\n          <IconRight />\n        <\/a-button>\n      <\/a-space>\n    <\/div>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const current = ref(1);\n\n    const onPrev = () => {\n      current.value = Math.max(1, current.value - 1);\n    };\n\n    const onNext = () => {\n      current.value = Math.min(3, current.value + 1);\n    };\n\n    const setCurrent = (current) => {\n      current.value = current;\n    };\n\n    return {\n      current,\n      onPrev,\n      onNext,\n      setCurrent\n    }\n  },\n};\n<\/script>";
const customNodeTitle = "Custom Node.Md";
const customNodeDescription = "步骤条的基本用法。";
import descriptionDemo from '../../.vitepress/theme/generated/steps/description.vue';
const descriptionSource = "<template>\n  <a-steps>\n    <a-step description=\"This is a description\">Succeeded<\/a-step>\n    <a-step description=\"This is a description\">Processing<\/a-step>\n    <a-step description=\"This is a description\">Pending<\/a-step>\n  <\/a-steps>\n<\/template>";
const descriptionTitle = "Description.Md";
const descriptionDescription = "通过设置 `description` 可以添加描述信息。";
import dotDemo from '../../.vitepress/theme/generated/steps/dot.vue';
const dotSource = "<template>\n  <a-steps type=\"dot\">\n    <a-step>Succeeded<\/a-step>\n    <a-step>Processing<\/a-step>\n    <a-step>Pending<\/a-step>\n  <\/a-steps>\n<\/template>";
const dotTitle = "Dot.Md";
const dotDescription = "通过设置 `type=\"dot\"` ， 可以使用点状的步骤条。此模式没有 small 尺寸。";
import errorDemo from '../../.vitepress/theme/generated/steps/error.vue';
const errorSource = "<template>\n  <a-steps :current=\"2\" status=\"error\">\n    <a-step description=\"This is a description\">Succeeded<\/a-step>\n    <a-step description=\"This is a description\">Error<\/a-step>\n    <a-step description=\"This is a description\">Pending<\/a-step>\n  <\/a-steps>\n<\/template>";
const errorTitle = "Error.Md";
const errorDescription = "通过设置 `status=\"error\"` 来展示错误状态。";
import iconDemo from '../../.vitepress/theme/generated/steps/icon.vue';
const iconSource = "<template>\n  <a-steps>\n    <a-step description=\"This is a description\">\n      Succeeded\n      <template #icon>\n        <icon-home/>\n      <\/template>\n    <\/a-step>\n    <a-step description=\"This is a description\">\n      Processing\n      <template #icon>\n        <icon-loading/>\n      <\/template>\n    <\/a-step>\n    <a-step description=\"This is a description\">\n      Pending\n      <template #icon>\n        <icon-thumb-up/>\n      <\/template>\n    <\/a-step>\n  <\/a-steps>\n<\/template>";
const iconTitle = "Icon.Md";
const iconDescription = "通过 `#icon` 插槽可以自定义节点图标。";
import labelPlacementDemo from '../../.vitepress/theme/generated/steps/labelPlacement.vue';
const labelPlacementSource = "<template>\n  <a-steps label-placement=\"vertical\">\n    <a-step description=\"This is a description\">Succeeded<\/a-step>\n    <a-step description=\"This is a description\">Processing<\/a-step>\n    <a-step description=\"This is a description\">Pending<\/a-step>\n  <\/a-steps>\n<\/template>";
const labelPlacementTitle = "Label Placement.Md";
const labelPlacementDescription = "通过设置 `label-placement` 可以改变标签描述文字放置的位置。放置位置分为 `horizontal` - **放置在图标右侧（默认）**、`vertical` - **放置在图标下方**两种。";
import lineLessDemo from '../../.vitepress/theme/generated/steps/lineLess.vue';
const lineLessSource = "<template>\n  <a-steps :current=\"2\" line-less>\n    <a-step description=\"This is a description\">Succeeded<\/a-step>\n    <a-step description=\"This is a description\">Processing<\/a-step>\n    <a-step description=\"This is a description\">Pending<\/a-step>\n  <\/a-steps>\n<\/template>";
const lineLessTitle = "Line Less.Md";
const lineLessDescription = "通过设置 `line-less` 可以使用无连接线模式。";
import navigationDemo from '../../.vitepress/theme/generated/steps/navigation.vue';
const navigationSource = "<template>\n  <a-steps type=\"navigation\">\n    <a-step>Succeeded<\/a-step>\n    <a-step>Processing<\/a-step>\n    <a-step>Pending<\/a-step>\n  <\/a-steps>\n<\/template>";
const navigationTitle = "Navigation.Md";
const navigationDescription = "通过设置 `type=\"navigation\"` 展示导航类型的步骤条。";
import smallArrowDemo from '../../.vitepress/theme/generated/steps/smallArrow.vue';
const smallArrowSource = "<template>\n  <div>\n    <a-steps type=\"arrow\" :current=\"2\" small style=\"margin-bottom: 20px;\">\n      <a-step description=\"This is a description\">Succeeded<\/a-step>\n      <a-step description=\"This is a description\">Processing<\/a-step>\n      <a-step description=\"This is a description\">Pending<\/a-step>\n    <\/a-steps>\n    <a-steps type=\"arrow\" :current=\"2\" small status=\"error\">\n      <a-step description=\"This is a description\">Succeeded<\/a-step>\n      <a-step description=\"This is a description\">Processing<\/a-step>\n      <a-step description=\"This is a description\">Pending<\/a-step>\n    <\/a-steps>\n  <\/div>\n<\/template>";
const smallArrowTitle = "Small Arrow.Md";
const smallArrowDescription = "指定 `type: 'arrow', small: true`， 可以使用迷你箭头类型的步骤条。";
import smallDemo from '../../.vitepress/theme/generated/steps/small.vue';
const smallSource = "<template>\n  <div>\n    <a-steps :current=\"2\" small>\n      <a-step>Succeeded<\/a-step>\n      <a-step>Processing<\/a-step>\n      <a-step>Pending<\/a-step>\n    <\/a-steps>\n    <a-divider/>\n    <div style=\"line-height: 140px; text-align: center; color: #C9CDD4; \">\n      Step 2 Content\n    <\/div>\n  <\/div>\n<\/template>";
const smallTitle = "Small.Md";
const smallDescription = "通过 `small` 可以设置展示小型步骤条";
import verticalDemo from '../../.vitepress/theme/generated/steps/vertical.vue';
const verticalSource = "<template>\n  <div class=\"frame-bg\">\n    <div class=\"frame-body\">\n      <div class=\"frame-aside\">\n        <a-steps :current=\"current\" direction=\"vertical\">\n          <a-step>Succeeded<\/a-step>\n          <a-step>Processing<\/a-step>\n          <a-step>Pending<\/a-step>\n        <\/a-steps>\n      <\/div>\n      <div class=\"frame-main\">\n        <div class=\"main-content\">The content of this step.<\/div>\n        <div class=\"main-bottom\">\n          <a-button :disabled=\"current===1\" @click=\"onPrev\">\n            <icon-left />\n            Back\n          <\/a-button>\n          <a-button :disabled=\"current===3\" @click=\"onNext\">\n            Next\n            <icon-right />\n          <\/a-button>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const current = ref(1);\n\n    const onPrev = () => {\n      current.value = Math.max(1, current.value - 1);\n    };\n\n    const onNext = () => {\n      current.value = Math.min(3, current.value + 1);\n    };\n\n    return {\n      current,\n      onPrev,\n      onNext,\n    }\n  },\n};\n<\/script>\n\n<style scoped lang=\"less\">\n.frame-bg {\n  max-width: 780px;\n  padding: 40px;\n  background: var(--color-fill-2);\n}\n\n.frame-body {\n  display: flex;\n  background: var(--color-bg-2);\n}\n\n.frame-aside {\n  padding: 24px;\n  height: 272px;\n  border-right: 1px solid var(--color-border);\n}\n\n.frame-main {\n  width: 100%;\n}\n\n.main-content {\n  text-align: center;\n  line-height: 200px;\n}\n\n.main-bottom {\n  display: flex;\n  justify-content: center;\n\n  button {\n    margin: 0 20px;\n  }\n}\n<\/style>";
const verticalTitle = "Vertical.Md";
const verticalDescription = "竖直方向的步骤条。";
</script>

## 示例


<DemoBlock
  :title="arrowTitle"
  :description="arrowDescription"
  :code="arrowSource"
>
  <arrowDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="changeableTitle"
  :description="changeableDescription"
  :code="changeableSource"
>
  <changeableDemo />
</DemoBlock>

<DemoBlock
  :title="customNodeTitle"
  :description="customNodeDescription"
  :code="customNodeSource"
>
  <customNodeDemo />
</DemoBlock>

<DemoBlock
  :title="descriptionTitle"
  :description="descriptionDescription"
  :code="descriptionSource"
>
  <descriptionDemo />
</DemoBlock>

<DemoBlock
  :title="dotTitle"
  :description="dotDescription"
  :code="dotSource"
>
  <dotDemo />
</DemoBlock>

<DemoBlock
  :title="errorTitle"
  :description="errorDescription"
  :code="errorSource"
>
  <errorDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="labelPlacementTitle"
  :description="labelPlacementDescription"
  :code="labelPlacementSource"
>
  <labelPlacementDemo />
</DemoBlock>

<DemoBlock
  :title="lineLessTitle"
  :description="lineLessDescription"
  :code="lineLessSource"
>
  <lineLessDemo />
</DemoBlock>

<DemoBlock
  :title="navigationTitle"
  :description="navigationDescription"
  :code="navigationSource"
>
  <navigationDemo />
</DemoBlock>

<DemoBlock
  :title="smallArrowTitle"
  :description="smallArrowDescription"
  :code="smallArrowSource"
>
  <smallArrowDemo />
</DemoBlock>

<DemoBlock
  :title="smallTitle"
  :description="smallDescription"
  :code="smallSource"
>
  <smallDemo />
</DemoBlock>

<DemoBlock
  :title="verticalTitle"
  :description="verticalDescription"
  :code="verticalSource"
>
  <verticalDemo />
</DemoBlock>
