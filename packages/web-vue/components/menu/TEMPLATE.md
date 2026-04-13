## zh-CN

```yaml
meta:
  type: 组件
  category: 导航
title: 菜单 Menu
description: 收纳、排列并展示一系列选项的列表。
```

---

## en-US

```yaml
meta:
  type: Component
  category: Navigation
title: Menu
description: Organize, arrange, and display a list of options.
```

---

@import ./**demo**/horizontal.md

@import ./**demo**/dark-horizontal.md

@import ./**demo**/collapse-control.md

@import ./**demo**/breakpoint.md

@import ./**demo**/sub-menu.md

@import ./**demo**/size.md

@import ./**demo**/pop.md

@import ./**demo**/pop-button.md

## API

%%API(base-menu.vue)%%

%%API(sub-menu.tsx)%%

%%API(item-group.vue)%%

%%API(item.tsx)%%

## FAQ

## zh-CN

### `<MenuItem>` 和 `<SubMenu>` 组件的 `key` 属性为必填

在 `<Menu>` 组件中使用 `<MenuItem>` 和 `<SubMenu>` 组件时，请传入唯一的 `key` 属性。组件内部在进行计算时会依赖此值，如果没有赋值会导致部分场景下异常

---

## en-US

### The `key` attribute of `<MenuItem>` and `<SubMenu>` components is required

When using `<MenuItem>` and `<SubMenu>` components in the `<Menu>` component, please pass in the unique `key` attribute. The component will rely on this value when calculating internally. If no value is assigned, some Abnormality in the scene

---
