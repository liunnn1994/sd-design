```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

当需要突出某个或某组数字或展示带描述的统计类数据时使用。

---

## en-US

Use when you need to highlight a certain number or group of numbers or display statistical data with descriptions.

---

```vue
<template>
  <sd-space size="large">
    <sd-statistic title="Downloads" :value="125670" show-group-separator />
    <sd-statistic extra="Comments" :value="40509" :precision="2" />
  </sd-space>
</template>
```
