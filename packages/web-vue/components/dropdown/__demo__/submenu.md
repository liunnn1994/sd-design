```yaml
title:
  zh-CN: 多级菜单
  en-US: Submenu
```

## zh-CN

带有多级菜单的下拉框。

---

## en-US

Drop-down box with multi-level menu.

---

```vue
<template>
  <sd-dropdown>
    <sd-button>Click Me</sd-button>
    <template #content>
      <sd-doption>Option 1</sd-doption>
      <sd-dsubmenu value="option-1">
        <template #default>Option 2</template>
        <template #content>
          <sd-doption>Option 2-1</sd-doption>
          <sd-dsubmenu value="option-2-2" trigger="hover">
            <template #default>Option 2-2</template>
            <template #content>
              <sd-doption>Option 2-1</sd-doption>
              <sd-doption>Option 2-2</sd-doption>
              <sd-doption>Option 2-3</sd-doption>
            </template>
            <template #footer>
              <div style="padding: 6px; text-align: center;">
                <sd-button>Click</sd-button>
              </div>
            </template>
          </sd-dsubmenu>
          <sd-doption>Option 2-3</sd-doption>
        </template>
      </sd-dsubmenu>
      <sd-doption>Option 3</sd-doption>
    </template>
  </sd-dropdown>
</template>
```
