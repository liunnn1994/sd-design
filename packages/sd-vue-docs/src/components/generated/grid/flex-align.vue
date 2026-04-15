<template>
  <div>
    <p>Arrange top</p>
    <sd-row class="grid-demo" align="start">
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
    <p>Arrange center</p>
    <sd-row class="grid-demo" align="center">
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
    <p>Arrange bottom</p>
    <sd-row class="grid-demo" align="end">
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

  .grid-demo .sd-col:nth-of-type(1) {
    height: 90px;
    line-height: 90px;
  }

  .grid-demo .sd-col:nth-of-type(2) {
    height: 48px;
    line-height: 48px;
  }

  .grid-demo .sd-col:nth-of-type(3) {
    height: 120px;
    line-height: 120px;
  }

  .grid-demo .sd-col:nth-of-type(4) {
    height: 60px;
    line-height: 60px;
  }

  .grid-demo .sd-col:nth-child(2n) {
    background-color: rgb(var(--sdblue-6), 0.9);
  }

  .grid-demo .sd-col:nth-child(2n + 1) {
    background-color: var(--color-primary-light-4);
  }
</style>
