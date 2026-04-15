```yaml
title:
  zh-CN: 分组选项
  en-US: Group
```

## zh-CN

通过 `<dgroup>` 组件使用分组选项。

---

## en-US

Use the grouping option through the `<dgroup>` component.

---

```vue
<template>
  <sd-dropdown>
    <sd-button>Click Me</sd-button>
    <template #content>
      <sd-dgroup title="Group 1">
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </sd-dgroup>
      <sd-dgroup title="Group 2">
        <sd-doption>Option 4</sd-doption>
        <sd-doption>Option 5</sd-doption>
        <sd-doption>Option 6</sd-doption>
      </sd-dgroup>
    </template>
  </sd-dropdown>
</template>
```
