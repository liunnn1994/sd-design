```yaml
title:
  zh-CN: 展开图标
  en-US: Custom expand icon
```

## zh-CN

为展开项自定义展开图标

---

## en-US

Customize the expand icon for `collapse-item`

---

```vue
<template>
  <sd-collapse :default-active-key="['1', 2]">
    <template #expand-icon="{ active }">
      <icon-face-smile-fill v-if="active" />
      <icon-face-frown-fill v-else />
    </template>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1">
      <template #expand-icon="{ active }">
        <icon-double-down v-if="active" />
        <icon-double-right v-else />
      </template>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." :key="2">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="3">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
  </sd-collapse>
</template>
```
