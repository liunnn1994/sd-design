```yaml
title:
  zh-CN: 带边框的标签
  en-US: Bordered
```

## zh-CN

通过参数 `bordered`，可以显示带边框的标签。

---

## en-US

Through the prop `bordered` to display a bordered tag.

---

```vue
<template>
  <sd-space wrap>
    <sd-tag bordered>default</sd-tag>
    <sd-tag v-for="(color, index) of colors" :key="index" :color="color" bordered>{{ color }}</sd-tag>
  </sd-space>
</template>

<script>
  export default {
    setup() {
      const colors = [
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
      return {
        colors,
      };
    },
  };
</script>
```
