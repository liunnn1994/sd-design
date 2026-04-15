```yaml
title:
  zh-CN: 弹出方向
  en-US: Position
```

## zh-CN

通过 `position` 支持指定 6 种弹出方位，分别是：top: 向上, tl: 左上, tr: 右上, bottom: 下方(默认), bl: 左下, br: 右下。

---

## en-US

Support to specify 6 pop-up orientations through `position`, which are: top: up, tl: top left, tr: top right, bottom: bottom (default), bl: bottom left, br: bottom right.

---

```vue
<template>
  <sd-space>
    <sd-dropdown position="bl">
      <sd-button>Bottom Left</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown position="bottom">
      <sd-button>Bottom</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown position="br">
      <sd-button>Bottom Right</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown position="tl">
      <sd-button>Top Left</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown position="top">
      <sd-button>Top</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown position="tr">
      <sd-button>Top Right</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
  </sd-space>
</template>
```
