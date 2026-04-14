<template>
  <div>
    <div style="marginbottom: 20px">
      <a-radio-group v-model="align" type="button">
        <a-radio value="start">start</a-radio>
        <a-radio value="center">center</a-radio>
        <a-radio value="end">end</a-radio>
        <a-radio value="baseline">baseline</a-radio>
      </a-radio-group>
    </div>
    <a-space :align="align" style="backgroundcolor: var(--color-fill-2); padding: 10px">
      <a-typography-text>Space:</a-typography-text>
      <a-button type="primary">Item2</a-button>
      <a-card title="Card"> Card content </a-card>
    </a-space>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        align: 'center',
      };
    },
  };
</script>
