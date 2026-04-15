```yaml
title:
  zh-CN: 竖直滑动条
  en-US: Vertical Slider
```

## zh-CN

设置 `direction="vertical"` ，将会显示竖直的滑动条。

---

## en-US

Set `direction="vertical"` and a vertical slider will be displayed.

---

```vue
<template>
  <sd-space align="start">
    <sd-slider :default-value="50" direction="vertical" />

    <sd-slider
      direction="vertical"
      :default-value="5"
      :style="{ width: '300px' }"
      :max="15"
      :marks="{
        5: '5km',
        10: '10km',
      }"
    />
  </sd-space>
</template>
```
