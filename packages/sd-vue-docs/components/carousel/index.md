---
title: 'carousel'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 图片轮播 Carousel
description: 用于展示多张图片、视频或内嵌框架等内容的循环播放，支持系统自动播放或用户手动切换。
```

## API

### `<carousel>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| current **(v-model)** | 当前展示索引 | `number` | `-` |
| default-current | 当前展示索引 | `number` | `1` |
| auto-play | 是否自动循环展示，或者传入 `{ interval: 自动切换的时间间隔(默认: 3000), hoverToPause: 鼠标悬浮时是否暂停自动切换(默认: true) }` 进行高级配置 | `boolean \| CarouselAutoPlayConfig` | `false` |
| move-speed | 幻灯片移动速率(ms) | `number` | `500` |
| animation-name | 切换动画 | `'slide' \| 'fade' \| 'card'` | `'slide'` |
| trigger | 幻灯片切换触发方式, click/hover 指示器 | `'click' \| 'hover'` | `'click'` |
| direction | 幻灯片移动方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| show-arrow | 切换箭头显示时机 | `'always' \| 'hover' \| 'never'` | `'always'` |
| arrow-class | 切换箭头样式 | `string` | `''` |
| indicator-type | 指示器类型，可为小方块和小圆点或不显示 | `'line' \| 'dot' \| 'slider' \| 'never'` | `'dot'` |
| indicator-position | 指示器位置 | `'bottom' \| 'top' \| 'left' \| 'right' \| 'outer'` | `'bottom'` |
| indicator-class | 指示器的样式 | `string` | `''` |
| transition-timing-function | 过渡速度曲线, 默认匀速 [transition-timing-function](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition-timing-function) | `string` | `'cubic-bezier(0.34, 0.69, 0.1, 1)'` |

### `<carousel>` Events

| 事件名 | 描述 | 参数 |
| --- | --- | --- |
| change | 幻灯片发生切换时的回调函数 | index: `number`<br>prevIndex: `number`<br>isManual: `boolean` |

