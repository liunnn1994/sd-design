```yaml
title:
  zh-CN: 水平布局
  en-US: Horizontal Layout
```

## zh-CN

通过 `justify` 来进行水平布局。

---

## en-US

## Use `justify` for horizontal layout

```vue
<template>
  <div>
    <p>Arrange left</p>
    <sd-row class="grid-demo" justify="start">
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Arrange center</p>
    <sd-row class="grid-demo" justify="center">
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Arrange right</p>
    <sd-row class="grid-demo" justify="end">
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Space around</p>
    <sd-row class="grid-demo" justify="space-around">
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Space between</p>
    <sd-row class="grid-demo" justify="space-between">
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
  </div>
</template>

<style scoped>
  .grid-demo {
    background-color: var(--color-fill-2);
    margin-bottom: 40px;
  }
  .grid-demo:last-child {
    margin-bottom: 0px;
  }
  .grid-demo .sd-col {
    height: 48px;
    line-height: 48px;
    color: var(--color-white);
    text-align: center;
  }
  .grid-demo .sd-col:nth-child(2n) {
    background-color: rgba(var(--sdblue-6), 0.9);
  }
  .grid-demo .sd-col:nth-child(2n + 1) {
    background-color: var(--color-primary-light-4);
  }
</style>
```
