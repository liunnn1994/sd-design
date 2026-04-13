## zh-CN

```yaml
meta:
  type: 组件
  category: 数据展示
title: 折叠面板 Collapse
description: 可以折叠 / 展开的内容区域。
```

---

## en-US

```yaml
meta:
  type: Component
  category: Data Display
title: Collapse
description: The content area that can be collapsed/expanded.
```

---

@import ./**demo**/basic.md

@import ./**demo**/accordion.md

@import ./**demo**/nested.md

@import ./**demo**/border-less.md

@import ./**demo**/extra.md

@import ./**demo**/expand-icon.md

@import ./**demo**/custom.md

@import ./**demo**/icon-position.md

@import ./**demo**/destroy.md

## API

%%API(collapse.vue)%%

%%API(collapse-item.tsx)%%

## FAQ

## zh-CN

### `<CollapseItem>` 组件的 `key` 属性为必填

在 `<Collapse>` 组件中每个 `<CollapseItem>` 都需要指定唯一的 `key` 属性，`key` 对应 `activeKey` 中的值。

---

## en-US

### The `key` attribute of `<CollapseItem>` components is required

In the `<Collapse>` component, each `<CollapseItem>` needs to specify a unique `key` attribute, and the `key` corresponding to the value in `activeKey`.

---
