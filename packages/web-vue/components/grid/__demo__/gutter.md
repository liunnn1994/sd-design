```yaml
title:
  zh-CN: 区块间隔
  en-US: Interval of Grid
```

## zh-CN

通过在 `Row` 上指定 `gutter` 可以增加栅格的区域间隔。

---

## en-US

By specifying `gutter` on `Row`, the area interval of the grid can be increased

---

```vue
<template>
  <div>
    <p>Horizontal</p>
    <sd-row class="grid-demo" :gutter="24">
      <sd-col :span="12">
        <div>col - 12</div>
      </sd-col>
      <sd-col :span="12">
        <div>col - 12</div>
      </sd-col>
    </sd-row>
    <p>Responsive</p>
    <sd-row class="grid-demo" :gutter="{ md: 8, lg: 24, xl: 32 }">
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
    </sd-row>
    <p>Horizontal and Vertical</p>
    <sd-row class="grid-demo" :gutter="[24, 12]">
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div>col - 6</div>
      </sd-col>
    </sd-row>
  </div>
</template>

<style scoped>
  .grid-demo .sd-col {
    height: 48px;
    color: var(--color-white);
  }
  .grid-demo .sd-col > div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .grid-demo .sd-col:nth-child(2n) > div {
    background-color: rgba(var(--sdblue-6), 0.9);
  }
  .grid-demo .sd-col:nth-child(2n + 1) > div {
    background-color: var(--color-primary-light-4);
  }
</style>
```