<script setup lang="ts">
import autoDemo from '../../.vitepress/theme/generated/carousel/auto.vue';
const autoSource = "<template>\n  <a-carousel\n    :style=\"{\n      width: '600px',\n      height: '240px',\n    }\"\n    :auto-play=\"true\"\n    indicator-type=\"dot\"\n    show-arrow=\"hover\"\n  >\n    <a-carousel-item v-for=\"image in images\">\n      <img\n        :src=\"image\"\n        :style=\"{\n          width: '100%',\n        }\"\n      />\n    <\/a-carousel-item>\n  <\/a-carousel>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const images = [\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',\n    ];\n    return {\n      images\n    }\n  },\n};\n<\/script>";
const autoTitle = "Auto.Md";
const autoDescription = "可以通过 `autoPlay` 设置是否自动切换。\n可设置 `moveSpeed`, `timingFunc` 实现不同切换幻灯片效果。";
import basicDemo from '../../.vitepress/theme/generated/carousel/basic.vue';
const basicSource = "<template>\n  <a-carousel\n    :style=\"{\n      width: '600px',\n      height: '240px',\n    }\"\n    :default-current=\"2\"\n    @change=\"handleChange\"\n  >\n    <a-carousel-item v-for=\"image in images\">\n      <img\n        :src=\"image\"\n        :style=\"{\n          width: '100%',\n        }\"\n      />\n    <\/a-carousel-item>\n  <\/a-carousel>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const images = [\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',\n    ];\n    const handleChange=(value)=>{\n      console.log(value)\n    }\n    return {\n      images,\n      handleChange\n    }\n  },\n};\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "基本用法";
import cardDemo from '../../.vitepress/theme/generated/carousel/card.vue';
const cardSource = "<template>\n  <a-carousel\n    :autoPlay=\"true\"\n    animation-name=\"card\"\n    show-arrow=\"never\"\n    indicator-position=\"outer\"\n    :style=\"{\n      width: '100%',\n      height: '240px',\n    }\"\n  >\n    <a-carousel-item v-for=\"image in images\" :style=\"{ width: '60%' }\">\n      <img\n        :src=\"image\"\n        :style=\"{\n          width: '100%',\n        }\"\n      />\n    <\/a-carousel-item>\n  <\/a-carousel>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const images = [\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/24e0dd27418d2291b65db1b21aa62254.png~tplv-uwbnlip3yd-webp.webp',\n    ];\n    return {\n      images\n    }\n  },\n};\n<\/script>";
const cardTitle = "Card.Md";
const cardDescription = "当页面宽度方向空间空余，但高度方向空间多余时，可指定 `animation` 为 `card` 使用卡片化风格。";
import directionDemo from '../../.vitepress/theme/generated/carousel/direction.vue';
const directionSource = "<template>\n  <a-carousel\n    :style=\"{\n      width: '600px',\n      height: '240px',\n    }\"\n    show-arrow=\"never\"\n    direction=\"vertical\"\n    indicator-position=\"right\"\n  >\n    <a-carousel-item v-for=\"image in images\">\n      <img\n        :src=\"image\"\n        :style=\"{\n          width: '100%',\n        }\"\n      />\n    <\/a-carousel-item>\n  <\/a-carousel>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const images = [\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',\n    ];\n    return {\n      images\n    }\n  },\n};\n<\/script>";
const directionTitle = "Direction.Md";
const directionDescription = "默认情况下，`direction` 为 `horizontal`。通过设置 `direction` 为 `vertical` 来使用垂直方向切换。";
import fadeDemo from '../../.vitepress/theme/generated/carousel/fade.vue';
const fadeSource = "<template>\n  <a-carousel\n    :style=\"{\n      width: '600px',\n      height: '240px',\n    }\"\n    :auto-play=\"true\"\n    animation-name=\"fade\"\n    show-arrow=\"never\"\n  >\n    <a-carousel-item v-for=\"image in images\">\n      <img\n        :src=\"image\"\n        :style=\"{\n          width: '100%',\n        }\"\n      />\n    <\/a-carousel-item>\n  <\/a-carousel>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const images = [\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',\n      'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',\n    ];\n    return {\n      images\n    }\n  },\n};\n<\/script>";
const fadeTitle = "Fade.Md";
const fadeDescription = "指定 `animation` 为 `fade` 使用渐隐切换效果。";
import indicatorDemo from '../../.vitepress/theme/generated/carousel/indicator.vue';
const indicatorSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group\n      type=\"button\"\n      @change=\"updateType\"\n      style=\"{ marginBottom: '10px' }\"\n      :modelValue=\"indicatorType\"\n    >\n      <a-radio value=\"dot\">dot<\/a-radio>\n      <a-radio value=\"line\">line<\/a-radio>\n      <a-radio value=\"slider\">slider<\/a-radio>\n    <\/a-radio-group>\n    <a-radio-group\n      type=\"button\"\n      @change=\"updatePosition\"\n      :style=\"{ marginBottom: '20px' }\"\n      :modelValue=\"indicatorPosition\"\n    >\n      <a-radio value=\"left\">left<\/a-radio>\n      <a-radio value=\"right\">right<\/a-radio>\n      <a-radio value=\"top\">top<\/a-radio>\n      <a-radio value=\"bottom\">bottom<\/a-radio>\n      <a-radio value=\"outer\">outer<\/a-radio>\n    <\/a-radio-group>\n    <a-carousel\n      :indicator-type=\"indicatorType\"\n      :indicator-position=\"indicatorPosition\"\n      show-arrow=\"never\"\n      :style=\"{\n      width: '600px',\n      height: '240px',\n    }\"\n    >\n      <a-carousel-item v-for=\"image in images\">\n        <img\n          :src=\"image\"\n          :style=\"{\n          width: '100%',\n        }\"\n        />\n      <\/a-carousel-item>\n    <\/a-carousel>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      images: [\n        'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',\n        'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',\n        'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',\n      ],\n      indicatorType: 'dot',\n      indicatorPosition: 'bottom',\n    };\n  },\n  methods: {\n    updateType(type) {\n      this.indicatorType = type;\n    },\n    updatePosition(position) {\n      this.indicatorPosition = position;\n    },\n  },\n};\n<\/script>";
const indicatorTitle = "Indicator.Md";
const indicatorDescription = "可以指定指示器类型：`dot` | `line` | `slider` 和位置 `left` | `right` | `top` | `bottom` | `outer`。";
</script>

## 示例

<DemoBlock :title="autoTitle" :description="autoDescription" :code="autoSource"

>   <autoDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="cardTitle" :description="cardDescription" :code="cardSource"

>   <cardDemo />
> </DemoBlock>

<DemoBlock :title="directionTitle" :description="directionDescription" :code="directionSource"

>   <directionDemo />
> </DemoBlock>

<DemoBlock :title="fadeTitle" :description="fadeDescription" :code="fadeSource"

>   <fadeDemo />
> </DemoBlock>

<DemoBlock :title="indicatorTitle" :description="indicatorDescription" :code="indicatorSource"

>   <indicatorDemo />
> </DemoBlock>
