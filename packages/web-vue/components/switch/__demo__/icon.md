```yaml
title:
  zh-CN: 自定义图标
  en-US: Custom Icon
```

## zh-CN

自定义开关按钮上显示的图标。

---

## en-US

Customize the icon displayed on the switch button.

---

```vue
<template>
  <sd-space size="large">
    <sd-switch>
      <template #checked-icon>
        <icon-check />
      </template>
      <template #unchecked-icon>
        <icon-close />
      </template>
    </sd-switch>
    <sd-switch type="round">
      <template #checked-icon>
        <icon-check />
      </template>
      <template #unchecked-icon>
        <icon-close />
      </template>
    </sd-switch>
    <sd-switch type="line">
      <template #checked-icon>
        <icon-check />
      </template>
      <template #unchecked-icon>
        <icon-close />
      </template>
    </sd-switch>
  </sd-space>
</template>
```
