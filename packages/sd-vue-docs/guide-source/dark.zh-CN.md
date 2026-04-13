```yaml
meta:
  type: 开发指南
title: 暗黑模式
description: 组件库内置暗色的主题，你可以轻易的切换到暗色。
```

## 切换到暗黑模式

组件库通过 body 标签上的 sd-theme 属性来标明当前的主题，所以你只要修改这个属性，即可完成主题的切换。

```ts
document.body.setAttribute('sd-theme', 'dark');

document.body.removeAttribute('sd-theme');
```

## 原理和内置颜色

可参考 [暗黑模式](https://sd.design/react/docs/palette) 和 [颜色](https://sd.design/react/docs/palette)
