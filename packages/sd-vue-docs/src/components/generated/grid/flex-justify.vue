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
    margin-bottom: 40px;
    background-color: var(--color-fill-2);
  }

  .grid-demo:last-child {
    margin-bottom: 0;
  }

  .grid-demo .sd-col {
    height: 48px;
    color: var(--color-white);
    line-height: 48px;
    text-align: center;
  }

  .grid-demo .sd-col:nth-child(2n) {
    background-color: rgb(var(--sdblue-6), 0.9);
  }

  .grid-demo .sd-col:nth-child(2n + 1) {
    background-color: var(--color-primary-light-4);
  }
</style>
