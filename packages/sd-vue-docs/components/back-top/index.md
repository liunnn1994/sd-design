---
title: 'back-top'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 其他
title: 返回顶部 BackTop
description: 可一键返回顶部的按钮。
```

## API

### `<back-top>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| visible-height | 显示回到顶部按钮的触发滚动高度 | `number` | `200` |
| target-container | 滚动事件的监听容器 | `string \| HTMLElement` | `-` |
| easing | 滚动动画的缓动方式，可选值参考 [BTween](https://github.com/PengJiyuan/b-tween) | `string` | `'quartOut'` |
| duration | 滚动动画的持续时间 | `number` | `200` |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/back-top/basic.vue';
const basicSource = "<template>\n  <div class=\"wrapper\">\n    <ul id=\"basic-demo\">\n      <li v-for=\"(_, index) of Array(40)\" :key=\"index\">This is the content<\/li>\n    <\/ul>\n    <a-back-top target-container=\"#basic-demo\" :style=\"{position:'absolute'}\" />\n  <\/div>\n<\/template>\n\n<style scoped lang=\"less\">\n.wrapper {\n  position: relative;\n\n  ul {\n    height: 200px;\n    overflow-y: auto;\n\n    li {\n      line-height: 30px;\n    }\n  }\n}\n<\/style>";
const basicTitle = "Basic.Md";
const basicDescription = "当容器滚动到一定高度的时候，在右下角会出现一个返回顶部的按钮。";
import customDemo from '../../.vitepress/theme/generated/back-top/custom.vue';
const customSource = "<template>\n  <div class=\"wrapper\">\n    <ul id=\"custom-demo\">\n      <li v-for=\"(_, index) of Array(40)\" :key=\"index\">This is the content<\/li>\n    <\/ul>\n    <a-back-top target-container=\"#custom-demo\" :style=\"{position:'absolute'}\" >\n      <a-button>UP<\/a-button>\n    <\/a-back-top>\n  <\/div>\n<\/template>\n\n<style scoped lang=\"less\">\n.wrapper {\n  position: relative;\n\n  ul {\n    height: 200px;\n    overflow-y: auto;\n\n    li {\n      line-height: 30px;\n    }\n  }\n}\n<\/style>";
const customTitle = "Custom.Md";
const customDescription = "可以自定义返回按钮。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="customTitle" :description="customDescription" :code="customSource"

>   <customDemo />
> </DemoBlock>
