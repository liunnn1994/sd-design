<template>
  <div>
    <a-row class="grid-demo">
      <a-col :xs="{span: 5, offset: 1}" :lg="{span: 6, offset: 2}">
        Col
      </a-col>
      <a-col :xs="{span: 11, offset: 1}" :lg="{span: 6, offset: 2}">
        Col
      </a-col>
      <a-col :xs="{span: 5, offset: 1}" :lg="{span: 6, offset: 2}">
        Col
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.grid-demo .arco-col {
  height: 48px;
  line-height: 48px;
  color: var(--color-white);
  text-align: center;
}
.grid-demo .arco-col:nth-child(2n) {
  background-color: rgba(var(--arcoblue-6), 0.9);
}
.grid-demo .arco-col:nth-child(2n + 1) {
  background-color: var(--color-primary-light-4);
}
</style>
