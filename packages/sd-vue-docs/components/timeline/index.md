---
title: 'timeline'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 时间轴 Timeline
description: 按照时间顺序或倒序规则的展示信息内容。
```

## API

### `<timeline>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| reverse | 是否倒序 | `boolean` | `false` |
| direction | 时间轴方向 | `'horizontal' \| 'vertical'` | `'vertical'` |
| mode | 时间轴的展示类型：时间轴在左侧，时间轴在右侧, 交替出现。 | `'left' \| 'right' \| 'top' \| 'bottom' \| 'alternate'` | `'left'` |
| pending | 是否展示幽灵节点，设置为 true 时候只展示幽灵节点。传入ReactNode时，会作为节点内容展示。 | `boolean\|string` | `-` |
| label-position | 设置标签文本的位置 | `'relative' \| 'same'` | `'same'` |

### `<timeline>` Slots

| 插槽名 |   描述   | 参数 |
| ------ | :------: | ---- |
| dot    | 幽灵节点 | -    |

### `<timeline-item>` Props

| 参数名     | 描述                         | 类型                              |  默认值   |
| ---------- | ---------------------------- | --------------------------------- | :-------: |
| dot-color  | 节点颜色                     | `string`                          |    `-`    |
| dot-type   | 节点类型：空心圆/实心圆      | `'hollow' \| 'solid'`             | `'solid'` |
| line-type  | 时间轴类型：实线/虚线/点状线 | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` |
| line-color | 时间轴颜色                   | `string`                          |    `-`    |
| label      | 标签文本                     | `string`                          |    `-`    |
| position   | Item 位置                    | `PositionType`                    |    `-`    |

### `<timeline-item>` Slots

| 插槽名 |    描述    | 参数 | 版本   |
| ------ | :--------: | ---- | :----- |
| dot    | 自定义节点 | -    |        |
| label  | 自定义标签 | -    | 2.50.0 |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/timeline/basic.vue';
const basicSource = "<template>\n  <div :style=\"{ marginBottom: '40px' }\">\n    <a-typography-text :style=\"{ verticalAlign: 'middle', marginRight: '8px' }\">\n      Reverse\n    <\/a-typography-text>\n    <a-radio-group\n      @change=\"onChange\"\n      style=\"{ marginBottom: '30px' }\"\n      :modelValue=\"isReverse\"\n    >\n      <a-radio :value=\"false\">No Reverse<\/a-radio>\n      <a-radio :value=\"true\">Reverse<\/a-radio>\n    <\/a-radio-group>\n  <\/div>\n  <a-timeline :reverse=\"isReverse\">\n    <a-timeline-item label=\"2017-03-10\">The first milestone<\/a-timeline-item>\n    <a-timeline-item label=\"2018-05-12\">The second milestone<\/a-timeline-item>\n    <a-timeline-item label=\"2020-09-30\">The third milestone<\/a-timeline-item>\n  <\/a-timeline>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const isReverse = ref(false);\n\n    const onChange = (bool) => {\n      isReverse.value = bool;\n    };\n\n    return {\n      isReverse,\n      onChange\n    }\n  },\n};\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "基本使用";
import customDemo from '../../.vitepress/theme/generated/timeline/custom.vue';
const customSource = "<template>\n  <a-timeline>\n    <a-timeline-item>\n      Code Review\n      <template #label>\n        <a-tag>\n          <template #icon>\n            <icon-check-circle-fill />\n          <\/template>\n          Passed\n        <\/a-tag>\n      <\/template>\n    <\/a-timeline-item>\n  <\/a-timeline>\n<\/template>";
const customTitle = "Custom.Md";
const customDescription = "可以通过 `label` 插槽自定义标签";
import directionDemo from '../../.vitepress/theme/generated/timeline/direction.vue';
const directionSource = "<template>\n  <div>\n    <a-row align=\"center\" :style=\"{ marginBottom: '24px' }\">\n      <a-typography-text>mode: &nbsp; &nbsp;<\/a-typography-text>\n      <a-radio-group @change=\"onChange\" :modelValue=\"mode\">\n        <a-radio value=\"top\">top<\/a-radio>\n        <a-radio value=\"bottom\">bottom<\/a-radio>\n        <a-radio value=\"alternate\">alternate<\/a-radio>\n      <\/a-radio-group>\n    <\/a-row>\n    <a-timeline direction=\"horizontal\" pending :mode=\"mode\">\n      <a-timeline-item label=\"2012-08\">\n        <a-row :style=\"{ display: 'inline-flex', alignItems: 'center' }\">\n          <img\n            width=\"40\"\n            :style=\"{ marginRight: '16px', marginBottom: '12px' }\"\n            src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/b5d834b83708a269b4562924436eac48.png~tplv-uwbnlip3yd-png.png\"\n          />\n          <div :style=\"{ marginBottom: '12px' }\">\n            Toutiao\n            <div :style=\"{ fontSize: '12px', color: '#4E5969' }\">\n              Founded in 2012\n            <\/div>\n          <\/div>\n        <\/a-row>\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2017-05\">\n        <a-row :style=\"{ display: 'inline-flex', alignItems: 'center' }\">\n          <img\n            width=\"40\"\n            :style=\"{ marginRight: '16px', marginBottom: '12px' }\"\n            src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/385ed540c359ec8a9b9ce2b5fe89b098.png~tplv-uwbnlip3yd-png.png\"\n          />\n          <div :style=\"{ marginBottom: '12px' }\">\n            Xigua Video\n            <div :style=\"{ fontSize: '12px', color: '#4E5969' }\">\n              Founded in 2017\n            <\/div>\n          <\/div>\n        <\/a-row>\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2018-07\">\n        <a-row :style=\"{ display: 'inline-flex', alignItems: 'center' }\">\n          <img\n            width=\"40\"\n            :style=\"{ marginRight: '16px', marginBottom: '12px' }\"\n            src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/385ed540c359ec8a9b9ce2b5fe89b098.png~tplv-uwbnlip3yd-png.png\"\n          />\n          <div :style=\"{ marginBottom: '12px' }\">\n            Pipidance\n            <div :style=\"{ fontSize: '12px', color: '#4E5969' }\">\n              Founded in 2018\n            <\/div>\n          <\/div>\n        <\/a-row>\n      <\/a-timeline-item>\n    <\/a-timeline>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const mode = ref('top');\n\n    const onChange = (_mode) => {\n      mode.value = _mode;\n    };\n\n    return {\n      mode,\n      onChange\n    }\n  },\n};\n<\/script>";
const directionTitle = "Direction.Md";
const directionDescription = "可以通过 `direction` 设置展示横向时间轴";
import dotDemo from '../../.vitepress/theme/generated/timeline/dot.vue';
const dotSource = "<template>\n  <div :style=\"{ display: 'flex' }\">\n    <a-timeline :style=\"{ marginRight: '40px' }\">\n      <a-timeline-item label=\"2020-04-12\" dotColor=\"#00B42A\">\n        The first milestone\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2020-05-17\">\n        The second milestone\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2020-06-22\">\n        <template #dot>\n          <IconClockCircle :style=\"{ fontSize: '12px', color: '#F53F3F' }\" />\n        <\/template>\n        The third milestone\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2020-06-22\" dotColor=\"var(--color-fill-4)\">\n        The third milestone\n      <\/a-timeline-item>\n    <\/a-timeline>\n\n    <a-timeline :style=\"{ marginRight: '40px' }\">\n      <a-timeline-item label=\"2020-04-12\">\n        <template #dot>\n          <IconCheck\n            :style=\"{\n              fontSize: '12px',\n              padding: '2px',\n              boxSizing: 'border-box',\n              borderRadius: '50%',\n              backgroundColor: 'var(--color-primary-light-1)',\n            }\"\n          />\n        <\/template>\n        The first milestone\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2020-05-17\">\n        <template #dot>\n          <IconCheck\n            :style=\"{\n              fontSize: '12px',\n              padding: '2px',\n              boxSizing: 'border-box',\n              borderRadius: '50%',\n              backgroundColor: 'var(--color-primary-light-1)',\n            }\"\n          />\n        <\/template>\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2020-06-22\">The third milestone<\/a-timeline-item>\n      <a-timeline-item label=\"2020-06-22\" dotColor=\"var(--color-fill-4)\">\n        The third milestone\n      <\/a-timeline-item>\n    <\/a-timeline>\n\n    <a-timeline>\n      <a-timeline-item label=\"2020-04-12\">The first milestone<\/a-timeline-item>\n      <a-timeline-item label=\"2020-05-17\" dotColor=\"var(--color-fill-4)\">\n        The second milestone\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2020-06-22\" dotColor=\"var(--color-fill-4)\">\n        The third milestone\n      <\/a-timeline-item>\n    <\/a-timeline>\n  <\/div>\n<\/template>\n\n<script>\nimport { IconCheck } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: { IconCheck },\n};\n<\/script>";
const dotTitle = "Dot.Md";
const dotDescription = "可以通过属性 `dotColor`, `dotType` 设置节点的颜色以及节点类型。同时可通过 `dot` 直接传入 DOM 自定义节点样式。优先级高于 `dotColor` 和 `dotType`";
import iconDemo from '../../.vitepress/theme/generated/timeline/icon.vue';
const iconSource = "<template>\n  <a-timeline>\n    <a-timeline-item label=\"2017-03-10\" dotColor=\"#00B42A\">\n      The first milestone\n    <\/a-timeline-item>\n    <a-timeline-item label=\"2018-05-22\">The second milestone<\/a-timeline-item>\n    <a-timeline-item label=\"2020-06-22\" dotColor=\"#F53F3F\">\n      The third milestone\n      <IconExclamationCircleFill\n        :style=\"{ color: 'F53F3F', fontSize: '12px', marginLeft: '4px' }\"\n      />\n    <\/a-timeline-item>\n    <a-timeline-item label=\"2020-09-30\" dotColor=\"#C9CDD4\">\n      The fourth milestone\n    <\/a-timeline-item>\n  <\/a-timeline>\n<\/template>\n\n<script>\nimport { IconExclamationCircleFill } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: { IconExclamationCircleFill },\n};\n<\/script>";
const iconTitle = "Icon.Md";
const iconDescription = "自定义节点内容";
import labelDemo from '../../.vitepress/theme/generated/timeline/label.vue';
const labelSource = "<template>\n  <div>\n    <a-row align=\"center\">\n      <a-typography-text>labelPosition: &nbsp; &nbsp;<\/a-typography-text>\n      <a-radio-group @change=\"onLabelPositionChange\" :modelValue=\"pos\">\n        <a-radio value=\"same\">same<\/a-radio>\n        <a-radio value=\"relative\">relative<\/a-radio>\n      <\/a-radio-group>\n    <\/a-row>\n    <a-row align=\"center\" :style=\"{ margin: '20px 0px 24px' }\">\n      <a-typography-text>mode: &nbsp; &nbsp;<\/a-typography-text>\n      <a-radio-group @change=\"onModeChange\" :modelValue=\"mode\">\n        <a-radio value=\"left\">left<\/a-radio>\n        <a-radio value=\"right\">right<\/a-radio>\n        <a-radio value=\"alternate\">alternate<\/a-radio>\n      <\/a-radio-group>\n    <\/a-row>\n    <a-timeline :mode=\"mode\" :labelPosition=\"pos\">\n      <a-timeline-item label=\"2017-03-10\" dotColor=\"#52C419\">\n        The first milestone\n      <\/a-timeline-item>\n      <a-timeline-item\n        label=\"2018-05-12\"\n        dotColor=\"#F5222D\"\n        labelPosition=\"same\"\n      >\n        The second milestone\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2020-09-30\" position=\"bottom\">\n        The third milestone\n      <\/a-timeline-item>\n    <\/a-timeline>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const mode = ref('left');\n    const pos = ref('same');\n\n    const onLabelPositionChange = (_pos) => {\n      pos.value = _pos;\n    };\n\n    const onModeChange = (_mode) => {\n      mode.value = _mode;\n    };\n\n    return {\n      mode,\n      pos,\n      onLabelPositionChange,\n      onModeChange\n    }\n  },\n};\n<\/script>";
const labelTitle = "Label.Md";
const labelDescription = "通过 `labelPosition` 可以设置标签文本的位置。";
import modeDemo from '../../.vitepress/theme/generated/timeline/mode.vue';
const modeSource = "<template>\n  <a-row justify=\"space-between\">\n    <a-timeline mode=\"alternate\" :style=\"{ flex: 1 }\">\n      <a-timeline-item label=\"2017-03-10\">The first milestone<\/a-timeline-item>\n      <a-timeline-item label=\"2018-05-12\">The second milestone<\/a-timeline-item>\n      <a-timeline-item label=\"2020-09-30\" position=\"bottom\">\n        The third milestone\n      <\/a-timeline-item>\n    <\/a-timeline>\n    <a-timeline mode=\"right\" :style=\"{ flex: 1 }\">\n      <a-timeline-item label=\"2017-03-10\">The first milestone<\/a-timeline-item>\n      <a-timeline-item label=\"2018-05-12\">The second milestone<\/a-timeline-item>\n      <a-timeline-item label=\"2020-09-30\" position=\"bottom\">\n        The third milestone\n      <\/a-timeline-item>\n    <\/a-timeline>\n  <\/a-row>\n<\/template>";
const modeTitle = "Mode.Md";
const modeDescription = "设置 `mode=alternate`时将会交替展示内容。同时可以通过设置 `TimelineItem` 的 `positon`属性控制时间轴节点的位置.";
import pendingDemo from '../../.vitepress/theme/generated/timeline/pending.vue';
const pendingSource = "<template>\n  <a-row align=\"center\" :style=\"{ marginBottom: '24px' }\">\n    <a-checkbox\n      :checked=\"!!pendingProps.direction\"\n      @change=\"(v) => onChange({ direction: v ? 'horizontal' : '' })\"\n    >\n      horizontal &nbsp; &nbsp;\n    <\/a-checkbox>\n    <a-checkbox\n      :checked=\"!!pendingProps.reverse\"\n      @change=\"(v) => onChange({ reverse: v })\"\n    >\n      reverse &nbsp; &nbsp;\n    <\/a-checkbox>\n    <a-checkbox\n      :checked=\"!!pendingProps.pending\"\n      @change=\"\n        (v) => onChange({ pending: v ? 'This is a pending dot' : false })\n      \"\n    >\n      pending &nbsp; &nbsp;\n    <\/a-checkbox>\n\n    <a-checkbox\n      :checked=\"!!pendingProps.hasPendingDot\"\n      @change=\"(v) => onChange({ hasPendingDot: v })\"\n    >\n      custom pendingDot\n    <\/a-checkbox>\n  <\/a-row>\n  <a-timeline v-bind=\"pendingProps\">\n    <template v-if=\"pendingProps.hasPendingDot\" #dot>\n      <IconFire :style=\"{ color: '#e70a0a' }\" />\n    <\/template>\n    <a-timeline-item label=\"2017-03-10\" dotColor=\"#52C419\">\n      The first milestone\n    <\/a-timeline-item>\n    <a-timeline-item label=\"2018-05-12\" dotColor=\"#F5222D\">\n      The second milestone\n    <\/a-timeline-item>\n    <a-timeline-item label=\"2020-09-30\">The third milestone<\/a-timeline-item>\n  <\/a-timeline>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\nimport { IconFire } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconFire,\n  },\n  setup() {\n    const pendingProps = ref({});\n\n    const onChange = (newProps) => {\n      pendingProps.value = {\n        ...pendingProps.value,\n        ...newProps,\n      };\n    };\n\n    return {\n      pendingProps,\n      onChange\n    }\n  },\n};\n<\/script>";
const pendingTitle = "Pending.Md";
const pendingDescription = "当任务状态正在发生，还在记录过程中，可用幽灵节点来表示当前的时间节点，通过`slot#pending-dot`定制其轴点。";
import typeDemo from '../../.vitepress/theme/generated/timeline/type.vue';
const typeSource = "<template>\n  <a-timeline>\n    <a-timeline-item label=\"2017-03-10\" lineType=\"dashed\">\n      The first milestone\n      <br />\n      <a-typography-text\n        type=\"secondary\"\n        :style=\"{ fontSize: '12px', marginTop: '4px' }\"\n      >\n        This is a descriptive message\n      <\/a-typography-text>\n    <\/a-timeline-item>\n    <a-timeline-item label=\"2018-05-12\" lineType=\"dashed\">\n      The second milestone\n      <br />\n      <a-typography-text\n        type=\"secondary\"\n        :style=\"{ fontSize: '12px', marginTop: '4px' }\"\n      >\n        This is a descriptive message\n      <\/a-typography-text>\n    <\/a-timeline-item>\n    <a-timeline-item label=\"2020-09-30\" lineType=\"dashed\">\n      The third milestone\n      <br />\n      <a-typography-text\n        type=\"secondary\"\n        :style=\"{ fontSize: '12px', marginTop: '4px' }\"\n      >\n        This is a descriptive message\n      <\/a-typography-text>\n    <\/a-timeline-item>\n  <\/a-timeline>\n<\/template>";
const typeTitle = "Type.Md";
const typeDescription = "自定义轴线的示例。";
import verticalDemo from '../../.vitepress/theme/generated/timeline/vertical.vue';
const verticalSource = "<template>\n  <div>\n    <a-row align=\"center\" :style=\"{ marginBottom: '24px' }\">\n      <a-typography-text>mode: &nbsp; &nbsp;<\/a-typography-text>\n      <a-radio-group @change=\"onChange\" :modelValue=\"mode\">\n        <a-radio value=\"left\">left<\/a-radio>\n        <a-radio value=\"right\">right<\/a-radio>\n        <a-radio value=\"alternate\">alternate<\/a-radio>\n      <\/a-radio-group>\n    <\/a-row>\n    <a-timeline :mode=\"mode\" labelPosition=\"relative\">\n      <a-timeline-item label=\"2012-08\">\n        <a-row :style=\"{ display: 'inline-flex', alignItems: 'center' }\">\n          <img\n            width=\"40\"\n            :style=\"{ marginRight: '16px', marginBottom: '12px' }\"\n            src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/b5d834b83708a269b4562924436eac48.png~tplv-uwbnlip3yd-png.png\"\n          />\n          <div :style=\"{ marginBottom: '12px' }\">\n            Toutiao\n            <div :style=\"{ fontSize: '12px', color: '#4E5969' }\">\n              Founded in 2012\n            <\/div>\n          <\/div>\n        <\/a-row>\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2017-05\">\n        <a-row :style=\"{ display: 'inline-flex', alignItems: 'center' }\">\n          <img\n            width=\"40\"\n            :style=\"{ marginRight: '16px', marginBottom: '12px' }\"\n            src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/385ed540c359ec8a9b9ce2b5fe89b098.png~tplv-uwbnlip3yd-png.png\"\n          />\n          <div :style=\"{ marginBottom: '12px' }\">\n            Xigua Video\n            <div :style=\"{ fontSize: '12px', color: '#4E5969' }\">\n              Founded in 2017\n            <\/div>\n          <\/div>\n        <\/a-row>\n      <\/a-timeline-item>\n      <a-timeline-item label=\"2018-07\">\n        <a-row :style=\"{ display: 'inline-flex', alignItems: 'center' }\">\n          <img\n            width=\"40\"\n            :style=\"{ marginRight: '16px', marginBottom: '12px' }\"\n            src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/385ed540c359ec8a9b9ce2b5fe89b098.png~tplv-uwbnlip3yd-png.png\"\n          />\n          <div :style=\"{ marginBottom: '12px' }\">\n            Pipidance\n            <div :style=\"{ fontSize: '12px', color: '#4E5969' }\">\n              Founded in 2018\n            <\/div>\n          <\/div>\n        <\/a-row>\n      <\/a-timeline-item>\n    <\/a-timeline>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const mode = ref('left');\n\n    const onChange = (_mode) => {\n      mode.value = _mode;\n    };\n\n    return {\n      mode,\n      onChange\n    }\n  },\n};\n<\/script>";
const verticalTitle = "Vertical.Md";
const verticalDescription = "竖直方向的时间轴。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="customTitle" :description="customDescription" :code="customSource"

>   <customDemo />
> </DemoBlock>

<DemoBlock :title="directionTitle" :description="directionDescription" :code="directionSource"

>   <directionDemo />
> </DemoBlock>

<DemoBlock :title="dotTitle" :description="dotDescription" :code="dotSource"

>   <dotDemo />
> </DemoBlock>

<DemoBlock :title="iconTitle" :description="iconDescription" :code="iconSource"

>   <iconDemo />
> </DemoBlock>

<DemoBlock :title="labelTitle" :description="labelDescription" :code="labelSource"

>   <labelDemo />
> </DemoBlock>

<DemoBlock :title="modeTitle" :description="modeDescription" :code="modeSource"

>   <modeDemo />
> </DemoBlock>

<DemoBlock :title="pendingTitle" :description="pendingDescription" :code="pendingSource"

>   <pendingDemo />
> </DemoBlock>

<DemoBlock :title="typeTitle" :description="typeDescription" :code="typeSource"

>   <typeDemo />
> </DemoBlock>

<DemoBlock :title="verticalTitle" :description="verticalDescription" :code="verticalSource"

>   <verticalDemo />
> </DemoBlock>
