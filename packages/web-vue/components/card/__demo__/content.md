```yaml
title:
  zh-CN: 简洁卡片
  en-US: Only Content
```

## zh-CN

卡片可以只有内容区域。

---

## en-US

A card that only has a content area.

---

```vue
<template>
  <sd-card hoverable :style="{ width: '360px', marginBottom: '20px' }">
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }"
    >
      <span :style="{ display: 'flex', alignItems: 'center', color: '#1D2129' }">
        <sd-avatar :style="{ marginRight: '8px', backgroundColor: '#165DFF' }" :size="28">
          A
        </sd-avatar>
        <sd-typography-text>Username</sd-typography-text>
      </span>
      <sd-link>More</sd-link>
    </div>
  </sd-card>
</template>
```
