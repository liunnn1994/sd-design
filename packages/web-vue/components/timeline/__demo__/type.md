```yaml
title:
  zh-CN: 自定义轴线样式
  en-US: Type
```

## zh-CN

自定义轴线的示例。

---

## en-US

Example of custom axis.

---

```vue
<template>
  <sd-timeline>
    <sd-timeline-item label="2017-03-10" lineType="dashed">
      The first milestone
      <br />
      <sd-typography-text type="secondary" :style="{ fontSize: '12px', marginTop: '4px' }">
        This is a descriptive message
      </sd-typography-text>
    </sd-timeline-item>
    <sd-timeline-item label="2018-05-12" lineType="dashed">
      The second milestone
      <br />
      <sd-typography-text type="secondary" :style="{ fontSize: '12px', marginTop: '4px' }">
        This is a descriptive message
      </sd-typography-text>
    </sd-timeline-item>
    <sd-timeline-item label="2020-09-30" lineType="dashed">
      The third milestone
      <br />
      <sd-typography-text type="secondary" :style="{ fontSize: '12px', marginTop: '4px' }">
        This is a descriptive message
      </sd-typography-text>
    </sd-timeline-item>
  </sd-timeline>
</template>
```
