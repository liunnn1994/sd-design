<template>
  <a-row class="grid-demo" style="margin-bottom: 16px">
    <a-col flex="100px">
      <div>100px</div>
    </a-col>
    <a-col flex="auto">
      <div>auto</div>
    </a-col>
  </a-row>
  <a-row class="grid-demo" style="margin-bottom: 16px">
    <a-col flex="100px">
      <div>100px</div>
    </a-col>
    <a-col flex="auto">
      <div>auto</div>
    </a-col>
    <a-col flex="100px">
      <div>100px</div>
    </a-col>
  </a-row>
  <a-row class="grid-demo" style="margin-bottom: 16px">
    <a-col :flex="3">
      <div>3 / 12</div>
    </a-col>
    <a-col :flex="4">
      <div>4 / 12</div>
    </a-col>
    <a-col :flex="5">
      <div>5 / 12</div>
    </a-col>
  </a-row>
</template>

<style scoped>
  .grid-demo .sd-col {
    height: 48px;
    line-height: 48px;
    color: var(--color-white);
    text-align: center;
  }

  .grid-demo .sd-col:nth-child(2n + 1) {
    background-color: var(--color-primary-light-4);
  }

  .grid-demo .sd-col:nth-child(2n) {
    background-color: rgba(var(--sdblue-6), 0.9);
  }
</style>
