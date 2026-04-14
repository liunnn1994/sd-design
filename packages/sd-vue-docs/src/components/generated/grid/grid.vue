<template>
  <div style="margin-bottom: 20px;">
    <a-typography-text>折叠：</a-typography-text>
    <a-switch :checked="collapsed" @click="collapsed = !collapsed" />
  </div>
  <a-grid :cols="3" :colGap="12" :rowGap="16" class="grid-demo-grid" :collapsed="collapsed">
    <a-grid-item class="demo-item">item</a-grid-item>
    <a-grid-item class="demo-item">item</a-grid-item>
    <a-grid-item class="demo-item">item</a-grid-item>
    <a-grid-item class="demo-item" :offset="1">item | offset - 1</a-grid-item>
    <a-grid-item class="demo-item">item</a-grid-item>
    <a-grid-item class="demo-item" :span="3">item | span - 3</a-grid-item>
    <a-grid-item class="demo-item">item</a-grid-item>
    <a-grid-item class="demo-item">item</a-grid-item>
    <a-grid-item class="demo-item" suffix #="{ overflow }">
      suffix | overflow: {{ overflow }}
    </a-grid-item>
  </a-grid>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const collapsed = ref(false);

      return {
        collapsed,
      };
    },
  };
</script>

<style scoped>
  .grid-demo-grid .demo-item,
  .grid-demo-grid .demo-suffix {
    height: 48px;
    line-height: 48px;
    color: var(--color-white);
    text-align: center;
  }

  .grid-demo-grid .demo-item:nth-child(2n) {
    background-color: rgba(var(--sdblue-6), 0.9);
  }

  .grid-demo-grid .demo-item:nth-child(2n + 1) {
    background-color: var(--color-primary-light-4);
  }
</style>
