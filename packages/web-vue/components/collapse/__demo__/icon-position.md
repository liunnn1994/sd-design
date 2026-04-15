```yaml
title:
  zh-CN: 展开图标位置
  en-US: Expand icon position
```

## zh-CN

通过 `expand-icon-position` 属性设置展开图标的位置。

---

## en-US

Set the position of the expanded icon through the `expand-icon-position` property.

---

```vue
<template>
  <sd-space direction="vertical" :style="{ width: '100%' }">
    <sd-space>
      <sd-radio-group type="button" v-model="position">
        <sd-radio value="left">Left</sd-radio>
        <sd-radio value="right">Right</sd-radio>
      </sd-radio-group>
      <sd-checkbox v-model="hideIcon">Hide Expand Icon</sd-checkbox>
    </sd-space>
    <sd-collapse
      :default-active-key="['1']"
      :expand-icon-position="position"
      :show-expand-icon="!hideIcon"
    >
      <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1">
        <template #expand-icon>
          <icon-plus />
        </template>
        <template #extra>
          <sd-tag size="small">city</sd-tag>
        </template>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
      </sd-collapse-item>
      <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="2" disabled>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
      </sd-collapse-item>
      <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="3">
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
        <div>Beijing Toutiao Technology Co., Ltd.</div>
      </sd-collapse-item>
    </sd-collapse>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const position = ref('left');
      const hideIcon = ref(false);

      return {
        position,
        hideIcon,
      };
    },
  };
</script>
```
