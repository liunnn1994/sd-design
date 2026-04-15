```yaml
title:
  zh-CN: 无边框模式
  en-US: Border less
```

## zh-CN

通过设置 `bordered="false"` 隐藏边框。

---

## en-US

Hide the border by setting `bordered="false"`.

---

```vue
<template>
  <sd-collapse :default-active-key="['1']" :bordered="false">
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="2" disabled>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="3">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
  </sd-collapse>
</template>
```
