```yaml
title:
  zh-CN: 标签的颜色
  en-US: Color
```

## zh-CN

我们提供多种预设色彩的标签样式，通过 `color` 设置不同颜色。如果预设值不能满足你的需求，`color` 字段也可以设置自定义色值。

---

## en-US

We provide a variety of label styles with preset colors, and set different colors through `color`. If the preset value cannot meet your needs, you can also set a custom color value in the `color` field.

---

```vue
<template>
  <sd-space wrap>
    <sd-tag v-for="(color, index) of colors" :key="index" :color="color" closable>{{ color }}</sd-tag>
  </sd-space>
  <h3>Custom Color:</h3>
  <sd-space wrap>
    <sd-tag v-for="(color, index) of custom" :key="index" :color="color" closable>{{ color }}</sd-tag>
  </sd-space>
</template>

<script>
  export default {
    setup() {
      const colors = [
        'red',
        'orangered',
        'orange',
        'gold',
        'lime',
        'green',
        'cyan',
        'blue',
        'sdblue',
        'purple',
        'pinkpurple',
        'magenta',
        'gray',
      ];
      const custom = [
        '#f53f3f',
        '#7816ff',
        '#00b42a',
        '#165dff',
        '#ff7d00',
        '#eb0aa4',
        '#7bc616',
        '#86909c',
        '#b71de8',
        '#0fc6c2',
        '#ffb400',
        '#168cff',
        '#ff5722',
      ];

      return {
        colors,
        custom,
      };
    },
  };
</script>
```
