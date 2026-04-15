```yaml
title:
  zh-CN: 带有面包屑
  en-US: Breadcrumb
```

## zh-CN

在页头中展示面包屑。

---

## en-US

Show breadcrumbs in the header.

---

```vue
<template>
  <div :style="{ background: 'var(--color-fill-2)', padding: '28px' }">
    <sd-page-header
      :style="{ background: 'var(--color-bg-2)' }"
      title="SD Design"
      subtitle="SD Design Vue"
      :show-back="false"
    >
      <template #breadcrumb>
        <sd-breadcrumb>
          <sd-breadcrumb-item>Home</sd-breadcrumb-item>
          <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
          <sd-breadcrumb-item>News</sd-breadcrumb-item>
        </sd-breadcrumb>
      </template>
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
