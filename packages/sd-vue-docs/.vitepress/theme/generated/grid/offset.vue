<template>
  <div>
    <a-row class="grid-demo" style="marginbottom: 16px; backgroundcolor: var(--color-fill-2)">
      <a-col :span="8">col - 8</a-col>
      <a-col :span="8" :offset="8"> col - 8 | offset - 8 </a-col>
    </a-row>
    <a-row class="grid-demo" style="marginbottom: 16px; backgroundcolor: var(--color-fill-2)">
      <a-col :span="6" :offset="8"> col - 6 | offset - 8 </a-col>
      <a-col :span="6" :offset="4"> col - 6 | offset - 4 </a-col>
    </a-row>
    <a-row class="grid-demo" style="backgroundcolor: var(--color-fill-2)">
      <a-col :span="12" :offset="8"> col - 12 | offset - 8 </a-col>
    </a-row>
  </div>
</template>

<style scoped>
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
