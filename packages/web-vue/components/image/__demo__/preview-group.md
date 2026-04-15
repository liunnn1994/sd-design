```yaml
title:
  zh-CN: 多图预览
  en-US: Multi-image preview
```

## zh-CN

用 `<sd-image-preview-group>` 包裹 `<sd-image>` 组件即可进行多图预览。

---

## en-US

Use `<sd-image-preview-group>` to wrap the `<sd-image>` component to preview multiple images.

---

```vue
<template>
  <sd-image-preview-group infinite>
    <sd-space>
      <sd-image
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp"
        width="200"
      />
      <sd-image
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp"
        width="200"
      />
      <sd-image
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp"
        width="200"
      />
      <sd-image
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/24e0dd27418d2291b65db1b21aa62254.png~tplv-uwbnlip3yd-webp.webp"
        width="200"
      />
    </sd-space>
  </sd-image-preview-group>
</template>
```
