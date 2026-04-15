```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

步骤条的基本用法。

---

## en-US

Basic usage of the step bar.

---

```vue
<template>
  <div>
    <sd-steps :current="2">
      <sd-step>Succeeded</sd-step>
      <sd-step>Processing</sd-step>
      <sd-step>Pending</sd-step>
    </sd-steps>
    <sd-divider />
    <div style="line-height: 140px; text-align: center; color: #C9CDD4; "> Step 2 Content </div>
  </div>
</template>
```
