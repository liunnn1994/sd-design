```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

标签页的基本使用方法。

---

## en-US

Basic usage of tab.

---

```vue
<template>
  <sd-tabs default-active-key="2">
    <sd-tab-pane key="1" title="Tab 1"> Content of Tab Panel 1 </sd-tab-pane>
    <sd-tab-pane key="2" title="Tab 2"> Content of Tab Panel 2 </sd-tab-pane>
    <sd-tab-pane key="3">
      <template #title>Tab 3</template>
      Content of Tab Panel 3
    </sd-tab-pane>
  </sd-tabs>
</template>
```
