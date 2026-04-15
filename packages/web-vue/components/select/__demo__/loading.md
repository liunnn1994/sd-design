```yaml
title:
  zh-CN: 加载中
  en-US: Loading
```

## zh-CN

选择框和下拉菜单显示加载中状态。

---

## en-US

Select boxes and drop-down menus show loading status.

---

```vue
<template>
  <sd-select :style="{ width: '320px' }" placeholder="Please select ..." loading>
    <sd-option>Beijing</sd-option>
    <sd-option>Shanghai</sd-option>
    <sd-option>Guangzhou</sd-option>
    <sd-option disabled>Disabled</sd-option>
  </sd-select>
</template>
```
