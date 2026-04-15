```yaml
title:
  zh-CN: 内部卡片
  en-US: Inner Card
```

## zh-CN

卡片中可以嵌套其他卡片组件。

---

## en-US

Other card components can be nested in the card.

---

```vue
<template>
  <sd-card title="SD Card">
    <sd-card :style="{ marginBottom: '20px' }" title="Inner Card Title">
      <template #extra>
        <sd-link>More</sd-link>
      </template>
      Inner Card Content
    </sd-card>
    <sd-card title="Inner Card Title">
      <template #extra>
        <sd-link>More</sd-link>
      </template>
      Inner Card Content
    </sd-card>
  </sd-card>
</template>
```
