```yaml
title:
  zh-CN: 懒加载
  en-US: Lazy load
```

## zh-CN

通过设置 lazy-load 属性，可以让面板在首次激活时渲染。

---

## en-US

By setting the lazy-load property, the panel can be rendered when it is first activated.

---

```vue
<template>
  <sd-tabs default-active-key="2" lazy-load>
    <sd-tab-pane key="1" title="Tab 1"> Content of Tab Panel 1 </sd-tab-pane>
    <sd-tab-pane key="2" title="Tab 2"> Content of Tab Panel 2 </sd-tab-pane>
    <sd-tab-pane key="3" title="Tab 3"> Content of Tab Panel 3 </sd-tab-pane>
  </sd-tabs>
</template>
```
