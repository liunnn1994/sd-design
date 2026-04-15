```yaml
title:
  zh-CN: 触发方式
  en-US: Trigger
```

## zh-CN

通过 `trigger` 指定触发方式。

---

## en-US

Specify the trigger method by `trigger`.

---

```vue
<template>
  <sd-radio-group v-model="trigger">
    <sd-radio value="click">click</sd-radio>
    <sd-radio value="hover">hover</sd-radio>
  </sd-radio-group>
  <sd-tabs default-active-key="1" :trigger="trigger">
    <sd-tab-pane key="1" title="Tab 1"> Content of Tab Panel 1 </sd-tab-pane>
    <sd-tab-pane key="2" title="Tab 2"> Content of Tab Panel 2 </sd-tab-pane>
    <sd-tab-pane key="3">
      <template #title>Tab 3</template>
      Content of Tab Panel 3
    </sd-tab-pane>
  </sd-tabs>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const trigger = ref('click');
      return {
        trigger,
      };
    },
  };
</script>
```
