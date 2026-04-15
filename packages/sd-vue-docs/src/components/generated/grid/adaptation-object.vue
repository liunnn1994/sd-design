<template>
  <div>
    <sd-row class="grid-demo">
      <sd-col :xs="{ span: 5, offset: 1 }" :lg="{ span: 6, offset: 2 }"> Col </sd-col>
      <sd-col :xs="{ span: 11, offset: 1 }" :lg="{ span: 6, offset: 2 }"> Col </sd-col>
      <sd-col :xs="{ span: 5, offset: 1 }" :lg="{ span: 6, offset: 2 }"> Col </sd-col>
    </sd-row>
  </div>
</template>

<style scoped>
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
