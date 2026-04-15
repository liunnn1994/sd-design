```yaml
title:
  zh-CN: 带图标的选项
  en-US: Icon Options
```

## zh-CN

通过 `icon` 插槽在选项前添加图标。

---

## en-US

Add an icon in front of the option via the `icon` slot.

---

```vue
<template>
  <sd-dropdown>
    <sd-button>Click Me</sd-button>
    <template #content>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 1</template>
      </sd-doption>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 2</template>
      </sd-doption>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 3</template>
      </sd-doption>
    </template>
  </sd-dropdown>
</template>
```
