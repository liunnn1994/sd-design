```yaml
title:
  zh-CN: RTL 视图
  en-US: RTL
```

## zh-CN

设置组件为从右向左阅读的视图。

---

## en-US

Set the component to a view that reads from right to left.

---

```vue
<template>
  <div>
    <sd-switch v-model="rtlType" style="margin-bottom: 20px;">
      <template #checked> RTL </template>
      <template #unchecked> LTR </template>
    </sd-switch>
    <sd-config-provider :rtl="rtlType">
      <sd-tabs :default-active-key="2" style="margin-bottom: 20px;">
        <sd-tab-pane v-for="i in 36" :key="i" :title="`Tab ${i}`">
          Content of Tab Panel {{ i }}
        </sd-tab-pane>
      </sd-tabs>
      <sd-space :direction="'vertical'" style="width: 100%;">
        <sd-space :size="40">
          <sd-badge :count="9">
            <sd-avatar shape="square" />
          </sd-badge>
          <sd-badge :count="9" dot :dotStyle="{ width: '10px', height: '10px' }">
            <sd-avatar shape="square" />
          </sd-badge>
          <sd-badge :dotStyle="{ height: '16px', width: '16px', fontSize: '14px' }">
            <template #content>
              <IconClockCircle :style="{ verticalAlign: 'middle', color: 'var(--color-text-2)' }" />
            </template>
            <sd-avatar shape="square" />
          </sd-badge>
          <sd-tag :color="'red'" closable>red</sd-tag>
          <sd-tag :color="'blue'" closable>blue</sd-tag>
          <sd-tag :color="'green'" closable>green</sd-tag>
        </sd-space>
      </sd-space>
    </sd-config-provider>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const rtlType = ref(true);

      return {
        rtlType,
      };
    },
  };
</script>
```
