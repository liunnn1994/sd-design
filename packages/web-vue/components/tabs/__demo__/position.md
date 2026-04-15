```yaml
title:
  zh-CN: 位置
  en-US: Position
```

## zh-CN

通过 `position` 属性可以自定义标签栏的位置。

---

## en-US

The position of the tab bar can be customized through the `position` property.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group v-model="position" type="button">
      <sd-radio value="top">Top</sd-radio>
      <sd-radio value="right">Right</sd-radio>
      <sd-radio value="bottom">Bottom</sd-radio>
      <sd-radio value="left">Left</sd-radio>
    </sd-radio-group>
    <sd-tabs :position="position">
      <sd-tab-pane key="1" title="Tab 1"> Content of Tab Panel 1 </sd-tab-pane>
      <sd-tab-pane key="2" title="Tab 2"> Content of Tab Panel 2 </sd-tab-pane>
      <sd-tab-pane key="3" title="Tab 3"> Content of Tab Panel 3 </sd-tab-pane>
    </sd-tabs>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const position = ref('top');

      return {
        position,
      };
    },
  };
</script>
```
