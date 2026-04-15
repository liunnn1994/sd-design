```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

基础页头，适合使用在需要简单描述的场景。默认是没有底色的。

---

## en-US

The basic page header is suitable for use in scenarios that require a simple description. The default is no background color.

---

```vue
<template>
  <div :style="{ background: 'var(--color-fill-2)', padding: '28px' }">
    <sd-page-header
      :style="{ background: 'var(--color-bg-2)' }"
      title="SD Design"
      subtitle="SD Design Vue"
    >
      <template #extra>
        <sd-radio-group type="button" default-value="large">
          <sd-radio value="mini">Mini</sd-radio>
          <sd-radio value="small">Small</sd-radio>
          <sd-radio value="large">Large</sd-radio>
        </sd-radio-group>
      </template>
    </sd-page-header>
  </div>
</template>
```
