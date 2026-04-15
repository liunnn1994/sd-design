```yaml
title:
  zh-CN: 按钮下拉框
  en-US: Dropdown button
```

## zh-CN

可以使用 `<dropdown-button>` 组件用来展示右边是额外相关功能菜单的按钮。 `2.16.0` 版本添加支持。

---

## en-US

The `<dropdown-button>` component can be used to display a button with a menu of additional related functions on the right. `2.16.0` version added support.

---

```vue
<template>
  <sd-space size="large">
    <sd-dropdown-button>
      Publish
      <template #content>
        <sd-doption>Save now</sd-doption>
        <sd-doption>Save and Publish</sd-doption>
      </template>
    </sd-dropdown-button>
    <sd-dropdown-button disabled>
      Disabled
      <template #content>
        <sd-doption>Save now</sd-doption>
        <sd-doption>Save and Publish</sd-doption>
      </template>
    </sd-dropdown-button>
    <sd-dropdown-button>
      Publish
      <template #icon>
        <icon-down />
      </template>
      <template #content>
        <sd-doption>Save now</sd-doption>
        <sd-doption>Save and Publish</sd-doption>
      </template>
    </sd-dropdown-button>
  </sd-space>
</template>

<style>
  .sd-dropdown-open .sd-icon-down {
    transform: rotate(180deg);
  }
</style>
```
