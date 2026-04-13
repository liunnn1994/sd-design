---
title: 'progress'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 反馈
title: 进度条 Progress
description: 给予用户当前系统执行中任务运行状态的反馈，多用于运行一段时间的场景，有效减轻用户在等待中产生的焦虑感。
```

## API

### `<progress>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| type | 进度条的类型 | `'line' \| 'circle'` | `'line'` |
| size | 进度条的大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |
| percent | 进度条当前的百分比 | `number` | `0` |
| steps | 开启步骤条模式，并设置步骤数 | `number` | `0` |
| animation | 是否开启过渡动画 | `boolean` | `false` |
| stroke-width | 进度条的线宽 | `number` | `-` |
| width | 进度条的长度 | `number\|string` | `-` |
| color | 进度条的颜色 | `string\|object` | `-` |
| track-color | 进度条的轨道颜色 | `string` | `-` |
| show-text | 是否显示文字 | `boolean` | `true` |
| status | 进度条状态 | `'normal' \| 'success' \| 'warning' \| 'danger'` | `-` |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/progress/basic.vue';
const basicSource = "<template>\n  <a-progress :percent=\"0.2\" :style=\"{width:'50%'}\" />\n  <br/>\n  <br/>\n  <a-progress :percent=\"0.3\" :style=\"{width:'50%'}\">\n    <template v-slot:text=\"scope\" >\n      进度 {{scope.percent * 100}}%\n    <\/template>\n  <\/a-progress>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "简单的进度条。";
import circleDemo from '../../.vitepress/theme/generated/progress/circle.vue';
const circleSource = "<template>\n  <a-space size=\"large\">\n    <a-progress type=\"circle\" :percent=\"percent\" />\n    <a-progress type=\"circle\" status='warning' :percent=\"percent\" />\n    <a-progress type=\"circle\" status='danger' :percent=\"percent\" />\n    <a-progress type=\"circle\" status='success' :percent=\"percent\" />\n  <\/a-space>\n  <div :style=\"{marginTop:'20px'}\">\n    <a-slider v-model=\"percent\" :max=\"1\" :step=\"0.1\" :style=\"{width: '150px'}\" />\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const percent = ref(0.2);\n\n    return {\n      percent\n    }\n  },\n}\n<\/script>";
const circleTitle = "Circle.Md";
const circleDescription = "设置 `type=\"circle\"` 将会展示环形进度条。";
import linearDemo from '../../.vitepress/theme/generated/progress/linear.vue';
const linearSource = "<template>\n  <div>\n    <a-progress\n      :percent=\"0.8\"\n      :style=\"{ width: '50%' }\"\n      :color=\"{\n        '0%': 'rgb(var(--primary-6))',\n        '100%': 'rgb(var(--success-6))',\n      }\"\n    />\n    <br/>\n    <br/>\n\n    <a-progress\n      :percent=\"1\"\n      :style=\"{ width: '50%' }\"\n      :color=\"{\n        '0%': 'rgb(var(--primary-6))',\n        '100%': 'rgb(var(--success-6))',\n      }\"\n    />\n    <br/>\n    <br/>\n    <a-space size=\"large\">\n      <a-progress\n        type=\"circle\"\n        :percent=\"0.8\"\n        :style=\"{ width: '50%' }\"\n        :color=\"{\n          '0%': 'rgb(var(--primary-6))',\n          '100%': 'rgb(var(--success-6))',\n        }\"\n      />\n\n      <a-progress\n        type=\"circle\"\n        :percent=\"1\"\n        :style=\"{ width: '50%' }\"\n        :color=\"{\n          '0%': 'rgb(var(--primary-6))',\n          '100%': 'rgb(var(--success-6))',\n        }\"\n      />\n    <\/a-space>\n  <\/div>\n<\/template>";
const linearTitle = "Linear.Md";
const linearDescription = "`color` 传入对象时， 会作为 `linear-gradient` 的属性值设置渐变色。";
import miniDemo from '../../.vitepress/theme/generated/progress/mini.vue';
const miniSource = "<template>\n  <a-space size=\"large\" :style=\"{width: '100%'}\">\n    <a-progress size=\"mini\" :percent=\"percent\"/>\n    <a-progress size=\"mini\" status='warning' :percent=\"percent\"/>\n    <a-progress size=\"mini\" status='danger' :percent=\"percent\"/>\n    <a-progress size=\"mini\" status='success' :percent=\"percent\"/>\n  <\/a-space>\n  <a-space size=\"large\" :style=\"{width: '100%', marginTop: '20px'}\">\n    <a-progress type=\"circle\" size=\"mini\" :percent=\"percent\"/>\n    <a-progress type=\"circle\" size=\"mini\" status='warning' :percent=\"percent\"/>\n    <a-progress type=\"circle\" size=\"mini\" status='danger' :percent=\"percent\"/>\n    <a-progress type=\"circle\" size=\"mini\" status='success' :percent=\"percent\"/>\n  <\/a-space>\n  <div :style=\"{marginTop: '20px'}\">\n    <a-slider v-model=\"percent\" :max=\"1\" :step=\"0.1\" :style=\"{width: '150px'}\" />\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const percent = ref(0.2);\n\n    return {\n      percent\n    }\n  },\n}\n<\/script>";
const miniTitle = "Mini.Md";
const miniDescription = "设置 `size=\"mini\"` 展示微型进度条。";
import sizeDemo from '../../.vitepress/theme/generated/progress/size.vue';
const sizeSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\" :style=\"{width:'50%'}\">\n    <a-radio-group v-model=\"size\" type=\"button\">\n      <a-radio value=\"small\">Small<\/a-radio>\n      <a-radio value=\"medium\">Medium<\/a-radio>\n      <a-radio value=\"large\">Large<\/a-radio>\n    <\/a-radio-group>\n    <a-progress :size=\"size\" :percent=\"0.2\"/>\n    <a-progress status='warning' :size=\"size\" :percent=\"0.2\"/>\n    <a-progress status='danger' :size=\"size\" :percent=\"0.2\"/>\n    <a-space>\n      <a-progress type=\"circle\" :size=\"size\" :percent=\"0.2\"/>\n      <a-progress type=\"circle\" status='warning' :size=\"size\" :percent=\"0.2\"/>\n      <a-progress type=\"circle\" status='danger' :size=\"size\" :percent=\"0.2\"/>\n    <\/a-space>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    return {\n      size: ref('medium')\n    }\n  }\n}\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "通过 `size` 设置进度条的大小";
import statusDemo from '../../.vitepress/theme/generated/progress/status.vue';
const statusSource = "<template>\n  <a-space direction=\"vertical\" :style=\"{width: '50%'}\">\n    <a-progress :percent=\"percent\" />\n    <a-progress status='warning' :percent=\"percent\" />\n    <a-progress status='danger' :percent=\"percent\" />\n  <\/a-space>\n  <div :style=\"{marginTop:'20px'}\">\n    <a-slider v-model=\"percent\" :max=\"1\" :step=\"0.1\" :style=\"{width: '150px'}\" />\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const percent = ref(0.2);\n\n    return {\n      percent\n    }\n  },\n}\n<\/script>";
const statusTitle = "Status.Md";
const statusDescription = "通过 `status` 指定进度条状态";
import stepsDemo from '../../.vitepress/theme/generated/progress/steps.vue';
const stepsSource = "<template>\n  <div :style=\"{ width: '50%' }\">\n    <a-progress :steps=\"3\" :percent=\"0.3\" />\n    <a-progress :steps=\"5\" status=\"warning\" :percent=\"1\" />\n    <a-progress :steps=\"3\" size=\"small\" :percent=\"0.3\" />\n  <\/div>\n<\/template>";
const stepsTitle = "Steps.Md";
const stepsDescription = "通过设置 `steps` 展示步骤进度条。";
import trackcolorDemo from '../../.vitepress/theme/generated/progress/trackcolor.vue';
const trackcolorSource = "<template>\n  <div :style=\"{ width: '50%' }\">\n    <a-progress\n      :percent=\"0.4\"\n      trackColor=\"var(--color-primary-light-1)\"\n      style=\"margin-bottom: 20px;\"\n    />\n    <a-progress\n      :percent=\"0.4\"\n      :steps=\"4\"\n      trackColor=\"var(--color-primary-light-1)\"\n      style=\"margin-bottom: 20px;\"\n    />\n    <a-progress\n      :percent=\"0.4\"\n      type=\"circle\"\n      trackColor=\"var(--color-primary-light-1)\"\n      style=\"margin-bottom: 20px;\"\n    />\n  <\/div>\n<\/template>";
const trackcolorTitle = "TrackColor.Md";
const trackcolorDescription = "可以通过 trackColor 设置剩余进度条的颜色";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="circleTitle" :description="circleDescription" :code="circleSource"

>   <circleDemo />
> </DemoBlock>

<DemoBlock :title="linearTitle" :description="linearDescription" :code="linearSource"

>   <linearDemo />
> </DemoBlock>

<DemoBlock :title="miniTitle" :description="miniDescription" :code="miniSource"

>   <miniDemo />
> </DemoBlock>

<DemoBlock :title="sizeTitle" :description="sizeDescription" :code="sizeSource"

>   <sizeDemo />
> </DemoBlock>

<DemoBlock :title="statusTitle" :description="statusDescription" :code="statusSource"

>   <statusDemo />
> </DemoBlock>

<DemoBlock :title="stepsTitle" :description="stepsDescription" :code="stepsSource"

>   <stepsDemo />
> </DemoBlock>

<DemoBlock :title="trackcolorTitle" :description="trackcolorDescription" :code="trackcolorSource"

>   <trackcolorDemo />
> </DemoBlock>
