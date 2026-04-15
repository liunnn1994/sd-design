```yaml
title:
  zh-CN: 渐变进度条
  en-US: linear-gradient
```

## zh-CN

`color` 传入对象时， 会作为 `linear-gradient` 的属性值设置渐变色。

---

## en-US

linear-gradient progress bar.

---

```vue
<template>
  <div>
    <sd-progress
      :percent="0.8"
      :style="{ width: '50%' }"
      :color="{
        '0%': 'rgb(var(--primary-6))',
        '100%': 'rgb(var(--success-6))',
      }"
    />
    <br />
    <br />

    <sd-progress
      :percent="1"
      :style="{ width: '50%' }"
      :color="{
        '0%': 'rgb(var(--primary-6))',
        '100%': 'rgb(var(--success-6))',
      }"
    />
    <br />
    <br />
    <sd-space size="large">
      <sd-progress
        type="circle"
        :percent="0.8"
        :style="{ width: '50%' }"
        :color="{
          '0%': 'rgb(var(--primary-6))',
          '100%': 'rgb(var(--success-6))',
        }"
      />

      <sd-progress
        type="circle"
        :percent="1"
        :style="{ width: '50%' }"
        :color="{
          '0%': 'rgb(var(--primary-6))',
          '100%': 'rgb(var(--success-6))',
        }"
      />
    </sd-space>
  </div>
</template>
```
